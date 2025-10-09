import React, { useCallback, useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";
import { Button } from "../../../../components";
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import {
  buildApprovalRequest,
  getBorderlessLineManagerTableColumns,
  mapEscalatedApprovalsToTableRows,
  mergeRows,
} from "./utill";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import EmptyState from "../../../../components/emptyStates/empty-states";
import style from "./approvalRequest.module.css";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import ViewDetailModal from "./modal/viewDetailLineManagerModal/ViewDetailModal";
import NoteLineManagerModal from "./modal/noteLineManagerModal/NoteLineManagerModal";
import ApprovedLineManagerModal from "./modal/approvedLineManagerModal/ApprovedLineManagerModal";
import DeclinedLineManagerModal from "./modal/declinedLineManagerModal/DeclinedLineManagerModal";
import ViewCommentLineManagerModal from "./modal/viewCommentLineManagerModal/ViewCommentLineManagerModal";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useSidebarContext } from "../../../../context/sidebarContaxt";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useApi } from "../../../../context/ApiContext";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import {
  GetAllLineManagerViewDetailRequest,
  SearchApprovalRequestLineManager,
} from "../../../../api/myApprovalApi";
import { useNavigate } from "react-router-dom";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";
import { useDashboardContext } from "../../../../context/dashboardContaxt";
import { toYYMMDD } from "../../../../commen/funtions/rejex";
import { useTableScrollBottom } from "../../../../commen/funtions/scroll";

const ApprovalRequest = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollLMApprovalRequest = useRef(null);

  const {
    viewDetailLineManagerModal,
    setViewDetailLineManagerModal,
    noteGlobalModal,
    approvedGlobalModal,
    declinedGlobalModal,
    viewCommentGlobalModal,
    setNoteGlobalModal,
    setIsSelectedViewDetailLineManager,
  } = useGlobalModal();

  const { showNotification } = useNotification();
  const { addApprovalRequestData } = useDashboardContext();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  // state of Search context which I'm getting from the SearchBar for Line Manager
  // Global state for filter/search values
  const {
    lineManagerApprovalSearch,
    setLineManagerApprovalSearch,
    resetLineManagerApprovalSearch,
  } = useSearchBarContext();

  // state of context which I'm getting from the myApproval for Line Manager
  const {
    lineManagerApproval,
    setLineManagerApproval,
    setViewDetailsLineManagerData,
    lineManagerApprovalMqtt,
    setLineManagerApprovalMQtt,
  } = useMyApproval();

  //local state to set data i table
  const [
    lineManagerApprovalRequestTableData,
    setLineManagerApprovalRequestTableData,
  ] = useState({
    rows: [],
    totalRecords: 0,
  });
  const [loadingMore, setLoadingMore] = useState(false);

  // Sort state for AntD Table
  const [sortedInfo, setSortedInfo] = useState({});

  // Confirmed filters displayed as tags
  const assetType = "Equities";
  /** 🔹 Build API request payload */


  /**
   * Fetches approval data from API on component mount
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;

      if (showLoaderFlag) showLoader(true);

      try {
        const response = await SearchApprovalRequestLineManager({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        const lineApprovals = Array.isArray(response?.lineApprovals)
          ? response.lineApprovals
          : [];
        console.log("lineApprovals", lineApprovals);
        // // map data according to used in table
        const mappedData = mapEscalatedApprovalsToTableRows(
          addApprovalRequestData?.Equities,
          lineApprovals
        );
        console.log("lineApprovals", mappedData);

        setLineManagerApproval({
          lineApprovals: mappedData,
          totalRecords: response?.totalRecords,
          apiCall: true,
          replace: replace,
        });
      } catch (error) {
        showNotification({
          type: "error",
          message: "Failed to fetch LineManager approvals. Please try again.",
        });
      } finally {
        if (showLoaderFlag) showLoader(false);
      }
    },
    [callApi, showNotification, showLoader, navigate, addApprovalRequestData]
  );

  /**
   * Runs only once to fetch api on initial render of a page
   */
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApprovalRequest(lineManagerApprovalSearch);

    fetchApiCall(requestData, true, true);
    setNoteGlobalModal({ visible: false, action: null });
    resetLineManagerApprovalSearch();
  }, []);

  // when data come to globle state this use useEffect trigger to set set data in local state
  useEffect(() => {
    if (!lineManagerApproval?.apiCall) return;
    const newData = mergeRows(
      lineManagerApprovalRequestTableData.rows,
      lineManagerApproval.lineApprovals,
      lineManagerApproval.replace
    );
    // Local state
    setLineManagerApprovalRequestTableData({
      rows: newData,
      totalRecords: newData?.length,
    });

    // global state return to its initial state but not data and total records
    setLineManagerApproval((prev) => ({
      ...prev,
      apiCall: false,
      replace: false,
    }));

    setLineManagerApprovalSearch((prev) => ({
      ...prev,
      pageNumber: prev.pageNumber + 10,
    }));
  }, [lineManagerApproval?.apiCall]);


  /**
   * Syncs filters on `filterTrigger` from context
   */
  useEffect(() => {
    if (lineManagerApprovalSearch.filterTrigger) {
      console.log("lineManagerApprovalSearch filterTrigger")
      // requestData, replace , mainLoader
      const requestData = buildApprovalRequest(lineManagerApprovalSearch,addApprovalRequestData?.[assetType]);
      fetchApiCall(requestData, true, true);

      setLineManagerApprovalSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [lineManagerApprovalSearch.filterTrigger]);

  useEffect(() => {
    if (!lineManagerApprovalMqtt) return;
    const requestData = buildApprovalRequest(lineManagerApprovalSearch);
    fetchApiCall(requestData, true, true);
    setLineManagerApprovalMQtt(false);
  }, [lineManagerApprovalMqtt]);

  // This Api is for the getAllViewDetailModal For LineManager
  const handleViewDetailsForLineManager = async (approvalID) => {
    await showLoader(true);
    const requestdata = { TradeApprovalID: approvalID };

    const responseData = await GetAllLineManagerViewDetailRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    if (responseData) {
      setViewDetailsLineManagerData(responseData);
      setViewDetailLineManagerModal(true);
    }
  };

  // Table columns with integrated filters
  const columns = getBorderlessLineManagerTableColumns({
    approvalStatusMap,
    sortedInfo,
    lineManagerApprovalSearch,
    setLineManagerApprovalSearch,
    setViewDetailLineManagerModal,
    setIsSelectedViewDetailLineManager,
    handleViewDetailsForLineManager,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      requesterName: { requesterName: "" },
      dateRange: { startDate: null, endDate: null },
      quantity: { quantity: 0 },
    };

    setLineManagerApprovalSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setLineManagerApprovalSearch((prev) => ({
      ...prev,
      instrumentName: "",
      requesterName: "",
      startDate: null,
      endDate: null,
      quantity: 0,
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { instrumentName, requesterName, startDate, endDate, quantity } =
      lineManagerApprovalSearch || {};

    return [
      instrumentName && {
        key: "instrumentName",
        value:
          instrumentName.length > 13
            ? instrumentName.slice(0, 13) + "..."
            : instrumentName,
      },
      requesterName && {
        key: "requesterName",
        value:
          requesterName.length > 13
            ? requesterName.slice(0, 13) + "..."
            : requesterName,
      },
      startDate &&
        endDate && {
          key: "dateRange",
          value: `${startDate} → ${endDate}`,
        },
      quantity &&
        Number(quantity) > 0 && {
          key: "quantity",
          value: Number(quantity).toLocaleString("en-US"),
        },
    ].filter(Boolean);
  })();

  useEffect(() => {
    try {
      // Get browser navigation entries (used to detect reload)
      const navigationEntries = performance.getEntriesByType("navigation");
      if (
        navigationEntries.length > 0 &&
        navigationEntries[0].type === "reload"
      ) {
        // Check localStorage for previously saved selectedKey
        resetLineManagerApprovalSearch();
      }
    } catch (error) {
      console.error(
        "❌ Error detecting page reload or restoring state:",
        error
      );
    }
  }, []);

  // For Lazy Loading
  useTableScrollBottom(
    async () => {
      if (
        lineManagerApproval?.totalRecords <=
        lineManagerApprovalRequestTableData?.totalRecords
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = {
          ...buildApprovalRequest(lineManagerApprovalSearch),
          PageNumber: lineManagerApprovalSearch.pageNumber || 0,
          Length: 10,
        };
        await fetchApiCall(requestData, false, false); // append mode
      } catch (error) {
        console.error("❌ Error loading more approvals:", error);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-orange"
  );
  return (
    <>
      {/* 🔹 Active Filter Tags */}
      {activeFilters.length > 0 && (
        <Row gutter={[12, 12]} className={style["filter-tags-container"]}>
          {activeFilters.map(({ key, value }) => (
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

          {/* 🔹 Show Clear All only if more than one filter */}
          {activeFilters.length > 1 && (
            <Col>
              <div
                className={`${style["filter-tag"]} ${style["clear-all-tag"]}`}
                onClick={handleRemoveAllFilters}
              >
                <span>Clear All</span>
              </div>
            </Col>
          )}
        </Row>
      )}

      {/* Page Content */}
      <PageLayout
        background="white"
        className={activeFilters.length > 0 && "changeHeight"}
      >
        <div className="px-4 md:px-6 lg:px-8">
          {/* Page Header */}
          <Row justify="space-between" align="middle" className="mb-4">
            <Col span={[24]}>
              <h2 className={style["heading"]}>Approval Requests</h2>
            </Col>
          </Row>

          {/* Table or Empty State */}
          <BorderlessTable
            rows={lineManagerApprovalRequestTableData.rows}
            columns={columns}
            scroll={
              lineManagerApprovalRequestTableData.rows.length
                ? {
                    x: "max-content",
                    y: activeFilters.length > 0 ? 450 : 500,
                  }
                : undefined
            }
            classNameTable="border-less-table-orange"
            onChange={(_, __, sorter) => setSortedInfo(sorter || {})}
            loading={loadingMore}
            ref={tableScrollLMApprovalRequest}
          />
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
