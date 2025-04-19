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
      try {
        const [storedToken, storedUserInfo] = await AsyncStorage.multiGet([
          AUTH_TOKEN_KEY,
          USER_INFO_KEY,
        ]);

        const token = storedToken[1];
        const userInfo = storedUserInfo[1]
          ? JSON.parse(storedUserInfo[1])
          : null;

        if (token) {
          setAuthToken(token);
        }

        return { userToken: token, userInfo };
      } catch (error) {
        console.error("Error retrieving auth data:", error);
        return { userToken: null, userInfo: null };
      }
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
      const errorMsg =
        error.response?.data?.message || "Login failed. Please try again.";
      setAuthError(errorMsg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ firstName, lastName, email, password }) => {
      const res = await axios.post(`${API_URL}/auth/signup`, {
        firstName,
        lastName,
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
      const errorMsg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setAuthError(errorMsg);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updateData) => {
      const response = await axios.patch(
        `${API_URL}/auth/updateMe`,
        updateData,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      return response.data;
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
      const errorMsg =
        error.response?.data?.message || "Failed to update profile.";
      setAuthError(errorMsg);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const response = await axios.post(
        `${API_URL}/auth/changePassword`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      return response.data;
    },
    onSuccess: async (data) => {
      const { token, data: userData } = data;
      setAuthToken(token);
      await storeUserData(token, userData.user);
      queryClient.setQueryData([AUTH_QUERY_KEY], {
        userToken: token,
        userInfo: userData.user,
      });
      return { success: true };
    },
    onError: (error) => {
      const errorMsg =
        error.response?.data?.message || "Password change failed";
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    },
  });

  const logout = useCallback(async () => {
    try {
      setAuthToken(null);
      await removeUserData();
      queryClient.setQueryData([AUTH_QUERY_KEY], {
        userToken: null,
        userInfo: null,
      });
      queryClient.clear();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [queryClient]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch {
      return false;
    }
  };

  const register = async (firstName, lastName, email, password) => {
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
  };

  const updateProfile = async (data) => {
    setAuthError(null);
    try {
      await updateProfileMutation.mutateAsync(data);
      return { success: true };
    } catch {
      return { success: false, error: authError };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
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
  };

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
    login,
    register,
    updateProfile,
    changePassword,
    logout,
    refetchAuth,
  };
};
