/**
 * 🔹 Build brokerOptions array for Select
 * @param {Array} employeeBasedBrokersData - Array of brokers from API
 * @returns {Array} options formatted for antd Select
 */
export const buildBrokerOptions = (employeeBasedBrokersData = []) => {
  return employeeBasedBrokersData.map((broker) => ({
    label: broker.brokerName,   // string label for search
    value: broker.brokerID,     // unique ID
    raw: broker,                // keep full broker object for UI rendering
  }));
};

