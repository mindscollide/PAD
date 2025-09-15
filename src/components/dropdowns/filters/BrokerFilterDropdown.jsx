// components/tables/columns/BrokerFilterDropdown.jsx

import React from "react";
import { Row, Col, Divider } from "antd";
import { Button, CheckBox } from "../.."; // your shared components
import styles from "./filter.module.css";

/**
 * BrokerFilterDropdown Component
 *
 * Dropdown for selecting brokers from a list.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.confirm - Function to confirm selection (closes dropdown).
 * @param {Function} props.clearFilters - Function to clear selected brokers.
 * @param {Function} props.setOpenState - State setter to control dropdown visibility.
 * @param {Object} props.state - Parent filter state object.
 * @param {Function} props.setState - State setter for parent filter state.
 * @param {Array} props.tempSelected - Temporary list of selected brokers (IDs).
 * @param {Function} props.setTempSelected - Setter for temporary selected brokers.
 * @param {Array} props.brokerOptions - List of broker objects { brokerID, brokerName }.
 *
 * @returns {JSX.Element} Rendered broker filter dropdown
 */
const BrokerFilterDropdown = ({
  confirm,
  clearFilters,
  setOpenState,
  state,
  setState,
  tempSelected,
  setTempSelected,
  brokerOptions,
}) => {
  /** Toggle selection for a broker */
  const toggleSelection = (brokerID) => {
    setTempSelected((prev) =>
      prev.includes(brokerID)
        ? prev.filter((id) => id !== brokerID)
        : [...prev, brokerID]
    );
  };

  /** Confirm selection and update parent state */
  const handleOk = () => {
    setState((prev) => ({
      ...prev,
      broker: tempSelected, // store brokerIDs in state
    }));
    setOpenState(false);
    confirm();
  };

  /** Reset selection */
  const handleReset = () => {
    setState((prev) => ({
      ...prev,
      broker: [],
    }));
    setTempSelected([]);
    clearFilters?.();
    setOpenState(false);
    confirm();
  };

  return (
    <div className={styles.dropdownContainer}>
      {/* Checkbox List */}
      <div className={styles.checkboxList}>
        {brokerOptions?.map((broker, index) => (
          <React.Fragment key={broker.brokerID}>
            <CheckBox
              value={broker.brokerID}
              label={broker.brokerName}
              checked={tempSelected.includes(broker.brokerID)}
              onChange={() => toggleSelection(broker.brokerID)}
            />
            {brokerOptions.length - 1 !== index && (
              <Divider className={styles.divider} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Action Buttons */}
      <div className={styles.buttonGroup}>
        <Row gutter={10}>
          <Col>
            <Button
              className="small-light-button"
              text="Reset"
              onClick={handleReset}
            />
          </Col>
          <Col>
            <Button
              className="small-dark-button"
              text="Ok"
              onClick={handleOk}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BrokerFilterDropdown;
