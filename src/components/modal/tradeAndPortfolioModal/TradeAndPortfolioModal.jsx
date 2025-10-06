import React, { useMemo, useState } from "react";
import { Row, Col, Select, Checkbox, Tooltip } from "antd";
import { GlobalModal, InstrumentSelect, TextField } from "../../../components";
import styles from "./TradeAndPortfolioModal.module.css";
import CustomButton from "../../../components/buttons/button";
import copyIcon from "../../../assets/img/copy-dark.png";

import {
  allowOnlyNumbers,
  formatNumberWithCommas,
} from "../../../commen/funtions/rejex";

const TradeAndPortfolioModal = ({
  visible,
  onClose,
  onSubmit,
  instruments = [],
  brokerOptions = [],
  typeOptions = [],
  mainHeading = "",
  heading = "",
  showLineManager = {},
  loading = false,
  ManagerHeading,
  submitButtonText,
  closeButtonText,
  lineManagerBackgroundClass = "",
  isUploadPortfolioTrue,
  copyEmail,
}) => {
  //For Instrument Dropdown show selected Name
  const [selectedInstrument, setSelectedInstrument] = useState(null);

  // for employeeBroker state to show data in dropdown
  const [selectedBrokers, setSelectedBrokers] = useState([]);
  const [selectedTradeApprovalType, setSelectedTradeApprovalType] =
    useState(null);

  //For Type and Asset Type States to show Data in Type Dropdown
  const [selectedAssetTypeID, setSelectedAssetTypeID] = useState(null);

  //To Show Asset type Name
  const [selectedAssetTypeName, setSelectedAssetTypeName] = useState("");

  //For Quantity Data State
  const [quantity, setQuantity] = useState("");

  //  Prepare and Show Brokers selected values for Select's `value` prop
  const selectedBrokerIDs = selectedBrokers.map((b) => b.brokerID);

  // OnChange Handle when user selects/deselects brokers
  const handleBrokerChange = (selectedIDs) => {
    const selectedData = brokerOptions
      .filter((item) => selectedIDs.includes(item.value))
      .map((item) => item.raw);
    setSelectedBrokers(selectedData);
  };

  // Handle Select For Instrument Data
  const handleSelect = (id) => {
    const selectedObj = instruments.find((item) => item.id === id);
    setSelectedInstrument(selectedObj || null);
  };

  // Handler For Type
  const handleTypeSelect = (value) => {
    const selected = typeOptions.find((opt) => opt.value === value);
    setSelectedTradeApprovalType(value);
    setSelectedAssetTypeID(selected?.value || null);
    setSelectedAssetTypeName(selected?.label || "");
  };

  // Handler For quantity
  // Handler For Quantity
  const handleQuantityChange = (e) => {
    let { value } = e.target;
    const rawValue = value.replace(/,/g, "");

    // Block 0 and leading zeros
    if (rawValue === "0") {
      return; // ignore if exactly 0
    }
    if (/^0\d+/.test(rawValue)) {
      value = rawValue.replace(/^0+/, ""); // trim leading zeros
    }

    if (rawValue === "" || allowOnlyNumbers(rawValue)) {
      if (rawValue.length <= 20) {
        const formattedValue = rawValue
          ? formatNumberWithCommas(rawValue.replace(/^0+/, "")) // trim leading zeros before formatting
          : "";
        setQuantity(formattedValue);
      }
    }
  };

  // Clear state by clicking on Cross Icon in Instrument dropdown
  const handleClearInstrument = () => {
    setSelectedInstrument(null);
  };

  // Reset all states
  const resetStates = () => {
    setSelectedInstrument(null);
    setSelectedBrokers([]);
    setSelectedTradeApprovalType(null);
    setSelectedAssetTypeID(null);
    setSelectedAssetTypeName("");
    setQuantity("");
  };

  // Close handler
  const handleModalClose = async () => {
    resetStates();
    onClose();
  };

  // To dont enable the button until all selected
  const isFormFilled = useMemo(() => {
    return (
      selectedInstrument &&
      selectedTradeApprovalType &&
      quantity.trim() !== "" &&
      selectedBrokers.length > 0
    );
  }, [
    selectedInstrument,
    selectedTradeApprovalType,
    quantity,
    selectedBrokers,
  ]);

  const handleSubmit = () => {
    onSubmit({
      selectedInstrument,
      selectedBrokers,
      selectedTradeApprovalType,
      selectedAssetTypeID,
      selectedAssetTypeName,
      quantity,
    });
  };

  return (
    <GlobalModal
      visible={visible}
      width={"800px"}
      centered={true}
      onCancel={handleModalClose}
      modalBody={
        <div className={styles.MainClassOfApprovals}>
          <Row>
            <Col>
              <h3 className={styles.approvalHeading}>
                {mainHeading}
                <span className={styles.approvalEquities}>{heading}</span>
              </h3>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <label className={styles.instrumentLabel}>
                Instrument <span className={styles.aesterickClass}>*</span>
              </label>
              <InstrumentSelect
                data={instruments}
                onSelect={handleSelect}
                value={selectedInstrument?.id || null}
                onClear={handleClearInstrument}
                className={styles.selectinstrumentclass}
                disabled={instruments.length === 0}
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
                options={typeOptions}
                value={selectedTradeApprovalType}
                onChange={handleTypeSelect}
                prefixCls="EquitiesApprovalSelectPrefix"
              />
            </Col>
            <Col span={12}>
              <TextField
                label={
                  <>
                    Quantity <span className={styles.aesterickClass}>*</span>
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
            <Col span={24}>
              <label className={styles.instrumentLabel}>
                Brokers <span className={styles.aesterickClass}>*</span>
              </label>
              <Select
                mode="multiple"
                placeholder="Select"
                showSearch
                value={selectedBrokerIDs}
                onChange={handleBrokerChange}
                options={brokerOptions}
                maxTagCount={0}
                maxTagPlaceholder={(omittedValues) => {
                  return (
                    <Tooltip
                      title={`${omittedValues.length} selected`}
                      placement="topRight"
                    >
                      <span>{`${omittedValues.length} selected`}</span>
                    </Tooltip>
                  );
                }}
                prefixCls="EquitiesBrokerSelectPrefix"
                optionLabelProp="label"
                optionRender={(option) => (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      className="custom-broker-option"
                      checked={selectedBrokerIDs.includes(option.value)}
                      style={{ marginRight: 8 }}
                    />
                    {option.data.raw.brokerName}
                    {/* 👈 label is plain text now */}
                  </div>
                )}
                filterOption={(input, option) =>
                  option?.searchText
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Col>
          </Row>

          {showLineManager && (
            <Row className={styles.mt1}>
              <Col span={12}>
                <label className={styles.instruLabel}>{ManagerHeading}</label>
              </Col>
              <Col>
                <div
                  className={`${styles.linemanagerBackground} ${lineManagerBackgroundClass}`}
                >
                  <Row>
                    {isUploadPortfolioTrue ? (
                      <>
                        <Col span={10}>
                          <label className={styles.instruLabelForManager}>
                            Name:
                          </label>
                          <p className={styles.lineManagername}>
                            {showLineManager?.managerName || "-"}
                          </p>
                        </Col>
                        <Col span={11}>
                          <label className={styles.instruLabelForManager}>
                            Email:
                          </label>
                          <p className={styles.lineManagername}>
                            {showLineManager?.managerEmail || "-"}
                          </p>
                        </Col>
                        <Col span={3}>
                          <div
                            className={styles.copyEmailConductMainClass}
                            onClick={copyEmail}
                          >
                            <img draggable={false} src={copyIcon} />
                          </div>
                        </Col>
                      </>
                    ) : (
                      <>
                        <Col span={12}>
                          <label className={styles.instruLabelForManager}>
                            Name:
                          </label>
                          <p className={styles.lineManagername}>
                            {showLineManager?.managerName || "-"}
                          </p>
                        </Col>
                        <Col span={12}>
                          <label className={styles.instruLabelForManager}>
                            Email:
                          </label>
                          <p className={styles.lineManagername}>
                            {showLineManager?.managerEmail || "-"}
                          </p>
                        </Col>
                      </>
                    )}
                  </Row>
                </div>
              </Col>
            </Row>
          )}
        </div>
      }
      modalFooter={
        <div className={styles.mainButtonDiv}>
          <CustomButton
            text={closeButtonText}
            className="big-light-button"
            onClick={handleModalClose}
          />
          <CustomButton
            text={submitButtonText}
            className="big-dark-button"
            onClick={handleSubmit}
            disabled={!isFormFilled || loading}
            loading={loading}
          />
        </div>
      }
    />
  );
};

export default TradeAndPortfolioModal;
