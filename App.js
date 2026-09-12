import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import Main from "./routes/Main";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { NotificationProvider } from "./context/NotificationContext";

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    const prepare = async () => {
      await SplashScreen.hideAsync();
    };
    prepare();
  }, []);

  return (
    <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Main />
      </QueryClientProvider>
    </NotificationProvider>
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
