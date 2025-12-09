import React, { useState } from "react";
import { Row, Col } from "antd";
import styles from "./manageBroker.module.css"; // keep same CSS file
import { GlobalModal, InstrumentSelect } from "../../../../components";
import CustomButton from "../../../../components/buttons/button";
import { useDashboardContext } from "../../../../context/dashboardContaxt";
import EmptyState from "../../../../components/emptyStates/empty-states";

const ManageBrokerModal = ({
  open,
  onClose,
  onSubmit,
  instruments = [],
}) => {
  const { setEmployeeBasedBrokersData, employeeBasedBrokersData } =
    useDashboardContext();

  const [selectedInstrument, setSelectedInstrument] = useState(null);

  const handleSelect = (id) => {
    const selectedObj = instruments.find((item) => item.id === id);
    setSelectedInstrument(selectedObj || null);
  };

  const handleClearInstrument = () => {
    setSelectedInstrument(null);
  };

  const handleReset = () => {
    setSelectedInstrument(null);
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = () => {
    onSubmit({
      selectedInstrument,
    });
  };

  const isFormFilled = !!selectedInstrument;

  return (
    <GlobalModal
      visible={open}
      width="600px"
      centered
      onCancel={handleModalClose}
      modalBody={
        <div className={styles.MainClassOfApprovals}>
          {/* Heading */}
          <Row>
            <Col>
              <h3 className={styles.approvalHeading}>Manage Brokers</h3>
            </Col>
          </Row>

          {/* Only Instrument Field */}
          <Row className={styles.mt1}>
            <Col span={24}>
              <label className={styles.instrumentLabel}>
                Search Broker <span className={styles.aesterickClass}>*</span>
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
          <Row>
            {employeeBasedBrokersData?.length > 0 ? (
              <></>
            ) : (
              <EmptyState type="employeeBroker" />
            )}
          </Row>
        </div>
      }
      modalFooter={
        <div className={styles.mainButtonDiv}>
          <CustomButton
            text={"cancel"}
            className="big-light-button"
            onClick={handleModalClose}
          />

          <CustomButton
            text={"Save"}
            className="big-dark-button"
            onClick={handleSubmit}
            disabled={!isFormFilled}
          />
        </div>
      }
    />
  );
};

export default ManageBrokerModal;
