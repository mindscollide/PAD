// components/tables/columns/BrokerColumnTitle.jsx

import React, { useEffect, useState } from "react";
import { Col, Dropdown, Row } from "antd";
import { DownOutlined } from "@ant-design/icons";
import BrokerFilterDropdown from "./BrokerFilterDropdown";
import style from "../../../pages/main/employes/myApprovals/approval.module.css";
import { useDashboardContext } from "../../../context/dashboardContaxt";

/**
 * BrokerColumnTitle Component
 *
 * Renders a column title with a filter dropdown for selecting brokers.
 * - Displays broker names in the header (or "Multiple" if more than one is selected).
 * - Stores only brokerIDs in parent state.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.state - The parent filter state object.
 * @param {Function} props.setState - Setter function for updating the parent filter state.
 *
 * @returns {JSX.Element} Rendered broker column title with filter dropdown.
 */
const BrokerColumnTitle = ({ state, setState }) => {
      const { employeeBasedBrokersData } = useDashboardContext();
    console.log("employeeBasedBrokersData",employeeBasedBrokersData)
  /** Controls dropdown visibility */
  const [visible, setVisible] = useState(false);

  /** Temporary selection of broker IDs */
  const [tempSelected, setTempSelected] = useState([]);

  /** Final confirmed broker IDs from state */
  const selected = state?.broker || [];

  /** Sync temp state with parent state on dropdown open/close */
  useEffect(() => {
    if (visible) {
      setTempSelected(selected);
    } else {
      setTempSelected([]);
    }
  }, [visible]);

  /** Resolve broker IDs → broker names for display */
  const selectedNames = employeeBasedBrokersData
    .filter((broker) => selected.includes(broker.brokerID))
    .map((b) => b.brokerName);

  return (
    <Dropdown
      open={visible}
      onOpenChange={setVisible}
      trigger={["click"]}
      className={style["table-filter-dropdown"]}
      popupRender={() => (
        <BrokerFilterDropdown
          confirm={() => setVisible(false)}
          clearFilters={() => {
            setState((prev) => ({
              ...prev,
              broker: [],
            }));
            setVisible(false);
          }}
          setOpenState={setVisible}
          state={state}
          setState={setState}
          tempSelected={tempSelected}
          setTempSelected={setTempSelected}
          brokerOptions={employeeBasedBrokersData}
        />
      )}
    >
      {/* Column Header Display */}
      <div
        className={`${style["custom-column-header"]} ${
          selected.length ? style["filtered-header"] : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Row gutter={[10, 10]}>
          {/* Broker label */}
          <Col>
            {selectedNames.length === 1
              ? selectedNames[0] // one broker selected → show its name
              : selectedNames.length > 1
              ? "Multiple"
              : "Broker"}
          </Col>

          {/* Dropdown Icon */}
          <Col>
            <DownOutlined
              className={`${style.icon} ${visible ? style.rotated : ""}`}
            />
          </Col>
        </Row>
      </div>
    </Dropdown>
  );
};

export default BrokerColumnTitle;
