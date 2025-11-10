import React, { useState } from "react";
import { Spin, Table } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
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
  refClass,
  loadingMore,
  hasMore,
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const handleExpand = (expanded, record) => {
    setExpandedRowKeys((prev) =>
      expanded ? [...prev, record.id] : prev.filter((key) => key !== record.id)
    );
  };

  return (
    <div className={styles.accordianTableMainDiv} ref={refClass}>
      <Table
        columns={columns}
        dataSource={dataSource?.filter(
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
          expandIcon: ({ expanded, onExpand, record }) =>
            expanded ? (
              <UpOutlined
                className={styles["expand-icon"]}
                onClick={(e) => onExpand(record, e)}
              />
            ) : (
              <DownOutlined
                className={styles["expand-icon"]}
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

      {/* loading spinner at bottom while fetching */}
      {loadingMore && (
        <div style={{ textAlign: "center", padding: 12 }}>
          <Spin size="small" />
        </div>
      )}

      {/* no more data message */}
      {!hasMore && (
        <div style={{ textAlign: "center", padding: 12, color: "#888" }}>
          No more users to load
        </div>
      )}
    </div>
  );
};

export default AcordianTable;
