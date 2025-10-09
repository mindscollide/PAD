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

// 🔹 Utils
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";
import { getBorderlessTableColumns, mapEmployeeMyApprovalData } from "./utils";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import { toYYMMDD } from "../../../../commen/funtions/rejex";

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
import { useTableScrollBottom } from "../../../../commen/funtions/scroll";

const Approval = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  // ----------------- Contexts -----------------
  const { addApprovalRequestData } = useDashboardContext();
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
  } = useGlobalModal();

  console.log(
    addApprovalRequestData,
    "addApprovalRequestDataaddApprovalRequestData"
  );

  // ----------------- Local State -----------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [isEquitiesModalOpen, setIsEquitiesModalOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // ----------------- Dropdown -----------------

  // make a global context state which is selectedAssetTypeId to show select assetTypeID on selected dropdown value
  // from the add Approval Request in Approval list to send that selected assetType Id into AssetTypeID in
  // AddTradeApprovalRequest Api

  const menuItems = Object.entries(addApprovalRequestData || {}).reduce(
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

  /** 🔹 Build API request payload */
  const buildApiRequest = useCallback(
    (searchState = {}) => ({
      InstrumentName:searchState.instrumentName || "",
      Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
      StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
      EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
      StatusIds: mapStatusToIds(searchState.status) || [],
      TypeIds:
        mapBuySellToIds(searchState.type, addApprovalRequestData?.Equities) ||
        [],
      PageNumber: Number(searchState.pageNumber) || 0,
      Length: Number(searchState.pageSize) || 10,
    }),
    [addApprovalRequestData]
  );

  /** 🔹 Fetch approvals from API */
  const fetchApprovals = useCallback(
    async (requestdata, { loader = false, lazy = false } = {}) => {
      if (loader) await showLoader(true);

      const res = await SearchTadeApprovals({
        callApi,
        showNotification,
        showLoader,
        requestdata,
        navigate,
      });

      const approvals = Array.isArray(res?.approvals) ? res.approvals : [];

      const mapped = mapEmployeeMyApprovalData(
        addApprovalRequestData?.Equities,
        approvals
      );

      setIsEmployeeMyApproval((prev) => ({
        approvals: lazy ? [...(prev?.approvals || []), ...mapped] : mapped,
        totalRecords: res?.totalRecords ?? mapped.length,
      }));

      setEmployeeMyApprovalSearch((prev) => ({
        ...prev,
        pageNumber: lazy ? prev.pageNumber + mapped.length : mapped.length,
      }));
    },
    [
      addApprovalRequestData,
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
      pageNumber: 0,
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
      pageNumber: 0,
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
      fetchApprovals(buildApiRequest(employeeMyApprovalSearch), {
        loader: true,
      });
    }
  }, [buildApiRequest, employeeMyApprovalSearch, fetchApprovals]);

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
      fetchApprovals(buildApiRequest(employeeMyApprovalSearch), {
        loader: true,
      });

      setEmployeeMyApprovalSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
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
      fetchApprovals(
        { ...buildApiRequest(employeeMyApprovalSearch), PageNumber: 0 },
        {}
      );
    }
  }, [employeeMyApprovalMqtt]);

  // Infinite Scroll
  useTableScrollBottom(
    async () => {
      if (
        employeeMyApproval?.totalRecords ===
        employeeMyApproval?.approvals?.length
      )
        return;

      try {
        setLoadingMore(true);
        await fetchApprovals(
          {
            ...buildApiRequest(employeeMyApprovalSearch),
            PageNumber: employeeMyApprovalSearch.pageNumber || 0,
          },
          { lazy: true }
        );
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
            columns={getBorderlessTableColumns({
              approvalStatusMap,
              sortedInfo,
              employeeMyApprovalSearch,
              setEmployeeMyApprovalSearch,
              setIsViewDetail,
              onViewDetail: handleViewDetails,
            })}
            scroll={
              employeeMyApproval?.approvals?.length
                ? { x: "max-content", y: activeFilters.length > 0 ? 450 : 500 }
                : undefined
            }
            classNameTable="border-less-table-orange"
            onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
            loading={loadingMore}
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
    </>
  );
};

export default Approval;
