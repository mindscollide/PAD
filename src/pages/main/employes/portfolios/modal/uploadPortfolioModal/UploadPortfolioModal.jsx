import React, { useEffect, useMemo, useState } from "react";
import { Col, Row, Select, Space, Checkbox } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import {
  GlobalModal,
  InstrumentSelect,
  TextField,
  TradeAndPortfolioModal,
} from "../../../../../../components";
import styles from "./UploadPortfolioModal.module.css";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";
import { usePortfolioContext } from "../../../../../../context/portfolioContax";

const UploadPortfolioModal = () => {
  const { uploadPortfolioModal, setUploadPortfolioModal } =
    usePortfolioContext();

  const {
    employeeBasedBrokersData,
    allInstrumentsData,
    addApprovalRequestData,
  } = useDashboardContext();

  // Refactor sessionStorage read with useMemo for performance & error handling
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
      console.error("Invalid JSON in sessionStorage", e);
      return {};
    }
  }, []);

  //the types should come dynamicallyy like it should be Equities, FixedIncome
  const assetTypeKey = Object.keys(addApprovalRequestData || {})[0]; // e.g., "Equities"
  const assetTypeData = addApprovalRequestData?.[assetTypeKey];

  // this is how I extract data fro the AllInstrumentsData which is stored in dashboardContextApi
  const formattedInstruments = (allInstrumentsData || []).map((item) => ({
    id: item?.instrumentID,
    shortCode: assetTypeData?.shortCode,
    name: item?.instrumentCode,
    description: item?.instrumentName,
  }));

  // Format broker options
  const brokerOptions = (employeeBasedBrokersData || []).map((broker) => ({
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Checkbox style={{ marginRight: 8 }} />
        {broker.brokerName}
      </div>
    ),
    value: broker.brokerID,
    raw: broker, // keep full broker data for later use
  }));

  // Format type options from addApprovalRequestData show data in type Select
  const typeOptions = Array.isArray(assetTypeData?.items)
    ? assetTypeData?.items.map((item) => ({
        label: item.type,
        value: item.tradeApprovalTypeID,
        assetTypeID: item.assetTypeID,
      }))
    : [];

  return (
    <>
      <TradeAndPortfolioModal
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
    </>
  );
};

export default UploadPortfolioModal;
