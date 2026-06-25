export type RealtimeConnectionStatus = "disconnected" | "connecting" | "connected";

export interface RealtimeNotification {
  id: string;
  kind: string;
  title: string;
  message: string;
  created_at: string;
  unread: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface RealtimeEnvelope<TEvent extends string = string, TData = unknown> {
  event: TEvent;
  data: TData;
  created_at: string;
}

export interface RealtimeContextValue {
  connectionStatus: RealtimeConnectionStatus;
  notifications: RealtimeNotification[];
  unreadCount: number;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
}
