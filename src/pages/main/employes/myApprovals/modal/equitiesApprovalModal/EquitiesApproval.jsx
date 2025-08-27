import React, { useEffect, useMemo, useState } from "react";
import { Col, Row, Select, Space, Checkbox } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import {
  GlobalModal,
  InstrumentSelect,
  TextField,
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
} from "../../../../../../commen/funtions/rejex";

const EquitiesApproval = () => {
  const navigate = useNavigate();

  const { isEquitiesModalVisible, setIsEquitiesModalVisible, setIsSubmit } =
    useGlobalModal();

  const {
    employeeBasedBrokersData,
    allInstrumentsData,
    addApprovalRequestData,
  } = useDashboardContext();

  const { showNotification } = useNotification();

  const { showLoader } = useGlobalLoader();

  const { callApi } = useApi();

  //For Instrument Dropdown show selected Name
  const [selectedInstrument, setSelectedInstrument] = useState(null);

  // for employeeBroker state to show data in dropdown
  const [selectedBrokers, setSelectedBrokers] = useState([]);

  //For Type and Asset Type States to show Data in Type Dropdown
  const [selectedTradeApprovalType, setSelectedTradeApprovalType] =
    useState(null);

  //To Show Asset type Id
  const [selectedAssetTypeID, setSelectedAssetTypeID] = useState(null);

  //To Show Asset type Name
  const [selectedAssetTypeName, setSelectedAssetTypeName] = useState("");

  //For Quantity Data State
  const [quantity, setQuantity] = useState("");

  // Refactor sessionStorage read with useMemo for performance & error handling
  const lineManagerDetails = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("line_Manager_Details") || "{}");
    } catch (e) {
      console.error("Invalid JSON in sessionStorage", e);
      return {};
    }
  }, []);

  // this is how I extract data fro the AllInstrumentsData which is stored in dashboardContextApi
  const formattedInstruments = (allInstrumentsData || []).map((item) => ({
    type: item?.instrumentID,
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
    raw: broker, // keep full broker data for later use
  }));

  // Handle when user selects/deselects brokers
  const handleBrokerChange = (selectedIDs) => {
    const selectedData = brokerOptions
      .filter((item) => selectedIDs.includes(item.value))
      .map((item) => item.raw);

    setSelectedBrokers(selectedData);
  };

  // Format type options from addApprovalRequestData show data in type Select
  const typeOptions = (addApprovalRequestData?.Equities || []).map((item) => ({
    label: item.type,
    value: item.tradeApprovalTypeID,
    assetTypeID: item.assetTypeID,
  }));

  //  Prepare selected values for Select's `value` prop
  const selectedBrokerIDs = selectedBrokers.map((b) => b.brokerID);

  // Handle Select For Instrument Data
  const handleSelect = (value) => {
    const selectedObj = formattedInstruments.find(
      (item) => item.type === value
    );
    setSelectedInstrument(selectedObj || null);
  };

  // Handler For Type
  const handleTypeSelect = (value) => {
    const selected = typeOptions.find((opt) => opt.value === value);
    setSelectedTradeApprovalType(value);
    setSelectedAssetTypeID(selected?.assetTypeID || null);
    setSelectedAssetTypeName(selected?.label || "");
  };

  // Handler For quantity
  const handleQuantityChange = (e) => {
    let { value } = e.target;

    // remove commas
    const rawValue = value.replace(/,/g, "");

    // sirf numbers allow karo
    if (rawValue === "" || allowOnlyNumbers(rawValue)) {
      // max length 20 enforce kar do
      if (rawValue.length <= 20) {
        const formattedValue = rawValue ? formatNumberWithCommas(rawValue) : "";
        setQuantity(formattedValue);
      }
    }
  };

  // Clear state by clicking on Cross Icon in Instrument dropdown
  const handleClearInstrument = () => {
    setSelectedInstrument(null);
  };

  // A Function For Fetch api of AddTradeApproval
  const fetchAddApprovalsRequest = async () => {
    showLoader(true);

    const quantityNumber = quantity ? Number(quantity.replace(/,/g, "")) : null;

    const requestdata = {
      TradeApprovalID: 0,
      InstrumentID: selectedInstrument?.type || null,
      InstrumentName: selectedInstrument?.description || "",
      AssetTypeID: selectedAssetTypeID,
      ApprovalTypeID: selectedTradeApprovalType,
      Quantity: quantityNumber,
      InstrumentShortCode: selectedInstrument?.name || "",
      ApprovalType: selectedAssetTypeName,
      ApprovalStatusID: 1,
      Comments: "",
      BrokerIds: selectedBrokers.map((b) => b.brokerID),
      ListOfTradeApprovalActionableBundle: [
        {
          instrumentID: selectedInstrument?.type || null,
          instrumentShortName: selectedInstrument?.name || "",
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
  const clickOnSubmitButton = () => {
    fetchAddApprovalsRequest();
  };

  // Reset all states
  const resetStates = () => {
    setSelectedInstrument(null);
    setSelectedBrokers([]);
    setSelectedTradeApprovalType(null);
    setSelectedAssetTypeID(null);
    setSelectedAssetTypeID("");
    setQuantity("");
  };

  // Close handler
  const handleClose = async () => {
    await resetStates();
    setIsEquitiesModalVisible(false);
  };

  const isFormFilled = useMemo(() => {
    return (
      selectedInstrument !== null &&
      selectedTradeApprovalType !== null &&
      quantity.trim() !== "" &&
      selectedBrokers.length > 0
    );
  }, [
    selectedInstrument,
    selectedTradeApprovalType,
    quantity,
    selectedBrokers,
  ]);

  return (
    <>
      <GlobalModal
        visible={isEquitiesModalVisible}
        width={"800px"}
        centered={true}
        onCancel={handleClose}
        modalBody={
          <>
            <div className={styles.MainClassOfApprovals}>
              <Row>
                <Col>
                  <h3 className={styles.approvalHeading}>
                    Add Approval Request:{" "}
                    <span className={styles.approvalEquities}>Equities</span>
                  </h3>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <label className={styles.instrumentLabel}>
                    Instrument <span className={styles.aesterickClass}>*</span>
                  </label>
                  <InstrumentSelect
                    data={formattedInstruments}
                    onSelect={handleSelect}
                    value={selectedInstrument?.type || null}
                    onClear={handleClearInstrument}
                    className={styles.selectinstrumentclass}
                    disabled={allInstrumentsData.length === 0}
                  />
                </Col>
              </Row>

              <Row className={styles.mt1} gutter={[20, 20]}>
                <Col span={12}>
                  <label className={styles.instrumentLabel}>
                    Type <span className={styles.aesterickClass}>*</span>
                  </label>
                  <Select
                    label="Type"
                    name="Type"
                    placeholder={"Select"}
                    allowClear
                    // open={true}
                    options={typeOptions}
                    value={selectedTradeApprovalType}
                    onChange={handleTypeSelect}
                    disabled={typeOptions.length === 0}
                    prefixCls="EquitiesApprovalSelectPrefix"
                  />
                </Col>
                <Col span={12}>
                  <TextField
                    label={
                      <>
                        Quantity
                        <span className={styles.aesterickClass}> *</span>
                      </>
                    }
                    placeholder="Quantity"
                    className={styles.TextFieldOfQuantity}
                    type="text"
                    maxLength={15}
                    value={quantity}
                    onChange={handleQuantityChange}
                  />
                </Col>
              </Row>

              <Row className={styles.mt1} gutter={[20, 20]}>
                <Col span={12}>
                  <label className={styles.instrumentLabel}>
                    Brokers <span className={styles.aesterickClass}>*</span>
                  </label>
                  <Select
                    name="broker"
                    placeholder={"Select"}
                    mode="multiple"
                    value={selectedBrokerIDs}
                    onChange={handleBrokerChange}
                    options={brokerOptions}
                    className={styles.checkboxSelectofBroker}
                    disabled={employeeBasedBrokersData.length === 0}
                  />
                </Col>
              </Row>

              <Row className={styles.mt1}>
                <Col span={12}>
                  <label className={styles.instruLabel}>Line Manager</label>
                </Col>
                <Col>
                  <div className={styles.linemanagerBackground}>
                    <Row>
                      <Col span={12}>
                        <label className={styles.instruLabelForManager}>
                          Name:
                        </label>
                        <p className={styles.lineManagername}>
                          {lineManagerDetails?.lineManagerName || "-"}
                        </p>
                      </Col>

                      <Col span={12}>
                        <label className={styles.instruLabelForManager}>
                          Email:
                        </label>
                        <p className={styles.lineManagername}>
                          {lineManagerDetails?.lineManagerEmail || "-"}
                        </p>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </div>
          </>
        }
        modalFooter={
          <>
            <Row
              gutter={[12, 30]}
              justify="end"
              className={styles.mainButtonDiv}
            >
              <Col>
                <Space>
                  <CustomButton
                    text={"Close"}
                    className="big-light-button"
                    onClick={handleClose}
                  />
                  <CustomButton
                    text={"Submit"}
                    className="big-dark-button"
                    onClick={clickOnSubmitButton}
                    disabled={!isFormFilled}
                  />
                </Space>
              </Col>
            </Row>
          </>
        }
      />
    </>
  );
};

export default EquitiesApproval;
