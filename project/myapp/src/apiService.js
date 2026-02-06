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
        // Try multiple paths to ensure we find the file (resilience for GitHub Pages vs Localhost)
        const pathsToTry = [
            getAssetPath("data.json"),
            "data.json", // Relative to current
            "/data.json", // Root
            "./data.json" // Explicit relative
        ];

        // Unique paths only
        const uniquePaths = [...new Set(pathsToTry.filter(p => p))];

        let response = null;
        let usedPath = "";

        for (const path of uniquePaths) {
            try {
                // console.log(`Attempting to fetch local data from: ${path}`);
                const res = await fetch(path);
                if (res.ok) {
                    response = res;
                    usedPath = path;
                    break;
                }
            } catch (e) {
                // Ignore failure and try next path
            }
        }

        if (!response || !response.ok) {
            console.error("Critical: All fallback paths for data.json failed");
            throw new Error("Local data not found");
        }

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
