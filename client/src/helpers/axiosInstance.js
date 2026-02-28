import axios from "axios";

// API URL dari env - kosongkan untuk dev (proxy ke localhost:5000)
const apiUrl = process.env.REACT_APP_API_URL || "";
const baseURL = apiUrl.replace(/\/$/, "");

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tambah token ke setiap request jika ada
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
