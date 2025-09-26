export const handleEmployeeApprovalUpdate = (
  payload,
  currentemployeeMyApprovalSearchRef,
  setIsEmployeeMyApproval
) => {
  const hasSearchData =
    currentemployeeMyApprovalSearchRef.instrumentName ||
    currentemployeeMyApprovalSearchRef.mainInstrumentName ||
    currentemployeeMyApprovalSearchRef.startDate ||
    currentemployeeMyApprovalSearchRef.quantity ||
    currentemployeeMyApprovalSearchRef.status.length > 0 ||
    currentemployeeMyApprovalSearchRef.type.length > 0;

  // If no search filters are active, add the payload
  if (!hasSearchData) {
    setIsEmployeeMyApproval((prev) => {
      const currentApprovals = Array.isArray(prev?.approvals)
        ? prev.approvals
        : [];
      return {
        ...prev,
        approvals: [payload, ...currentApprovals],
        totalRecords: (prev?.totalRecords || 0) + 1,
      };
    });
    return;
  }

  // Define matching conditions
  const conditions = [
    // Instrument name condition
    () => {
      if (
        !currentemployeeMyApprovalSearchRef.instrumentName &&
        !currentemployeeMyApprovalSearchRef.mainInstrumentName
      ) {
        return true;
      }

      const searchInstrument =
        currentemployeeMyApprovalSearchRef.instrumentName ||
        currentemployeeMyApprovalSearchRef.mainInstrumentName;

      return payload.instrument.instrumentName.includes(searchInstrument);
    },

    // Start date condition
    () => {
      if (!currentemployeeMyApprovalSearchRef.startDate) return true;

      const payloadDateTime = payload.requestDate + payload.requestTime;
      return payloadDateTime === currentemployeeMyApprovalSearchRef.startDate;
    },

    // Quantity condition
    () => {
      if (!currentemployeeMyApprovalSearchRef.quantity) return true;
      return payload.quantity === currentemployeeMyApprovalSearchRef.quantity;
    },

    // Status condition
    () => {
      if (currentemployeeMyApprovalSearchRef.status.length === 0) return true;
      return currentemployeeMyApprovalSearchRef.status.includes(
        payload.approvalStatus.approvalStatusName
      );
    },

    // Type condition
    () => {
      if (currentemployeeMyApprovalSearchRef.type.length === 0) return true;
      return currentemployeeMyApprovalSearchRef.type.includes(
        payload.tradeType.typeName
      );
    },
  ];

  // Check if all conditions are met
  const matchesAllConditions = conditions.every((condition) => condition());

  if (matchesAllConditions) {
    setIsEmployeeMyApproval((prev) => {
      const currentApprovals = Array.isArray(prev?.approvals)
        ? prev.approvals
        : [];
      return {
        ...prev,
        approvals: [payload, ...currentApprovals],
        totalRecords: (prev?.totalRecords || 0) + 1,
      };
    });
  }
};

export const handleLineManagerApprovalNewTrade = (
  payload,
  currentlineManagerApprovalSearchRef,
  setLineManagerApproval
) => {
    console.log("mqtt :currentlineManagerApprovalSearchRef",currentlineManagerApprovalSearchRef)
  const hasSearchData =
    currentlineManagerApprovalSearchRef.instrumentName ||
    currentlineManagerApprovalSearchRef.mainInstrumentName ||
    currentlineManagerApprovalSearchRef.requesterName ||
    currentlineManagerApprovalSearchRef.date ||
    currentlineManagerApprovalSearchRef.quantity ||
    currentlineManagerApprovalSearchRef.status.length > 0 ||
    currentlineManagerApprovalSearchRef.type.length > 0;

  // If no search filters are active, add the payload
  if (!hasSearchData) {
    setLineManagerApproval((prev) => {
      const currentLineApprovals = Array.isArray(prev?.lineApprovals) ? prev.lineApprovals : [];
      return {
        ...prev,
        lineApprovals: [payload, ...currentLineApprovals],
        totalRecords: (prev?.totalRecords || 0) + 1,
      };
    });
    return;
  }

  // Define matching conditions
  const conditions = [
    // Instrument name condition
    () => {
      if (
        !currentlineManagerApprovalSearchRef.instrumentName &&
        !currentlineManagerApprovalSearchRef.mainInstrumentName
      )
        return true;

      const searchInstrument =
        currentlineManagerApprovalSearchRef.instrumentName ||
        currentlineManagerApprovalSearchRef.mainInstrumentName;
      return payload.instrument.instrumentName.includes(searchInstrument);
    },

    // Requester name condition
    () => {
      if (!currentlineManagerApprovalSearchRef.requesterName) return true;
      return payload.requesterName.includes(currentlineManagerApprovalSearchRef.requesterName);
    },

    // Date condition
    () => {
      if (!currentlineManagerApprovalSearchRef.date) return true;
      const payloadDateTime = payload.requestDate + payload.requestTime;
      return payloadDateTime === currentlineManagerApprovalSearchRef.date;
    },

    // Quantity condition
    () => {
      if (!currentlineManagerApprovalSearchRef.quantity) return true;
      return payload.quantity === currentlineManagerApprovalSearchRef.quantity;
    },

    // Status condition
    () => {
      if (currentlineManagerApprovalSearchRef.status.length === 0) return true;
      return currentlineManagerApprovalSearchRef.status.includes(
        payload.approvalStatus.approvalStatusName
      );
    },

    // Type condition
    () => {
      if (currentlineManagerApprovalSearchRef.type.length === 0) return true;
      return currentlineManagerApprovalSearchRef.type.includes(
        payload.tradeType.typeName
      );
    },
  ];

  // Check if all conditions are met
  const matchesAllConditions = conditions.every((condition) => condition());

  if (matchesAllConditions) {
    setLineManagerApproval((prev) => {
      const currentLineApprovals = Array.isArray(prev?.lineApprovals) ? prev.lineApprovals : [];
      return {
        ...prev,
        lineApprovals: [payload, ...currentLineApprovals],
        totalRecords: (prev?.totalRecords || 0) + 1,
      };
    });
  }
};