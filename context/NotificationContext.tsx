import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { registerForPushNotificationsAsync } from "../utils/registerForPushNotificationsAsync";
import axiosInstance from "../api/axiosInstance";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "Plant care reminders",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#2E7D32",
  });
}

async function sendPushTokenToServer(token: string) {
  if (!token) return;
  try {
    await axiosInstance.post("/profile/push-token", { token });
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.log(
        "Push-token endpoint not implemented on the backend yet — skipping registration.",
      );
    } else {
      console.warn(
        "Could not register push token with the server:",
        error?.message,
      );
    }
  }
}

export async function presentLocalNotification({
  title,
  body,
  data,
}: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  try {
    await ensureAndroidChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: data || {},
      },
      trigger: null, // fire immediately
    });
  } catch (error) {
    console.error("Error presenting local notification:", error);
  }
}

export async function scheduleNotification({
  title,
  body,
  year,
  month,
  day,
  hour,
  minute,
}: {
  title: string;
  body: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}) {
  const date = new Date(year, month - 1, day, hour, minute, 0);

  if (date.getTime() <= Date.now()) {
    console.warn(
      "Skipped scheduling a notification for a date in the past:",
      date,
    );
    return null;
  }

  await ensureAndroidChannel();

  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { tag: `${title}-reminder` },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
    });
  } catch (error) {
    console.error("Error scheduling notification:", error);
    throw error;
  }
}

export async function logNotificationDebugInfo() {
  const permissions = await Notifications.getPermissionsAsync();
  console.log("[Notifications] Permission status:", permissions.status);

  if (Platform.OS === "android") {
    const channels = await Notifications.getNotificationChannelsAsync();
    console.log("[Notifications] Android channels:", channels);
  }

  console.log("[Notifications] Is physical device:", Device.isDevice);
}

interface NotificationContextType {
  expoPushToken: string | null;
  devicePushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [devicePushToken, setDevicePushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => {
        console.log("📱 Expo Push Token:", token);
        setExpoPushToken(token);
        sendPushTokenToServer(token);
      },
      (err) => {
        console.log("❌ Push token error:", err);
        setError(err);
      },
    );

    if (Device.isDevice) {
      Notifications.getDevicePushTokenAsync().then(
        (result) => {
          setDevicePushToken(result.data);
        },
        (err) => {
          console.log("Device push token unavailable:", err?.message);
        },
      );
    }

    const notificationListener = Notifications.addNotificationReceivedListener(
      (n) => {
        console.log("🔔 Notification Received: ", n);
        setNotification(n);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("🔔 Notification Response: ", response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, devicePushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
