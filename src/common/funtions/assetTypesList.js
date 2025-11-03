/**
 * 🧠 getSafeAssetTypeData
 * 
 * Safely retrieves `assetTypeListingData` from memory or sessionStorage.
 * If data exists in sessionStorage, it restores it to React state and clears the session entry.
 *
 * @param {Object|null} assetTypeListingData - current in-memory data
 * @param {Function} [setAssetTypeListingData] - optional state setter
 * @returns {Object|null} the most up-to-date assetTypeListingData
 */
export const getSafeAssetTypeData = (assetTypeListingData, setAssetTypeListingData) => {
  try {
    // ✅ Return current state if it already has valid data
    if (assetTypeListingData?.Equities) return assetTypeListingData;

    // ⚠️ Otherwise, try to restore from sessionStorage
    const stored = sessionStorage.getItem("assetTypeListingData");
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (parsed) {
      // 🔁 Update React state if setter provided
      if (typeof setAssetTypeListingData === "function") {
        setAssetTypeListingData(parsed);
      }

      // 🧹 Remove from session after restoring to prevent duplication
      sessionStorage.removeItem("assetTypeListingData");

      return parsed;
    }

    return null;
  } catch (error) {
    console.error("❌ Failed to restore assetTypeListingData:", error);
    return null;
  }
};
