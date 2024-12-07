import axios from "axios";
const axiosInstance = axios.create({
  baseURL:
    import.meta.mode === "development" ? "http://localhost:5000/api" : "/api", // default base URL for API requests and base URL for production
  withCredentials: true, // allow cookies to be sent with requests
});

export default axiosInstance;
