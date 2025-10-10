import React, { useCallback, useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";
import { useNavigate } from "react-router-dom";

// Components
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";

// Contexts
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useApi } from "../../../../context/ApiContext";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import { useDashboardContext } from "../../../../context/dashboardContaxt";
import { useEscalatedApprovals } from "../../../../context/escalatedApprovalContext";

// Utilities
import {
  getBorderlessTableColumns,
  mapEscalatedApprovalsToTableRows,
} from "./utill";

import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";

import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";

import { toYYMMDD } from "../../../../common/funtions/rejex";

// API
import {
  SearchEscalatedApprovalsRequestMethod,
  GetHeadOfApprovalViewDetailRequest,
} from "../../../../api/escalatedApproval";

// Modals
import ViewDetailHeadOfApprovalModal from "./modals/viewDetailHeadOfApprovalModal/ViewDetailHeadOfApprovalModal";
import NoteHeadOfApprovalModal from "./modals/noteHeadOfApprovalModal/NoteHeadOfApprovalModal";
import DeclinedHeadOfApprovalModal from "./modals/declinedHeadOfApprovalModal/DeclinedHeadOfApprovalModal";
import ApprovedHeadOfApprovalModal from "./modals/approvedHeadOfApprovalModal/ApprovedHeadOfApprovalModal";
import ViewCommentHeadOfApprovalModal from "./modals/viewCommentHeadOfApprovalModal/ViewCommentHeadOfApprovalModal";

// Styles
import style from "./escalatedApprovals.module.css";
import { useTableScrollBottom } from "../../../../common/funtions/scroll";

const EscalatedApprovals = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEscalatedApprovals = useRef(null);

  // Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const { addApprovalRequestData } = useDashboardContext();

  const {
    viewDetailsHeadOfApprovalModal,
    setViewDetailsHeadOfApprovalModal,
    noteGlobalModal,
    headApprovalNoteModal,
    headDeclineNoteModal,
    viewCommentGlobalModal,
  } = useGlobalModal();

  const {
    escalatedApprovalData,
    setEscalatedApprovalData,
    setViewDetailsHeadOfApprovalData,
  } = useEscalatedApprovals();

  const {
    headOfTradeEscalatedApprovalsSearch,
    setHeadOfTradeEscalatedApprovalsSearch,
    resetHeadOfTradeApprovalEscalatedApprovalsSearch,
  } = useSearchBarContext();

  // Local State
  const [sortedInfo, setSortedInfo] = useState({});
  const [escalatedData, setEscalatedData] = useState({
    rows: [],
    totalRecords: 0,
  });
  const [loadingMore, setLoadingMore] = useState(false);

  // ===========================================================================
  // 📦 HELPERS
  // ===========================================================================

  const buildEscalatedTradeApprovalRequest = (searchState = {}) => {
    const formatDate = (date) => (date ? toYYMMDD(date) : "");
    return {
      RequesterName: searchState.requesterName || "",
      LineManagerName: searchState.lineManagerName || "",
      InstrumentName: searchState.instrumentName || "",
      RequestDateFrom: formatDate(searchState.requestDateFrom),
      RequestDateTo: formatDate(searchState.requestDateTo),
      EscalatedDateFrom: formatDate(searchState.escalatedDateFrom),
      EscalatedDateTo: formatDate(searchState.escalatedDateTo),
      StatusIds: mapStatusToIds(searchState.status) || [],
      TypeIds:
        mapBuySellToIds(searchState.type, addApprovalRequestData?.Equities) ||
        [],
      PageNumber: Number(searchState.pageNumber) || 0,
      Length: Number(searchState.pageSize) || 10,
    };
  };

  const mergeRows = (prevRows, newRows, replace = false) => {
    if (replace) return newRows;
    const ids = new Set(prevRows.map((r) => r.key));
    return [...prevRows, ...newRows.filter((r) => !ids.has(r.key))];
  };

  // ===========================================================================
  // 📦 API CALLS
  // ===========================================================================

  const fetchEscalatedApprovals = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;

      if (showLoaderFlag) showLoader(true);

      try {
        const response = await SearchEscalatedApprovalsRequestMethod({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        const transactions = Array.isArray(response?.htaEscalatedApprovals)
          ? response.htaEscalatedApprovals
          : [];

        const mappedData = mapEscalatedApprovalsToTableRows(
          addApprovalRequestData?.Equities,
          transactions
        );

        setEscalatedApprovalData({
          data: mappedData,
          totalRecords: response?.totalRecords,
          apiCall: true,
          replace,
        });
      } catch (error) {
        console.error("❌ Error fetching escalated approvals:", error);
        showNotification({
          type: "error",
          message: "Failed to fetch escalated approvals. Please try again.",
        });
      } finally {
        if (showLoaderFlag) showLoader(false);
      }
    },
    [callApi, showNotification, showLoader, navigate, addApprovalRequestData]
  );

  // ===========================================================================
  // 📦 EFFECTS
  // ===========================================================================

  // Initial fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const requestData = buildEscalatedTradeApprovalRequest(
      headOfTradeEscalatedApprovalsSearch
    );
    fetchEscalatedApprovals(requestData, true, true);
  }, []);

  // Sync escalatedApprovalData → local state
  useEffect(() => {
    if (!escalatedApprovalData?.apiCall) return;
    const newData = mergeRows(
      escalatedData.rows,
      escalatedApprovalData.data,
      escalatedApprovalData.replace
    );
    setEscalatedData({
      rows: newData,
      totalRecords: newData?.length,
    });
    setEscalatedApprovalData((prev) => ({ ...prev, apiCall: false }));
    setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
      ...prev,
      pageNumber: prev.pageNumber + 10,
    }));
  }, [escalatedApprovalData?.apiCall]);

  // Handle filters
  useEffect(() => {
    if (!headOfTradeEscalatedApprovalsSearch?.filterTrigger) return;

    const requestData = buildEscalatedTradeApprovalRequest(
      headOfTradeEscalatedApprovalsSearch
    );
    fetchEscalatedApprovals(requestData, true, true);

    setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
      ...prev,
      filterTrigger: false,
    }));
  }, [headOfTradeEscalatedApprovalsSearch?.filterTrigger]);

  // Reset on unmount
  useEffect(() => {
    return () => {
      setSortedInfo({});
      resetHeadOfTradeApprovalEscalatedApprovalsSearch();
      setEscalatedData({ rows: [], totalRecords: 0 });
    };
  }, []);

  const handleHeadOfApprovalViewDetail = async (approvalID) => {
    showLoader(true);
    const responseData = await GetHeadOfApprovalViewDetailRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata: { TradeApprovalID: approvalID },
      navigate,
    });

    if (responseData) {
      setViewDetailsHeadOfApprovalData(responseData);
      setViewDetailsHeadOfApprovalModal(true);
    }
  };
  // ===========================================================================
  // 📦 TABLE CONFIG
  // ===========================================================================

  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    headOfTradeEscalatedApprovalsSearch,
    setHeadOfTradeEscalatedApprovalsSearch,
    setViewDetailsHeadOfApprovalModal,
    onViewDetail: handleHeadOfApprovalViewDetail,
  });
  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      requesterName: { requesterName: "" },
      lineManagerName: { inlineManagerNamestrumentName: "" },
      dateRange: { escalatedDateFrom: null, requestDateTo: null },
      escalatedDateRange: { escalatedDateFrom: null, escalatedDateTo: null },
    };

    setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
      ...prev,
      instrumentName: "",
      requesterName: "",
      lineManagerName: "",
      requestDateFrom: null,
      requestDateTo: null,
      escalatedDateFrom: null,
      escalatedDateTo: null,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const {
      instrumentName,
      requesterName,
      lineManagerName,
      requestDateFrom,
      requestDateTo,
      escalatedDateFrom,
      escalatedDateTo,
    } = headOfTradeEscalatedApprovalsSearch || {};

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
          instrumentName.length > 13
            ? instrumentName.slice(0, 13) + "..."
            : instrumentName,
      },
      lineManagerName && {
        key: "lineManagerName",
        value:
          instrumentName.length > 13
            ? instrumentName.slice(0, 13) + "..."
            : instrumentName,
      },
      requestDateFrom &&
        requestDateTo && {
          key: "dateRange",
          value: `${requestDateFrom} → ${requestDateTo}`,
        },
      escalatedDateFrom &&
        escalatedDateTo && {
          key: "escalatedDateRange",
          value: `${escalatedDateFrom} → ${escalatedDateTo}`,
        },
    ].filter(Boolean);
  })();

  useTableScrollBottom(
    async () => {
      if (escalatedApprovalData?.totalRecords <= escalatedData?.rows?.length)
        return;

      try {
        setLoadingMore(true);
        const requestData = {
          ...buildEscalatedTradeApprovalRequest(
            headOfTradeEscalatedApprovalsSearch
          ),
          PageNumber: headOfTradeEscalatedApprovalsSearch.pageNumber || 0,
          Length: 10,
        };
        await fetchEscalatedApprovals(requestData, false, false); // append mode
        setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
          ...prev,
          pageNumber: (prev.pageNumber || 0) + 10,
        }));
      } catch (error) {
        console.error("❌ Error loading more approvals:", error);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-orange"
  );
  // ===========================================================================
  // 📦 RENDER
  // ===========================================================================

  return (
    <>
      {/* Filter Tags */}
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

      <PageLayout
        background="white"
        className={activeFilters.length > 0 && "changeHeight"}
      >
        <div className="px-4 md:px-6 lg:px-8">
          <Row justify="space-between" align="middle" className="mb-4">
            <Col span={24}>
              <h2 className={style["heading"]}>Escalated Approvals</h2>
            </Col>
          </Row>

          <BorderlessTable
            rows={escalatedData.rows}
            columns={columns}
            scroll={
              escalatedData.rows.length
                ? {
                    x: "max-content",
                    y: activeFilters.length > 0 ? 450 : 500,
                  }
                : undefined
            }
            classNameTable="border-less-table-orange"
            onChange={(_, __, sorter) => setSortedInfo(sorter || {})}
            loading={loadingMore}
            ref={tableScrollEscalatedApprovals}
          />
        </div>
      </PageLayout>

      {/* Modals */}
      {viewDetailsHeadOfApprovalModal && <ViewDetailHeadOfApprovalModal />}
      {noteGlobalModal && <NoteHeadOfApprovalModal />}
      {headApprovalNoteModal && <ApprovedHeadOfApprovalModal />}
      {headDeclineNoteModal && <DeclinedHeadOfApprovalModal />}
      {viewCommentGlobalModal && <ViewCommentHeadOfApprovalModal />}
    </>
  );
};

export default EscalatedApprovals;
