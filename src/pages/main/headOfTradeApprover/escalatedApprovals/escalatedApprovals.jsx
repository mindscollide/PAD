import React, { useEffect, useRef, useState } from "react";
import { Col, Row, Spin } from "antd";
import { ComonDropDown } from "../../../../components";
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import { getBorderlessTableColumns, useTableScrollBottom } from "./utill";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import style from "./escalatedApprovals.module.css";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useApi } from "../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import { useSidebarContext } from "../../../../context/sidebarContaxt";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";
import { apiCallSearch } from "../../../../components/dropdowns/searchableDropedown/utill";
import { GetAllViewDetailsByTradeApprovalID } from "../../../../api/myApprovalApi";
import { useDashboardContext } from "../../../../context/dashboardContaxt";
import { toYYMMDD } from "../../../../commen/funtions/rejex";
import { useEscalatedApprovals } from "../../../../context/escalatedApprovalContext";
import {
  GetHeadOfApprovalViewDetailRequest,
  SearchEscalatedApprovalsRequestMethod,
} from "../../../../api/escalatedApproval";
import ViewDetailHeadOfApprovalModal from "./modals/viewDetailHeadOfApprovalModal/ViewDetailHeadOfApprovalModal";
import NoteHeadOfApprovalModal from "./modals/noteHeadOfApprovalModal/NoteHeadOfApprovalModal";
import DeclinedHeadOfApprovalModal from "./modals/declinedHeadOfApprovalModal/DeclinedHeadOfApprovalModal";
import ApprovedHeadOfApprovalModal from "./modals/approvedHeadOfApprovalModal/ApprovedHeadOfApprovalModal";

const EscalatedApprovals = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const {
    viewDetailsHeadOfApprovalModal,
    setViewDetailsHeadOfApprovalModal,
    noteGlobalModal,
    setNoteGlobalModal,
    headApprovalNoteModal,
    headDeclineNoteModal,
  } = useGlobalModal();

  const { addApprovalRequestData } = useDashboardContext();
  const { showNotification } = useNotification();
  const { selectedKey } = useSidebarContext();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const {
    escalatedApprovalData,
    setEscalatedApprovalData,
    viewDetailsHeadOfApprovalData,
    setViewDetailsHeadOfApprovalData,
  } = useEscalatedApprovals();

  const {
    HeadOfTradeEscalatedApprovalsSearch,
    setHeadOfTradeEscalatedApprovalsSearch,
    resetHeadOfTradeApprovalEscalatedApprovalsSearch,
  } = useSearchBarContext();

  console.log(
    escalatedApprovalData,
    "escalatedApprovalDataescalatedApprovalData"
  );

  console.log(viewDetailsHeadOfApprovalData, "viewDetailsHeadOfApprovalData");

  const [sortedInfo, setSortedInfo] = useState({});
  const [escalatedData, setEscalatedData] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false); // spinner at bottom

  // Confirmed filters displayed as tags
  const [escalatedSubmitedFilters, setEscalatedSubmittedFilters] = useState([]);

  // Keys used to generate filter tags
  const filterKeys = [
    { key: "instrumentName", label: "Instrument" },
    { key: "mainInstrumentName", label: "Main Instrument" },
    { key: "startDate", label: "Date" },
    { key: "quantity", label: "Quantity" },
  ];

  // This Api is for the getAllViewDetailModal For myApproval in Emp
  const handleHeadOfApprovalViewDetail = async (approvalID) => {
    await showLoader(true);
    const requestdata = { TradeApprovalID: approvalID };

    const responseData = await GetHeadOfApprovalViewDetailRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    if (responseData) {
      setViewDetailsHeadOfApprovalData(responseData);
      setViewDetailsHeadOfApprovalModal(true);
    }
  };

  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    HeadOfTradeEscalatedApprovalsSearch,
    setHeadOfTradeEscalatedApprovalsSearch,
    setViewDetailsHeadOfApprovalModal,
    onViewDetail: handleHeadOfApprovalViewDetail, // ✅ pass directly
  });

  /**
   * Fetches approval data from API on component mount
   */
  const fetchApprovals = async (loader = false) => {
    if (loader) {
      await showLoader(true);
    }

    const requestdata = {
      InstrumentName:
        HeadOfTradeEscalatedApprovalsSearch.InstrumentName || null,
      Quantity: HeadOfTradeEscalatedApprovalsSearch.Quantity || null,
      RequestDateFrom:
        HeadOfTradeEscalatedApprovalsSearch.RequestDateFrom || null,
      RequestDateTo: HeadOfTradeEscalatedApprovalsSearch.RequestDateTo || null,
      EscalatedDateFrom:
        HeadOfTradeEscalatedApprovalsSearch.EscalatedDateFrom || null,
      EscalatedDateTo:
        HeadOfTradeEscalatedApprovalsSearch.EscalatedDateTo || null,
      StatusIds: HeadOfTradeEscalatedApprovalsSearch.status || [],
      TypeIds: HeadOfTradeEscalatedApprovalsSearch.type || [],
      RequesterName: HeadOfTradeEscalatedApprovalsSearch.RequesterName || null,
      LineManagerName:
        HeadOfTradeEscalatedApprovalsSearch.LineManagerName || null,
      PageNumber: 0,
      Length: HeadOfTradeEscalatedApprovalsSearch.pageSize || 10,
    };

    const data = await SearchEscalatedApprovalsRequestMethod({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    setEscalatedApprovalData(data);
  };

  /**
   * Runs only once to fetch approvals on initial render
   */
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchApprovals(true);
  }, []);

  useEffect(() => {
    // to resetALlState WHen its unmount
    return () => {
      resetHeadOfTradeApprovalEscalatedApprovalsSearch();
      setHeadOfTradeEscalatedApprovalsSearch({
        InstrumentName: null,
        Quantity: null,
        RequestDateFrom: null,
        RequestDateTo: null,
        EscalatedDateFrom: null,
        EscalatedDateTo: null,
        StatusIds: [],
        TypeIds: [],
        RequesterName: null,
        LineManagerName: null,
        PageNumber: 0,
        Length: 10,
        filterTrigger: false,
        tableFilterTrigger: false,
      });
      setEscalatedApprovalData([]);
      setEscalatedSubmittedFilters([]);
    };
  }, []);

  /**
   * Removes a filter tag and re-fetches data
   */
  const handleRemoveFilter = async (key) => {
    const normalizedKey = key?.toLowerCase();
    // 1️⃣ Update UI state for removed filters
    setEscalatedSubmittedFilters((prev) =>
      prev.filter((item) => item.key !== key)
    );

    //To show dynamically AssetType like EQ equities ETC
    const assetKey = HeadOfTradeEscalatedApprovalsSearch.assetType;
    const assetData = addApprovalRequestData?.[assetKey];

    // 2️⃣ Prepare API request parameters
    const TypeIds = mapBuySellToIds(
      HeadOfTradeEscalatedApprovalsSearch.type,
      assetData
    );
    const statusIds = mapStatusToIds(
      HeadOfTradeEscalatedApprovalsSearch.status
    );

    const requestdata = {
      InstrumentName:
        HeadOfTradeEscalatedApprovalsSearch.InstrumentName || null,
      Quantity: HeadOfTradeEscalatedApprovalsSearch.Quantity || null,
      RequestDateFrom:
        toYYMMDD(HeadOfTradeEscalatedApprovalsSearch.RequestDateFrom) || null,
      RequestDateTo:
        toYYMMDD(HeadOfTradeEscalatedApprovalsSearch.RequestDateTo) || null,
      EscalatedDateFrom:
        toYYMMDD(HeadOfTradeEscalatedApprovalsSearch.EscalatedDateFrom) || null,
      EscalatedDateTo:
        toYYMMDD(HeadOfTradeEscalatedApprovalsSearch.EscalatedDateTo) || null,
      StatusIds: statusIds || [],
      TypeIds: TypeIds || [],
      RequesterName: HeadOfTradeEscalatedApprovalsSearch.RequesterName || null,
      LineManagerName:
        HeadOfTradeEscalatedApprovalsSearch.LineManagerName || null,
      PageNumber: 0,
      Length: HeadOfTradeEscalatedApprovalsSearch.pageSize || 10,
    };

    // 3️⃣ Reset API params for the specific filter being removed
    if (normalizedKey === "quantity") {
      requestdata.Quantity = null;
      // 5️⃣ Update search state — only reset the specific key + page number
      setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
        ...prev,
        quantity: null,
        pageNumber: 0,
      }));
    } else if (normalizedKey === "instrumentname") {
      setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
        ...prev,
        instrumentName: "",
        mainInstrumentName: "",
        pageNumber: 0,
      }));
      requestdata.InstrumentName = "";
    } else if (normalizedKey === "startdate") {
      console.log("normalizedKey", normalizedKey);
      requestdata.RequestDateFrom = null;
      setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
        ...prev,
        startdate: "",
        pageNumber: 0,
      }));
    }

    // 4️⃣ Show loader and call API
    showLoader(true);
    console.log("normalizedKey", requestdata);

    const data = await SearchEscalatedApprovalsRequestMethod({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    setEscalatedApprovalData(data);
  };
  /**
   * Syncs escalatedSubmitedFilters state when filters are applied
   */

  useEffect(() => {
    if (HeadOfTradeEscalatedApprovalsSearch.filterTrigger) {
      const snapshot = filterKeys
        .filter(({ key }) => HeadOfTradeEscalatedApprovalsSearch[key])
        .map(({ key }) => ({
          key,
          value: HeadOfTradeEscalatedApprovalsSearch[key],
        }));

      setEscalatedSubmittedFilters(snapshot);

      setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [HeadOfTradeEscalatedApprovalsSearch.filterTrigger]);

  /**
   * Handles table-specific filter trigger
   */

  useEffect(() => {
    const fetchFilteredData = async () => {
      if (!HeadOfTradeEscalatedApprovalsSearch.tableFilterTrigger) return;

      const snapshot = filterKeys
        .filter(({ key }) => HeadOfTradeEscalatedApprovalsSearch[key])
        .map(({ key }) => ({
          key,
          value: HeadOfTradeEscalatedApprovalsSearch[key],
        }));

      await apiCallSearch({
        selectedKey,
        HeadOfTradeEscalatedApprovalsSearch,
        callApi,
        showNotification,
        showLoader,
        navigate,
        setData: setEscalatedApprovalData,
      });

      setEscalatedSubmittedFilters(snapshot);

      setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
        ...prev,
        tableFilterTrigger: false,
      }));
    };

    fetchFilteredData();
  }, [HeadOfTradeEscalatedApprovalsSearch.tableFilterTrigger]);

  /**
   * Resets global search state if user reloads the page
   */
  useEffect(() => {
    try {
      const navigationEntries = performance.getEntriesByType("navigation");
      if (
        navigationEntries.length > 0 &&
        navigationEntries[0].type === "reload"
      ) {
        resetHeadOfTradeApprovalEscalatedApprovalsSearch();
      }
    } catch (error) {
      console.error(
        "❌ Error detecting page reload or restoring state:",
        error
      );
    }
  }, []);

  /**
   * Transforms raw API data into table-compatible format
   */

  // Lazy Loading Work Start
  useEffect(() => {
    try {
      if (
        escalatedApprovalData?.htaEscalatedApprovals &&
        Array.isArray(escalatedApprovalData.htaEscalatedApprovals)
      ) {
        // 🔹 Map and normalize data
        const mappedData = escalatedApprovalData?.htaEscalatedApprovals.map(
          (item) => ({
            key: item.approvalID,
            instrument: `${item.instrument?.instrumentName || ""} - ${
              item.instrument?.instrumentCode || ""
            }`,
            type: item.tradeType?.typeName || "",
            requestDateTime: `${item.requestDate || ""} ${
              item.requestTime || ""
            }`,
            isEscalated: item.isEscalationOpen || false,
            status: item.approvalStatus?.approvalStatusName || "",
            quantity: item.quantity || 0,
            timeRemainingToTrade: item.timeRemainingToTrade || "",
            escalatedDateTime: item.escalatedOnDate
              ? `${item.escalatedOnDate} ${item.escalatedOnTime || ""}`
              : "",
            requesterName: item.requesterName || "",
            assetType: item.assetType?.assetTypeName || "",
            assetTypeCode: item.assetType?.assetTypeShortCode || "",
            tradeApprovalID: item.tradeApprovalID || "",
            ...item,
          })
        );

        // 🔹 Set approvals data
        setEscalatedData(mappedData);

        // 🔹 Update search state (avoid unnecessary updates)
        setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
          ...prev,
          totalRecords:
            prev.totalRecords !== escalatedApprovalData.totalRecords
              ? escalatedApprovalData.totalRecords
              : prev.totalRecords,
          pageNumber: mappedData.length,
        }));
      } else if (escalatedApprovalData === null) {
        // No data case
        setEscalatedData([]);
      }
    } catch (error) {
      console.error("Error processing employee approvals:", error);
    } finally {
      // 🔹 Always stop loading state
      setLoadingMore(false);
    }
  }, [escalatedApprovalData]);

  // Lazy Loading
  // Inside your component
  useTableScrollBottom(
    async () => {
      // ✅ Only load more if there are still records left
      if (escalatedApprovalData?.totalRecords !== escalatedData?.length) {
        try {
          setLoadingMore(true);

          // ✅ Consistent assetKey fallback
          const assetKey =
            HeadOfTradeEscalatedApprovalsSearch.assetType ||
            (addApprovalRequestData &&
            Object.keys(addApprovalRequestData).length > 0
              ? Object.keys(addApprovalRequestData)[0]
              : "Equities");

          const assetData = addApprovalRequestData?.[assetKey] || { items: [] };

          // ✅ Pass assetData to mapBuySellToIds
          const TypeIds = mapBuySellToIds(
            HeadOfTradeEscalatedApprovalsSearch.type || [],
            assetData
          );

          // Build request payload
          const requestdata = {
            InstrumentName:
              HeadOfTradeEscalatedApprovalsSearch.InstrumentName || null,
            Quantity: HeadOfTradeEscalatedApprovalsSearch.Quantity || null,
            RequestDateFrom:
              toYYMMDD(HeadOfTradeEscalatedApprovalsSearch.RequestDateFrom) ||
              null,
            RequestDateTo:
              toYYMMDD(HeadOfTradeEscalatedApprovalsSearch.RequestDateTo) ||
              null,
            EscalatedDateFrom:
              toYYMMDD(HeadOfTradeEscalatedApprovalsSearch.EscalatedDateFrom) ||
              null,
            EscalatedDateTo:
              toYYMMDD(HeadOfTradeEscalatedApprovalsSearch.EscalatedDateTo) ||
              null,
            StatusIds:
              mapStatusToIds(HeadOfTradeEscalatedApprovalsSearch.status) || [],
            TypeIds: TypeIds || [],
            RequesterName:
              HeadOfTradeEscalatedApprovalsSearch.RequesterName || null,
            LineManagerName:
              HeadOfTradeEscalatedApprovalsSearch.LineManagerName || null,
            PageNumber: 0,
            Length: HeadOfTradeEscalatedApprovalsSearch.pageSize || 10,
          };
          // Call API
          const data = await SearchEscalatedApprovalsRequestMethod({
            callApi,
            showNotification,
            showLoader, // ✅ Don't trigger full loader for lazy load
            requestdata,
            navigate,
          });

          if (!data) return;

          setEscalatedApprovalData((prevState) => {
            const safePrev =
              prevState && typeof prevState === "object"
                ? prevState
                : { htaEscalatedApprovals: [], totalRecords: 0 };

            return {
              htaEscalatedApprovals: [
                ...(Array.isArray(safePrev.htaEscalatedApprovals)
                  ? safePrev.htaEscalatedApprovals
                  : []),
                ...(Array.isArray(data?.htaEscalatedApprovals)
                  ? data.htaEscalatedApprovals
                  : []),
              ],
              totalRecords: data?.totalRecords ?? safePrev.totalRecords,
            };
          });
        } catch (error) {
          console.error("Error loading more approvals:", error);
        } finally {
          setLoadingMore(false);
        }
      }
    },
    0,
    "border-less-table-orange" // Container selector
  );

  return (
    <>
      {/* Filter Tags */}
      {escalatedSubmitedFilters.length > 0 && (
        <Row gutter={[12, 12]} className={style["filter-tags-container"]}>
          {escalatedSubmitedFilters.map(({ key, value }) => (
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

      {/* Page Layout */}
      <PageLayout
        background="white"
        className={escalatedSubmitedFilters.length > 0 && "changeHeight"}
      >
        <div className="px-4 md:px-6 lg:px-8">
          {/* Header */}
          <Row justify="space-between" align="middle" className="mb-4">
            <Col span={24}>
              <h2 className={style["heading"]}>Escalated Approvals</h2>
            </Col>
          </Row>

          {/* Table or Empty State */}
          <BorderlessTable
            rows={escalatedData}
            columns={columns}
            scroll={
              escalatedData?.length
                ? {
                    x: "max-content",
                    y: escalatedSubmitedFilters.length > 0 ? 450 : 500,
                  }
                : undefined
            }
            classNameTable="border-less-table-orange"
            onChange={(sorter) => {
              setSortedInfo(sorter);
            }}
            loading={loadingMore}
          />
        </div>
      </PageLayout>

      {/* To Show View Detail Modal when click on view Detail Button */}
      {viewDetailsHeadOfApprovalModal && <ViewDetailHeadOfApprovalModal />}

      {/* To Show Head Of Approval Note Modal */}
      {noteGlobalModal && <NoteHeadOfApprovalModal />}

      {/* To Show Head Of Approval Modal after click on Note Modal submit */}
      {headApprovalNoteModal && <ApprovedHeadOfApprovalModal />}

      {/* To Show Head Of Decline after click on Note Modal submit */}
      {headDeclineNoteModal && <DeclinedHeadOfApprovalModal />}
    </>
  );
};

export default EscalatedApprovals;
