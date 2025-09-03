import React, { useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";
import { Button } from "../../../../components";
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import { getBorderlessLineManagerTableColumns } from "./utill";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import EmptyState from "../../../../components/emptyStates/empty-states";
import style from "./approvalRequest.module.css";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import ViewDetailModal from "./modal/viewDetailLineManagerModal/ViewDetailModal";
import NoteLineManagerModal from "./modal/noteLineManagerModal/NoteLineManagerModal";
import ApprovedLineManagerModal from "./modal/approvedLineManagerModal/approvedLineManagerModal";
import DeclinedLineManagerModal from "./modal/declinedLineManagerModal/DeclinedLineManagerModal";
import ViewCommentLineManagerModal from "./modal/viewCommentLineManagerModal/ViewCommentLineManagerModal";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useSidebarContext } from "../../../../context/sidebarContaxt";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useApi } from "../../../../context/ApiContext";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import { SearchTadeApprovals } from "../../../../api/myApprovalApi";
import { useNavigate } from "react-router-dom";

const ApprovalRequest = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const {
    viewDetailLineManagerModal,
    setViewDetailLineManagerModal,
    noteGlobalModal,
    approvedGlobalModal,
    declinedGlobalModal,
    viewCommentGlobalModal,
  } = useGlobalModal();

  const { showNotification } = useNotification();
  const { selectedKey } = useSidebarContext();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  // state of context which I'm getting from the myApproval for Line Manager
  const { lineManagerApproval, setLineManagerApproval } = useMyApproval();

  console.log(lineManagerApproval, "lineManagerApprovalChecker123");

  // state of Search context which I'm getting from the SearchBar for Line Manager
  // Global state for filter/search values
  const {
    lineManagerApprovalSearch,
    setLineManagerApprovalSearch,
    resetLineManagerApprovalSearch,
  } = useSearchBarContext();

  // Sort state for AntD Table
  const [sortedInfo, setSortedInfo] = useState({});

  // Confirmed filters displayed as tags
  const [submittedFilters, setSubmittedFilters] = useState([]);

  /**
   * Fetches approval data from API on component mount
   */
  const fetchApprovals = async () => {
    await showLoader(true);
    const requestdata = {
      InstrumentName:
        lineManagerApprovalSearch.instrumentName ||
        lineManagerApprovalSearch.mainInstrumentName,
      Date: lineManagerApprovalSearch.date || "",
      Quantity: lineManagerApprovalSearch.quantity || 0,
      StatusIds: lineManagerApprovalSearch.status || [],
      TypeIds: lineManagerApprovalSearch.type || [],
      PageNumber: 0,
      Length: lineManagerApprovalSearch.pageSize || 10,
    };

    const data = await SearchTadeApprovals({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    setLineManagerApproval(data);
  };

  /**
   * Runs only once to fetch approvals on initial render
   */
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchApprovals();
  }, []);

  // Sample static approval request data
  let data = [
    {
      id: 1,
      requesterName: "James Miller",
      instrument: "PSO-NOV",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Pending",
      isEscalated: false,
    },
    {
      id: 2,
      requesterName: "Emily Johnson",
      instrument: "PSO-OCT",
      type: "Sell",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Approved",
      isEscalated: false,
    },
    {
      id: 3,
      requesterName: "Michael Thompson",
      instrument: "PRL-OCT",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Not-Traded",
      isEscalated: true,
    },
    {
      id: 4,
      requesterName: "Sarah Wilson",
      instrument: "PRL-OCT",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Resubmit",
      isEscalated: true,
    },
    {
      id: 5,
      requesterName: "James Miller",
      instrument: "PSO-OCT",
      type: "Sell",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Declined",
      timeRemaining: "02 days 20 hours left",
    },
    {
      id: 6,
      requesterName: "Emily Johnson",
      instrument: "PRL-OCT",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Not-Traded",
      isEscalated: true,
    },
    {
      id: 7,
      requesterName: "Michael Thompson",
      instrument: "PRL-OCT",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Resubmit",
      isEscalated: true,
    },
    {
      id: 8,
      requesterName: "Sarah Wilson",
      instrument: "PSO-OCT",
      type: "Sell",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Approved",
      isEscalated: true,
    },
    {
      id: 9,
      requesterName: "James Miller",
      instrument: "PRL-OCT",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Not-Traded",
      isEscalated: true,
    },
    {
      id: 10,
      requesterName: "James Miller",
      instrument: "PRL-OAACT",
      type: "Buy",
      requestDateTime: "2024-10-11 | 10:00 pm",
      status: "Resubmit",
      isEscalated: false,
    },
  ];

  // Keys to track which filters to sync/display
  const filterKeys = [
    { key: "instrumentName", label: "Instrument" },
    { key: "mainInstrumentName", label: "Main Instrument" },
    { key: "date", label: "Date" },
    { key: "quantity", label: "Quantity" },
  ];

  // Table columns with integrated filters
  const columns = getBorderlessLineManagerTableColumns(
    approvalStatusMap,
    sortedInfo,
    lineManagerApprovalSearch,
    setLineManagerApprovalSearch,
    setViewDetailLineManagerModal
  );

  console.log(approvalStatusMap, "approvalStatusMapapprovalStatusMap");

  /**
   * Removes a filter from both context and UI tags
   */
  const handleRemoveFilter = (key) => {
    setLineManagerApprovalSearch((prev) => ({
      ...prev,
      [key]: "",
    }));

    setSubmittedFilters((prev) => prev.filter((item) => item.key !== key));
  };

  /**
   * Syncs filters on `filterTrigger` from context
   */
  useEffect(() => {
    if (lineManagerApprovalSearch.filterTrigger) {
      const snapshot = filterKeys
        .filter(({ key }) => lineManagerApprovalSearch[key])
        .map(({ key }) => ({
          key,
          value: lineManagerApprovalSearch[key],
        }));

      setSubmittedFilters(snapshot);

      // Reset filter trigger to avoid infinite loop
      setLineManagerApprovalSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [lineManagerApprovalSearch.filterTrigger]);

  useEffect(() => {
    try {
      // Get browser navigation entries (used to detect reload)
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries.length > 0) {
        const navigationType = navigationEntries[0].type;
        if (navigationType === "reload") {
          // Check localStorage for previously saved selectedKey
          resetLineManagerApprovalSearch();
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
            <Col span={[24]}>
              <h2 className={style["heading"]}>Approvals Request</h2>
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

      {/* To Show Line Manager View Detail Modal */}
      {viewDetailLineManagerModal && <ViewDetailModal />}

      {/* To Show Line Manager Note Modal */}
      {noteGlobalModal && <NoteLineManagerModal />}

      {/* To Show Line Manager Approved Modal */}
      {approvedGlobalModal && <ApprovedLineManagerModal />}

      {/* To Show Line Manager Declined Modal */}
      {declinedGlobalModal && <DeclinedLineManagerModal />}

      {/* To Show Line Manager View COmment Modal */}
      {viewCommentGlobalModal && <ViewCommentLineManagerModal />}
    </>
  );
};

export default ApprovalRequest;
