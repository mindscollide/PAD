// src/utils/statusConfig.js
import styles from "./ViewDetailTransactionModal.module.css";

/**
 * Returns label and style configuration for a given status ID
 * @param {number} statusId - Numeric status code
 * @returns {Object} { label: string, labelClass: string, borderClass: string }
 */
export const getStatusConfig = (statusId) => {
  const statusMapping = {
    1: {
      label: "Pending",
      labelClass: styles.pendingDetailHeading,
      borderClass: styles.pendingBorderClass,
    },
    2: {
      label: "Resubmit",
      labelClass: styles.resubmittedDetailHeading,
      borderClass: styles.resubmittedBorderClass,
    },
    3: {
      label: "Approved",
      labelClass: styles.approvedDetailHeading,
      borderClass: styles.approvedBorderClass,
    },
    4: {
      label: "Declined",
      labelClass: styles.declinedDetailHeading,
      borderClass: styles.declinedBorderClass,
    },
    5: {
      label: "Traded",
      labelClass: styles.pendingDetailHeading,
      borderClass: styles.pendingBorderClass,
    },
    6: {
      label: "Not-Traded",
      labelClass: styles.notTradedDetailHeading,
      borderClass: styles.notTradedBorderClass,
    },
    8: {
      label: "Compliant",
      labelClass: styles.approvedDetailHeading,
      borderClass: styles.approvedBorderClass,
    },
    9: {
      label: "Non-Compliant",
      labelClass: styles.declinedDetailHeading,
      borderClass: styles.declinedBorderClass,
    },
  };

  // Return the matching config, or a default if not found
  return statusMapping[statusId] || {
    label: "Unknown",
    labelClass: styles.defaultLabelClass,
    borderClass: styles.defaultBorderClass,
  };
};
