import axios from "axios";

const rawBase = import.meta.env.VITE_API_URL;
const baseURL = rawBase ? `${rawBase.replace(/\/+$/, "")}/api` : "/api";

export const apiClient = axios.create({
    baseURL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
        const message =
            err.response?.data?.error?.message ||
            err.message ||
            "Request failed";
        return Promise.reject({
            status: err.response?.status,
            message,
            details: err.response?.data?.error?.details,
            original: err,
        });
    }
);
