import axios from "axios";

// External Node.js backend URL.
// Set VITE_BACKEND_URL (or VITE_API_URL) in your environment.
// If it is missing, stay on relative /api instead of silently talking to an old host.
const configuredBackendUrl =
  typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_BACKEND_URL || import.meta.env?.VITE_API_URL || "https://api.bazari.site"
    : "";

export const BACKEND_URL = configuredBackendUrl.replace(/\/$/, "");
export const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});
