import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useState, useCallback } from "react";

const API_URL =
  "https://labour-jewell-plant-area-6cb70f30.koyeb.app/plantarea/api";
const AUTH_QUERY_KEY = "auth";
const AUTH_TOKEN_KEY = "userToken";
const USER_INFO_KEY = "userInfo";

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

const storeUserData = async (token, userData) => {
  try {
    await AsyncStorage.multiSet([
      [AUTH_TOKEN_KEY, token],
      [USER_INFO_KEY, JSON.stringify(userData)],
    ]);
  } catch (error) {
    console.error("Error storing user data:", error);
  }
};

const removeUserData = async () => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_INFO_KEY]);
  } catch (error) {
    console.error("Error removing user data:", error);
  }
};

const useAuthStatus = () => {
  return useQuery({
    queryKey: [AUTH_QUERY_KEY],
    queryFn: async () => {
      const [tokenEntry, userEntry] = await AsyncStorage.multiGet([
        AUTH_TOKEN_KEY,
        USER_INFO_KEY,
      ]);
      const token = tokenEntry[1];
      const userInfo = userEntry[1] ? JSON.parse(userEntry[1]) : null;

      if (token) setAuthToken(token);

      return { userToken: token, userInfo };
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
    data: authData = { userToken: null, userInfo: null },
    isLoading: isAuthLoading,
    refetch: refetchAuth,
  } = useAuthStatus();

  const { userToken, userInfo } = authData;

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      return res.data;
    },
    onSuccess: async (data) => {
      const { token, data: userData } = data;
      setAuthToken(token);
      await storeUserData(token, userData.user);
      queryClient.setQueryData([AUTH_QUERY_KEY], {
        userToken: token,
        userInfo: userData.user,
      });
    },
    onError: (error) => {
      setAuthError(error.response?.data?.message || "Login failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (user) => {
      const res = await axios.post(`${API_URL}/auth/signup`, user);
      return res.data;
    },
    onSuccess: async (data) => {
      const { token, data: userData } = data;
      setAuthToken(token);
      await storeUserData(token, userData.user);
      queryClient.setQueryData([AUTH_QUERY_KEY], {
        userToken: token,
        userInfo: userData.user,
      });
    },
    onError: (error) => {
      setAuthError(error.response?.data?.message || "Registration failed");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email) => {
      const res = await axios.post(`${API_URL}/auth/forgotPassword`, { email });
      return res.data;
    },
    onError: (error) => {
      setAuthError(
        error.response?.data?.message || "Failed to send reset code"
      );
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, otp }) => {
      const res = await axios.post(`${API_URL}/auth/verifyOTP`, { email, otp });
      return res.data;
    },
    onError: (error) => {
      setAuthError(
        error.response?.data?.message || "Invalid verification code"
      );
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ email, otp, password }) => {
      const res = await axios.post(`${API_URL}/auth/resetPassword`, {
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

  const updateProfileMutation = useMutation({
    mutationFn: async (updateData) => {
      const res = await axios.patch(`${API_URL}/auth/updateMe`, updateData, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
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

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const res = await axios.post(
        `${API_URL}/auth/changePassword`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      return res.data;
    },
    onSuccess: async (data) => {
      const { token, data: userData } = data;
      setAuthToken(token);
      await storeUserData(token, userData.user);
      queryClient.setQueryData([AUTH_QUERY_KEY], {
        userToken: token,
        userInfo: userData.user,
      });
    },
    onError: (error) => {
      setAuthError(error.response?.data?.message || "Password change failed");
    },
  });

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
        await loginMutation.mutateAsync({ email, password });
        return true;
      } catch {
        return false;
      }
    },
    register: async (firstName, lastName, email, password) => {
      setAuthError(null);
      try {
        await registerMutation.mutateAsync({
          firstName,
          lastName,
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
        return { success: true };
      } catch {
        return { success: false, error: authError };
      }
    },
    verifyOTP: async (email, otp) => {
      setAuthError(null);
      try {
        await verifyOtpMutation.mutateAsync({ email, otp });
        return { success: true };
      } catch {
        return { success: false, error: authError };
      }
    },
    resetPassword: async (email, otp, password) => {
      setAuthError(null);
      try {
        await resetPasswordMutation.mutateAsync({ email, otp, password });
        return { success: true };
      } catch {
        return { success: false, error: authError };
      }
    },
    updateProfile: async (data) => {
      setAuthError(null);
      try {
        await updateProfileMutation.mutateAsync(data);
        return { success: true };
      } catch {
        return { success: false, error: authError };
      }
    },
    changePassword: async (currentPassword, newPassword) => {
      setAuthError(null);
      try {
        await changePasswordMutation.mutateAsync({
          currentPassword,
          newPassword,
        });
        return { success: true };
      } catch {
        return { success: false, error: authError };
      }
    },
    logout,
    refetchAuth,
  };
};

// ✅ Notification Preferences Hook
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
      const response = await axios.get(
        `${API_URL}/users/notification-preferences`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      return response.data.data?.preferences || {};
    },
    enabled: !!userToken,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (prefs) => {
      const response = await axios.patch(
        `${API_URL}/users/notification-preferences`,
        prefs,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      return response.data;
    },
    onError: (error) => {
      setNotificationError(
        error.response?.data?.message || "Failed to update preferences"
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
      return { success: true };
    } catch {
      return { success: false, error: notificationError };
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
