import React, { useCallback, useEffect, useRef, useState } from "react";
import { Row, Col } from "antd";
import { AcordianTable, PageLayout } from "../../../../components";
import style from "./myActions.module.css";
import { buildMyActionApiRequest, getMyActionsColumn } from "./utils";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import {
  DownloadMyActionsReportRequest,
  GetHTAMyActionsWorkflowDetailApiRequest,
} from "../../../../api/myApprovalApi";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useApi } from "../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
} from "../../../../common/funtions/rejex";
const HTAMyAction = () => {
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
    headOfTradeApprovalMyActionSearch,
    setHeadOfTradeApprovalMyActionSearch,
  } = useSearchBarContext();

  const {
    myActionHeadOfTradeApprovalData,
    setMyActionHeadOfTradeApprovalData,
  } = useMyApproval();

  /**
   * Fetches transactions from API.
   * @param {boolean} flag - whether to show loader
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await GetHTAMyActionsWorkflowDetailApiRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      if (res) {
        setMyActionHeadOfTradeApprovalData(res);
      }
    },
    [callApi, navigate, showLoader, showNotification]
  );

  // Initial Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildMyActionApiRequest(
        headOfTradeApprovalMyActionSearch
      );

      fetchApiCall(requestData, true, true);
    }
  }, [
    buildMyActionApiRequest,
    headOfTradeApprovalMyActionSearch,
    fetchApiCall,
  ]);

  /** 🔹 this useEffect is for Search Filter */
  useEffect(() => {
    if (headOfTradeApprovalMyActionSearch?.filterTrigger) {
      hasFetched.current = true;
      const requestData = buildMyActionApiRequest(
        headOfTradeApprovalMyActionSearch
      );

      fetchApiCall(requestData, true, true);
      setHeadOfTradeApprovalMyActionSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [
    buildMyActionApiRequest,
    headOfTradeApprovalMyActionSearch,
    fetchApiCall,
  ]);

  // -------------------- Table Columns --------------------
  const columns = getMyActionsColumn(
    approvalStatusMap,
    sortedInfo,
    headOfTradeApprovalMyActionSearch,
    setHeadOfTradeApprovalMyActionSearch
  );

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      requestID: { requestID: "" },
      instrumentName: { instrumentName: "" },
      requesterName: { requesterName: "" },
      quantity: { quantity: null },
      type: { type: [] },
      status: { status: [] },
      dateRange: { startDate: "", endDate: "" },
    };

    setHeadOfTradeApprovalMyActionSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setHeadOfTradeApprovalMyActionSearch((prev) => ({
      ...prev,
      requestID: "",
      instrumentName: "",
      requesterName: "",
      quantity: null,
      startDate: "",
      endDate: "",
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
    } = headOfTradeApprovalMyActionSearch || {};
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
    const total = myActionHeadOfTradeApprovalData?.totalRecords ?? 0;
    const currentLen = myActionHeadOfTradeApprovalData?.requests?.length ?? 0;
    setHasMore(currentLen < total);
  }, [myActionHeadOfTradeApprovalData]);

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
        // Backend PageNumber is now a 1-based page index (offset = (PageNumber-1)*Length),
        // so derive the next page from how many rows are already loaded, not the raw count
        const currentLength =
          myActionHeadOfTradeApprovalData?.requests?.length || 0;
        const pageSize = 10;
        const nextPageNumber = Math.floor(currentLength / pageSize) + 1;

        // build request based on current search/filter but override pagination
        const baseRequest = buildMyActionApiRequest(
          headOfTradeApprovalMyActionSearch
        );
        const requestData = {
          ...baseRequest,
          PageNumber: nextPageNumber,
          Length: pageSize,
        };

        const res = await GetHTAMyActionsWorkflowDetailApiRequest({
          callApi,
          showNotification,
          showLoader, // you can pass showLoader or not; it won't show global loader if you manage local spinner
          requestdata: requestData,
          navigate,
        });

        const newEmployees = res?.requests || [];

        if (newEmployees.length > 0) {
          // merge new employees into existing array and also update any other top-level response fields (e.g., totalRecords)
          setMyActionHeadOfTradeApprovalData((prev = {}) => ({
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
      setHeadOfTradeApprovalMyActionSearch();
      setMyActionHeadOfTradeApprovalData([]);
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
  }, [
    containerRef.current,
    hasMore,
    loadingMore,
    myActionHeadOfTradeApprovalData,
  ]);

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

    // Pulls the numeric suffix out of an approval ID like "REQ000096" ->
    // 96, so a workflow's own approvalID can be compared against a
    // "Resubmitted For Approval" event's referenceApprovalID - see
    // buildTrail below.
    const extractApprovalNumber = (id) => {
      if (!id) return null;
      const digits = String(id).replace(/\D/g, "");
      return digits ? parseInt(digits, 10) : null;
    };

    // eventType → trail step shape (see approvalStepper.jsx's getIcon)
    //
    // FIXED (same issue reported/fixed on LM's own My Actions page, e.g.
    // REQ-000096/REQ-000097): a workflow's own timeline can carry up to
    // two "Resubmitted For Approval" entries - one describing how THIS
    // workflow came to exist (its referenceApprovalID is numerically
    // LOWER than this workflow's own approvalID - an "incoming" resubmit)
    // and, if this workflow was itself later resubmitted, one describing
    // what it became (referenceApprovalID numerically HIGHER -
    // "outgoing"). Both used to render in raw array order (both near the
    // very start, before any approvals) - the outgoing one reads as if
    // the resubmission happened before this workflow was even acted on,
    // when it actually happens after, so it's held back and appended
    // once the rest of the trail is built. A workflow whose only resubmit
    // entry is outgoing (the first link in its own chain) has no real
    // "Submitted For Approval" event in its timeline at all - a
    // synthesized one (dated off the workflow's own requestedDate/
    // requestedTime) is added at the front for it instead.
    const buildTrail = (timeline = [], wf) => {
      const ownNum = extractApprovalNumber(wf?.approvalID);
      const steps = [];
      const trailingResubmits = [];

      timeline.forEach((event) => {
        const date = formatApiDateTime(`${event.eventDate} ${event.eventTime}`);

        switch (event.eventType) {
          case "Submitted For Approval":
            steps.push({
              status: "Submitted For Approval",
              date,
              iconType: "SendForApproval",
            });
            break;
          case "Resubmitted For Approval": {
            const refNum = extractApprovalNumber(event.referenceApprovalID);
            const isOutgoing =
              refNum != null && ownNum != null && refNum > ownNum;

            const step = {
              status: isOutgoing ? "Resubmitted" : "Resubmit",
              date,
              requesterID: dashBetweenApprovalAssets(
                event.referenceApprovalID
              ),
              iconType: "Resubmit",
            };

            if (isOutgoing) {
              trailingResubmits.push(step);
            } else {
              steps.push(step);
            }
            break;
          }
          case "Escalated On":
            steps.push({
              status: "Escalated On",
              user: event.actorName,
              date,
              iconType: "EscaltedOn",
            });
            break;
          // FIXED: was "Approved By You" (capital "By") - the sibling
          // "Declined by You" case (and the real backend event type)
          // uses lowercase "by", so this never matched and fell through
          // to default, showing the raw event type with the Ellipses
          // "awaiting" icon instead of the intended green check.
          case "Approved by You":
            // actorName here is always the viewing HTA themselves (per
            // the event's own name) — show "Approved by You" literally
            // instead of the name a second time.
            // ADDED: same orange highlight as LM's own My Actions page
            // for the viewer's own approval - same tick shape as the
            // plain green "Approved" icon, just recolored (icon + text).
            steps.push({
              status: "Approved by You",
              date,
              iconType: "ApprovedByYou",
              textColor: "#f67f29",
            });
            break;
          case "Declined by You":
            steps.push({
              status: "Declined by You",
              date,
              iconType: "Decline",
            });
            break;
          default:
            steps.push({
              status: event.eventType,
              user: event.actorName,
              date,
              iconType: "ellipsis",
            });
        }
      });

      const hasLeadingOrigin =
        steps[0]?.iconType === "SendForApproval" ||
        steps[0]?.iconType === "Resubmit";

      if (!hasLeadingOrigin) {
        steps.unshift({
          status: "Submitted For Approval",
          date: formatApiDateTime(
            `${wf?.requestedDate} ${wf?.requestedTime}`
          ),
          iconType: "SendForApproval",
        });
      }

      return [...steps, ...trailingResubmits];
    };

    return data.requests.map((wf) => {
      // Journey trail — built from the pre-sorted timeline[] (chronological
      // events: submitted/resubmitted, each escalation, each approve/decline
      // this HTA closed), not the flat per-actor bundleHistory[] snapshot.
      const trail = Array.isArray(wf.timeline)
        ? buildTrail(wf.timeline, wf)
        : [];

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
        status: wf.statusState || wf.statusState,
        // ADDED: same "Resubmit" marker convention already used on LM's
        // own My Actions page (wf.workFlowStatusName, not statusState).
        isResubmit: wf.workFlowStatusName === "Resubmit",
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
            dataSource={mapMyActionData(myActionHeadOfTradeApprovalData)}
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

export default HTAMyAction;
