import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./useAuth";

const fetchMyPlants = async () => {
  try {
    const { data } = await axiosInstance.get("/my-plants", {
      params: { limit: 100 },
    });

    if (!data?.data) {
      throw new Error("Invalid response format");
    }
    return data.data; // Paginated envelope
  } catch (error) {
    console.error("Error fetching my plants:", error);
    if (error.message && error.message.includes("localStorage")) {
      throw new Error("Storage API is not available");
    }
    throw new Error(
      error.response?.data?.message || error.message || "Failed to load plants",
    );
  }
};

export const useMyPlants = () => {
  const { userToken } = useAuth();

  return useQuery({
    queryKey: ["myPlants"],
    queryFn: fetchMyPlants,
    enabled: !!userToken,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

const addToMyPlants = async (plantId) => {
  if (!plantId || typeof plantId !== "number") {
    throw new Error("Invalid plant ID");
  }

  try {
    const { data } = await axiosInstance.post("/my-plants", { plantId });
    return data.data.myPlant;
  } catch (error) {
    console.error("Error adding plant:", error);
    throw new Error(
      error.response?.data?.message || error.message || "Failed to add plant",
    );
  }
};

const removeFromMyPlants = async (myPlantId) => {
  if (!myPlantId || typeof myPlantId !== "number") {
    throw new Error("Invalid plant ID");
  }

  try {
    const { data } = await axiosInstance.delete(`/my-plants/${myPlantId}`);
    return data.data;
  } catch (error) {
    console.error("Error removing plant:", error);
    if (error.message && error.message.includes("localStorage")) {
      throw new Error("Storage API is not available");
    }
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to remove plant",
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

const waterPlant = async (myPlantId) => {
  try {
    const { data } = await axiosInstance.post(`/my-plants/${myPlantId}/water`);
    return data.data.myPlant;
  } catch (error) {
    console.error("Error watering plant:", error);
    throw new Error(
      error.response?.data?.message || error.message || "Failed to water plant",
    );
  }
};

export const useWaterPlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: waterPlant,
    onSuccess: () => {
      queryClient.invalidateQueries(["myPlants"]);
    },
  });
};

const fertilizePlant = async (myPlantId) => {
  try {
    const { data } = await axiosInstance.post(
      `/my-plants/${myPlantId}/fertilize`,
    );
    return data.data.myPlant;
  } catch (error) {
    console.error("Error fertilizing plant:", error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fertilize plant",
    );
  }
};

export const useFertilizePlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fertilizePlant,
    onSuccess: () => {
      queryClient.invalidateQueries(["myPlants"]);
    },
  });
};

const updateMyPlantImage = async ({ myPlantId, imageUri }) => {
  if (!myPlantId || typeof myPlantId !== "number") {
    throw new Error("Invalid plant ID");
  }

  try {
    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "my-plant.jpg",
    });

    const { data } = await axiosInstance.patch(
      `/my-plants/${myPlantId}/image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data.myPlant;
  } catch (error) {
    console.error("Error updating plant image:", error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update plant photo",
    );
  }
};

export const useUpdateMyPlantImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyPlantImage,
    onSuccess: () => {
      queryClient.invalidateQueries(["myPlants"]);
    },
  });
};
