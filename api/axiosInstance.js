import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://10.0.2.2:5000/plantarea/api",
});

export default axiosInstance;
