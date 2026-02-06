import API_URL, { getAssetPath, shouldCallApi } from "./config";

/**
 * Fetch data with automatic fallback to data.json
 * @param {string} endpoint - API endpoint (e.g., 'api/categories')
 * @param {string} dataKey - Key in data.json (e.g., 'categories')
 * @returns {Promise<any>}
 */
export const fetchData = async (endpoint, dataKey) => {
    // 1. Try API if appropriate
    if (shouldCallApi() && API_URL) {
        try {
            const url = endpoint.startsWith('http') ? endpoint : `${API_URL}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
            console.warn(`API ${endpoint} returned ${response.status}, falling back...`);
        } catch (error) {
            console.warn(`API ${endpoint} failed: ${error.message}, falling back...`);
        }
    }

    // 2. Fallback to local data.json
    try {
        const localDataUrl = getAssetPath("data.json");
        const response = await fetch(localDataUrl);
        if (!response.ok) throw new Error("Local data not found");

        const staticData = await response.json();

        // If dataKey is provided, return just that part
        if (dataKey) {
            return { [dataKey]: staticData[dataKey] };
        }

        return staticData;
    } catch (error) {
        console.error("Critical: Both API and fallback failed:", error);
        return null;
    }
};

export default fetchData;
