import React, { useState } from "react";
import { Col, Row, Select, Space, Checkbox } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import {
  CommenSearchInput,
  GlobalModal,
  InstrumentSelect,
  TextField,
} from "../../../../../../components";
import styles from "./EquitiesApproval.module.css";
import CustomButton from "../../../../../../components/buttons/button";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";

const EquitiesApproval = () => {
  const {
    isEquitiesModalVisible,
    setIsEquitiesModalVisible,
    setIsTradeRequestRestricted,
  } = useGlobalModal();

  const {
    employeeBasedBrokersData,
    allInstrumentsData,
    addApprovalRequestData,
  } = useDashboardContext();

  console.log(addApprovalRequestData, "employeeBasedBrokersData121");

  //For Instrument Dropdown show selected Name
  const [selectedInstrument, setSelectedInstrument] = useState(null);

  // for employeeBroker state to show data in dropdown
  const [selectedBrokers, setSelectedBrokers] = useState([]);

  //For Type State to show Data in Type Dropdown
  const [selectedType, setSelectedType] = useState(null);

  console.log(selectedType, "SelectedTypeChecker");

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
  }));

  //  Prepare selected values for Select's `value` prop
  const selectedBrokerIDs = selectedBrokers.map((b) => b.brokerID);

  // Handle Select For Instrument Data
  const handleSelect = (value) => {
    setSelectedInstrument(value);
  };

  const handleClearInstrument = () => {
    setSelectedInstrument(null);
  };

  const clickOnSubmitButton = () => {
    setIsEquitiesModalVisible(false); // Close Equities modal
    setIsTradeRequestRestricted(true);
  };

  return (
    <>
      <GlobalModal
        visible={isEquitiesModalVisible}
        width={"800px"}
        centered={true}
        onCancel={() => setIsEquitiesModalVisible(false)}
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
                  <label className={styles.instrumentLabel}>Instrument</label>
                  <InstrumentSelect
                    data={formattedInstruments}
                    onSelect={handleSelect}
                    value={selectedInstrument}
                    onClear={handleClearInstrument}
                    className={styles.selectinstrumentclass}
                    disabled={allInstrumentsData.length === 0}
                  />
                </Col>
              </Row>

              <Row className={styles.mt1} gutter={[20, 20]}>
                <Col span={12}>
                  <label className={styles.instrumentLabel}>Type</label>
                  <Select
                    label="Type"
                    name="Type"
                    placeholder={"Select"}
                    allowClear
                    options={typeOptions}
                    value={selectedType}
                    onChange={setSelectedType}
                    disabled={typeOptions.length === 0}
                    className={styles.checkboxSelect}
                  />
                </Col>
                <Col span={12}>
                  <TextField
                    label="Quantity"
                    placeholder="Quantity"
                    className={styles.TextFieldOfQuantity}
                  />
                </Col>
              </Row>

              <Row className={styles.mt1} gutter={[20, 20]}>
                <Col span={12}>
                  <label className={styles.instrumentLabel}>Brokers</label>
                  <Select
                    name="broker"
                    placeholder={"Select"}
                    mode="multiple"
                    value={selectedBrokerIDs}
                    onChange={handleBrokerChange}
                    options={brokerOptions}
                    className={styles.checkboxSelect}
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
                        <p className={styles.lineManagername}>Mr. John Doe</p>
                      </Col>

                      <Col span={12}>
                        <label className={styles.instruLabelForManager}>
                          Email:
                        </label>
                        <p className={styles.lineManagername}>
                          john.doe@example.com
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
                    onClick={() => setIsEquitiesModalVisible(false)}
                  />
                  <CustomButton
                    text={"Submit"}
                    className="big-dark-button"
                    onClick={clickOnSubmitButton}
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
