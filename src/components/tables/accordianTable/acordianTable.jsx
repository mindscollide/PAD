import React, { useState } from "react";
import { Table } from "antd";
import { DownOutlined } from "@ant-design/icons";
import EmptyState from "../../emptyStates/empty-states";
import styles from "./AcordianTable.module.css";
import ApprovalStepper from "./approvalStepper";

const AcordianTable = ({
  columns,
  dataSource,
  onChange,
  rowClassName,
  searchText = "",
  className = "",
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const handleExpand = (expanded, record) => {
    setExpandedRowKeys((prev) =>
      expanded ? [...prev, record.id] : prev.filter((key) => key !== record.id)
    );
  };

  return (
    <Table
      className={styles[className] || ""}
      columns={columns}
      dataSource={dataSource.filter(
        (item) =>
          item.instrument?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.id?.toLowerCase().includes(searchText.toLowerCase())
      )}
      expandable={{
        expandedRowKeys,
        onExpand: handleExpand,
        expandedRowRender: (record) =>
          record.trail.length > 0 ? (
            <div className={styles["expanded-content"]}>
              <ApprovalStepper trail={record.trail} />
            </div>
          ) : (
            <EmptyState type="Underdevelopment" />
          ),
        expandIcon: ({ expanded, onExpand, record }) => (
          <DownOutlined
            className={`${styles["expand-icon"]} ${
              expanded ? styles["icon-rotated"] : ""
            }`}
            onClick={(e) => onExpand(record, e)}
          />
        ),
        expandIconColumnIndex: columns.length,
      }}
      pagination={false}
      rowKey="id"
      onChange={onChange}
      rowClassName={(record) => {
        const baseClass =
          rowClassName?.(record) && styles[rowClassName(record)]
            ? styles[rowClassName(record)]
            : rowClassName?.(record) || "";

        return expandedRowKeys.includes(record.id)
          ? `${baseClass} ${styles["expanded-row"]}`
          : baseClass;
      }}
    />
  );
};

export default AcordianTable;
