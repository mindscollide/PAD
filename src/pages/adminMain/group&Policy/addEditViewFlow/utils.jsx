/**
 * 🔹 Build API Request Body for Admin Group & Policy
 * Combines data from all tabs into a single payload for creation/update.
 */
export const buildApiRequest = (searchState = {}) => {
  const requestPayload = {
    GroupTitle: searchState?.details?.groupTitle?.trim() || "",
    GroupDescription: searchState?.details?.groupDiscription?.trim() || "",
    Policies: searchState?.policies || [],
    UserIDs: searchState?.users || [],
  };
  return requestPayload;
};

export const mapGroupPolicyResponse = (res) => {
  if (!res || typeof res !== "object") return null;

  const groupPolicy = res.groupPolicy || {};
  const policies = Array.isArray(res.policies) ? res.policies : [];
  const assignedUsers = Array.isArray(res.assignedUsers) ? res.assignedUsers : [];

  return {
    details: {
      groupTitle: groupPolicy.groupTitle || "",
      groupDiscription: groupPolicy.groupDescription || "",
    },
    policies: policies.map((p) => ({
      policyID: p.policyID || null,
      threshold: p.thresholdValue || "",
      dataTypeID: p.dataTypeID || null, // will be null if backend doesn't send it
    })),
    users: assignedUsers.map((u) => Number(u.userID)), // convert all to string
  };
};