/* ------------------------------------------------------------------ */
/* 🔹 Trade Type Resolver */
/* ------------------------------------------------------------------ */
/**
 * Resolves trade type label by matching the given `tradeType` ID
 * with the API-provided `assetTypeData`.
 *
 * @param {Object} assetTypeData - Asset type API response object.
 * @param {Array<Object>} assetTypeData.items - Array of trade approval types.
 * @param {Object} tradeType - Trade type object (with typeID).
 * @param {string|number} tradeType.typeID - Trade type ID.
 * @returns {string} The trade type label (e.g., "Buy", "Sell") or "—".
 */
export const getTradeTypeById = (assetTypeData, tradeType) => {
  if (!Array.isArray(assetTypeData?.items)) return "—";
  return (
    assetTypeData.items.find((i) => i.tradeApprovalTypeID === tradeType.typeID)
      ?.type || "—"
  );
};
