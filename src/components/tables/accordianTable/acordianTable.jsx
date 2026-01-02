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

  // const handleExpand = (expanded, record) => {
  //   setExpandedRowKeys((prev) =>
  //     expanded ? [...prev, record.id] : prev.filter((key) => key !== record.id)
  //   );
  // };

  // New work click on row to collapse panel as Sir amir said also mentioned in SRS in CO Section in my action page
  // ✅ Multiple rows can be expanded
  const toggleRowExpand = (record) => {
    setExpandedRowKeys((prev) =>
      prev.includes(record.id)
        ? prev.filter((key) => key !== record.id)
        : [...prev, record.id]
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
        rowKey="id"
        pagination={false}
        onChange={onChange}
        expandable={{
          expandedRowKeys,
          expandedRowRender: (record) =>
            record.trail?.length > 0 ? (
              <div className={styles["expanded-content"]}>
                <ApprovalStepper trail={record.trail} />
              </div>
            ) : (
              <EmptyState type="Underdevelopment" />
            ),
          expandIcon: ({ expanded }) =>
            expanded ? (
              <UpOutlined className={styles["expand-icon"]} />
            ) : (
              <DownOutlined className={styles["expand-icon"]} />
            ),
          expandIconColumnIndex: columns.length,
        }}
        onRow={(record) => ({
          onClick: () => toggleRowExpand(record),
        })}
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

      {loadingMore && (
        <div style={{ textAlign: "center", padding: 12 }}>
          <Spin size="small" />
        </div>
      )}
    </div>
  );
};

export default AcordianTable;
