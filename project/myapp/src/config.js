const API_URL = "http://localhost:5000";

// Base URL for static assets (GitHub Pages subdirectory support)
export const BASE_URL = import.meta.env.BASE_URL || "/";

// Helper to get correct asset path
export const getAssetPath = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    // Remove leading slash if present to avoid double slashes with BASE_URL
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_URL}${cleanPath}`;
};

export default API_URL;
