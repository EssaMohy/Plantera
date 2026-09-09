import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

const fetchPlants = async () => {
  try {
    const { data } = await axiosInstance.get("/plants", {
      params: { limit: 100 }
    });
    return data.data; // Paginated envelope
  } catch (error) {
    console.error("Error fetching plants:", error);
    throw error;
  }
};

export const usePlants = () => {
  return useQuery({ queryKey: ["plants"], queryFn: fetchPlants });
};

const plantById = async (id) => {
  const { data } = await axiosInstance.get(`/plants/${id}`);
  return data.data; // ApiEnvelope
};

export const usePlantById = (id) => {
  return useQuery({ queryKey: ["plants", id], queryFn: () => plantById(id) });
};
