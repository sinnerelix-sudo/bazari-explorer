import axios from "axios";

// Absolute backend URL for production
const PROD_BACKEND = "https://api.bazari.site";

const configuredBackendUrl =
  typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_BACKEND_URL || import.meta.env?.VITE_API_URL || PROD_BACKEND
    : PROD_BACKEND;

export const BACKEND_URL = configuredBackendUrl.replace(/\/$/, "");
export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});
