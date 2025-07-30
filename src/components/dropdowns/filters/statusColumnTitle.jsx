// components/tables/columns/StatusColumnTitle.jsx
import React, { useEffect, useState } from "react";
import { Col, Dropdown, Row } from "antd";
import { DownOutlined } from "@ant-design/icons";
import StatusFilterDropdown from "./statusFilterDropdown";
import style from "../../../pages/main/employes/myApprovals/approval.module.css";

/**
 * Column title dropdown for Status filter
 */
const StatusColumnTitle = ({
  state,
  setState,
}) => {
  const [visible, setVisible] = useState(false);
  const [tempSelected, setTempSelected] = useState([]);

  const selected = state?.status || [];
  console.log("hello", selected);
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
      popupRender={() => (
        <StatusFilterDropdown
          confirm={() => setVisible(false)}
          clearFilters={() => {
            setState((prev) => ({
              ...prev,
              status: [],
            }));
            setVisible(false);
          }}
          state={state}
          setState={setState}
          tempSelected={tempSelected}
          setTempSelected={setTempSelected}
        />
      )}
      trigger={["click"]}
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
            {selected.length === 1
              ? selected[0]
              : selected.length > 1
              ? "Multiple"
              : "Status"}
          </Col>
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
