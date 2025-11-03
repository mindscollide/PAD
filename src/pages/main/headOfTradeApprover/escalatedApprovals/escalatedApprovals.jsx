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
  buildApiRequest,
  getBorderlessTableColumns,
  mapEscalatedApprovalsToTableRows,
} from "./utill";

import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";

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
import { getSafeAssetTypeData } from "../../../../common/funtions/assetTypesList";

const EscalatedApprovals = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEscalatedApprovals = useRef(null);

  // Local State
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);

  // Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();
  const {
    viewDetailsHeadOfApprovalModal,
    setViewDetailsHeadOfApprovalModal,
    noteGlobalModal,
    headApprovalNoteModal,
    headDeclineNoteModal,
    viewCommentGlobalModal,
  } = useGlobalModal();
  const {
    htaEscalatedApprovalData,
    setHtaEscalatedApprovalData,
    htaEscalatedApprovalDataMqtt,
    setHtaEscalatedApprovalDataMqtt,
    setViewDetailsHeadOfApprovalData,
  } = useEscalatedApprovals();
  const {
    headOfTradeEscalatedApprovalsSearch,
    setHeadOfTradeEscalatedApprovalsSearch,
    resetHeadOfTradeApprovalEscalatedApprovalsSearch,
  } = useSearchBarContext();

  // ===========================================================================
  // 📦 API CALLS
  // ===========================================================================

  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;

      if (showLoaderFlag) showLoader(true);

      try {
        const res = await SearchEscalatedApprovalsRequestMethod({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        // ✅ Always get the freshest version (from memory or session)
        const currentAssetTypeData = getSafeAssetTypeData(
          assetTypeListingData,
          setAssetTypeListingData
        );

        const htaEscalatedApprovals = Array.isArray(res?.htaEscalatedApprovals)
          ? res.htaEscalatedApprovals
          : [];

        const mapped = mapEscalatedApprovalsToTableRows(
          currentAssetTypeData?.Equities,
          htaEscalatedApprovals
        );

        setHtaEscalatedApprovalData((prev) => ({
          htaEscalatedApprovalsList: replace
            ? mapped
            : [...(prev?.htaEscalatedApprovalsList || []), ...mapped],
          // this is for to run lazy loading its data comming from database of total data in db
          totalRecordsDataBase: res?.totalRecords || 0,
          // this is for to know how mush dta currently fetch from  db
          totalRecordsTable: replace
            ? mapped.length
            : htaEscalatedApprovalData.totalRecordsTable + mapped.length,
        }));

        setHeadOfTradeEscalatedApprovalsSearch((prev) => {
          const next = {
            ...prev,
            pageNumber: replace
              ? mapped.length
              : prev.pageNumber + mapped.length,
          };
          // this is for check if filter value get true only on that it will false
          if (prev.filterTrigger) {
            next.filterTrigger = false;
          }

          return next;
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
    [callApi, showNotification, showLoader, navigate, assetTypeListingData]
  );

  // ===========================================================================
  // 📦 EFFECTS
  // ===========================================================================

  // Initial fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(
      headOfTradeEscalatedApprovalsSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
  }, []);

  // Handle filters
  useEffect(() => {
    if (!headOfTradeEscalatedApprovalsSearch?.filterTrigger) return;

    const requestData = buildApiRequest(
      headOfTradeEscalatedApprovalsSearch,
      assetTypeListingData
    );
    fetchApiCall(requestData, true, true);
  }, [headOfTradeEscalatedApprovalsSearch?.filterTrigger]);

  // ----------------------------------------------------------------
  // 🔄 REAL-TIME: Handle new MQTT rows
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!htaEscalatedApprovalDataMqtt) return;

    let requestData = buildApiRequest(
      headOfTradeEscalatedApprovalsSearch,
      assetTypeListingData
    );
    requestData = {
      ...requestData,
      PageNumber: 0,
    };
    fetchApiCall(requestData, true, false);
    setHtaEscalatedApprovalDataMqtt(false);
  }, [htaEscalatedApprovalDataMqtt]);

  // Reset on unmount
  useEffect(() => {
    return () => {
      setSortedInfo({});
      setLoadingMore(false);
      resetHeadOfTradeApprovalEscalatedApprovalsSearch();
      setHtaEscalatedApprovalData({
        reconsileTransaction: [],
        totalRecordsDataBase: 0,
        totalRecordsTable: 0,
      });
      setHtaEscalatedApprovalDataMqtt(false);
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
      pageNumber: 0,
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
      if (
        htaEscalatedApprovalData?.totalRecordsDataBase <=
        htaEscalatedApprovalData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          headOfTradeEscalatedApprovalsSearch,
          assetTypeListingData
        );
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
            rows={htaEscalatedApprovalData?.htaEscalatedApprovalsList}
            columns={columns}
            scroll={
              htaEscalatedApprovalData?.htaEscalatedApprovalsList?.length
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
