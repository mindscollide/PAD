export const buildApiRequest = (searchState = {}) => ({
  PolicyID: searchState.policyID || "",
  Scenario: searchState.scenario || "",
  Duration: searchState.duration || "",
  Consequence: searchState.consequence || "",
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});
