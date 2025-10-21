import React, { useEffect, useMemo, useState } from "react";
import { Col, Row, Select, Space, Checkbox } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import {
  GlobalModal,
  InstrumentSelect,
  TextField,
  TradeAndPortfolioModal,
} from "../../../../../../components";
import styles from "./EquitiesApproval.module.css";
import CustomButton from "../../../../../../components/buttons/button";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";
import { AddTradeApprovalRequest } from "../../../../../../api/myApprovalApi";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../../context/LoaderContext";
import { useApi } from "../../../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import {
  allowOnlyNumbers,
  formatNumberWithCommas,
} from "../../../../../../common/funtions/rejex";
import CopyToClipboard from "../../../../../../hooks/useClipboard";

const EquitiesApproval = () => {
  const navigate = useNavigate();

  const {
    isEquitiesModalVisible,
    setIsEquitiesModalVisible,
    setIsSubmit,
    selectedAssetTypeId,
  } = useGlobalModal();

  const { employeeBasedBrokersData, allInstrumentsData, assetTypeListingData } =
    useDashboardContext();

  const { showNotification } = useNotification();

  const { showLoader } = useGlobalLoader();

  const { callApi } = useApi();

  //For Instrument Dropdown show selected Name
  const [selectedInstrument, setSelectedInstrument] = useState(null);

  console.log(assetTypeListingData, "assetTypeListingData");

  // for employeeBroker state to show data in dropdown
  const [selectedBrokers, setSelectedBrokers] = useState([]);

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
  const assetTypeKey = Object.keys(assetTypeListingData || {})[0]; // e.g., "Equities"
  const assetTypeData = assetTypeListingData?.[assetTypeKey];

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
        <Checkbox
          checked={selectedBrokers.some((b) => b.brokerID === broker.brokerID)}
          style={{ marginRight: 8 }}
        />
        {broker.brokerName}
      </div>
    ),
    value: broker.brokerID,
    searchText: broker.brokerName,
    raw: broker, // keep full broker data for later use
  }));

  // Format type options from assetTypeListingData show data in type Select
  const typeOptions = Array.isArray(assetTypeData?.items)
    ? assetTypeData?.items.map((item) => ({
        label: item.type,
        value: item.tradeApprovalTypeID,
        assetTypeID: item.assetTypeID,
      }))
    : [];

  // A Function For Fetch api of AddTradeApproval
  const fetchAddApprovalsRequest = async (formData) => {
    showLoader(true);

    const quantityNumber = formData.quantity
      ? Number(formData.quantity.replace(/,/g, ""))
      : null;

    const requestdata = {
      TradeApprovalID: 0,
      InstrumentID: formData.selectedInstrument?.id || null,
      InstrumentName: formData.selectedInstrument?.description || "",
      AssetTypeID: selectedAssetTypeId || 0,
      ApprovalTypeID: formData.selectedTradeApprovalType,
      Quantity: quantityNumber,
      InstrumentShortCode: formData.selectedInstrument?.name || "",
      ApprovalType: formData.selectedAssetTypeName,
      ApprovalStatusID: 1,
      ResubmittedCommentID: 0,
      Comments: "",
      BrokerIds: formData.selectedBrokers.map((b) => b.brokerID),
      ListOfTradeApprovalActionableBundle: [
        {
          instrumentID: formData.selectedInstrument?.id || null,
          instrumentShortName: formData.selectedInstrument?.name || "",
          Entity: { EntityID: 1, EntityTypeID: 1 },
        },
      ],
    };

    await AddTradeApprovalRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      setIsEquitiesModalVisible,
      setIsSubmit,
      navigate,
    });
  };

  // Call an API which inside the fetchAddApprovals Request
  const clickOnSubmitButton = (formData) => {
    fetchAddApprovalsRequest(formData);
  };

  const handleCopyEmailOfLineManager = async () => {
    const emailToCopy =
      lineManagerDetails?.managerEmail || "LineManager@horizoncapital.com";

    try {
      await CopyToClipboard(emailToCopy); // ✅ Use your utility function here
      showNotification({
        type: "success",
        title: "Copied",
        description: "Email copied to clipboard.",
        placement: "bottomLeft",
      });
    } catch (error) {
      console.error("Email Not Copied:", error);
    }
  };

  // Close handler
  const handleClose = async () => {
    await resetStates();
    setIsEquitiesModalVisible(false);
  };

  return (
    <>
      <TradeAndPortfolioModal
        visible={isEquitiesModalVisible}
        onClose={() => setIsEquitiesModalVisible(false)}
        onSubmit={clickOnSubmitButton}
        instruments={formattedInstruments}
        brokerOptions={brokerOptions}
        typeOptions={typeOptions}
        mainHeading="Add Approval Request:"
        heading={assetTypeKey}
        ManagerHeading="Line Manager"
        showLineManager={lineManagerDetails}
        submitButtonText="Submit"
        closeButtonText="Close"
        lineManagerBackgroundClass={styles.linemanagerBackground}
        isUploadPortfolioTrue={false}
        copyEmail={handleCopyEmailOfLineManager}
      />
    </>
  );
};

export default EquitiesApproval;
