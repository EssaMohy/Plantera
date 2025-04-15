import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const AuthContext = createContext();

const API_URL =
  "https://labour-jewell-plant-area-6cb70f30.koyeb.app/plantarea/api";

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  // Store user data in AsyncStorage
  const storeUserData = async (token, userData) => {
    try {
      await AsyncStorage.multiSet([
        ["userToken", token],
        ["userInfo", JSON.stringify(userData)],
      ]);
    } catch (error) {
      console.error("Error storing user data:", error);
      throw new Error("Failed to save user data");
    }
  };

  // Remove user data from AsyncStorage
  const removeUserData = async () => {
    try {
      await AsyncStorage.multiRemove(["userToken", "userInfo"]);
    } catch (error) {
      console.error("Error removing user data:", error);
      throw new Error("Failed to clear user data");
    }
  };

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token, data } = response.data;

      // Update state and storage
      setUserToken(token);
      setUserInfo(data.user);
      await storeUserData(token, data.user);

      // Set default axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { success: true, user: data.user };
    } catch (error) {
      let errorMsg = "Network error. Please check your connection.";
      if (error.response) {
        errorMsg = error.response.data.message || "Login failed";
      }
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (firstName, lastName, email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        firstName,
        lastName,
        email,
        password,
      });

      const { token, data } = response.data;

      // Update state and storage
      setUserToken(token);
      setUserInfo(data.user);
      await storeUserData(token, data.user);

      // Set default axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { success: true, user: data.user };
    } catch (error) {
      let errorMsg = "Network error. Please check your connection.";
      if (error.response) {
        errorMsg = error.response.data.message || "Registration failed";
      }
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (updateData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.patch(
        `${API_URL}/auth/updateMe`,
        updateData,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const updatedUser = response.data.data.user;

      // Update state and storage
      setUserInfo(updatedUser);
      await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (error) {
      let errorMsg = "Network error. Please check your connection.";
      if (error.response) {
        errorMsg = error.response.data.message || "Profile update failed";
      }
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/auth/changePassword`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const { token, data } = response.data;

      // Update state and storage
      setUserToken(token);
      setUserInfo(data.user);
      await storeUserData(token, data.user);

      // Update axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return { success: true };
    } catch (error) {
      let errorMsg = "Network error. Please check your connection.";
      if (error.response) {
        errorMsg = error.response.data.message || "Password change failed";
      }
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationPreferences = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/users/notification-preferences`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      // Ensure consistent response structure
      return {
        success: true,
        preferences: response.data.data?.preferences || {
          pushEnabled: false,
          wateringReminders: false,
          fertilizingReminders: false,
          emailNotifications: false,
        },
      };
    } catch (error) {
      console.error("Get preferences error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to get preferences",
      };
    }
  };

  const updateNotificationPreferences = async (preferences) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.patch(
        `${API_URL}/users/notification-preferences`,
        preferences,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      // Ensure we always return the full updated user object
      const updatedUser = response.data.data?.user || {};
      setUserInfo(updatedUser);
      await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUser));

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      console.error("Update preferences error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update preferences",
      };
    } finally {
      setIsLoading(false);
    }
  };
  // Push token management
  const savePushToken = async (token, deviceId) => {
    try {
      const response = await axios.post(
        `${API_URL}/user/push-token`,
        { token, deviceId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const updatedUser = response.data.data.user;
      setUserInfo(updatedUser);
      await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUser));

      return { success: true };
    } catch (error) {
      console.error("Failed to save push token:", error);
      return { success: false };
    }
  };

  const removePushToken = async (token) => {
    try {
      const response = await axios.delete(`${API_URL}/user/push-token`, {
        data: { token },
        headers: { Authorization: `Bearer ${userToken}` },
      });

      const updatedUser = response.data.data.user;
      setUserInfo(updatedUser);
      await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUser));

      return { success: true };
    } catch (error) {
      console.error("Failed to remove push token:", error);
      return { success: false };
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      setUserToken(null);
      setUserInfo(null);
      delete axios.defaults.headers.common["Authorization"];
      await removeUserData();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check login status on app start
  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const [storedToken, storedUserInfo] = await AsyncStorage.multiGet([
        "userToken",
        "userInfo",
      ]);

      if (storedToken[1] && storedUserInfo[1]) {
        setUserToken(storedToken[1]);
        setUserInfo(JSON.parse(storedUserInfo[1]));
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken[1]}`;
      }
    } catch (error) {
      console.error("Login check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        register,
        updateProfile,
        changePassword,
        getNotificationPreferences,
        updateNotificationPreferences,
        savePushToken,
        removePushToken,
        isLoading,
        userToken,
        userInfo,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
