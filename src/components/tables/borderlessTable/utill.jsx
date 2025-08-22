export const approvalStatusMap = {
  Pending: { backgroundColor: "#f5f5f5", textColor: "#333", label: "Pending" },
  Approved: { backgroundColor: "#C5FFC7", textColor: "#1a6e22", label: "Approved" },
  Declined: { backgroundColor: "#FFDBDB", textColor: "#a50000", label: "Declined" },
  Traded: { backgroundColor: "#B2F3BD", textColor: "#1a6e22", label: "Traded" },
  
  // Not-Traded come like this in previous Not Traded set like this thats why status wont show
  "Not-Traded": { backgroundColor: "#FFDBDB", textColor: "#a50000", label: "Not Traded" },

   // Not-Traded come like this in previous Not Traded set like this thats why status wont show
  Resubmit: { backgroundColor: "#f5f5f5", textColor: "#333", label: "Resubmitted" },

  
  "Non Compliant": { backgroundColor: "#FFDBDB", textColor: "#a50000", label: "Non-Compliant" },
  Compliant: { backgroundColor: "#C5FFC7", textColor: "#1a6e22", label: "Compliant" },
};

export const pendingApprovalstatusMap = {
  Pending: { backgroundColor: "#f5f5f5", textColor: "#333", label: "Pending" },
  "Non-Compliant": { backgroundColor: "#f5f5f5", textColor: "#333", label: "Non-Compliant" },
};