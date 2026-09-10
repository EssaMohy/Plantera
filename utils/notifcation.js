import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Foreground presentation: without this handler, expo-notifications
// silently drops notifications that arrive while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Android requires an explicit notification channel (API 26+) or
 * notifications are delivered silently with no heads-up banner/sound.
 * Safe to call more than once — it's idempotent.
 */
async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "Plant care reminders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#2E7D32",
  });
}

/**
 * Requests notification permission. Always call this BEFORE requesting a
 * push token — asking for a token first (the previous order in this file)
 * returns nothing useful on iOS if permission hasn't been granted yet.
 */
export async function requestPushNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permissions denied");
    return null;
  }

  return finalStatus;
}

/**
 * Gets this device's Expo push token. Returns null (instead of throwing)
 * on simulators/emulators, which don't support push and would otherwise
 * make `getExpoPushTokenAsync` reject.
 */
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return null;
  }

  const granted = await requestPushNotificationPermission();
  if (!granted) return null;

  await ensureAndroidChannel();

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn(
        "No EAS projectId found in app config — cannot request an Expo push token.",
      );
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    console.log("Expo push token:", token);
    return token;
  } catch (error) {
    console.error("Error getting Expo push token:", error);
    return null;
  }
}

/**
 * Sends the device's push token to the backend so it can be used for
 * server-triggered pushes (e.g. via Expo's push API).
 *
 * NOTE: the current backend contract (mirrored from DEPI-Front's
 * lib/api.ts) has no device/push-token registration endpoint — care
 * reminders are currently delivered as in-app `Notification` rows plus a
 * live "notification" socket.io event, not real OS-level push. This call
 * is wired up and ready to go, but is wrapped so a missing endpoint
 * fails quietly instead of crashing anything, until that route exists.
 */
export async function sendPushTokenToServer(axiosInstance, token) {
  if (!token) return;
  try {
    await axiosInstance.post("/profile/push-token", { token });
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(
        "Push-token endpoint not implemented on the backend yet — skipping registration.",
      );
    } else {
      console.warn(
        "Could not register push token with the server:",
        error.message,
      );
    }
  }
}

/**
 * Full push-notification bootstrap: call once at app startup. Registers
 * for a token (only on real devices, only once permission is granted)
 * and attempts to hand it to the backend.
 */
export async function initPushNotifications(axiosInstance) {
  const token = await registerForPushNotificationsAsync();
  if (token && axiosInstance) {
    await sendPushTokenToServer(axiosInstance, token);
  }
  return token;
}

/**
 * Shows an immediate local OS notification. Used to surface a live
 * "notification" event received over the socket connection (see
 * hooks/notifications.js) as a real system banner while the app process
 * is alive — the closest mobile equivalent to DEPI-Front's live toast,
 * since there's no server-side push endpoint yet.
 */
export async function presentLocalNotification({ title, body, data }) {
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

/**
 * Schedules a notification for a specific future date/time — used for
 * one-off local reminders (e.g. a user-picked care schedule).
 */
export async function scheduleNotification({
  title,
  body,
  year,
  month,
  day,
  hour,
  minute,
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
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { tag: `${title}-reminder` },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
    });
    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    throw error;
  }
}
