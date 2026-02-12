const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_URL = isDevelopment
    ? "http://localhost:5000"
    : (import.meta.env.VITE_API_URL || "https://urbancompany-backend.onrender.com");



window.API_URL = API_URL;

// Base URL for the application
export const BASE_URL = isDevelopment ? "/" : "/urbancompany/";

/**
 * Robust fetch helper that handles JSON errors and fallbacks to static data
 * if the API is not available (e.g., on GitHub Pages).
 */
export const apiFetch = async (endpoint, options = {}) => {
    try {
        // Resolve the URL:
        // 1. If absolute URL, use it
        // 2. If API_URL is set (development), use it
        // 3. Otherwise (production on GitHub Pages), use BASE_URL to stay within the repo
        let url;
        if (endpoint.startsWith('http')) {
            url = endpoint;
        } else if (API_URL) {
            url = `${API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        } else {
            // Relative to the app's base (e.g., /urbancompany/api/...)
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
            url = `${BASE_URL}${cleanEndpoint}`;
        }

        const response = await fetch(url, options);

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        return await response.json();
    } catch (error) {
        // Fallback for production/static hosting
        if (!isDevelopment || endpoint.includes('api/') || endpoint.includes('static-data')) {
            try {
                const fallbackRes = await fetch(`${BASE_URL}data.json`);
                if (fallbackRes.ok) {
                    const allData = await fallbackRes.json();
                    const key = endpoint.split('/').pop().split('?')[0];

                    if (allData[key]) return { [key]: allData[key], success: true };

                    // Return everything if specific key not found (good for static-data)
                    return { ...allData, success: true, [key]: allData.packages || [] };
                }
            } catch (e) {
                // Silent failure is better than spamming console in production
            }
        }

        // Return empty structure to prevent crashes
        const key = endpoint.split('/').pop().split('?')[0];
        return { success: false, [key]: [], error: error.message };
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

