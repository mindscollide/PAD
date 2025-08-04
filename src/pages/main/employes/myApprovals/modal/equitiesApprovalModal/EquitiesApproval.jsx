import React, { useState } from "react";
import { Col, Row, Select, Space, Button, Checkbox } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import {
  CommenSearchInput,
  GlobalModal,
  InstrumentSelect,
  TextField,
} from "../../../../../../components";
import styles from "./EquitiesApproval.module.css";
import CustomButton from "../../../../../../components/buttons/button";
import SubmittedModal from "../submittedModal/SubmittedModal";

const EquitiesApproval = () => {
  const {
    isEquitiesModalVisible,
    hideModal,
    setIsSubmit,
    isSubmit,
    setIsEquitiesModalVisible,
  } = useGlobalModal();

  const [selectedItems, setSelectedItems] = useState([]);

  const instrumentData = [
    {
      type: "EQ",
      name: "PSO",
      description: "Pakistan State Oil Company Limited - PSX",
    },
    {
      type: "FT",
      name: "PSO-OCT",
      description: "PSO-OCT - PSX",
    },
    {
      type: "FT",
      name: "PSO-NOV",
      description: "PSO-NOV - PSX",
    },
  ];

  const options = [
    { label: "K Trade Security", value: "1" },
    { label: "Arif Habib Limited", value: "2" },
    { label: "MRA Security Limited", value: "3" },
    { label: "AKD Securities", value: "4" },
  ];

  const handleSelect = (value) => {
    console.log("Selected:", value);
  };

  const handleAdd = (item) => {
    console.log("Add clicked for:", item.name);
  };

  const customOptions = options.map((item) => ({
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Checkbox
          checked={selectedItems.includes(item.value)}
          style={{ marginRight: 8 }}
        />
        {item.label}
      </div>
    ),
    value: item.value,
  }));

  const handleChange = (values) => {
    setSelectedItems(values);
  };

  const clickOnSubmitButton = () => {
    setIsEquitiesModalVisible(false); // Close Equities modal
    setIsSubmit(true);
  };

  return (
    <>
      <GlobalModal
        visible={isEquitiesModalVisible}
        width={"800px"}
        onCancel={hideModal}
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
                    data={instrumentData}
                    onSelect={handleSelect}
                    onAdd={handleAdd}
                    className={styles.selectinstrumentclass}
                  />
                </Col>
              </Row>

              <Row className={styles.mt1} gutter={[20, 20]}>
                <Col span={12} className={styles.mtopPx}>
                  <CommenSearchInput
                    label="Type"
                    name="broker"
                    placeholder={"Select"}
                    className={styles.selectinstrumentclass}
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
                    value={selectedItems}
                    onChange={handleChange}
                    options={customOptions}
                    className={styles.checkboxSelect}
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
                  <CustomButton text={"Close"} className="big-light-button" />
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

      {isSubmit && <SubmittedModal />}
    </>
  );
};

export default EquitiesApproval;
