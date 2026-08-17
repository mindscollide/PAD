import React, { useCallback, useEffect, useRef, useState } from "react";
import { Row, Col } from "antd";
import { AcordianTable, PageLayout } from "../../../../components";
import style from "./co-myActions.module.css";
import { buildMyActionApiRequest, getMyActionsColumn } from "./utils";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import {
  DownloadMyActionsReportRequest,
  GetComplianceOfficerMyActionsWorkflowDetail,
  SearchLMMyActionWorkFlowRequest,
} from "../../../../api/myApprovalApi";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useApi } from "../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
} from "../../../../common/funtions/rejex";
const COMyAction = () => {
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
    complianceOfficerMyActionSearch,
    setComplianceOfficerMyActionSearch,
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

      const res = await GetComplianceOfficerMyActionsWorkflowDetail({
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
  console.log("setMyActionLineManagerData", myActionLineManagerData);

  // Initial Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildMyActionApiRequest(
        complianceOfficerMyActionSearch
      );

      fetchApiCall(requestData, true, true);
    }
  }, []);

  /** 🔹 this useEffect is for Search Filter */
  useEffect(() => {
    if (complianceOfficerMyActionSearch?.filterTrigger) {
      hasFetched.current = true;
      const requestData = buildMyActionApiRequest(
        complianceOfficerMyActionSearch
      );

      fetchApiCall(requestData, true, true);
      setComplianceOfficerMyActionSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [buildMyActionApiRequest, complianceOfficerMyActionSearch, fetchApiCall]);

  // -------------------- Table Columns --------------------
  const columns = getMyActionsColumn(
    approvalStatusMap,
    sortedInfo,
    complianceOfficerMyActionSearch,
    setComplianceOfficerMyActionSearch
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

    setComplianceOfficerMyActionSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 1,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setComplianceOfficerMyActionSearch((prev) => ({
      ...prev,
      requestID: "",
      instrumentName: "",
      requesterName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      type: [],
      status: [],
      pageNumber: 1,
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
    } = complianceOfficerMyActionSearch || {};
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
        // GetComplianceOfficerMyActionsWorkflowDetail's PageNumber is now
        // a real 1-indexed page number (backend fix 2026-08-05: OFFSET =
        // (PageNumber-1)*Length) — derive the next page from how many
        // rows are already loaded, not the raw row count itself.
        const currentLength = myActionLineManagerData?.requests?.length || 0;
        const pageSize = 10;
        const nextPageNumber = Math.floor(currentLength / pageSize) + 1;

        // build request based on current search/filter but override pagination
        const baseRequest = buildMyActionApiRequest(
          complianceOfficerMyActionSearch
        );
        const requestData = {
          ...baseRequest,
          PageNumber: nextPageNumber,
          Length: pageSize,
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
      setComplianceOfficerMyActionSearch();
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

    const loggedUser = JSON.parse(sessionStorage.getItem("user_profile_data"));
    const loggedUserId = loggedUser?.userID;

    // REWORKED (2026-08-17): trail is now built from the new timeline[]
    // (API_Changes/2026-08-17_co_lm_my_actions_timeline.md), same concept
    // already live on HOC (API_Changes/2026-08-04_hta_hoc_my_actions_timeline.md)
    // - replaces the flat per-actor bundleHistory[] snapshot this used to
    // filter by assignedToUserID.
    //
    // Deliberate difference from HOC's version, per this doc's explicit
    // callout: HOC's timeline is scoped to the viewing caller only
    // ("Approved By You"/"Declined by You", "Escalated On" filtered down
    // to escalations *this* HOC closed). This one is NOT scoped - it shows
    // every level's resolution from submission to the current state
    // (plain "Approved"/"Declined" event types, every "Escalated On" kept
    // as-is), attributed to whoever actually acted via actorName/
    // actorUserID - so no filtering here, and "You" is substituted only
    // when the event's own actor happens to be the viewer.
    const buildTrail = (timeline = []) => {
      return timeline.map((event) => {
        const date = formatApiDateTime(`${event.eventDate} ${event.eventTime}`);
        const actor =
          event.actorUserID === loggedUserId ? "You" : event.actorName;

        switch (event.eventType) {
          case "Submitted For Approval":
            // Same CO-specific relabel as the HOC fix: the first real
            // event here is the employee's underlying transaction, not an
            // approval request.
            return {
              status: "Transaction Conducted",
              date,
              iconType: "co-Transaction Conducted",
            };
          case "Resubmitted For Approval":
            return {
              status: "Resubmit",
              date,
              requesterID: dashBetweenApprovalAssets(
                event.referenceApprovalID
              ),
              iconType: "Resubmit",
            };
          case "Escalated On":
            return {
              status: "Escalated On",
              user: actor,
              date,
              iconType: "EscaltedOn",
            };
          case "Approved":
            return {
              status: "Marked Compliant",
              user: actor,
              date,
              iconType: "co-Compliant",
            };
          case "Declined":
            return {
              status: "Marked Non-Compliant",
              user: actor,
              date,
              iconType: "co-Non-Compliant",
            };
          default:
            return {
              status: event.eventType,
              user: actor,
              date,
              iconType: "ellipsis",
            };
        }
      });
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
        approvalDateTime:
          [wf?.requestedDate, wf?.requestedTime].filter(Boolean).join(" ") ||
          "—",
        quantity: Number(wf.quantity),
        nature: wf.nature,
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

export default COMyAction;
