import React from "react";
import { Empty, Table } from "antd";
import "./borderless.css";
import { SmileOutlined } from "@ant-design/icons";

const BorderlessTable = ({
  rows = [],
  columns,
  scroll,
  classNameTable,
  rowHoverable = false,
  onChange,
  loading,
  ref,
}) => {
  const CustomEmpty = () => (
    <div style={{ padding: "16px" }}>
      <SmileOutlined style={{ fontSize: "24px", color: "#ffcc00" }} />
      <p>No data available</p>
    </div>
  );

  return (
    <Table
      ref={ref}
      rowHoverable={rowHoverable}
      scroll={scroll}
      dataSource={rows}
      columns={columns}
      pagination={false}
      rowKey={(record) => record.id}
      bordered={false}
      prefixCls={classNameTable}
      onChange={onChange}
      loading={loading}
    />
  );
};

export default BorderlessTable;
