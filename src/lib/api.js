import axios from "axios";

// External Node.js backend URL.
// Set VITE_BACKEND_URL in `.env` (e.g. VITE_BACKEND_URL=https://my-backend.onrender.com)
// Falls back to same-origin in development.
export const BACKEND_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_BACKEND_URL || import.meta.env?.VITE_API_URL)) ||
  "https://bazari-explorer.onrender.com";

export const API_BASE = BACKEND_URL ? `${BACKEND_URL.replace(/\/$/, "")}/api` : "/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});
