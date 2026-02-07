const API_URL = "http://localhost:5000";

// Base URL for the application
export const BASE_URL = "/";

// Simple asset path helper
export const getAssetPath = (path) => {
    if (!path) return "/assets/placeholder.png";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
};

// Simplified API call check
export const shouldCallApi = () => {
    return true;
};

export default API_URL;

