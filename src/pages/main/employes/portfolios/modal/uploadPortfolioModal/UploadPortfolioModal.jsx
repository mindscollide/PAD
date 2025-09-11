// src/pages/employee/approval/UploadPortfolioModal.jsx

import React, { useEffect, useMemo, useState } from "react";
import { Checkbox } from "antd";
import { useNavigate } from "react-router-dom";

// Contexts
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";
import { usePortfolioContext } from "../../../../../../context/portfolioContax";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../../context/LoaderContext";
import { useApi } from "../../../../../../context/ApiContext";

// Components
import { TradeAndPortfolioModal } from "../../../../../../components";

// API
import { UploadPortFolioRequest } from "../../../../../../api/protFolioApi";

// Styles
import styles from "./UploadPortfolioModal.module.css";

/**
 * 📌 UploadPortfolioModal
 *
 * A modal form used to submit a portfolio upload request.
 * It allows users to:
 *  - Select an instrument
 *  - Choose broker(s)
 *  - Select trade approval type
 *  - Enter quantity
 *  - Submit request for compliance verification
 *
 * Contexts used:
 *  - PortfolioContext: controls modal visibility
 *  - DashboardContext: provides brokers, instruments, and approval type data
 *  - GlobalModal: submit state handling
 *  - GlobalLoader: global loading overlay
 *  - NotificationProvider: toast notifications
 */
const UploadPortfolioModal = () => {
  const navigate = useNavigate();

  // ✅ Context hooks
  const { uploadPortfolioModal, setUploadPortfolioModal } =
    usePortfolioContext();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const { setIsSubmit } = useGlobalModal();

  const {
    employeeBasedBrokersData,
    allInstrumentsData,
    addApprovalRequestData,
  } = useDashboardContext();

  /**
   * 🔹 Extract Line Manager details from sessionStorage
   * Used for showing "Compliance Officer" section in modal.
   */
  const lineManagerDetails = useMemo(() => {
    try {
      const storedData = JSON.parse(
        sessionStorage.getItem("user_Hierarchy_Details") || "[]"
      );

      if (!Array.isArray(storedData)) return {};

      const found = storedData.find(
        (item) => item.roleName === "Line Manager (LM)" && item.levelNo === 1
      );

      return found
        ? { managerName: found.managerName, managerEmail: found.managerEmail }
        : {};
    } catch (e) {
      console.error("❌ Invalid JSON in sessionStorage:", e);
      return {};
    }
  }, []);

  /**
   * 🔹 Asset type key → e.g., "Equities", "FixedIncome"
   * Data comes from `addApprovalRequestData` in DashboardContext.
   */
  const assetTypeKey = Object.keys(addApprovalRequestData || {})[0];
  const assetTypeData = addApprovalRequestData?.[assetTypeKey];
console.log("typeOptions",addApprovalRequestData)
  /**
   * 🔹 Format instruments for dropdown
   * Pulls instruments from DashboardContext and maps to {id, shortCode, name, description}.
   */
  const formattedInstruments = (allInstrumentsData || []).map((item) => ({
    id: item?.instrumentID,
    shortCode: assetTypeData?.shortCode,
    name: item?.instrumentCode,
    description: item?.instrumentName,
  }));

  /**
   * 🔹 Format broker options for checkbox dropdown
   * Each broker shows with a checkbox and label.
   */
  const brokerOptions = (employeeBasedBrokersData || []).map((broker) => ({
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Checkbox style={{ marginRight: 8 }} />
        {broker.brokerName}
      </div>
    ),
    value: broker.brokerID,
    raw: broker, // keep full broker object for future use
  }));

  /**
   * 🔹 Format type options (e.g., Buy, Sell)
   * Derived from `addApprovalRequestData`.
   */
  const typeOptions = Array.isArray(assetTypeData?.items)
    ? assetTypeData.items.map((item) => ({
        label: item.type,
        value: item.tradeApprovalTypeID,
        assetTypeID: item.assetTypeID,
      }))
    : [];

  /**
   * 🔹 Transform modal form values → API payload
   * @param {Object} formValues - values selected in modal form
   * @returns {Object} request payload for UploadPortFolioRequest
   */
  const transformRequestData = (formValues) => {
    const {
      selectedInstrument,
      selectedBrokers,
      selectedTradeApprovalType,
      selectedAssetTypeID,
      selectedAssetTypeName,
      quantity,
    } = formValues;

    return {
      TradeApprovalID: 0,
      InstrumentID: selectedInstrument?.id ?? 0,
      InstrumentName: selectedInstrument?.description ?? "",
      AssetTypeID: 1, // default
      ApprovalTypeID: selectedAssetTypeID ?? 1,
      Quantity: Number((quantity || "0").replace(/,/g, "")), // strip commas
      InstrumentShortCode: selectedInstrument?.name ?? "",
      ApprovalType: selectedAssetTypeName ?? "",
      ApprovalStatusID: 1, // default
      Comments: "",
      BrokerIds: (selectedBrokers || []).map((broker) => broker.brokerID),
      ListOfTradeApprovalActionableBundle: [
        {
          instrumentID: selectedInstrument?.id ?? 0,
          instrumentShortName: selectedInstrument?.name ?? "",
          Entity: {
            EntityID: selectedInstrument?.id ?? 0,
            EntityTypeID: 3, // portfolio workflow
          },
        },
      ],
    };
  };

  /**
   * 🔹 Handle form submission
   * @param {Object} formValues - submitted values from TradeAndPortfolioModal
   */
  const handleSubmit = (formValues) => {
    try {
      showLoader(true);

      const requestdata = transformRequestData(formValues);

      UploadPortFolioRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata,
        setUploadPortfolioModal,
        setIsSubmit,
        navigate,
      });
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      showNotification(
        "error",
        "Failed to upload portfolio. Please try again."
      );
      showLoader(false);
    }
  };

  return (
    <TradeAndPortfolioModal
      onSubmit={handleSubmit}
      visible={uploadPortfolioModal}
      onClose={() => setUploadPortfolioModal(false)}
      instruments={formattedInstruments}
      brokerOptions={brokerOptions}
      typeOptions={typeOptions}
      mainHeading="Upload Portfolio"
      ManagerHeading="Compliance Officer"
      showLineManager={lineManagerDetails}
      submitButtonText="Send for Verification"
      closeButtonText="Cancel"
      lineManagerBackgroundClass={styles.complianceOfficerClass}
      isUploadPortfolioTrue={true}
    />
  );
};

export default UploadPortfolioModal;
