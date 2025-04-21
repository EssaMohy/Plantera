import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./useAuth";

const API_URL =
  "https://labour-jewell-plant-area-6cb70f30.koyeb.app/plantarea/api";

const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem("userToken");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

const fetchMyPlants = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const { data } = await axios.get(`${API_URL}/my-plants`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data?.data?.myPlants) {
      throw new Error("Invalid response format");
    }
    return data.data.myPlants;
  } catch (error) {
    console.error("Error fetching my plants:", error);
    // Handle the specific localStorage error
    if (error.message && error.message.includes("localStorage")) {
      throw new Error("Storage API is not available");
    }
    throw new Error(
      error.response?.data?.message || error.message || "Failed to load plants"
    );
  }
};

export const useMyPlants = () => {
  const { userToken } = useAuth();

  return useQuery({
    queryKey: ["myPlants"],
    queryFn: fetchMyPlants,
    enabled: !!userToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

const addToMyPlants = async (plantId) => {
  if (!plantId || typeof plantId !== "string") {
    throw new Error("Invalid plant ID");
  }

  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const { data } = await axios.post(
      `${API_URL}/my-plants`,
      { plantId }, // Just send plantId, no scheduling data
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error) {
    console.error("Error adding plant:", error);
    throw new Error(
      error.response?.data?.message || error.message || "Failed to add plant"
    );
  }
};

const removeFromMyPlants = async (plantId) => {
  if (!plantId || typeof plantId !== "string") {
    throw new Error("Invalid plant ID");
  }

  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const { data } = await axios.delete(`${API_URL}/my-plants/${plantId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("Error removing plant:", error);
    // Handle the specific localStorage error
    if (error.message && error.message.includes("localStorage")) {
      throw new Error("Storage API is not available");
    }
    throw new Error(
      error.response?.data?.message || error.message || "Failed to remove plant"
    );
  }
};

export const useAddToMyPlants = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToMyPlants,
    onSuccess: () => {
      queryClient.invalidateQueries(["myPlants"]);
    },
    onError: (error) => {
      console.error("Add to my plants error:", error);
    },
  });
};

export const useRemoveFromMyPlants = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromMyPlants,
    onSuccess: () => {
      queryClient.invalidateQueries(["myPlants"]);
    },
    onError: (error) => {
      console.error("Remove from my plants error:", error);
    },
  });
};

// Add to myPlants.js
const schedulePlantCare = async ({
  plantId,
  wateringFrequency,
  fertilizingFrequency,
}) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Authentication required");

    const { data } = await axios.patch(
      `${API_URL}/my-plants/${plantId}/schedule`,
      { wateringFrequency, fertilizingFrequency },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error) {
    console.error("Error scheduling plant care:", error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to schedule care"
    );
  }
};

export const useSchedulePlantCare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: schedulePlantCare,
    onSuccess: () => {
      queryClient.invalidateQueries(["myPlants"]);
    },
  });
};

// Add to myPlants.js
const schedulePlantCareNotification = async ({ plantId, type, days }) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Authentication required");

    const { data } = await axios.post(
      `${API_URL}/notifications/schedule`,
      {
        plantId,
        type, // 'watering' or 'fertilizing'
        days,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    throw new Error(
      error.response?.data?.message || "Failed to schedule notification"
    );
  }
};

export const useSchedulePlantCareNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: schedulePlantCareNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(["myPlants"]);
      queryClient.invalidateQueries(["upcomingTasks"]);
    },
  });
};
