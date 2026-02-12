const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_URL = isDevelopment
    ? "http://localhost:5000"
    : "";

window.API_URL = API_URL;

// Base URL for the application
export const BASE_URL = isDevelopment ? "/" : "/urbancompany/";

/**
 * Robust fetch helper that handles JSON errors and fallbacks to static data
 * if the API is not available (e.g., on GitHub Pages).
 */
export const apiFetch = async (endpoint, options = {}) => {
    try {
        // If we're in production and it's a GET request to a known static-data endpoint,
        // we might want to go straight to data.json if no backend is hosted.
        const url = `${API_URL}${endpoint}`;

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
            // If not JSON (likely HTML error page), throw to trigger fallback
            throw new Error("Response was not JSON");
        }
    } catch (error) {
        console.warn(`API Fetch failed for ${endpoint}:`, error.message);

        // Fallback for public static data if the API fails (especially in production)
        if (!isDevelopment || endpoint.includes('api/') || endpoint.includes('static-data')) {
            console.log("Attempting fallback to public/data.json...");
            try {
                const fallbackUrl = `${BASE_URL}data.json`;
                const fallbackRes = await fetch(fallbackUrl);
                if (fallbackRes.ok) {
                    const allData = await fallbackRes.json();

                    // Try to find the specific key requested (e.g., 'carousel' from '/api/carousel')
                    const key = endpoint.split('/').pop().split('?')[0];
                    if (allData[key]) {
                        return { [key]: allData[key] };
                    }

                    // If no specific key, return everything (some components might expect this)
                    return allData;
                }
            } catch (fallbackError) {
                console.error("Fallback also failed:", fallbackError);
            }
        }
        throw error;
    }
};

window.apiFetch = apiFetch;

// Simple asset path helper
export const getAssetPath = (path) => {
    if (!path) return `${BASE_URL}assets/placeholder.png`;
    if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) return path;

    const cleanPath = path.startsWith("/") ? path.substring(1) : path;

    // Use BASE_URL for all local assets to handle nested routes correctly (like /admin/dashboard)
    if (cleanPath.startsWith("assets/") || cleanPath.startsWith("data.json")) {
        return `${BASE_URL}${cleanPath}`;
    }

    // Fallback for API-hosted assets
    return isDevelopment ? `/${cleanPath}` : `${API_URL}/${cleanPath}`;
};

window.getAssetPath = getAssetPath;

export default API_URL;

