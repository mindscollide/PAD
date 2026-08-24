import React, { useCallback, useEffect, useRef, useState } from "react";
import { Row, Col } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { AcordianTable, PageLayout } from "../../../../components";
import CustomButton from "../../../../components/buttons/button";
import style from "./myHistory.module.css";
import PDF from "../../../../assets/img/pdf.png";
import Excel from "../../../../assets/img/xls.png";
import { buildMyHistoryApiRequest, getMyHistoryColumn } from "./utils";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import {
  DownloadMyHistoryReportRequest,
  SearchEmployeeHistoryDetailRequest,
} from "../../../../api/myApprovalApi";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useApi } from "../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import {
  dashBetweenApprovalAssets,
  formatApiDateTime,
} from "../../../../common/funtions/rejex";
import { useDashboardContext } from "../../../../context/dashboardContaxt";
import { getSafeAssetTypeData } from "../../../../common/funtions/assetTypesList";
import { UpOutlined, DownOutlined } from "@ant-design/icons";

const MyHistory = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const containerRef = useRef(null);
  // Bumped on every replace-style fetch (initial load, Status/Type/any
  // filter change) - handleScroll's "load more" checks this hasn't moved
  // since it started before merging its response in, so a slow scroll
  // fetch that was still in flight when the user changed a filter can't
  // land afterwards and append stale/wrong-filter rows onto the fresh
  // filtered list.
  const requestIdRef = useRef(0);
  // Synchronous re-entrancy lock for handleScroll - the `loadingMore`
  // state guard alone isn't enough: rapid native scroll events can fire
  // handleScroll again before React has committed the loadingMore=true
  // state update, so multiple overlapping "load more" calls for the same
  // next page could both go through and duplicate rows. A ref updates
  // immediately, closing that window.
  const isFetchingMoreRef = useRef(false);
  // Next page to request on scroll - tracked explicitly instead of derived
  // from `Math.floor(workFlows.length / pageSize) + 1`. That derivation
  // silently got stuck once the dedup guard below started dropping any
  // BE-echoed duplicate row (see the "TRX-000011..014 page-boundary
  // duplicates" bug): a deduped page adds fewer than `pageSize` rows, so
  // workFlows.length stops landing on the next multiple of pageSize, the
  // computed "next page" keeps re-resolving to the page just fetched, and
  // every further scroll re-fetches and re-dedupes that same page forever
  // - "load more" looked alive (loader flickered) but no new rows ever
  // appeared. Reset to 2 on every replace-style fetch (page 1 just loaded
  // fresh) and incremented by exactly 1 after each successful load-more,
  // independent of how many of those rows turned out to be duplicates.
  const nextPageRef = useRef(2);

  // -------------------- Contexts --------------------
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  const [sortedInfo, setSortedInfo] = useState({});

  const [open, setOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // until proven otherwise

  const {
    employeeMyHistorySearch,
    setEmployeeMyHistorySearch,
    resetEmployeeMyHistorySearch,
  } = useSearchBarContext();
  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();

  const { setEmployeeMyHistoryData, employeeMyHistoryData } = useMyApproval();

  /**
   * Fetches transactions from API.
   * @param {boolean} flag - whether to show loader
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);
      // New replace-style fetch (initial load or a filter change) -
      // invalidates any "load more" fetch already in flight, see
      // handleScroll below.
      requestIdRef.current += 1;

      const res = await SearchEmployeeHistoryDetailRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });
      const currentAssetTypeData = getSafeAssetTypeData(
        assetTypeListingData,
        setAssetTypeListingData,
      );
      if (res) {
        setEmployeeMyHistoryData(res);
      }
    },
    [callApi, navigate, showLoader, showNotification],
  );

  // Initial Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      // Page 1 is being loaded fresh here - the next scroll should ask for
      // page 2, see nextPageRef above.
      nextPageRef.current = 2;
      const requestData = buildMyHistoryApiRequest(
        employeeMyHistorySearch,
        assetTypeListingData,
      );

      fetchApiCall(requestData, true, true);
    }
  }, []);

  /** 🔹 this useEffect is for Search Filter */
  useEffect(() => {
    if (employeeMyHistorySearch?.filterTrigger) {
      hasFetched.current = true;
      // Clear the table immediately on Type/Status (or any filter) OK -
      // don't leave the previous filter's rows sitting on screen for the
      // full round-trip until the new response replaces them. Same empty
      // shape already used on unmount below.
      setEmployeeMyHistoryData([]);
      // Fresh page 1 for the new filter - same reset as the initial fetch
      // above.
      nextPageRef.current = 2;

      const requestData = buildMyHistoryApiRequest(
        employeeMyHistorySearch,
        assetTypeListingData,
      );

      fetchApiCall(requestData, true, true);
      setEmployeeMyHistorySearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeeMyHistorySearch]);

  // -------------------- Table Columns --------------------
  const columns = getMyHistoryColumn(approvalStatusMap, sortedInfo);

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      requestID: { requestID: "" },
      instrumentName: { instrumentName: "" },
      quantity: { quantity: 0 },
      dateRange: { startDate: null, endDate: null },
      nature: { nature: "" },
      type: { type: [] },
      status: { status: [] },
    };

    setEmployeeMyHistorySearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 1,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setEmployeeMyHistorySearch((prev) => ({
      ...prev,
      requestID: "",
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      nature: "",
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
      startDate,
      endDate,
      quantity,
      nature,
      type,
      status,
    } = employeeMyHistorySearch || {};

    const truncate = (val) =>
      val?.length > 13 ? `${val.slice(0, 13)}...` : val;

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
      nature && {
        key: "nature",
        value: nature.length > 13 ? nature.slice(0, 13) + "..." : nature,
      },
      type?.length > 0 && {
        key: "type",
        value: truncate(type.join(", ")),
      },
      status?.length > 0 && {
        key: "status",
        value: truncate(status.join(", ")),
      },
    ].filter(Boolean);
  })();

  // Update hasMore when employeeMyHistoryData changes
  useEffect(() => {
    const total = employeeMyHistoryData?.totalRecords ?? 0;
    const currentLen = employeeMyHistoryData?.workFlows?.length ?? 0;
    setHasMore(currentLen < total);
  }, [employeeMyHistoryData]);

  // Scroll handler for lazy loading
  const handleScroll = async () => {
    if (!containerRef.current) return;
    if (loadingMore || isFetchingMoreRef.current) return;
    if (!hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // if reached bottom (small offset to be safe)
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      // Set synchronously first - closes the window where rapid scroll
      // events fire this again before React commits loadingMore=true,
      // which would otherwise let two "load more" calls for the same
      // next page both go through and duplicate rows.
      isFetchingMoreRef.current = true;
      setLoadingMore(true);

      // Snapshot which replace-generation is current before the request
      // goes out - if a filter change (or the initial fetch) starts a new
      // one while this is in flight, requestIdRef.current will have moved
      // by the time this resolves, and the stale result below is
      // discarded instead of being appended onto the now-different list.
      const requestIdAtStart = requestIdRef.current;

      try {
        // GetEmployeeHistoryWorkFlowDetails's PageNumber is now a real
        // 1-indexed page number (backend fix 2026-08-05: OFFSET =
        // (PageNumber-1)*Length) — use the explicitly tracked next page
        // (nextPageRef above), not a value derived from how many rows
        // happen to be loaded, which gets stuck once the dedup guard below
        // ever drops a duplicate row.
        const pageSize = 10;
        const nextPageNumber = nextPageRef.current;

        // build request based on current search/filter but override pagination
        const baseRequest = buildMyHistoryApiRequest(
          employeeMyHistorySearch,
          assetTypeListingData,
        );
        const requestData = {
          ...baseRequest,
          PageNumber: nextPageNumber,
          Length: pageSize,
        };

        const res = await SearchEmployeeHistoryDetailRequest({
          callApi,
          showNotification,
          showLoader, // you can pass showLoader or not; it won't show global loader if you manage local spinner
          requestdata: requestData,
          navigate,
        });

        // A filter/initial fetch replaced the list while this "load more"
        // was in flight - this page belongs to the old filter/list, drop
        // it rather than appending mismatched rows onto the fresh one.
        if (requestIdRef.current !== requestIdAtStart) return;

        // This page has now been fetched (successfully or not) - move on
        // to the next one regardless of how many of its rows turn out to
        // be duplicates after the dedup filter below, so a boundary
        // duplicate can never re-request the same page forever.
        nextPageRef.current = nextPageNumber + 1;

        const newEmployees = res?.workFlows || [];

        if (newEmployees.length > 0) {
          // merge new employees into existing array and also update any other top-level response fields (e.g., totalRecords)
          setEmployeeMyHistoryData((prev = {}) => {
            const existingWorkFlows = prev.workFlows || [];
            // Defensive dedup by workFlowID - BE's OFFSET/FETCH pagination
            // can hand back a row already seen on an earlier page when its
            // ORDER BY has no fully unique tiebreaker (rows tied on the
            // sort column can land in either page depending on the call).
            // That's a backend ordering issue to fix at the source, but
            // this guard keeps it from rendering as duplicate rows here.
            const existingIDs = new Set(
              existingWorkFlows.map((wf) => wf.workFlowID),
            );
            const uniqueNewEmployees = newEmployees.filter(
              (wf) => !existingIDs.has(wf.workFlowID),
            );

            return {
              ...res, // take latest top-level fields (totalRecords etc.) from response
              workFlows: [...existingWorkFlows, ...uniqueNewEmployees],
            };
          });
        } else {
          // no new data => stop further fetching
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error fetching more users:", err);
      } finally {
        isFetchingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  };

  // Reset on Unmount
  useEffect(() => {
    return () => {
      setEmployeeMyHistorySearch();
      setEmployeeMyHistoryData([]);
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
  }, [containerRef.current, hasMore, loadingMore, employeeMyHistoryData]);

  // 🔷 Excel Report download Api Hit
  // Was hardcoded to an empty payload, ignoring every on-screen filter -
  // export always returned every request regardless of what was applied.
  // Build from the same filters the live listing uses; PageNumber/Length
  // excluded since exports return every matching row, never a page.
  const downloadMyHistoryReportInExcelFormat = async () => {
    const { PageNumber, Length, ...requestdata } = buildMyHistoryApiRequest(
      employeeMyHistorySearch,
      assetTypeListingData,
    );

    await DownloadMyHistoryReportRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      setOpen,
      navigate,
    });
  };

  const mapEmployeeHistoryData = (data) => {
    if (!data?.workFlows) return [];

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

    return data.workFlows.map((wf) => {
      // Step 0: Send For Approval — when this request was itself CREATED
      // by resubmitting an earlier one (resubmitRequestTrackingID set,
      // and this request's own status isn't "Resubmit" — that's the
      // OTHER direction, handled by the final step below), show
      // "Resubmit for Approval" with the original submission's date/time
      // and the previous REQ-ID it came from. creationDate/creationTime
      // on this record is when THIS resubmitted record was created, not
      // the lineage's original submission — that's embedded in `title`
      // instead (e.g. "TradeApprovalRequest-41-20260804 12:49:06").
      const isCreatedFromResubmit =
        wf.workFlowStatus !== "Resubmit" &&
        Boolean(wf.resubmitRequestTrackingID);

      // title's time portion is colon-separated ("12:49:06"), unlike the
      // plain HHmmss used everywhere else — strip the colons before
      // handing it to formatApiDateTime.
      const titleDateTimeMatch = wf.title?.match(
        /(\d{8})\s(\d{2}):(\d{2}):(\d{2})$/,
      );

      // FIXED (2026-08-18): the previous pass renamed this step to
      // "Transaction Conducted" for every row unconditionally - correct
      // for CO/HOC My Actions (Transaction-only, or nature-gated), wrong
      // here: My History mixes both natures in one list
      // (API_Changes/2026-08-18_employee_my_history_nature_vocabulary.md
      // - "Approval" for Trade Approval Request/REQ workflows,
      // "Verification" for Conducted Transaction/TRX workflows). A
      // REQ-prefixed request (e.g. REQ-000018) is a Trade Approval
      // Request, not a transaction - it should keep "Send for Approval".
      // Checking the ID prefix directly rather than wf.nature since that
      // vocabulary rename's SQL script hasn't been applied yet per the
      // doc - this works correctly either way, before or after.
      const isTransactionNature = wf.tradeApprovalID?.startsWith("TRX");

      const sendForApprovalStep = {
        status: isCreatedFromResubmit
          ? "Resubmit for Approval"
          : isTransactionNature
            ? "Transaction Conducted"
            : "Send for Approval",
        date:
          isCreatedFromResubmit && titleDateTimeMatch
            ? formatApiDateTime(
                `${titleDateTimeMatch[1]} ${titleDateTimeMatch[2]}${titleDateTimeMatch[3]}${titleDateTimeMatch[4]}`,
              )
            : formatApiDateTime(`${wf.creationDate} ${wf.creationTime}`),
        ...(isCreatedFromResubmit && {
          requesterID: dashBetweenApprovalAssets(wf.resubmitRequestTrackingID),
        }),
        iconType: isCreatedFromResubmit
          ? "Resubmit"
          : isTransactionNature
            ? "co-Transaction Conducted"
            : "SendForApproval",
      };

      // Step 1: Bundle hierarchy
      // ADDED (2026-08-20): bundleStatusState 3 was labeled "Declined"
      // unconditionally - correct wording for a Trade Approval Request
      // reviewer, but wrong for a Transaction/Portfolio workflow the CO
      // marked Non-Compliant (same bundleStatusState value, different
      // vocabulary - workFlowStatusID 9 is the actual outcome here, see
      // the shouldAddFinalStep exclusion above). Only relabels the entry
      // that's genuinely part of a Non-Compliant-outcome workflow, so a
      // real Declined Trade Approval Request keeps saying "Declined".
      const isNonCompliantOutcome = wf.workFlowStatusID === 9;

      const bundleSteps =
        wf.bundleHierarchy?.map((b) => ({
          status:
            b.bundleStatusState === 2
              ? "Approved"
              : b.bundleStatusState === 3
                ? isNonCompliantOutcome
                  ? "Non-Compliant"
                  : "Declined"
                : "Pending",
          user: `${b.firstName} ${b.lastName}`,
          date: formatApiDateTime(
            `${b.bundleModifiedDate} ${b.bundleModifiedTime}`,
          ),
          iconType: getBundleIconType(b.bundleStatusState),
        })) || [];

      // Step 2: Final workflow status
      const finalStepStatus = wf.workFlowStatusID;

      // FIXED (2026-08-18): status 1 (Pending) was NOT excluded here, so
      // a still-pending request got a redundant final step repeating
      // "Pending" on top of the bundle/hierarchy step(s) already showing
      // the pending reviewer - excluded now, same reasoning as the
      // existing Declined (4) exclusion.
      //
      // FIXED (2026-08-20): status 9 (Non-Compliant) fell through to the
      // generic path below and got its own final step too - genuinely
      // redundant AND mistimed: the CO's bundle entry (bundleStatusState
      // 3, generic "Declined" label + actual actor/timestamp) already
      // represents this exact outcome accurately, while the generic final
      // step used wf.creationDate/Time (the transaction's own conduct
      // time, not when it was actually marked Non-Compliant) - showing an
      // extra "Non-Compliant" step with an earlier, wrong timestamp after
      // the real "Declined by <CO name>" step.
      //
      // FIXED (2026-08-20): status 8 (Compliant) had its OWN dedicated
      // branch below that added a second final step attributed to the
      // same lastBundleEntry actor/timestamp already shown on the bundle
      // step above it - e.g. "Approved by Kamil Shah 12:18pm" followed by
      // a redundant "Compliant by Kamil Shah 12:18pm" repeating the exact
      // same actor and exact same timestamp. Per explicit confirmation,
      // the bundle step's existing wording ("Approved by <name>") is kept
      // as the one and only last step - excluded here the same way
      // Declined (4) and Non-Compliant (9) already are, and the
      // now-dead special branch that used to build that second step is
      // removed below.
      const shouldAddFinalStep = ![1, 4, 8, 9].includes(finalStepStatus);

      let finalStep = null;

      if (shouldAddFinalStep) {
        // ADDED (2026-08-19): for Not Traded (6), wf.creationDate/Time is
        // when the request was ORIGINALLY submitted, not when the
        // background job actually flipped it to Not Traded - that's a
        // separate moment, only now captured as notTradedDate/notTradedTime
        // (2026-08-19_employee_history_not_traded_datetime.md). Falls back
        // to creationDate/Time (today's existing behavior) when those are
        // null - per the doc this isn't retroactively backfilled, so a
        // transition that happened before this fix shipped has no recorded
        // moment to show instead.
        const isNotTraded = wf.workFlowStatusID === 6;
        const finalStepDate =
          isNotTraded && wf.notTradedDate
            ? formatApiDateTime(`${wf.notTradedDate} ${wf.notTradedTime}`)
            : formatApiDateTime(`${wf.creationDate} ${wf.creationTime}`);

        finalStep = {
          // Display-only relabel: "Resubmit" -> "Resubmitted" for this
          // final step (it's reporting a completed action, not an
          // instruction) - the raw wf.workFlowStatus value below is left
          // untouched for the requesterID check right after, so that
          // comparison keeps matching the backend's actual string.
          status:
            wf.workFlowStatus === "Resubmit" ? "Resubmitted" : wf.workFlowStatus,
          date: finalStepDate,
          // Only show the tracking ID here when THIS request was itself
          // resubmitted (workFlowStatus === "Resubmit") — then
          // resubmitRequestTrackingID is the NEW REQ-ID it became. A
          // request merely created FROM a resubmission (e.g. now
          // Approved) also has resubmitRequestTrackingID set, but that
          // belongs on the "Resubmit for Approval" step above, not here.
          ...(wf.workFlowStatus === "Resubmit" && {
            requesterID: dashBetweenApprovalAssets(
              wf.resubmitRequestTrackingID,
            ),
          }),
          iconType: getWorkFlowIconType(wf.workFlowStatusID),
        };
      }

      // ADDED (2026-08-19): notTradedDate/Time stays populated even after
      // the request moves on from status 6 - e.g. a Not Traded request that
      // gets resubmitted flips to "Resubmit" (2), but it genuinely did sit
      // as Not Traded before that resubmit happened, and the field still
      // reflects that moment. The final step above only ever shows the
      // CURRENT status now, so without this the fact it was ever Not
      // Traded disappeared from the trail entirely for a resubmitted
      // request. Inserted as its own step, right before the final one -
      // skipped when the current status IS 6, since the final step already
      // represents that directly (would otherwise show the same moment
      // twice).
      const notTradedStep =
        wf.notTradedDate && finalStepStatus !== 6
          ? {
              status: "Not Traded",
              date: formatApiDateTime(
                `${wf.notTradedDate} ${wf.notTradedTime}`,
              ),
              iconType: "Not-Traded",
            }
          : null;

      // 🔥 Final ordered steps
      const trail = [
        sendForApprovalStep,
        ...bundleSteps,
        ...(notTradedStep ? [notTradedStep] : []),
        ...(finalStep ? [finalStep] : []),
      ];

      return {
        id: wf.tradeApprovalID || wf.workFlowID,
        tradeApprovalID: wf.tradeApprovalID,
        instrumentName: wf.instrumentName,
        instrumentShortCode: wf.instrumentShortCode,
        assetShortCode: wf.assetShortCode,
        quantity: Number(wf.quantity),
        type: wf.tradeType,
        nature: wf.nature,
        creationDate: wf.creationDate,
        creationTime: wf.creationTime,
        status: wf.workFlowStatus,
        // Set whenever this request is part of a resubmit chain, in
        // either direction — resubmitted into a new request, or itself
        // created by resubmitting an earlier one.
        isResubmitLinked: Boolean(wf.resubmitRequestTrackingID),
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
      <PageLayout className={activeFilters.length > 0 && "changeHeight2"}>
        <div className="px-4 md:px-6 lg:px-8">
          {/* Header & Actions */}
          <Row justify="space-between" align="middle">
            <Col>
              <span className={style["heading"]}>My History</span>
            </Col>
            <Col style={{ position: "relative", marginTop: "2px" }}>
              <CustomButton
                text={
                  <span className={style.exportButtonText}>
                    Export
                    <span className={style.iconContainer}>
                      {open ? <UpOutlined /> : <DownOutlined />}
                    </span>
                  </span>
                }
                className="small-light-button-report"
                onClick={() => setOpen((prev) => !prev)}
              />

              {open && (
                <div className={style.dropdownExport}>
                  <div className={style.dropdownItem}>
                    <img src={PDF} alt="PDF" draggable={false} />
                    <span>Export PDF</span>
                  </div>
                  <div
                    className={style.dropdownItem}
                    onClick={downloadMyHistoryReportInExcelFormat}
                  >
                    <img src={Excel} alt="Excel" draggable={false} />
                    <span>Export Excel</span>
                  </div>
                </div>
              )}
            </Col>
          </Row>
          {/* Table */}
          <AcordianTable
            className={style["accordian-table-blue"]}
            columns={columns}
            dataSource={mapEmployeeHistoryData(employeeMyHistoryData)}
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

export default MyHistory;
