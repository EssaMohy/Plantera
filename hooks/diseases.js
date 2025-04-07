import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

const fetchDiseases = async () => {
  try {
    const { data } = await axiosInstance.get("/diseases");
    return data;
  } catch (error) {
    console.error("Error fetching diseases:", error);
    throw error;
  }
};

export const useDiseases = () => {
  return useQuery({ queryKey: ["diseases"], queryFn: fetchDiseases });
};
