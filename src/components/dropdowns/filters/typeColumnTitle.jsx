import React, { useEffect, useState } from "react";
import { Col, Dropdown, Row } from "antd";
import { DownOutlined } from "@ant-design/icons";
import TypeFilterDropdown from "./typesFilterDropdown";
import style from "../../../pages/main/employes/myApprovals/approval.module.css";

/**
 * Component: TypeColumnTitle
 * ----------------------------
 * This component renders a custom column header with a dropdown filter for "Type".
 * It shows the selected filters and updates the state on confirm or reset.
 *
 * Props:
 * - employeeMyApprovalSearch: Object containing search filters for approvals.
 * - setEmployeeMyApprovalSearch: Function to update the filter state.
 */
const TypeColumnTitle = ({
  state,
  setState,
}) => {
  // Local dropdown visibility state
  const [visible, setVisible] = useState(false);

  // Local temporary selected types (only committed to global state on confirm)
  const [tempSelected, setTempSelected] = useState([]);

  // Current global selected types (from context or parent)
  const selected = state?.type || [];

  /**
   * Sync local `tempSelected` when dropdown opens.
   * Reset `tempSelected` when dropdown closes.
   */
  useEffect(() => {
    if (visible) {
      setTempSelected(state?.type || []);
    } else {
      setTempSelected([]);
    }
  }, [visible]);

  return (
    <Dropdown
      open={visible}
      onOpenChange={setVisible}
      trigger={["click"]}
      popupRender={() => (
        <TypeFilterDropdown
          confirm={() => setVisible(false)} // Only commit state when confirmed inside dropdown
          clearFilters={() => {
            setState((prev) => ({
              ...prev,
              type: [],
            }));
            setVisible(false);
          }}
          state={state}
          setState={setState}
          onDropdownOpen={visible}
          tempSelected={tempSelected}
          setTempSelected={setTempSelected}
        />
      )}
      className={style["table-filter-dropdown"]}
    >
      <div
        className={`${style["custom-column-header"]} ${
          selected.length ? style["filtered-header"] : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Row gutter={[10, 10]}>
          <Col>
            {/* Display current filter state: single value, multiple, or default */}
            {selected.length === 1
              ? selected[0]
              : selected.length > 1
              ? "Multiple"
              : "Type"}
          </Col>
          <Col>
            {/* Arrow icon rotates when dropdown is open */}
            <DownOutlined
              className={`${style.icon} ${visible ? style.rotated : ""}`}
            />
          </Col>
        </Row>
      </div>
    </Dropdown>
  );
};

export default TypeColumnTitle;
