import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { Button, ComonDropDown } from "../../../../components";
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import { getBorderlessTableColumns } from "./utill";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import EmptyState from "../../../../components/emptyStates/empty-states";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import style from "./approval.module.css";

const Approval = () => {
  // Sample static approval request data
  let data = [
    {
      id: 1,
      instrument: "PSO-NOV",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Pending",
      quantity: 20000,
      timeRemaining: "-",
      isEscalated: false,
    },
    {
      id: 2,
      instrument: "PSO-OCT",
      type: "Sell",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Approved",
      quantity: 20000,
      timeRemaining: "02 days 20 hours left",
      isEscalated: false,
    },
    {
      id: 3,
      instrument: "PRL-OCT",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Not Traded",
      quantity: 40000,
      timeRemaining: "-",
      isEscalated: true,
    },
    {
      id: 4,
      instrument: "PRL-OCT",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Resubmitted",
      quantity: 20000,
      timeRemaining: "-",
      isEscalated: true,
    },
    {
      id: 5,
      instrument: "PSO-OCT",
      type: "Sell",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Approved",
      quantity: 20000,
      timeRemaining: "02 days 20 hours left",
    },
    {
      id: 6,
      instrument: "PRL-OCT",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Not Traded",
      quantity: 40000,
      timeRemaining: "-",
      isEscalated: true,
    },
    {
      id: 7,
      instrument: "PRL-OCT",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Resubmitted",
      quantity: 20000,
      timeRemaining: "-",
      isEscalated: true,
    },
    {
      id: 8,
      instrument: "PSO-OCT",
      type: "Sell",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Approved",
      quantity: 20000,
      timeRemaining: "02 days 20 hours left",
      isEscalated: true,
    },
    {
      id: 9,
      instrument: "PRL-OCT",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Not Traded",
      quantity: 40000,
      timeRemaining: "-",
      isEscalated: true,
    },
    {
      id: 10,
      instrument: "PRL-OAACT",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Resubmitted",
      quantity: 20000,
      timeRemaining: "-",
      isEscalated: false,
    },
  ];

  // Global state for filter/search values
  const {
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch,
    resetEmployeeMyApprovalSearch,
  } = useSearchBarContext();

  // Sort state for AntD Table
  const [sortedInfo, setSortedInfo] = useState({});

  // Confirmed filters displayed as tags
  const [submittedFilters, setSubmittedFilters] = useState([]);

  // Keys to track which filters to sync/display
  const filterKeys = [
    { key: "instrumentName", label: "Instrument" },
    { key: "mainInstrumentName", label: "Main Instrument" },
    { key: "date", label: "Date" },
    { key: "quantity", label: "Quantity" },
  ];

  // Dropdown menu items for Add Approval Request
  const menuItems = [
    {
      key: "1",
      label: "Equities",
      onClick: () => console.log("Equities clicked"),
    },
  ];

  // Table columns with integrated filters
  const columns = getBorderlessTableColumns(
    approvalStatusMap,
    sortedInfo,
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch
  );

  /**
   * Removes a filter from both context and UI tags
   */
  const handleRemoveFilter = (key) => {
    setEmployeeMyApprovalSearch((prev) => ({
      ...prev,
      [key]: "",
    }));

    setSubmittedFilters((prev) => prev.filter((item) => item.key !== key));
  };

  /**
   * Syncs filters on `filterTrigger` from context
   */
  useEffect(() => {
    if (employeeMyApprovalSearch.filterTrigger) {
      const snapshot = filterKeys
        .filter(({ key }) => employeeMyApprovalSearch[key])
        .map(({ key }) => ({
          key,
          value: employeeMyApprovalSearch[key],
        }));

      setSubmittedFilters(snapshot);

      // Reset filter trigger to avoid infinite loop
      setEmployeeMyApprovalSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeeMyApprovalSearch.filterTrigger]);

   useEffect(() => {
      try {
        // Get browser navigation entries (used to detect reload)
        const navigationEntries = performance.getEntriesByType("navigation");
        if (navigationEntries.length > 0) {
          const navigationType = navigationEntries[0].type;
          if (navigationType === "reload") {
            // Check localStorage for previously saved selectedKey
            resetEmployeeMyApprovalSearch();
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
      {/* Filter Tags Display */}
      {submittedFilters.length > 0 && (
        <Row gutter={[12, 12]} className={style["filter-tags-container"]}>
          {submittedFilters.map(({ key, value }) => (
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

      {/* Page Content */}
      <PageLayout background="white">
        <div className="px-4 md:px-6 lg:px-8">
          {/* Page Header */}
          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              <h2 className={style["heading"]}>My Approvals</h2>
            </Col>
            <Col>
              <ComonDropDown
                menuItems={menuItems}
                buttonLabel="Add Approval Request"
                className="dropedown-dark"
              />
            </Col>
          </Row>

          {/* Table or Empty State */}
          {data && data.length > 0 ? (
            <BorderlessTable
              rows={data}
              columns={columns}
              scroll={{ x: "max-content", y: 550 }}
              classNameTable="border-less-table-orange"
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

export default Approval;
