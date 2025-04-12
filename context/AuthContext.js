import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Create context
export const AuthContext = createContext();

// Base URL for API requests
const API_URL =
  "https://labour-jewell-plant-area-6cb70f30.koyeb.app/plantarea/api";

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  // Function to store the JWT token and user info
  const storeUserData = async (token, userData) => {
    try {
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userInfo", JSON.stringify(userData));
    } catch (error) {
      console.log("Error storing user data:", error);
    }
  };

  // Function to remove the JWT token and user info
  const removeUserData = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userInfo");
    } catch (error) {
      console.log("Error removing user data:", error);
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

      // Store token and user data
      setUserToken(token);
      setUserInfo(data.user);
      storeUserData(token, data.user);

      // Configure axios to use token for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);

      // Handle specific error messages
      if (error.response) {
        setError(error.response.data.message || "Login failed");
      } else {
        setError("Network error. Please check your connection.");
      }

      return false;
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

      // Store token and user data
      setUserToken(token);
      setUserInfo(data.user);
      storeUserData(token, data.user);

      // Configure axios to use token for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);

      // Handle specific error messages
      if (error.response) {
        setError(error.response.data.message || "Registration failed");
      } else {
        setError("Network error. Please check your connection.");
      }

      return false;
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
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const updatedUser = response.data.data.user;

      // Update user info in state and storage
      setUserInfo(updatedUser);
      await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUser));

      setIsLoading(false);
      return { success: true, user: updatedUser };
    } catch (error) {
      setIsLoading(false);

      // Handle specific error messages
      if (error.response) {
        setError(error.response.data.message || "Profile update failed");
      } else {
        setError("Network error. Please check your connection.");
      }

      return {
        success: false,
        error: error.response?.data?.message || "Update failed",
      };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/auth/changePassword`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const { token, data } = response.data;

      // Update token and user info
      setUserToken(token);
      setUserInfo(data.user);
      storeUserData(token, data.user);

      // Update axios headers with new token
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);

      // Handle specific error messages
      if (error.response) {
        setError(error.response.data.message || "Password change failed");
      } else {
        setError("Network error. Please check your connection.");
      }

      return {
        success: false,
        error: error.response?.data?.message || "Password change failed",
      };
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserInfo(null);

    // Remove Authorization header
    delete axios.defaults.headers.common["Authorization"];

    // Remove stored data
    await removeUserData();

    setIsLoading(false);
  };

  // Check if user is logged in on app start
  const isLoggedIn = async () => {
    try {
      setIsLoading(true);

      // Get stored token and user info
      const storedToken = await AsyncStorage.getItem("userToken");
      const storedUserInfo = await AsyncStorage.getItem("userInfo");

      if (storedToken && storedUserInfo) {
        setUserToken(storedToken);
        setUserInfo(JSON.parse(storedUserInfo));

        // Configure axios to use token for future requests
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;
      }

      setIsLoading(false);
    } catch (error) {
      console.log("Error checking login state:", error);
      setIsLoading(false);
    }
  };

  // Run once on component mount
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

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
