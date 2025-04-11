import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext"; // Import auth context to check login status

// Fetch user's my plants
const fetchMyPlants = async () => {
  try {
    // Using the correct API endpoint path from your backend routes
    const { data } = await axiosInstance.get("/my-plants");
    return data.data.myPlants;
  } catch (error) {
    console.error("Error fetching my plants:", error);
    throw error;
  }
};

// Hook to get user's plants with auth check
export const useMyPlants = () => {
  const { userToken } = useAuth(); // Get auth state

  return useQuery({
    queryKey: ["myPlants"],
    queryFn: fetchMyPlants,
    // Only run query if user is logged in
    enabled: !!userToken,
  });
};

// Add a plant to my plants
const addToMyPlants = async (plantId) => {
  const { data } = await axiosInstance.post("/my-plants", { plantId });
  return data;
};

// Remove a plant from my plants
const removeFromMyPlants = async (plantId) => {
  const { data } = await axiosInstance.delete(`/my-plants/${plantId}`);
  return data;
};

// Hook for adding plants
export const useAddToMyPlants = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToMyPlants,
    onSuccess: () => {
      // Invalidate the my plants query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["myPlants"] });
    },
  });
};

// Hook for removing plants
export const useRemoveFromMyPlants = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromMyPlants,
    onSuccess: () => {
      // Invalidate the my plants query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["myPlants"] });
    },
  });
};
