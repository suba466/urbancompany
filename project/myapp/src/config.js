const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Base URL for the application
export const BASE_URL = import.meta.env.BASE_URL || "/";

// Simple asset path helper
export const getAssetPath = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_URL}${cleanPath}`;
};

// Simplified API call check
export const shouldCallApi = () => true;

export default API_URL;

