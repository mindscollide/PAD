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

  const { employeeBasedBrokersData, allInstrumentsData } =
    useDashboardContext();

  console.log(employeeBasedBrokersData.length, "employeeBasedBrokersData121");
  console.log(allInstrumentsData.length, "employeeBasedBrokersData121");

  //For Instrument Dropdown show selected Name
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  console.log(selectedInstrument, "selectedInstrument");

  // for employeeBroker state to show data in dropdown
  const [selectedBrokers, setSelectedBrokers] = useState([]);
  console.log(selectedBrokers, "selectedBrokersselectedBrokers1");

  // this is how I extract data fro the AllInstrumentsData which is stored in dashboardContextApi
  const formattedInstruments = (allInstrumentsData || []).map((item) => ({
    type: item?.instrumentID,
    name: item?.instrumentCode,
    description: item?.instrumentName,
  }));

  // 🔹 Memoize broker options to avoid unnecessary re-renders
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
  //  Prepare selected values for Select's `value` prop
  const selectedBrokerIDs = selectedBrokers.map((b) => b.brokerID);
  console.log(selectedBrokerIDs, "selectedBrokerIDs");

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
                    name="broker"
                    placeholder={"Select"}
                    className={styles.checkboxSelect}
                  />
                </Col>
                <Col span={12}>
                  <TextField
                    label="Quantity"
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
