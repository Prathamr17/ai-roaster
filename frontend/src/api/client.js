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
    // Let browser/axios generate multipart boundary automatically
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    return config;
});

apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
        }
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
