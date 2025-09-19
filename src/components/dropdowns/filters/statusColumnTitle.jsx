// components/tables/columns/StatusColumnTitle.jsx

import React, { useEffect, useState } from "react";
import { Col, Dropdown, Row } from "antd";
import { DownOutlined } from "@ant-design/icons";
import StatusFilterDropdown from "./statusFilterDropdown";
import style from "../../../pages/main/employes/myApprovals/approval.module.css";

/**
 * StatusColumnTitle Component
 *
 * Renders a column title with a filter dropdown for selecting approval statuses.
 * Displays the currently selected status (or "Multiple" if more than one is chosen).
 * Integrates with `StatusFilterDropdown` to provide filter selection UI.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.state - The parent filter state object.
 * @param {Function} props.setState - Setter function for updating the parent filter state.
 *
 * @returns {JSX.Element} Rendered status column title with filter dropdown.
 */
const StatusColumnTitle = ({ state, setState }) => {
  /** Controls dropdown visibility */
  const [visible, setVisible] = useState(false);

  /** Temporary list of selected statuses while dropdown is open */
  const [tempSelected, setTempSelected] = useState([]);

  /** The confirmed selected statuses from parent state */
  const selected = state?.status || [];

  /**
   * Syncs temporary selection with parent state when dropdown opens/closes.
   * - When opened → copy current selected values into temp state.
   * - When closed → reset temp state.
   */
  console.log("selected",selected)
  useEffect(() => {
    if (visible) {
      setTempSelected(selected);
    } else {
      setTempSelected([]);
    }
  }, [visible]);

  return (
    <Dropdown
      open={visible}
      onOpenChange={setVisible}
      trigger={["click"]}
      className={style["table-filter-dropdown"]}
      /** Custom dropdown content */
      popupRender={() => (
        <StatusFilterDropdown
          confirm={() => setVisible(false)} // close dropdown on confirm
          clearFilters={() => {
            setState((prev) => ({
              ...prev,
              status: [],
            }));
            setVisible(false);
          }}
          setOpenState={setVisible}
          state={state}
          setState={setState}
          tempSelected={tempSelected}
          setTempSelected={setTempSelected}
        />
      )}
    >
      {/* Column Header Display */}
      <div
        className={`${style["custom-column-header"]} ${
          selected.length ? style["filtered-header"] : ""
        }`}
        onClick={(e) => e.stopPropagation()} // prevent table sort click
      >
        <Row gutter={[10, 10]}>
          {/* Status Label */}
          <Col>
            {
              selected.length === 1
                ? selected[0] // Single selection → show the status
                : selected.length > 1
                ? "Multiple" // Multiple selections
                : "Status" // Default label
            }
          </Col>

          {/* Dropdown Icon (rotates when open) */}
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

export default StatusColumnTitle;
