import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Main from "./routes/Main";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import {
  registerForPushNotificationsAsync,
  requestPushNotificationPermission,
  sendInstantNotification,
  scheduleNotification,
  sendBackgroundNotificationTest,
  sendClosedAppNotificationTest,
} from "./utils/notifcation";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    const prepare = async () => {
      await SplashScreen.hideAsync();
    };
    prepare();
  }, []);

  useEffect(() => {
    const registerAndSendTestNotification = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        await requestPushNotificationPermission();
        console.log("Push notification token:", token);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    registerAndSendTestNotification();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Main />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
