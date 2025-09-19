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
import { SearchApprovalRequestLineManager } from "../../../../api/myApprovalApi";
import { useNavigate } from "react-router-dom";
import { apiCallSearchForLineManager } from "../../../../components/dropdowns/searchableDropedown/utill";
import { useTableScrollBottom } from "../../employes/myApprovals/utill";
import {
  mapBuySellToIds,
  mapStatusToIds,
  mapStatusToIdsForLineManager,
} from "../../../../components/dropdowns/filters/utils";
import { useDashboardContext } from "../../../../context/dashboardContaxt";
import { toYYMMDD } from "../../../../commen/funtions/rejex";

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
  const { addApprovalRequestData } = useDashboardContext();
  const { selectedKey } = useSidebarContext();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  //local state to set data i table
  const [approvalRequestLMData, setApprovalRequestLMData] = useState([]);

  // state of context which I'm getting from the myApproval for Line Manager
  const { lineManagerApproval, setLineManagerApproval } = useMyApproval();

  const [loadingMore, setLoadingMore] = useState(false);

  // state of Search context which I'm getting from the SearchBar for Line Manager
  // Global state for filter/search values
  const {
    lineManagerApprovalSearch,
    setLineManagerApprovalSearch,
    resetLineManagerApprovalSearch,
  } = useSearchBarContext();

  console.log(
    lineManagerApprovalSearch,
    lineManagerApproval,
    "lineManagerApprovalChecker123"
  );

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
      Date: toYYMMDD(lineManagerApprovalSearch.date) || "",
      Quantity: lineManagerApprovalSearch.quantity || 0,
      PageNumber: 0,
      Length: lineManagerApprovalSearch.pageSize || 10,
      StatusIds: lineManagerApprovalSearch.status || [],
      TypeIds: lineManagerApprovalSearch.type || [],
      RequesterName: lineManagerApprovalSearch.requesterName || "",
    };

    const data = await SearchApprovalRequestLineManager({
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

    resetLineManagerApprovalSearch();
    setLineManagerApprovalSearch({
      instrumentName: "",
      requesterName: "",
      date: null,
      mainInstrumentName: "",
      type: [],
      status: [],
      pageSize: 0,
      pageNumber: 0,
      totalRecords: 0,
      quantity: 0,
      filterTrigger: true,
      tableFilterTrigger: false,
    });
  }, []);

  // Keys to track which filters to sync/display
  const filterKeys = [
    { key: "instrumentName", label: "Instrument" },
    { key: "mainInstrumentName", label: "Main Instrument" },
    { key: "startDate", label: "Date" },
    { key: "requesterName", label: "Requester Name" },
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
   * Removes a filter tag and re-fetches data
   */
  const handleRemoveFilter = async (key) => {
    console.log("Check Data");
    const normalizedKey = key?.toLowerCase();
    // 1️⃣ Update UI state for removed filters
    setSubmittedFilters((prev) => prev.filter((item) => item.key !== key));

    //To show dynamically AssetType like EQ equities ETC
    const assetKey = lineManagerApprovalSearch.assetType;
    const assetData = addApprovalRequestData?.[assetKey];

    // 2️⃣ Prepare API request parameters
    const TypeIds = mapBuySellToIds(lineManagerApprovalSearch.type, assetData);
    const statusIds = mapStatusToIdsForLineManager(
      lineManagerApprovalSearch.status
    );

    const requestdata = {
      InstrumentName:
        lineManagerApprovalSearch.instrumentName ||
        lineManagerApprovalSearch.mainInstrumentName ||
        "",
      Date: toYYMMDD(lineManagerApprovalSearch.date) || "",
      Quantity: lineManagerApprovalSearch.quantity || 0,
      StatusIds: statusIds || [],
      TypeIds: TypeIds || [],
      PageNumber: 0,
      Length: lineManagerApprovalSearch.pageSize || 10,
      RequesterName: lineManagerApprovalSearch.requesterName || "",
    };

    // 3️⃣ Reset API params for the specific filter being removed
    if (normalizedKey === "requestername") {
      requestdata.RequesterName = "";
      // 5️⃣ Update search state — only reset the specific key + page number
      setLineManagerApprovalSearch((prev) => ({
        ...prev,
        requesterName: "",
        pageNumber: 0,
      }));
    } else if (
      normalizedKey === "instrumentname" ||
      normalizedKey === "maininstrumentname"
    ) {
      setLineManagerApprovalSearch((prev) => ({
        ...prev,
        instrumentName: "",
        mainInstrumentName: "",
        pageNumber: 0,
      }));
      requestdata.InstrumentName = "";
    } else if (normalizedKey === "quantity") {
      requestdata.Quantity = 0;
      setLineManagerApprovalSearch((prev) => ({
        ...prev,
        quantity: 0,
        pageNumber: 0,
      }));
    } else if (normalizedKey === "startdate") {
      requestdata.StartDate = "";
      setLineManagerApprovalSearch((prev) => ({
        ...prev,
        startdate: "",
        pageNumber: 0,
      }));
    }

    // 4️⃣ Show loader and call API
    showLoader(true);

    const data = await SearchApprovalRequestLineManager({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    setLineManagerApproval(data);
  };

  /**
   * Syncs filters on `filterTrigger` from context
   */
  useEffect(() => {
    console.log("Filter Checker align");
    console.log(selectedKey, "Filter Checker align");
    if (lineManagerApprovalSearch.filterTrigger) {
      const snapshot = filterKeys
        .filter(({ key }) => lineManagerApprovalSearch[key])
        .map(({ key }) => ({
          key,
          value: lineManagerApprovalSearch[key],
        }));

      setSubmittedFilters(snapshot);

      setLineManagerApprovalSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [lineManagerApprovalSearch.filterTrigger]);

  /**
   * Handles table-specific filter trigger
   */
  useEffect(() => {
    console.log(
      lineManagerApprovalSearch.tableFilterTrigger,
      "Filter Checker align"
    );
    const fetchFilteredData = async () => {
      if (!lineManagerApprovalSearch.tableFilterTrigger) return;

      const snapshot = filterKeys
        .filter(({ key }) => lineManagerApprovalSearch[key])
        .map(({ key }) => ({
          key,
          value: lineManagerApprovalSearch[key],
        }));

      console.log(selectedKey, "Filter Checker align");
      await apiCallSearchForLineManager({
        selectedKey,
        lineManagerApprovalSearch,
        callApi,
        showNotification,
        showLoader,
        navigate,
        setData: setLineManagerApproval,
      });

      setSubmittedFilters(snapshot);

      setLineManagerApprovalSearch((prev) => ({
        ...prev,
        tableFilterTrigger: false,
      }));
    };

    fetchFilteredData();
  }, [lineManagerApprovalSearch.tableFilterTrigger]);

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

  // Lazy Loading Work Start
  useEffect(() => {
    try {
      if (
        lineManagerApproval?.lineApprovals &&
        Array.isArray(lineManagerApproval?.lineApprovals)
      ) {
        console.log(lineManagerApproval, "CheckDatayagjvashvajhs");
        // 🔹 Map and normalize data
        const mappedData = lineManagerApproval?.lineApprovals?.map((item) => ({
          key: item.approvalID,
          instrument: `${item.instrument?.instrumentName || ""} - ${
            item.instrument?.instrumentCode || ""
          }`,
          type: item.tradeType?.typeName || "",
          requestDateTime: `${item.requestDate || ""} ${
            item.requestTime || ""
          }`,
          isEscalated: false,
          status: item.approvalStatus?.approvalStatusName || "",
          quantity: item.quantity || 0,
          timeRemaining: item.timeRemainingToTrade || "",
          ...item,
        }));

        // 🔹 Set approvals data
        setApprovalRequestLMData(mappedData);

        // 🔹 Update search state (avoid unnecessary updates)
        setLineManagerApprovalSearch((prev) => ({
          ...prev,
          totalRecords:
            prev.totalRecords !== lineManagerApproval.totalRecords
              ? lineManagerApproval.totalRecords
              : prev.totalRecords,
          pageNumber: mappedData.length,
        }));
      } else if (lineManagerApproval === null) {
        // No data case
        setApprovalRequestLMData([]);
      }
    } catch (error) {
      console.error("Error processing employee approvals:", error);
    } finally {
      // 🔹 Always stop loading state
      setLoadingMore(false);
    }
  }, [lineManagerApproval]);

  // Lazy Loading
  // Inside your component
  useTableScrollBottom(
    async () => {
      // ✅ Only load more if there are still records left
      if (
        lineManagerApproval?.lineApprovals?.totalRecords !==
        approvalRequestLMData?.length
      ) {
        try {
          setLoadingMore(true);

          // ✅ Consistent assetKey fallback
          const assetKey =
            lineManagerApprovalSearch.assetType ||
            (addApprovalRequestData &&
            Object.keys(addApprovalRequestData).length > 0
              ? Object.keys(addApprovalRequestData)[0]
              : "Equities");

          const assetData = addApprovalRequestData?.[assetKey] || { items: [] };

          // ✅ Pass assetData to mapBuySellToIds
          const TypeIds = mapBuySellToIds(
            lineManagerApprovalSearch.type || [],
            assetData
          );

          console.log("CHeck STausu APi here");
          // Build request payload
          const requestdata = {
            InstrumentName:
              lineManagerApprovalSearch.instrumentName ||
              lineManagerApprovalSearch.mainInstrumentName,
            Date: toYYMMDD(lineManagerApprovalSearch.date) || "",
            Quantity: lineManagerApprovalSearch.quantity || 0,
            StatusIds: mapStatusToIds(lineManagerApprovalSearch.status),
            TypeIds: TypeIds || [],
            PageNumber: lineManagerApprovalSearch.pageNumber || 0, // Acts as offset for API
            Length: 10,
            RequesterName: lineManagerApprovalSearch.requesterName || "",
          };
          // Call API
          const data = await SearchApprovalRequestLineManager({
            callApi,
            showNotification,
            showLoader, // ✅ Don't trigger full loader for lazy load
            requestdata,
            navigate,
          });

          if (!data) return;

          setLineManagerApproval((prevState) => {
            const safePrev =
              prevState && typeof prevState === "object"
                ? prevState
                : { lineApprovals: [], totalRecords: 0 };

            return {
              lineApprovals: [
                ...(Array.isArray(safePrev.lineApprovals)
                  ? safePrev.lineApprovals
                  : []),
                ...(Array.isArray(data?.lineApprovals)
                  ? data.lineApprovals
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
      <PageLayout
        background="white"
        className={submittedFilters.length > 0 && "changeHeight"}
      >
        <div className="px-4 md:px-6 lg:px-8">
          {/* Page Header */}
          <Row justify="space-between" align="middle" className="mb-4">
            <Col span={[24]}>
              <h2 className={style["heading"]}>Approvals Request</h2>
            </Col>
          </Row>

          {/* Table or Empty State */}
          <BorderlessTable
            rows={approvalRequestLMData}
            columns={columns}
            scroll={
              approvalRequestLMData?.length
                ? {
                    x: "max-content",
                    y: submittedFilters.length > 0 ? 450 : 500,
                  }
                : undefined
            }
            classNameTable="border-less-table-orange"
            onChange={(pagination, filters, sorter) => {
              setSortedInfo(sorter);
            }}
            loading={loadingMore}
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
