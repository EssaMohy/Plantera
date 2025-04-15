import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export const useWaterPlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plantId) => axiosInstance.post(`/plant-care/water/${plantId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["myPlants"]);
      queryClient.invalidateQueries(["upcomingTasks"]);
    },
  });
};

export const useFertilizePlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plantId) =>
      axiosInstance.post(`/plant-care/fertilize/${plantId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["myPlants"]);
      queryClient.invalidateQueries(["upcomingTasks"]);
    },
  });
};

export const useUpcomingTasks = () => {
  return useQuery({
    queryKey: ["upcomingTasks"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/plant-care/upcoming-tasks");
      return data.data.plants;
    },
  });
};
