import React, { useMemo, useState } from "react";
import { Button, Input, Row, Col } from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import { AcordianTable, PageLayout } from "../../../../components";
import style from "./myHistory.module.css";
import EmptyState from "../../../../components/emptyStates/empty-states";
import { getColumns } from "./utils";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
const MyHistory = () => {
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({});

  const {
    employeeMyHistorySearch,
    setEmployeeMyHistorySearch,
    resetEmployeeMyHistorySearch,
  } = useSearchBarContext();
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
    () =>
      getColumns(
        approvalStatusMap,
        sortedInfo,
        employeeMyHistorySearch,
        setEmployeeMyHistorySearch
      ),
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
        {rawData.length > 0 ? (
          <AcordianTable
            className="accordian-table-blue" // ✅ Matches module CSS
            columns={columns}
            dataSource={filteredData}
            onChange={(pagination, filters, sorter) => {
                setSortedInfo(sorter);
              }}
            rowClassName={(record) =>
              record.status === "Approved" ? "approved-row" : ""
            }
          />
        ) : (
          <EmptyState type="history" />
        )}
      </div>
    </PageLayout>
  );
};

export default MyHistory;
