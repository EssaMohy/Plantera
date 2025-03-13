import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://labour-jewell-plant-area-6cb70f30.koyeb.app/plantarea/api",
});

export default axiosInstance;
