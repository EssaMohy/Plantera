import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../api/axiosInstance";
import { useState, useCallback } from "react";

const AUTH_QUERY_KEY = "auth";
const AUTH_TOKEN_KEY = "userToken";
const USER_INFO_KEY = "userInfo";

// Set / remove Authorization header
const setAuthToken = (token) => {
  if (token && typeof token === "string") {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

// Extract token safely from different API response formats
const getTokenString = (token) => {
  if (typeof token === "string") {
    return token;
  }

  if (token && typeof token === "object") {
    if (typeof token.token === "string") {
      return token.token;
    }

    if (typeof token.accessToken === "string") {
      return token.accessToken;
    }

    if (typeof token.value === "string") {
      return token.value;
    }
  }

  return null;
};

// Store authentication data
const storeUserData = async (token, userData) => {
  try {
    const tokenString = getTokenString(token);

    if (!tokenString) {
      console.error("Invalid access token received:", token);
      throw new Error("Invalid access token received from server");
    }

    await AsyncStorage.multiSet([
      [AUTH_TOKEN_KEY, tokenString],
      [USER_INFO_KEY, JSON.stringify(userData)],
    ]);

    // Make Axios use the token immediately
    setAuthToken(tokenString);

    console.log("Authentication data stored successfully");
  } catch (error) {
    console.error("Error storing user data:", error);
    throw error;
  }
};

// Remove authentication data
const removeUserData = async () => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_INFO_KEY]);
  } catch (error) {
    console.error("Error removing user data:", error);
  }
};

// Check authentication status
const useAuthStatus = () => {
  return useQuery({
    queryKey: [AUTH_QUERY_KEY],

    queryFn: async () => {
      const [tokenEntry, userEntry] = await AsyncStorage.multiGet([
        AUTH_TOKEN_KEY,
        USER_INFO_KEY,
      ]);

      const storedToken = tokenEntry[1];
      const userInfo = userEntry[1] ? JSON.parse(userEntry[1]) : null;

      // Make sure stored token is valid
      const token = getTokenString(storedToken);

      if (token) {
        setAuthToken(token);
      } else {
        setAuthToken(null);
      }

      return {
        userToken: token,
        userInfo,
      };
    },

    staleTime: Infinity,
    cacheTime: Infinity,
    retry: false,
  });
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState(null);

  const {
    data: authData = {
      userToken: null,
      userInfo: null,
    },
    isLoading: isAuthLoading,
    refetch: refetchAuth,
  } = useAuthStatus();

  const { userToken, userInfo } = authData;

  // LOGIN
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      return res.data;
    },

    onSuccess: async (data) => {
      console.log("LOGIN RESPONSE:", JSON.stringify(data, null, 2));

      const { accessToken, user } = data.data;

      const tokenString = getTokenString(accessToken);

      console.log("Access token type:", typeof accessToken);

      if (!tokenString) {
        throw new Error("Invalid access token received from server");
      }

      await storeUserData(tokenString, user);

      queryClient.setQueryData([AUTH_QUERY_KEY], {
        userToken: tokenString,
        userInfo: user,
      });
    },

    onError: (error) => {
      setAuthError(error.response?.data?.message || "Login failed");
    },
  });

  // REGISTER
  const registerMutation = useMutation({
    mutationFn: async (user) => {
      const res = await axiosInstance.post("/auth/register", user);

      return res.data;
    },

    onSuccess: async (data) => {
      console.log("REGISTER RESPONSE:", JSON.stringify(data, null, 2));

      const { accessToken, user } = data.data;

      const tokenString = getTokenString(accessToken);

      if (!tokenString) {
        throw new Error("Invalid access token received from server");
      }

      await storeUserData(tokenString, user);

      queryClient.setQueryData([AUTH_QUERY_KEY], {
        userToken: tokenString,
        userInfo: user,
      });
    },

    onError: (error) => {
      setAuthError(error.response?.data?.message || "Registration failed");
    },
  });

  // FORGOT PASSWORD
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email) => {
      const res = await axiosInstance.post("/auth/forgot-password", { email });

      return res.data;
    },

    onError: (error) => {
      setAuthError(
        error.response?.data?.message || "Failed to send reset code",
      );
    },
  });

  // VERIFY OTP
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, otp }) => {
      const res = await axiosInstance.post("/auth/verify-otp", { email, otp });

      return res.data;
    },

    onError: (error) => {
      setAuthError(
        error.response?.data?.message || "Invalid verification code",
      );
    },
  });

  // RESET PASSWORD
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ email, otp, password }) => {
      const res = await axiosInstance.post("/auth/reset-password", {
        email,
        otp,
        password,
      });

      return res.data;
    },

    onError: (error) => {
      setAuthError(error.response?.data?.message || "Failed to reset password");
    },
  });

  // UPDATE PROFILE
  const updateProfileMutation = useMutation({
    mutationFn: async (updateData) => {
      const res = await axiosInstance.patch("/profile", updateData);

      return res.data;
    },

    onSuccess: async (data) => {
      const updatedUser = data.data.user;

      await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(updatedUser));

      queryClient.setQueryData([AUTH_QUERY_KEY], (old) => ({
        ...old,
        userInfo: updatedUser,
      }));
    },

    onError: (error) => {
      setAuthError(error.response?.data?.message || "Failed to update profile");
    },
  });

  // CHANGE PASSWORD
  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const res = await axiosInstance.patch("/profile/password", {
        currentPassword,
        newPassword,
      });

      return res.data;
    },

    onError: (error) => {
      setAuthError(error.response?.data?.message || "Password change failed");
    },
  });

  // LOGOUT
  const logout = useCallback(async () => {
    setAuthToken(null);

    await removeUserData();

    queryClient.setQueryData([AUTH_QUERY_KEY], {
      userToken: null,
      userInfo: null,
    });

    queryClient.clear();
  }, [queryClient]);

  return {
    userToken,
    userInfo,
    isAuthenticated: !!userToken,

    isLoading:
      isAuthLoading ||
      loginMutation.isPending ||
      registerMutation.isPending ||
      updateProfileMutation.isPending ||
      changePasswordMutation.isPending,

    error: authError,
    setError: setAuthError,

    login: async (email, password) => {
      setAuthError(null);

      try {
        await loginMutation.mutateAsync({
          email,
          password,
        });

        return true;
      } catch {
        return false;
      }
    },

    register: async (firstName, lastName, username, email, password) => {
      setAuthError(null);

      try {
        await registerMutation.mutateAsync({
          firstName,
          lastName,
          username,
          email,
          password,
        });

        return true;
      } catch {
        return false;
      }
    },

    forgotPassword: async (email) => {
      setAuthError(null);

      try {
        await forgotPasswordMutation.mutateAsync(email);

        return {
          success: true,
        };
      } catch {
        return {
          success: false,
          error: authError,
        };
      }
    },

    verifyOTP: async (email, otp) => {
      setAuthError(null);

      try {
        await verifyOtpMutation.mutateAsync({
          email,
          otp,
        });

        return {
          success: true,
        };
      } catch {
        return {
          success: false,
          error: authError,
        };
      }
    },

    resetPassword: async (email, otp, password) => {
      setAuthError(null);

      try {
        await resetPasswordMutation.mutateAsync({
          email,
          otp,
          password,
        });

        return {
          success: true,
        };
      } catch {
        return {
          success: false,
          error: authError,
        };
      }
    },

    updateProfile: async (data) => {
      setAuthError(null);

      try {
        await updateProfileMutation.mutateAsync(data);

        return {
          success: true,
        };
      } catch {
        return {
          success: false,
          error: authError,
        };
      }
    },

    changePassword: async (currentPassword, newPassword) => {
      setAuthError(null);

      try {
        await changePasswordMutation.mutateAsync({
          currentPassword,
          newPassword,
        });

        return {
          success: true,
        };
      } catch {
        return {
          success: false,
          error: authError,
        };
      }
    },

    logout,
    refetchAuth,
  };
};

// Notification Preferences Hook
export const useNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const [notificationError, setNotificationError] = useState(null);

  const authData = queryClient.getQueryData([AUTH_QUERY_KEY]) || {
    userToken: null,
    userInfo: null,
  };

  const { userToken } = authData;

  const preferencesQuery = useQuery({
    queryKey: ["notificationPreferences"],

    queryFn: async () => {
      const response = await axiosInstance.get("/profile/notifications");

      return response.data.data?.preferences || {};
    },

    enabled: !!userToken,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (prefs) => {
      const response = await axiosInstance.patch(
        "/profile/notifications",
        prefs,
      );

      return response.data;
    },

    onError: (error) => {
      setNotificationError(
        error.response?.data?.message || "Failed to update preferences",
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["notificationPreferences"]);
    },
  });

  const updatePreferences = async (prefs) => {
    setNotificationError(null);

    try {
      await updatePreferencesMutation.mutateAsync(prefs);

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        error: notificationError,
      };
    }
  };

  return {
    preferences: preferencesQuery.data,

    isLoading:
      preferencesQuery.isLoading || updatePreferencesMutation.isPending,

    error: notificationError,
    setError: setNotificationError,

    updatePreferences,
  };
};
