import * as Notifications from "expo-notifications";

export async function scheduleNotification({
  title,
  body,
  year,
  month,
  day,
  hour,
  minute,
}) {
  console.log(`🔧 Received scheduling request: Title=${title}, Body=${body}`);
  console.log(
    ` 🔧 Date and Time Details: Year=${year}, Month=${month}, Day=${day}, Hour=${hour}, Minute=${minute}`
  );

  // Convert to exact JavaScript Date (note: month is 0-based in JS)
  const date = new Date(year, month - 1, day, hour, minute, 0);
  console.log("📆 Computed Date object for notification:", date);

  // Notification content
  const content = {
    title,
    body,
    sound: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
    data: { tag: ` ${title}-reminder, day` },
  };

  try {
    console.log("⏰ Scheduling the notification...");
    const notificationId = await Notifications.scheduleNotificationAsync({
      content,
      trigger: date, // ← use exact date
    });

    console.log(`✅ Notification scheduled with ID: ${notificationId}`);

    console.log(`🔑 Saved notification ID: ${notificationId} in AsyncStorage`);

    return notificationId;
  } catch (error) {
    console.error("❌ Error scheduling notification:", error);
    throw error;
  }
}

export async function registerForPushNotificationsAsync() {
  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("🚀 Expo Push Token:", token);
    return token;
  } catch (error) {
    console.error("❌ Error getting Expo push token:", error);
  }
}

export async function requestPushNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("❌ Push notification permissions denied");
    return null;
  }

  console.log("✅ Push notification permission granted");
  return finalStatus;
}
