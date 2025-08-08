import React, { useMemo, useState } from "react";
import { Button, Input, Row, Col } from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import { AcordianTable, PageLayout } from "../../../../components";
import style from "./myHistory.module.css";
const MyHistory = () => {
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([]);

  const rawData = [
    {
      id: "REQ-001",
      instrument: "HUBC-OCT",
      date: "2025-08-07 10:30",
      nature: "Approval",
      type: "Buy",
      status: "Approved",
      quantity: 1000,
      trail: [
        { icon: "🟢", status: "Requested", date: "2025-08-06" },
        { icon: "🟡", status: "In Review", date: "2025-08-07" },
        { icon: "✅", status: "Approved", date: "2025-08-07" },
      ],
    },
      {
      id: "REQ-002",
      instrument: "HUBC-OCT",
      date: "2025-08-07 10:30",
      nature: "Approval",
      type: "Buy",
      status: "Approved",
      quantity: 1000,
      trail: [
        { icon: "🟢", status: "Requested", date: "2025-08-06" },
        { icon: "🟡", status: "In Review", date: "2025-08-07" },
        { icon: "✅", status: "Approved", date: "2025-08-07" },
      ],
    },
  ];

  const columns = useMemo(
    () => [
      {
        title: "Request / Transaction ID",
        dataIndex: "id",
        sorter: (a, b) => a.id.localeCompare(b.id),
      },
      {
        title: "Instrument",
        dataIndex: "instrument",
        sorter: (a, b) => a.instrument.localeCompare(b.instrument),
      },
      {
        title: "Date & Time of Approval Request",
        dataIndex: "date",
        sorter: (a, b) => new Date(a.date) - new Date(b.date),
        defaultSortOrder: "descend",
      },
      {
        title: "Nature",
        dataIndex: "nature",
        sorter: (a, b) => a.nature.localeCompare(b.nature),
      },
      {
        title: "Type",
        dataIndex: "type",
        sorter: (a, b) => a.type.localeCompare(b.type),
      },
      {
        title: "Status",
        dataIndex: "status",
        sorter: (a, b) => a.status.localeCompare(b.status),
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        sorter: (a, b) => a.quantity - b.quantity,
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return rawData.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchText.toLowerCase()) ||
        item.instrument.toLowerCase().includes(searchText.toLowerCase());

      const matchesDate =
        dateRange.length === 0 ||
        (new Date(item.date) >= dateRange[0] &&
          new Date(item.date) <= dateRange[1]);

      return matchesSearch && matchesDate;
    });
  }, [searchText, dateRange]);

  return (
    <PageLayout>
      <div>
        {/* Header & Actions */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16, marginTop: 26 }}
        >
          <Col>
            <span className={style["heading"]}>My History</span>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              style={{ marginRight: 8 }}
            >
              Export
            </Button>
          </Col>
        </Row>
        {/* Table */}
        <AcordianTable
          className="accordian-table-blue" // ✅ Matches module CSS
          columns={columns}
          dataSource={filteredData}
          onChange={(pagination, filters, sorter) => {
            console.log("Sorting/Filtering:", sorter);
          }}
          rowClassName={(record) =>
            record.status === "Approved" ? "approved-row" : ""
          }
        />
      </div>
    </PageLayout>
  );
};

export default MyHistory;
