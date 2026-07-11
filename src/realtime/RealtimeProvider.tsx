import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getStoredAccessToken } from "../api/auth";
import useContextPro from "../hooks/useContextPro";
import { RealtimeContext } from "./RealtimeContext";
import type {
  RealtimeConnectionStatus,
  RealtimeContextValue,
  RealtimeEnvelope,
  RealtimeNotification,
} from "./types";

const MAX_NOTIFICATIONS = 20;

function resolveWebSocketUrl(token: string) {
  const explicitUrl = import.meta.env.VITE_WS_URL;
  if (explicitUrl) {
    const url = new URL(explicitUrl);
    url.searchParams.set("token", token);
    return url.toString();
  }

  const apiBase = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_ORIGIN ?? window.location.origin;
  const url = new URL(apiBase);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.searchParams.set("token", token);
  return url.toString();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeNotification(envelope: RealtimeEnvelope): RealtimeNotification | null {
  if (envelope.event !== "notification_created" || !isObject(envelope.data)) {
    return null;
  }

  return {
    id: String(envelope.data.id ?? `notification-${Date.now()}`),
    kind: String(envelope.data.kind ?? "general"),
    title: String(envelope.data.title ?? "Update"),
    message: String(envelope.data.message ?? ""),
    created_at: envelope.created_at,
    unread: true,
    metadata: isObject(envelope.data.metadata) ? envelope.data.metadata : null,
  };
}

export default function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const {
    dispatch,
    state: { user },
  } = useContextPro();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef(0);
  const userRef = useRef(user);
  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>("disconnected");
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      socketRef.current?.close();
      socketRef.current = null;
      setConnectionStatus("disconnected");
      setNotifications([]);
      return;
    }

    const token = getStoredAccessToken();
    if (!token) {
      setConnectionStatus("disconnected");
      return;
    }

    let isActive = true;

    const invalidateKeys = (keys: string[][]) => {
      keys.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    };

    const syncSweetPoints = (summary: unknown) => {
      if (!isObject(summary)) return;
      queryClient.setQueryData(["my-rewards"], summary);
      queryClient.setQueryData(["my-profile"], (current: unknown) => {
        if (!isObject(current)) return current;
        return {
          ...current,
          sweet_points: Number(summary.sweet_points ?? current.sweet_points ?? 0),
          current_level: isObject(summary.current_level)
            ? String(summary.current_level.key ?? current.current_level ?? "bronze")
            : current.current_level,
        };
      });
      const currentUser = userRef.current;
      if (!currentUser) return;
      const nextUser = {
        ...currentUser,
        sweet_points: Number(summary.sweet_points ?? currentUser.sweet_points ?? 0),
        current_level: isObject(summary.current_level)
          ? String(summary.current_level.key ?? currentUser.current_level ?? "bronze")
          : currentUser.current_level,
      };
      dispatch({ type: "UPDATE_USER", payload: nextUser });
    };

    const handleEnvelope = (envelope: RealtimeEnvelope) => {
      const nextNotification = normalizeNotification(envelope);
      if (nextNotification) {
        setNotifications((current) => {
          const deduped = current.filter((item) => item.id !== nextNotification.id);
          return [nextNotification, ...deduped].slice(0, MAX_NOTIFICATIONS);
        });
      }

      if (envelope.event === "new_order") {
        invalidateKeys([["admin-orders"], ["admin-dashboard"]]);
        return;
      }

      if (envelope.event === "order_status_updated") {
        invalidateKeys([["admin-orders"], ["admin-dashboard"], ["my-orders"]]);
        if (isObject(envelope.data) && typeof envelope.data.current_status === "string" && user.role !== "admin") {
          toast.info(`Order updated: ${envelope.data.current_status.replaceAll("_", " ")}`);
        }
        return;
      }

      if (envelope.event === "new_review") {
        invalidateKeys([["admin-reviews"], ["admin-dashboard"]]);
        return;
      }

      if (envelope.event === "review_status_updated") {
        invalidateKeys([
          ["admin-reviews"],
          ["admin-dashboard"],
          ["featured-reviews"],
          ["dessert-reviews"],
          ["featured-desserts"],
          ["featured-desserts", "detail"],
          ["profile-featured-desserts"],
        ]);
        return;
      }

      if (envelope.event === "stock_updated") {
        invalidateKeys([
          ["admin-desserts"],
          ["admin-dashboard"],
          ["featured-desserts"],
          ["featured-desserts", "detail"],
          ["profile-featured-desserts"],
          ["chef-choice"],
        ]);
        return;
      }

      if (envelope.event === "low_stock_alert") {
        invalidateKeys([["admin-desserts"], ["admin-dashboard"]]);
        return;
      }

      if (envelope.event === "chef_choice_updated") {
        invalidateKeys([["admin-desserts"], ["chef-choice"]]);
        return;
      }

      if (envelope.event === "points_updated") {
        if (isObject(envelope.data)) {
          syncSweetPoints(envelope.data.summary);
          invalidateKeys([["my-rewards"], ["my-profile"]]);
          const earnedPoints = Number(envelope.data.points_earned ?? 0);
          if (earnedPoints > 0) {
            toast.success(`+${earnedPoints} Sweet Points`);
          }
        }
        return;
      }

      if (envelope.event === "reward_unlocked") {
        if (isObject(envelope.data)) {
          syncSweetPoints(envelope.data.summary);
          invalidateKeys([["my-rewards"], ["active-coupons"], ["admin-rewards"]]);
          const rewardTitle =
            typeof envelope.data.reward_title === "string" && envelope.data.reward_title
              ? envelope.data.reward_title
              : "A new reward is ready";
          toast.success(rewardTitle);
        }
      }
    };

    const connect = () => {
      setConnectionStatus("connecting");
      const socket = new WebSocket(resolveWebSocketUrl(token));
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttemptRef.current = 0;
        setConnectionStatus("connected");
      };

      socket.onmessage = (event) => {
        try {
          handleEnvelope(JSON.parse(event.data) as RealtimeEnvelope);
        } catch {
          return;
        }
      };

      socket.onclose = (event) => {
        if (!isActive) return;
        setConnectionStatus("disconnected");
        if (event.code === 4401) {
          return;
        }
        const reconnectDelay = Math.min(5000, 1000 * 2 ** reconnectAttemptRef.current);
        reconnectAttemptRef.current += 1;
        reconnectTimerRef.current = window.setTimeout(connect, reconnectDelay);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      isActive = false;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      socketRef.current?.close();
      socketRef.current = null;
      setConnectionStatus("disconnected");
    };
  }, [dispatch, queryClient, user?.id, user?.role]);

  const value = useMemo<RealtimeContextValue>(() => {
    const unreadCount = notifications.filter((item) => item.unread).length;
    return {
      connectionStatus,
      notifications,
      unreadCount,
      markNotificationAsRead: (notificationId: string) => {
        setNotifications((current) =>
          current.map((item) => (item.id === notificationId ? { ...item, unread: false } : item)),
        );
      },
      markAllNotificationsAsRead: () => {
        setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
      },
    };
  }, [connectionStatus, notifications]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
