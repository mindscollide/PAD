import React, { useCallback, useEffect, useRef, useState } from "react";
import { Row, Col } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { AcordianTable, PageLayout } from "../../../../components";
import CustomButton from "../../../../components/buttons/button";
import style from "./HOC-myActions.module.css";
import Excel from "../../../../assets/img/xls.png";
import { buildMyActionApiRequest, getMyActionsColumn } from "./utils";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import {
  DownloadMyActionsReportRequest,
  GetHOCMyActionsWorkflowDetail,
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
const HOCMyActionPage = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const containerRef = useRef(null);
  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { selectedKey } = useSidebarContext();

  const [sortedInfo, setSortedInfo] = useState({});

  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // until proven otherwise

  const {
    headOfComplianceMyActionSearch,
    setHeadOfComplianceMyActionSearch,
    resetHeadOfComplianceOfficerMyActionSearch,
  } = useSearchBarContext();

  const { myActionHOCData, setMyActionHOCData } = useMyApproval();
  console.log(selectedKey, "selectedKey");

  console.log(myActionHOCData, "myActionHOCDatamyActionHOCData");

  /**
   * Fetches transactions from API.
   * @param {boolean} flag - whether to show loader
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await GetHOCMyActionsWorkflowDetail({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      if (res) {
        setMyActionHOCData(res);
      }
    },
    [callApi, navigate, showLoader, showNotification],
  );

  // Initial Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildMyActionApiRequest(
        headOfComplianceMyActionSearch,
      );

      fetchApiCall(requestData, true, true);
    }
  }, [buildMyActionApiRequest, headOfComplianceMyActionSearch, fetchApiCall]);

  /** 🔹 this useEffect is for Search Filter */
  useEffect(() => {
    if (headOfComplianceMyActionSearch?.filterTrigger) {
      hasFetched.current = true;
      const requestData = buildMyActionApiRequest(
        headOfComplianceMyActionSearch,
      );

      fetchApiCall(requestData, true, true);
      setHeadOfComplianceMyActionSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [buildMyActionApiRequest, headOfComplianceMyActionSearch, fetchApiCall]);

  // -------------------- Table Columns --------------------
  const columns = getMyActionsColumn(
    approvalStatusMap,
    sortedInfo,
    headOfComplianceMyActionSearch,
    setHeadOfComplianceMyActionSearch,
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
      nature: { nature: [] },
      dateRange: { startDate: null, endDate: null },
    };

    setHeadOfComplianceMyActionSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setHeadOfComplianceMyActionSearch((prev) => ({
      ...prev,
      requestID: "",
      instrumentName: "",
      requesterName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      type: [],
      status: [],
      nature: [],
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
      nature,
    } = headOfComplianceMyActionSearch || {};

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

    const filters = [];

    if (requestID) {
      filters.push({
        key: "requestID",
        value:
          requestID.length > 13 ? requestID.slice(0, 13) + "..." : requestID,
      });
    }

    if (instrumentName) {
      filters.push({
        key: "instrumentName",
        value:
          instrumentName.length > 13
            ? instrumentName.slice(0, 13) + "..."
            : instrumentName,
      });
    }

    if (requesterName) {
      filters.push({
        key: "requesterName",
        value:
          requesterName.length > 13
            ? requesterName.slice(0, 13) + "..."
            : requesterName,
      });
    }

    if (startDate && endDate) {
      filters.push({
        key: "dateRange",
        value: `${startDate} → ${endDate}`,
      });
    }

    if (quantity && Number(quantity) > 0) {
      filters.push({
        key: "quantity",
        value: Number(quantity).toLocaleString("en-US"),
      });
    }

    // ✅ TYPE logic
    if (Array.isArray(type) && type.length > 0) {
      filters.push({
        key: "type",
        value: type.length === 1 ? typeMap[type[0]] : "Multiple",
      });
    }

    // ✅ STATUS logic (THIS is what you want)
    if (Array.isArray(status) && status.length > 0) {
      filters.push({
        key: "status",
        value: status.length === 1 ? statusMap[status[0]] : "Multiple",
      });
    }

    // ✅ NATURE logic
    if (Array.isArray(nature) && nature.length > 0) {
      filters.push({
        key: "nature",
        value: nature.length === 1 ? nature[0] : "Multiple",
      });
    }

    return filters;
  })();

  // Update hasMore when myActionHOCData changes
  useEffect(() => {
    const total = myActionHOCData?.totalRecords ?? 0;
    const currentLen = myActionHOCData?.requests?.length ?? 0;
    setHasMore(currentLen < total);
  }, [myActionHOCData]);

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
        const currentLength = myActionHOCData?.requests?.length || 0;

        // build request based on current search/filter but override pagination
        const baseRequest = buildMyActionApiRequest(
          headOfComplianceMyActionSearch,
        );
        const requestData = {
          ...baseRequest,
          PageNumber: currentLength, // sRow
          Length: 10, // eRow (static 10)
        };

        // FIXED (2026-08-17): was calling SearchLMMyActionWorkFlowRequest -
        // Line Manager's own My Actions search API, not HOC's. Every
        // scroll-triggered "load more" page past the first was fetching
        // (or failing to fetch, depending on the viewing HOC's assigned
        // roles) the wrong role's data entirely instead of more of this
        // HOC's own GetHOCMyActionsWorkflowDetail results - same endpoint
        // the initial fetch above already correctly uses.
        const res = await GetHOCMyActionsWorkflowDetail({
          callApi,
          showNotification,
          showLoader, // you can pass showLoader or not; it won't show global loader if you manage local spinner
          requestdata: requestData,
          navigate,
        });

        const newEmployees = res?.requests || [];

        if (newEmployees.length > 0) {
          // merge new employees into existing array and also update any other top-level response fields (e.g., totalRecords)
          setMyActionHOCData((prev = {}) => ({
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
      setHeadOfComplianceMyActionSearch();
      setMyActionHOCData([]);
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
  }, [containerRef.current, hasMore, loadingMore, myActionHOCData]);

  const mapMyActionData = (data) => {
    if (!data?.requests) return [];

    // CHANGED (2026-08-11): trail is now built from the pre-sorted
    // timeline[] (API_Changes/2026-08-04_hta_hoc_my_actions_timeline.md) -
    // chronological events (submitted/resubmitted, escalations this HOC
    // personally closed, every approve/decline this HOC closed) - not the
    // flat per-actor bundleHistory[] snapshot this used to filter by
    // assignedToUserID.
    //
    // Two HOC-specific deviations from HTA's myActions.jsx (per request):
    //  - "Submitted For Approval" is relabeled "Transaction Conducted"
    //    (co-Transaction Conducted icon) instead of HTA's generic
    //    "Send for Approval" - the first real event in HOC's domain is the
    //    employee's underlying transaction, not an approval request.
    //  - "Escalated On" is filtered down to only escalations *this* HOC
    //    actually closed - timeline's own contract is full escalation
    //    history (every level, regardless of who closed it), but that's
    //    not wanted here. There's no explicit "closed by" field on the
    //    event itself, so this pairs each escalation with the very next
    //    timeline entry for the same workflow: if that's one of this HOC's
    //    own Approved/Declined events, this escalation was the one that
    //    action resolved, so it's kept; otherwise (next entry is another
    //    escalation, or nothing follows) someone else closed it, or it's
    //    still open, so it's dropped.
    const buildTrail = (timeline = []) => {
      const trail = [];

      timeline.forEach((event, index) => {
        const date = formatApiDateTime(`${event.eventDate} ${event.eventTime}`);

        switch (event.eventType) {
          case "Submitted For Approval":
            trail.push({
              status: "Transaction Conducted",
              date,
              iconType: "co-Transaction Conducted",
            });
            break;
          case "Resubmitted For Approval":
            trail.push({
              status: "Resubmit",
              date,
              requesterID: dashBetweenApprovalAssets(event.referenceApprovalID),
              iconType: "Resubmit",
            });
            break;
          case "Escalated On": {
            const nextEvent = timeline[index + 1];
            const closedByViewer =
              nextEvent?.eventType === "Approved By You" ||
              nextEvent?.eventType === "Declined by You";
            if (closedByViewer) {
              trail.push({
                status: "Escalated On",
                user: event.actorName,
                date,
                iconType: "EscaltedOn",
              });
            }
            break;
          }
          case "Approved By You":
            trail.push({
              status: "Marked Compliant by You",
              date,
              iconType: "co-Compliant",
            });
            break;
          case "Declined by You":
            trail.push({
              status: "Marked Non-Compliant by You",
              date,
              iconType: "co-Non-Compliant",
            });
            break;
          default:
            trail.push({
              status: event.eventType,
              user: event.actorName,
              date,
              iconType: "ellipsis",
            });
        }
      });

      return trail;
    };

    return data.requests.map((wf) => {
      const trail = Array.isArray(wf.timeline) ? buildTrail(wf.timeline) : [];

      return {
        id: String(wf.requestID),
        approvalID: wf.approvalID,
        instrumentName: wf.instrumentName,
        instrumentShortCode: wf.instrumentShortCode,
        assetShortCode: wf.assetShortCode,
        requesterName: wf.requesterName,
        creationDate: wf.requestedDate,
        creationTime: wf.requestedTime,
        nature: wf.nature,
        creationTimeAndTime:
          [wf?.requestedDate, wf?.requestedTime].filter(Boolean).join(" ") ||
          "—",
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
            dataSource={mapMyActionData(myActionHOCData)}
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

export default HOCMyActionPage;
