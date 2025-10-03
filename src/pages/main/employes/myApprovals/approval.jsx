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
import { useSidebarContext } from "../../../../context/sidebarContaxt";
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
import {
  getBorderlessTableColumns,
  mapEmployeeMyApprovalData,
  useTableScrollBottom,
} from "./utils";
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

const Approval = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  // ----------------- Contexts -----------------
  const { addApprovalRequestData } = useDashboardContext();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const { selectedKey } = useSidebarContext();

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

  console.log(employeeMyApproval, "employeeMyApproval");

  // ----------------- Local State -----------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [submittedFilters, setSubmittedFilters] = useState([]);
  const [isEquitiesModalOpen, setIsEquitiesModalOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // For Common Dropdown state to set Api response in this local state
  const [equitiesCommonDropdown, setEquitiesCommonDropdown] = useState([]);

  // Keys for displaying active filters as tags
  const filterKeys = [
    { key: "instrumentName", label: "Instrument" },
    { key: "mainInstrumentName", label: "Main Instrument" },
    { key: "startDate", label: "Date" },
    { key: "endDate", label: "Date" },
    { key: "quantity", label: "Quantity" },
  ];

  // ----------------- Dropdown -----------------

  // make a global context state which is selectedAssetTypeId to show select assetTypeID on selected dropdown value
  // from the add Approval Request in Approval list to send that selected assetType Id into AssetTypeID in
  // AddTradeApprovalRequest Api

  const menuItems = (equitiesCommonDropdown || []).reduce((acc, item) => {
    const { assetType } = item;
    if (!acc.some((m) => m.key === String(assetType.assetTypeID))) {
      acc.push({
        key: String(assetType.assetTypeID),
        label: assetType.assetTypeName,
        onClick: () => {
          setIsEquitiesModalOpen(true);
          setIsEquitiesModalVisible(true);
          setSelectedAssetTypeId(assetType.assetTypeID);
          console.log(`Open modal for: ${assetType.assetTypeName}`);
        },
      });
    }
    return acc;
  }, []);

  // ----------------- Helpers -----------------
  /** Build API request payload */
  const buildApprovalRequest = useCallback(
    (searchState = {}) => ({
      InstrumentName:
        searchState.mainInstrumentName || searchState.instrumentName || "",
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

  /** Fetch approvals */
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

      // This is the local state to get Api response
      setEquitiesCommonDropdown(approvals);

      const mapped = mapEmployeeMyApprovalData(
        addApprovalRequestData?.Equities,
        approvals
      );

      setIsEmployeeMyApproval((prev) => {
        if (lazy) {
          return {
            approvals: [...(prev?.approvals || []), ...mapped],
            totalRecords: res?.totalRecords ?? mapped.length,
          };
        }
        return {
          approvals: mapped,
          totalRecords: res?.totalRecords ?? mapped.length,
        };
      });
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

  /** Handle "View Details" modal */
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

  // ----------------- Table Columns -----------------
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch,
    setIsViewDetail,
    onViewDetail: handleViewDetails,
  });

  // ----------------- Effects -----------------
  // Initial Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestdata = buildApprovalRequest(employeeMyApprovalSearch);
      console.log("fetchApprovals");
      fetchApprovals(requestdata, { loader: true });
    }
  }, [buildApprovalRequest, employeeMyApprovalSearch, fetchApprovals]);

  // Reset Search State on Unmount
  useEffect(() => {
    return () => {
      resetEmployeeMyApprovalSearch();
      setIsEmployeeMyApproval([]);
      setSubmittedFilters([]);
    };
  }, []);

  // Sync Active Filters → Tags
  useEffect(() => {
    if (employeeMyApprovalSearch.filterTrigger) {
      const requestdata = buildApprovalRequest(employeeMyApprovalSearch);
      console.log("fetchApprovals");
      fetchApprovals(requestdata, { loader: true });

      // const snapshot = filterKeys
      //   .filter(({ key }) => employeeMyApprovalSearch[key])
      //   .map(({ key }) => ({ key, value: employeeMyApprovalSearch[key] }));

      // setSubmittedFilters(snapshot);
      setEmployeeMyApprovalSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeeMyApprovalSearch.filterTrigger]);

  // Table Filter Trigger
  // useEffect(() => {
  //   if (employeeMyApprovalSearch.tableFilterTrigger) {
  //     const requestdata = buildApprovalRequest(employeeMyApprovalSearch);
  //     fetchApprovals(requestdata, { loader: true });
  //     setEmployeeMyApprovalSearch((prev) => ({
  //       ...prev,
  //       tableFilterTrigger: false,
  //     }));
  //   }
  // }, [employeeMyApprovalSearch.tableFilterTrigger]);

  // Reload Detection → Reset Search State
  useEffect(() => {
    try {
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries[0]?.type === "reload") resetEmployeeMyApprovalSearch();
    } catch (error) {
      console.error("error", error);
    }
  }, []);

  // MQTT Updates
  useEffect(() => {
    if (employeeMyApprovalMqtt) {
      setIsEmployeeMyApprovalMqtt(false);
      const requestdata = {
        ...buildApprovalRequest(employeeMyApprovalSearch),
        PageNumber: 0,
      };
      console.log("fetchApprovals");
      setIsEmployeeMyApprovalMqtt(false);
      fetchApprovals(requestdata);
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

        const requestdata = {
          ...buildApprovalRequest(employeeMyApprovalSearch),
          PageNumber: employeeMyApprovalSearch.pageNumber || 0,
        };
        console.log("fetchApprovals");
        await fetchApprovals(requestdata, { lazy: true });
        // setEmployeeMyApprovalSearch((prev) => ({
        //   ...prev,
        //   pageNumber: (prev.pageNumber || 0) + 10,
        // }));
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
      {submittedFilters.length > 0 && (
        <Row gutter={[12, 12]} className={style["filter-tags-container"]}>
          {submittedFilters.map(({ key, value }) => (
            <Col key={key}>
              <div className={style["filter-tag"]}>
                <span>{value}</span>
                <span
                  className={style["filter-tag-close"]}
                  onClick={() => console.log("TODO: Remove filter")}
                >
                  &times;
                </span>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* 🔹 Page Layout */}
      <PageLayout
        background="white"
        className={submittedFilters.length > 0 && "changeHeight"}
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
                ? {
                    x: "max-content",
                    y: submittedFilters.length > 0 ? 450 : 500,
                  }
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
