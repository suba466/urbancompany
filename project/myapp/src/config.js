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

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        // Fallback for public static data if the API fails (especially on GitHub Pages)
        if (!isDevelopment || endpoint.includes('api/') || endpoint.includes('static-data') || endpoint.includes('added')) {
            try {
                // Always fetch data.json from the root of the app
                const fallbackUrl = `${BASE_URL}data.json`;
                const fallbackRes = await fetch(fallbackUrl);

                if (fallbackRes.ok) {
                    const allData = await fallbackRes.json();

                    // Try to find the specific key requested
                    const key = endpoint.split('/').pop().split('?')[0];
                    if (allData[key]) {
                        return { [key]: allData[key], success: true };
                    }

                    // Smart fallback for missing keys: 
                    // If it's a common data key, try to provide a reasonable default from allData
                    const fallbackData = allData.packages || allData.subcategories || allData;
                    return {
                        ...allData,
                        [key]: fallbackData,
                        success: true
                    };
                }
            } catch (fallbackError) {
                // Silent fallback failure unless both fail
            }
        }

        // Final fallback: log the error only once if everything fails (including fallback)
        console.warn(`Note: API ${endpoint} not found, using local data.json fallback if available.`);

        // Return a safe empty object instead of throwing if we're on a static host
        if (!isDevelopment) {
            return { success: false, [endpoint.split('/').pop()]: [] };
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

