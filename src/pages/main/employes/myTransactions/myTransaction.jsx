import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import moment from "moment";
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import { getBorderlessTableColumns } from "./utill";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import style from "./myTransaction.module.css";
import EmptyState from "../../../../components/emptyStates/empty-states";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";

const MyTransaction = () => {
  const {
    employeeMyTransactionSearch,
    setEmployeeMyTransactionSearch,
    resetEmployeeMyTransactionSearch,
  } = useSearchBarContext();

  const [sortedInfo, setSortedInfo] = useState({});
  const [submittedFilters, setSubmittedFilters] = useState([]);

  let data = [
    {
      key: "1",
      transactionId: "TRX-001",
      instrument: "GDSC-OCT",
      type: "Buy",
      transactionDate: "2024-10-11T10:00:00",
      status: "Pending",
      quantity: "10,000",
      broker: "MRA Securities Ltd.",
    },
    {
      key: "2",
      transactionId: "TRX-002",
      instrument: "GDSC-NOV",
      type: "Sell",
      transactionDate: "2024-10-11T10:00:00",
      status: "Pending",
      quantity: 15000,
      broker: "Multiple Brokers",
    },
    {
      key: "3",
      transactionId: "TRX-003",
      instrument: "AIRLINK-NOV",
      type: "Buy",
      transactionDate: "2024-10-04T10:00:00",
      status: "Pending",
      quantity: 6000000,
      broker: "AKD Securities",
    },
    {
      key: "4",
      transactionId: "TRX-004",
      instrument: "PQQ-OCT",
      type: "Buy",
      transactionDate: "2024-10-11T10:00:00",
      status: "Compliant",
      quantity: 5000000,
      broker: "Multiple Brokers",
    },
    {
      key: "5",
      transactionId: "TRX-005",
      instrument: "PRI-OCT",
      type: "Sell",
      transactionDate: "2024-10-11T12:00:00",
      status: "Compliant",
      quantity: 2000,
      broker: "AKD Securities",
    },
    {
      key: "6",
      transactionId: "TRX-006",
      instrument: "PRL-NOV",
      type: "Buy",
      transactionDate: "2024-10-10T11:00:00",
      status: "Compliant",
      quantity: 5000000,
      broker: "AKD Securities",
    },
    {
      key: "7",
      transactionId: "TRX-007",
      instrument: "PPL-NOV",
      type: "Buy",
      transactionDate: "2024-10-09T10:00:00",
      status: "Compliant",
      quantity: 5000000,
      broker: "AKD Securities",
    },
    {
      key: "8",
      transactionId: "TRX-008",
      instrument: "HUBC-NOV",
      type: "Buy",
      transactionDate: "2024-10-15T10:00:00",
      status: "Non Compliant",
      quantity: 2000,
      broker: "MRA Securities",
    },
    {
      key: "9",
      transactionId: "TRX-009",
      instrument: "HUBC-OCT",
      type: "Sell",
      transactionDate: "2024-10-11T10:00:00",
      status: "Non Compliant",
      quantity: 20000,
      broker: "Multiple Brokers",
    },
  ];

  const columns = getBorderlessTableColumns(
    approvalStatusMap,
    sortedInfo,
    employeeMyTransactionSearch,
    setEmployeeMyTransactionSearch
  );

  // Define filters (excluding start/end date here, handled separately)
  const filterKeys = [
    { key: "instrumentName", label: "Instrument" },
    { key: "mainInstrumentName", label: "Main Instrument" },
    { key: "quantity", label: "Quantity" },
  ];

  // Removes a filter from context and submittedFilters state
  const handleRemoveFilter = (key) => {
    if (key === "dateRange") {
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        startDate: "",
        endDate: "",
      }));
    } else {
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        [key]: "",
      }));
    }

    setSubmittedFilters((prev) => prev.filter((item) => item.key !== key));
  };

  // On `filterTrigger`, sync filters from context into tag list
  useEffect(() => {
    if (employeeMyTransactionSearch.filterTrigger) {
      const snapshot = [];

      // Handle all non-date filters
      filterKeys.forEach(({ key, label }) => {
        const value = employeeMyTransactionSearch[key];
        if (value) {
          snapshot.push({
            key,
            label,
            value,
          });
        }
      });

      // Handle combined date range
      const { startDate, endDate } = employeeMyTransactionSearch;
      if (startDate || endDate) {
        const formattedStart = startDate
          ? moment(startDate).format("YYYY-MM-DD")
          : "N/A";
        const formattedEnd = endDate
          ? moment(endDate).format("YYYY-MM-DD")
          : "N/A";
        const label = "Date Range";
        const value = `${formattedStart} - ${formattedEnd}`;

        snapshot.push({
          key: "dateRange",
          label,
          value,
        });
      }

      setSubmittedFilters(snapshot);

      // Reset the filter trigger
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeeMyTransactionSearch.filterTrigger]);

  useEffect(() => {
    try {
      // Get browser navigation entries (used to detect reload)
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries.length > 0) {
        const navigationType = navigationEntries[0].type;
        if (navigationType === "reload") {
          // Check localStorage for previously saved selectedKey
          resetEmployeeMyTransactionSearch();
        }
      }
    } catch (error) {
      console.error(
        "❌ Error detecting page reload or restoring state:",
        error
      );
    }
  }, []);

  return (
    <>
      {/* Render Filter Tags */}
      {submittedFilters.length > 0 && (
        <Row gutter={[12, 12]} className={style["filter-tags-container"]}>
          {submittedFilters.map(({ key, label, value }) => (
            <Col key={key}>
              <div className={style["filter-tag"]}>
                <span>{value}</span>
                <span
                  className={style["filter-tag-close"]}
                  onClick={() => handleRemoveFilter(key)}
                >
                  &times;
                </span>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* Table Layout */}
      <PageLayout background="white">
        <div className="px-4 md:px-6 lg:px-8">
          <Row>
            <Col>
              <h2 className={style["heading"]}>My Transactions</h2>
            </Col>
          </Row>

          {data && data.length > 0 ? (
            <BorderlessTable
              rows={data}
              classNameTable="border-less-table-blue"
              scroll={{ x: "max-content", y: 550 }}
              columns={columns}
              onChange={(pagination, filters, sorter) => {
                setSortedInfo(sorter);
              }}
            />
          ) : (
            <EmptyState type="request" />
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default MyTransaction;
