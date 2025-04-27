import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, StyleSheet } from "react-native";
import DrawerNavigator from "./DrawerNavigator";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import VerificationScreen from "../screens/VerificationScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import { AuthProvider } from "../providers/AuthProvider";
import { useAuth } from "../hooks/useAuth";
import {
  registerForPushNotificationsAsync,
  requestPushNotificationPermission,
  sendInstantNotification,
} from "../utils/notifcation";
import SplashScreen from "../screens/SplashScreen"; // Import the SplashScreen component

const Stack = createStackNavigator();

// Auth Navigator component with login-related screens
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="Verification" component={VerificationScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

// Main app content that determines which navigator to show
const AppContent = () => {
  // Get auth state directly from the hook
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Set a timeout to hide the splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash || isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        // User is logged in
        <DrawerNavigator />
      ) : (
        // User is not logged in
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

// Main component wrapped with AuthProvider
const Main = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});

export default Main;
