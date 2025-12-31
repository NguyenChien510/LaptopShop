import axios from "axios";

// Ưu tiên VITE_API_URL, fallback về relative path cho production
const BASE_URL = "/api";

const api = axios.create({ baseURL: BASE_URL, withCredentials: true });
export default api;
