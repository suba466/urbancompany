const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '' ||
    window.location.hostname.includes('192.168.')
);

// In development, default to localhost:5000. In production (GitHub Pages), default to empty or a specific production URL.
const API_URL = import.meta.env.VITE_API_URL || (isLocalhost ? "http://localhost:5000" : "");

// Base URL for static assets (GitHub Pages subdirectory support)
export const BASE_URL = import.meta.env.BASE_URL || "/";

// Helper to determine if we should even try to call the backend
export const shouldCallApi = () => {
    // If we are on GH Pages and API_URL is localhost or empty, skip it to avoid CORS/404 errors
    if (!isLocalhost && (!API_URL || API_URL.includes('localhost'))) {
        return false;
    }

    // Otherwise, if we have an API_URL, try it
    return !!API_URL;
};


// Helper to get correct asset path
export const getAssetPath = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    // Remove leading slash if present to avoid double slashes with BASE_URL
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    const fullPath = `${BASE_URL}${cleanPath}`;

    // Ensure no double slashes except after protocol
    return fullPath.replace(/([^:]\/)\/+/g, "$1");
};

export default API_URL;
