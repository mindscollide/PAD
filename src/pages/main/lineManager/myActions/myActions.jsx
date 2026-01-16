import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Row, Col } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { AcordianTable, PageLayout } from "../../../../components";
import CustomButton from "../../../../components/buttons/button";
import style from "./myActions.module.css";
import EmptyState from "../../../../components/emptyStates/empty-states";
import CheckIcon from "../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../assets/img/Cross.png";
import PDF from "../../../../assets/img/pdf.png";
import Excel from "../../../../assets/img/xls.png";
import { buildMyActionApiRequest, getMyActionsColumn } from "./utils";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import {
  DownloadMyActionsReportRequest,
  SearchLMMyActionWorkFlowRequest,
} from "../../../../api/myApprovalApi";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useApi } from "../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { useSidebarContext } from "../../../../context/sidebarContaxt";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
} from "../../../../common/funtions/rejex";
const MyAction = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const containerRef = useRef(null);
  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  const [sortedInfo, setSortedInfo] = useState({});

  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // until proven otherwise

  const {
    lineManagerMyActionSearch,
    setLineManagerMyActionSearch,
    resetEmployeeMyHistorySearch,
  } = useSearchBarContext();

  const { setMyActionLineManagerData, myActionLineManagerData } =
    useMyApproval();

  /**
   * Fetches transactions from API.
   * @param {boolean} flag - whether to show loader
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchLMMyActionWorkFlowRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      if (res) {
        setMyActionLineManagerData(res);
      }
    },
    [callApi, navigate, showLoader, showNotification]
  );

  // Initial Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildMyActionApiRequest(lineManagerMyActionSearch);

      fetchApiCall(requestData, true, true);
    }
  }, [buildMyActionApiRequest, lineManagerMyActionSearch, fetchApiCall]);

  /** 🔹 this useEffect is for Search Filter */
  useEffect(() => {
    if (lineManagerMyActionSearch?.filterTrigger) {
      hasFetched.current = true;
      const requestData = buildMyActionApiRequest(lineManagerMyActionSearch);

      fetchApiCall(requestData, true, true);
      setLineManagerMyActionSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [buildMyActionApiRequest, lineManagerMyActionSearch, fetchApiCall]);

  // -------------------- Table Columns --------------------
  const columns = getMyActionsColumn(
    approvalStatusMap,
    sortedInfo,
    lineManagerMyActionSearch,
    setLineManagerMyActionSearch
  );

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      requestID: { requestID: "" },
      instrumentName: { instrumentName: "" },
      requesterName: { requesterName: "" },
      quantity: { quantity: 0 },
      type: { type: [] },
      status: { status: [] },
      dateRange: { startDate: null, endDate: null },
    };

    setLineManagerMyActionSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setLineManagerMyActionSearch((prev) => ({
      ...prev,
      requestID: "",
      instrumentName: "",
      requesterName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      type: [],
      status: [],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const {
      requestID,
      instrumentName,
      requesterName,
      startDate,
      endDate,
      quantity,
      type,
      status,
    } = lineManagerMyActionSearch || {};
    // 🔹 Mappings for display labels
    const typeMap = {
      1: "Buy",
      2: "Sell",
    };

    const statusMap = {
      1: "Pending",
      2: "Resubmit",
      3: "Approved",
      4: "Declined",
      5: "Traded",
      6: "Not-Traded",
      7: "Compliant",
      8: "Non-Compliant",
    };
    return [
      requestID && {
        key: "requestID",
        value:
          requestID.length > 13 ? requestID.slice(0, 13) + "..." : requestID,
      },
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
      // 🔹 Add Type (multiple selection support)
      type?.length > 0 && {
        key: "type",
        value: type.map((id) => typeMap[id] || id).join(", "),
      },

      // 🔹 Add Status (multiple selection support)
      status?.length > 0 && {
        key: "status",
        value: status.map((id) => statusMap[id] || id).join(", "),
      },
    ].filter(Boolean);
  })();

  // Update hasMore when myActionLineManagerData changes
  useEffect(() => {
    const total = myActionLineManagerData?.totalRecords ?? 0;
    const currentLen = myActionLineManagerData?.requests?.length ?? 0;
    setHasMore(currentLen < total);
  }, [myActionLineManagerData]);

  // Scroll handler for lazy loading
  const handleScroll = async () => {
    if (!containerRef.current) return;
    if (loadingMore) return;
    if (!hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // if reached bottom (small offset to be safe)
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setLoadingMore(true);

      try {
        // calculate current offset (PageNumber) as current loaded employees length
        const currentLength = myActionLineManagerData?.requests?.length || 0;

        // build request based on current search/filter but override pagination
        const baseRequest = buildMyActionApiRequest(lineManagerMyActionSearch);
        const requestData = {
          ...baseRequest,
          PageNumber: currentLength, // sRow
          Length: 10, // eRow (static 10)
        };

        const res = await SearchLMMyActionWorkFlowRequest({
          callApi,
          showNotification,
          showLoader, // you can pass showLoader or not; it won't show global loader if you manage local spinner
          requestdata: requestData,
          navigate,
        });

        const newEmployees = res?.requests || [];

        if (newEmployees.length > 0) {
          // merge new employees into existing array and also update any other top-level response fields (e.g., totalRecords)
          setMyActionLineManagerData((prev = {}) => ({
            ...res, // take latest top-level fields (totalRecords etc.) from response
            requests: [...(prev.requests || []), ...newEmployees],
          }));
        } else {
          // no new data => stop further fetching
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error fetching more users:", err);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  // Reset on Unmount
  useEffect(() => {
    return () => {
      setLineManagerMyActionSearch();
      setMyActionLineManagerData([]);
    };
  }, []);

  // Attach scroll listener to the managed container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // attach
    el.addEventListener("scroll", handleScroll);

    // cleanup
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef.current, hasMore, loadingMore, myActionLineManagerData]);

  // 🔷 Excel Report download Api Hit
  const downloadMyActionsReportInExcelFormat = async () => {
    showLoader(true);
    const requestdata = {
      InstrumentName: "",
      RequesterName: "",
      StartDate: "",
      EndDate: "",
      Type: null,
      Status: null,
      Quantity: 0,
    };
    await DownloadMyActionsReportRequest({
      callApi,
      showLoader,
      requestdata: requestdata,
      navigate,
    });
  };

  const mapMyActionData = (data) => {
    if (!data?.requests) return [];

    const getBundleIconType = (state) => {
      switch (state) {
        case 2:
          return "Approved";
        case 3:
          return "Decline";
        default:
          return "Pending";
      }
    };

    // ❗ REMOVE "Compliant" and "Declined" from workflow icon mapping
    const getWorkFlowIconType = (id) => {
      switch (id) {
        case 6:
          return "Not-Traded";
        case 5:
          return "Traded";
        case 2:
          return "Resubmit";
        case 3:
          return "Approved";
        // case 4 (Declined) → removed
        // case 8 (Compliant) → removed
        default:
          return "ellipsis";
      }
    };

    return data.requests.map((wf) => {
      // Step 0: Send For Approval
      const sendForApprovalStep = {
        status: "Send for Approval",
        date: formatApiDateTime(`${wf.requestedDate} ${wf.requestedTime}`),
        iconType: "SendForApproval",
      };
      // userID
      const userProfileData = JSON.parse(
        sessionStorage.getItem("user_profile_data")
      );
      // Step 1: Bundle hierarchy
      const bundleSteps =
        wf.bundleHistory?.map((b) => ({
          status:
            b.bundleStatus === 2
              ? "Approved"
              : b.bundleStatus === 3
              ? "Declined"
              : "Pending",
          user:
            userProfileData?.userID === b.assignedToUserID
              ? "You"
              : `${b.firstName} ${b.lastName}`,
          date: formatApiDateTime(
            `${b.bundleModifiedDate} ${b.bundleModifiedTime}`
          ),
          iconType: getBundleIconType(b.bundleStatus),
        })) || [];

      // Step 2: Final workflow status
      const finalStepStatus = wf.workFlowStatusID;

      // ❗ EXCLUDE Compliant (ID 8) and Declined (ID 4)
      const shouldAddFinalStep = ![8, 4].includes(finalStepStatus);

      let finalStep = null;

      if (shouldAddFinalStep) {
        finalStep = {
          status: wf.workFlowStatusName,
          date: formatApiDateTime(`${wf.requestedDate} ${wf.requestedTime}`),
          requesterID: dashBetweenApprovalAssets(wf.approvalID),
          iconType: getWorkFlowIconType(wf.workFlowStatusID),
        };
      }

      // 🔥 Final ordered steps
      const trail = [
        sendForApprovalStep,
        ...bundleSteps,
        ...(shouldAddFinalStep ? [finalStep] : []),
      ];

      return {
        id: String(wf.requestID),
        approvalID: wf.approvalID,
        instrumentName: wf.instrumentName,
        instrumentShortCode: wf.instrumentShortCode,
        assetShortCode: wf.assetShortCode,
        requesterName: wf.requesterName,
        creationDate: wf.requestedDate,
        creationTime: wf.requestedTime,
        quantity: Number(wf.quantity),
        type: wf.typeName || wf.type,
        status: wf.workFlowStatusName || wf.statusState,
        trail,
      };
    });
  };

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

      {/* 🔹 Transactions Table */}
      <PageLayout className={activeFilters.length > 0 && "changeHeight"}>
        <div>
          {/* Header & Actions */}
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 16, marginTop: 26 }}
          >
            <Col>
              <span className={style["heading"]}>My Actions</span>
            </Col>
          </Row>
          {/* Table */}
          <AcordianTable
            className={style["accordian-table-blue"]}
            columns={columns}
            dataSource={mapMyActionData(myActionLineManagerData)}
            onChange={(pagination, filters, sorter) => {
              setSortedInfo(sorter);
            }}
            rowClassName={(record) =>
              record.status === "Approved" ? "approved-row" : ""
            }
            refClass={containerRef}
            loadingMore={loadingMore}
            hasMore={hasMore}
          />
        </div>
      </PageLayout>
    </>
  );
};

export default MyAction;
