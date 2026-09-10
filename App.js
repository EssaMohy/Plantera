import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import Main from "./routes/Main";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { initPushNotifications } from "./utils/notifcation";
import axiosInstance from "./api/axiosInstance";

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    const prepare = async () => {
      await SplashScreen.hideAsync();
    };
    prepare();
  }, []);

  useEffect(() => {
    // Requests permission, then (only on a real device, only once granted)
    // fetches this device's Expo push token and hands it to the backend.
    // See utils/notifcation.js for why this alone isn't full push yet.
    initPushNotifications(axiosInstance).catch((error) => {
      console.error("Push notification setup failed:", error);
    });
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
