const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const API_URL = import.meta.env.VITE_API_URL || (isLocalhost ? "http://localhost:5000" : "");

// Base URL for the application
export const BASE_URL = import.meta.env.BASE_URL || "/";

// Simple asset path helper
export const getAssetPath = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
    return `${base}${cleanPath}`;
};

// Simplified API call check - don't hit localhost from a live site
export const shouldCallApi = () => {
    if (import.meta.env.VITE_API_URL) return true;
    if (isLocalhost && API_URL) return true;
    return false;
};

export default API_URL;

