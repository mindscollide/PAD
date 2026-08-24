// src/pages/complianceOfficer/approval/Approval.jsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Col, Row } from "antd";
import { useNavigate } from "react-router-dom";

// 🔹 Components
import { ComonDropDown, SubmittedModal } from "../../../../components";
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../components/pageContainer/pageContainer";

// 🔹 Contexts
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useApi } from "../../../../context/ApiContext";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import { useDashboardContext } from "../../../../context/dashboardContaxt";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";

// 🔹 API
import {
  GetAllViewDetailsByTradeApprovalID,
  SearchTadeApprovals,
} from "../../../../api/myApprovalApi";

import {
  buildApiRequest,
  getBorderlessTableColumns,
  mapEmployeeMyApprovalData,
} from "./utils";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";

// 🔹 Modals
import EquitiesApproval from "./modal/equitiesApprovalModal/EquitiesApproval";
import RequestRestrictedModal from "./modal/requestRestrictedModal/RequestRestrictedModal";
import ViewDetailModal from "./modal/viewDetailModal/ViewDetailModal";
import ViewComment from "./modal/viewComment/ViewComment";
import ResubmitModal from "./modal/resubmitModal/ResubmitModal";
import ResubmitIntimationModal from "./modal/resubmitIntimationModal/ResubmitIntimationModal";
import ConductTransaction from "./modal/conductTransaction/ConductTransaction";

// 🔹 Styles
import style from "./approval.module.css";
import { useTableScrollBottom } from "../../../../common/funtions/scroll";
import { getSafeAssetTypeData } from "../../../../common/funtions/assetTypesList";
import IntimationTradeApprovalModal from "./modal/intimationModalAddTradeClose/IntimationModal";

const Approval = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeApproval = useRef(null);

  // ----------------- Contexts -----------------
  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const {
    employeeMyApproval,
    setIsEmployeeMyApproval,
    employeeMyApprovalMqtt,
    setIsEmployeeMyApprovalMqtt,
    setViewDetailsModalData,
  } = useMyApproval();

  const {
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch,
    resetEmployeeMyApprovalSearch,
  } = useSearchBarContext();

  const {
    isEquitiesModalVisible,
    setIsEquitiesModalVisible,
    isSubmit,
    isTradeRequestRestricted,
    isViewDetail,
    setIsViewDetail,
    isViewComments,
    isResubmitted,
    resubmitIntimation,
    isConductedTransaction,
    setSelectedAssetTypeId,
    addTradeApprovalIntimationModal,
  } = useGlobalModal();

  // ----------------- Local State -----------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [isEquitiesModalOpen, setIsEquitiesModalOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // ----------------- Dropdown -----------------

  // make a global context state which is selectedAssetTypeId to show select assetTypeID on selected dropdown value
  // from the add Approval Request in Approval list to send that selected assetType Id into AssetTypeID in
  // AddTradeApprovalRequest Api

  const menuItems = Object.entries(assetTypeListingData || {}).reduce(
    (acc, [categoryLabel, categoryData]) => {
      const items = categoryData?.items || [];

      items.forEach((item) => {
        const { assetTypeID } = item;
        const key = String(assetTypeID);

        // Avoid duplicate assetTypeID entries
        if (!acc.some((m) => m.key === key)) {
          acc.push({
            key,
            label: categoryLabel, // <-- This is dynamic: "Equities", "FixedIncome", etc.
            onClick: () => {
              setIsEquitiesModalOpen(true);
              setIsEquitiesModalVisible(true);
              setSelectedAssetTypeId(assetTypeID);
              console.log(
                `Open modal for: ${categoryLabel} (AssetTypeID: ${assetTypeID})`
              );
            },
          });
        }
      });

      return acc;
    },
    []
  );

  // ----------------- Helpers -----------------

  /** 🔹 Fetch approvals from API */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchTadeApprovals({
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

      const approvals = Array.isArray(res?.approvals) ? res.approvals : [];
      const mapped = mapEmployeeMyApprovalData(
        currentAssetTypeData?.Equities,
        approvals
      );

      setIsEmployeeMyApproval((prev) => ({
        approvals: replace ? mapped : [...(prev?.approvals || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : employeeMyApproval.totalRecordsTable + mapped.length,
      }));

      console.log(mapped, "mappedmappedEMPData");

      setEmployeeMyApprovalSearch((prev) => {
        const next = {
          ...prev,
          // SearchTradeApprovals's PageNumber is now a real 1-indexed
          // page number (backend fix 2026-08-05) — advance by one page
          // per fetch, not by however many rows just loaded.
          pageNumber: replace ? 2 : prev.pageNumber + 1,
        };

        // this is for check if filter value get true only on that it will false
        if (prev.filterTrigger) {
          next.filterTrigger = false;
        }

        return next;
      });
    },
    [
      assetTypeListingData,
      callApi,
      navigate,
      setIsEmployeeMyApproval,
      showLoader,
      showNotification,
    ]
  );

  /** 🔹 Handle "View Details" modal */
  const handleViewDetails = async (approvalID) => {
    await showLoader(true);
    const responseData = await GetAllViewDetailsByTradeApprovalID({
      callApi,
      showNotification,
      showLoader,
      requestdata: { TradeApprovalID: approvalID },
      navigate,
    });
    if (responseData) {
      setViewDetailsModalData(responseData);
      setIsViewDetail(true);
    }
  };

  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch,
    setIsViewDetail,
    onViewDetail: handleViewDetails,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      dateRange: { startDate: null, endDate: null },
      quantity: { quantity: 0 },
    };

    setEmployeeMyApprovalSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 1,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setEmployeeMyApprovalSearch((prev) => ({
      ...prev,
      instrumentName: "",
      startDate: null,
      endDate: null,
      quantity: 0,
      pageNumber: 1,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { instrumentName, startDate, endDate, quantity } =
      employeeMyApprovalSearch || {};

    return [
      instrumentName && {
        key: "instrumentName",
        value:
          instrumentName.length > 13
            ? instrumentName.slice(0, 13) + "..."
            : instrumentName,
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

  // ----------------- Effects -----------------

  // Initial Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildApiRequest(
        employeeMyApprovalSearch,
        assetTypeListingData
      );

      fetchApiCall(requestData, true, true);
    }
  }, [buildApiRequest, employeeMyApprovalSearch, fetchApiCall]);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      resetEmployeeMyApprovalSearch();
      setIsEmployeeMyApproval([]);
    };
  }, []);

  // Fetch on Filter Trigger
  useEffect(() => {
    if (employeeMyApprovalSearch.filterTrigger) {
      const requestData = buildApiRequest(
        employeeMyApprovalSearch,
        assetTypeListingData
      );

      fetchApiCall(requestData, true, true);
    }
  }, [employeeMyApprovalSearch.filterTrigger]);

  // Reload Detection
  useEffect(() => {
    try {
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries[0]?.type === "reload") resetEmployeeMyApprovalSearch();
    } catch (error) {
      console.error("Reload detection failed", error);
    }
  }, []);

  // MQTT Updates
  useEffect(() => {
    if (employeeMyApprovalMqtt) {
      setIsEmployeeMyApprovalMqtt(false);
      let requestData = buildApiRequest(
        employeeMyApprovalSearch,
        assetTypeListingData
      );
      requestData = {
        ...requestData,
        // PageNumber is now 1-indexed (backend fix 2026-08-05) — 1 is
        // "start from the top", matching this refresh's intent.
        PageNumber: 1,
      };
      fetchApiCall(requestData, true, false);
    }
  }, [employeeMyApprovalMqtt]);

  // Infinite Scroll
  useTableScrollBottom(
    async () => {
      if (
        employeeMyApproval?.totalRecordsDataBase <=
        employeeMyApproval?.totalRecordsTable
      )
        return;
      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          employeeMyApprovalSearch,
          assetTypeListingData
        );
        await fetchApiCall(requestData, false, false);
      } catch (err) {
        console.error("Error loading more approvals:", err);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-orange"
  );

  // ----------------- Render -----------------
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

      {/* 🔹 Page Layout */}
      <PageLayout
        background="white"
        className={activeFilters.length > 0 && "changeHeight"}
      >
        <div className="px-4 md:px-6 lg:px-8">
          {/* Header */}
          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              <h2 className={style["heading"]}>My Approvals</h2>
            </Col>
            <Col>
              <ComonDropDown
                menuItems={menuItems}
                buttonLabel="Add Approval Request"
                className={style.dropedowndark}
              />
            </Col>
          </Row>

          {/* Table */}
          <BorderlessTable
            rows={employeeMyApproval?.approvals || []}
            columns={columns}
            scroll={
              employeeMyApproval?.approvals?.length
                ? { x: "max-content", y: activeFilters.length > 0 ? 450 : 500 }
                : undefined
            }
            classNameTable="border-less-table-orange"
            onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
            loading={loadingMore}
            ref={tableScrollEmployeeApproval}
          />
        </div>
      </PageLayout>

      {/* 🔹 Modals */}
      {isEquitiesModalVisible && <EquitiesApproval />}
      {isSubmit && <SubmittedModal isEquitiesModalOpen={isEquitiesModalOpen} />}
      {isTradeRequestRestricted && <RequestRestrictedModal />}
      {isViewDetail && <ViewDetailModal />}
      {isViewComments && <ViewComment />}
      {isResubmitted && <ResubmitModal />}
      {resubmitIntimation && <ResubmitIntimationModal />}
      {isConductedTransaction && <ConductTransaction />}
      {addTradeApprovalIntimationModal && <IntimationTradeApprovalModal />}
    </>
  );
};

export default Approval;
