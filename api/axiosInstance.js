import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const axiosInstance = axios.create({
  baseURL: "https://labour-jewell-plant-area-6cb70f30.koyeb.app/plantarea/api",
});

// Add request interceptor to attach the JWT token to all requests
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get the token from AsyncStorage
    const token = await AsyncStorage.getItem("userToken");

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      console.log("Authentication error. Please log in again.");
      // You could trigger a logout action here if needed
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
