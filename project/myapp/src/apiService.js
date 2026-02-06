import API_URL from "./config";

/**
 * Fetch data with automatic fallback to data.json
 * @param {string} endpoint - API endpoint (e.g., 'api/categories')
 * @param {string} dataKey - Key in data.json (e.g., 'categories')
 * @returns {Promise<any>}
 */
export const fetchData = async (endpoint, dataKey) => {
    // 1. Try API first
    try {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
        const response = await fetch(url);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn(`API ${endpoint} failed, falling back to local data...`);
    }

    // 2. Simple fallback to local data.json
    try {
        const response = await fetch("/data.json");
        if (response.ok) {
            const staticData = await response.json();
            return dataKey ? { [dataKey]: staticData[dataKey] } : staticData;
        }
    } catch (error) {
        console.error("Critical: Both API and fallback failed:", error);
    }
    return null;
};


export default fetchData;
