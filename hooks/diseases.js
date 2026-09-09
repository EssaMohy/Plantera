import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

const fetchDiseases = async () => {
  try {
    const { data } = await axiosInstance.get("/diseases", {
      params: { limit: 100 }
    });
    return data.data; // Paginated envelope
  } catch (error) {
    console.error("Error fetching diseases:", error);
    throw error;
  }
};

export const useDiseases = () => {
  return useQuery({ queryKey: ["diseases"], queryFn: fetchDiseases });
};

const diseaseById = async (id) => {
  const { data } = await axiosInstance.get(`/diseases/${id}`);
  return data.data; // ApiEnvelope
};

export const useDiseaseById = (id) => {
  return useQuery({ queryKey: ["diseases", id], queryFn: () => diseaseById(id), enabled: !!id });
};
