import { useCallback, useEffect, useMemo, useReducer, useRef, type Dispatch, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MyContext } from "../context/MyContext";
import {
  clearStoredAuth,
  clearStoredUser,
  getMe,
  getStoredAccessToken,
  logoutUser,
  normalizeUser,
  persistTokens,
} from "../api/auth";
import type { LoginResponse, User } from "../types/types";

export interface TypeState {
  user: User | null;
  isLoading: boolean;
}

export interface ContextType {
  state: TypeState;
  dispatch: Dispatch<Action>;
  login: (tokens: LoginResponse, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

type SetUserAction = { type: "SET_USER"; payload: User | null };
type UpdateUserAction = { type: "UPDATE_USER"; payload: Partial<User> };
type LogoutAction = { type: "LOGOUT" };
type SetLoadingAction = { type: "SET_LOADING"; payload: boolean };

type Action = SetUserAction | UpdateUserAction | LogoutAction | SetLoadingAction;

function reducer(state: TypeState, action: Action): TypeState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "UPDATE_USER":
      return state.user ? { ...state, user: { ...state.user, ...action.payload } } : state;
    case "LOGOUT":
      return { ...state, user: null };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

function CreateContextPro({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authRequestIdRef = useRef(0);
  const hasToken = Boolean(getStoredAccessToken());
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    isLoading: hasToken,
  });

  useEffect(() => {
    clearStoredUser();
  }, []);

  const refreshUser = useCallback(async (options?: { background?: boolean }) => {
    const requestId = ++authRequestIdRef.current;
    const shouldRefreshInBackground = options?.background ?? false;

    if (!getStoredAccessToken()) {
      queryClient.clear();
      clearStoredUser();
      if (requestId === authRequestIdRef.current) {
        dispatch({ type: "SET_USER", payload: null });
        dispatch({ type: "SET_LOADING", payload: false });
      }
      return;
    }

    if (!shouldRefreshInBackground) {
      dispatch({ type: "SET_LOADING", payload: true });
    }

    try {
      const me = await getMe();
      if (requestId === authRequestIdRef.current) {
        const normalizedUser = normalizeUser(me);
        dispatch({ type: "SET_USER", payload: normalizedUser });
      }
    } catch {
      if (requestId === authRequestIdRef.current) {
        clearStoredAuth();
        clearStoredUser();
        queryClient.clear();
        dispatch({ type: "SET_USER", payload: null });
      }
    } finally {
      if (requestId === authRequestIdRef.current) {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
  }, [queryClient]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback((tokens: LoginResponse, user: User) => {
    authRequestIdRef.current += 1;
    persistTokens(tokens);
    queryClient.clear();
    dispatch({ type: "SET_USER", payload: normalizeUser(user) });
    dispatch({ type: "SET_LOADING", payload: false });
  }, [queryClient]);

  const logout = useCallback(async () => {
    authRequestIdRef.current += 1;
    const redirectTo = state.user?.role === "user" ? "/" : "/";

    try {
      await logoutUser();
    } catch {
      // Local logout should still complete even if backend logout fails.
    } finally {
      clearStoredAuth();
      clearStoredUser();
      queryClient.clear();
      dispatch({ type: "LOGOUT" });
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, queryClient, state.user?.role]);

  const value = useMemo<ContextType>(
    () => ({
      state,
      dispatch,
      login,
      logout,
      refreshUser,
    }),
    [state, login, logout, refreshUser],
  );

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

export default CreateContextPro;
