import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./useAuth";

// The backend is mounted under `/api/v1`; the WebSocket server for live
// notifications lives at the same host, one level up (matches DEPI-Front's
// `useNotificationSocket`).
const SOCKET_URL = axiosInstance.defaults.baseURL.replace(/\/api\/v1\/?$/, "");
const PAGE_SIZE = 20;

/**
 * Paginated notification feed. Mirrors DEPI-Front's `NotificationsPage`:
 * `GET /notifications` (newest first, no server-side filter beyond
 * pagination), plus a `loadMore` for infinite scroll.
 */
export const useNotifications = () => {
  const { userToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const loadPage = useCallback(async (pageToLoad, append) => {
    append ? setIsLoadingMore(true) : setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get("/notifications", {
        params: { page: pageToLoad, limit: PAGE_SIZE },
      });
      const list = data.data || [];
      const meta = data.meta || {};

      setNotifications((prev) => (append ? [...prev, ...list] : list));
      setHasMore(pageToLoad < (meta.totalPages || 1));
      setPage(pageToLoad);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not load notifications.",
      );
    } finally {
      append ? setIsLoadingMore(false) : setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userToken) {
      loadPage(1, false);
    } else {
      setNotifications([]);
      setIsLoading(false);
    }
  }, [userToken, loadPage]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadPage(page + 1, true);
    }
  }, [isLoadingMore, hasMore, page, loadPage]);

  const refresh = useCallback(() => loadPage(1, false), [loadPage]);

  // Insert a notification that just arrived over the live socket, so the
  // feed updates immediately without waiting for the next fetch/poll.
  const prependLive = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const markRead = useCallback(async (id) => {
    // Optimistic update; the backend has no bulk endpoint, so "mark all"
    // just loops this one at a time (same as DEPI-Front).
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      return true;
    } catch (err) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
      );
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not mark that notification as read.",
      );
      return false;
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    const results = await Promise.allSettled(
      unread.map((n) => axiosInstance.patch(`/notifications/${n.id}/read`)),
    );
    const failedIds = unread
      .filter((_, i) => results[i].status === "rejected")
      .map((n) => n.id);

    if (failedIds.length > 0) {
      setNotifications((prev) =>
        prev.map((n) =>
          failedIds.includes(n.id) ? { ...n, isRead: false } : n,
        ),
      );
      setError("Some notifications couldn't be marked as read.");
    }
  }, [notifications]);

  return {
    notifications,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    markRead,
    markAllRead,
    prependLive,
  };
};

/**
 * Live socket.io connection to the notification server, mirroring
 * DEPI-Front's `useNotificationSocket`. Fires `onNotification` for every
 * `notification` event the server pushes while connected (i.e. while the
 * app is open/foregrounded — see the note in utils/notifcation.js about
 * why this isn't the same as OS-level push when the app is killed).
 */
export const useNotificationSocket = ({ onNotification } = {}) => {
  const { userToken } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  useEffect(() => {
    if (!userToken) return undefined;

    let cancelled = false;

    const connect = async () => {
      const token = (await AsyncStorage.getItem("userToken")) || userToken;
      if (!token || cancelled) return;

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        console.log("[Socket] Connected to notification server");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("[Socket] Disconnected from notification server");
        setIsConnected(false);
      });

      socket.on("connect_error", (err) => {
        console.warn("[Socket] Connection error:", err.message);
        setIsConnected(false);
      });

      socket.on("notification", (data) => {
        console.log("[Socket] New notification:", data);
        onNotificationRef.current?.(data);
      });

      socketRef.current = socket;
    };

    connect();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [userToken]);

  return { isConnected };
};

/**
 * Unread badge count for the bell icon: REST count on load/poll, plus a
 * live increment for anything that arrives over the socket in between —
 * same combined approach as DEPI-Front's `useUnreadNotificationsCount`.
 */
export const useUnreadNotificationsCount = () => {
  const { userToken } = useAuth();
  const [count, setCount] = useState(0);
  const wsCountRef = useRef(0);
  const pollingCountRef = useRef(0);

  const syncCount = useCallback(() => {
    setCount(wsCountRef.current + pollingCountRef.current);
  }, []);

  const fetchCount = useCallback(async () => {
    if (!userToken) return;
    try {
      const { data } = await axiosInstance.get("/notifications", {
        params: { limit: 100 },
      });
      const unread = (data.data || []).filter((n) => !n.isRead).length;
      pollingCountRef.current = unread;
      syncCount();
    } catch {
      // Silently ignore — the badge just won't update this cycle.
    }
  }, [userToken, syncCount]);

  useNotificationSocket({
    onNotification: () => {
      wsCountRef.current += 1;
      syncCount();
    },
  });

  useEffect(() => {
    if (!userToken) {
      setCount(0);
      wsCountRef.current = 0;
      pollingCountRef.current = 0;
      return undefined;
    }

    fetchCount();
    const interval = setInterval(() => {
      fetchCount();
      wsCountRef.current = 0;
    }, 60_000);

    return () => clearInterval(interval);
  }, [userToken, fetchCount]);

  return count;
};
