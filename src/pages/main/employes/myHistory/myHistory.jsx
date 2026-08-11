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

      const res = await SearchEmployeeHistoryDetailRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });
      const currentAssetTypeData = getSafeAssetTypeData(
        assetTypeListingData,
        setAssetTypeListingData
      );
      if (res) {
        setEmployeeMyHistoryData(res);
      }
    },
    [callApi, navigate, showLoader, showNotification]
  );

  // Initial Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildMyHistoryApiRequest(
        employeeMyHistorySearch,
        assetTypeListingData
      );

      fetchApiCall(requestData, true, true);
    }
  }, []);

  /** 🔹 this useEffect is for Search Filter */
  useEffect(() => {
    if (employeeMyHistorySearch?.filterTrigger) {
      hasFetched.current = true;
      const requestData = buildMyHistoryApiRequest(
        employeeMyHistorySearch,
        assetTypeListingData
      );

      fetchApiCall(requestData, true, true);
      setEmployeeMyHistorySearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeeMyHistorySearch]);

  // -------------------- Table Columns --------------------
  const columns = getMyHistoryColumn(
    approvalStatusMap,
    sortedInfo,
    employeeMyHistorySearch,
    setEmployeeMyHistorySearch
  );

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      requestID: { requestID: "" },
      instrumentName: { instrumentName: "" },
      quantity: { quantity: 0 },
      dateRange: { startDate: null, endDate: null },
      nature: { nature: "" },
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
      pageNumber: 1,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { requestID, instrumentName, startDate, endDate, quantity, nature } =
      employeeMyHistorySearch || {};

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
    if (loadingMore) return;
    if (!hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // if reached bottom (small offset to be safe)
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setLoadingMore(true);

      try {
        // GetEmployeeHistoryWorkFlowDetails's PageNumber is now a real
        // 1-indexed page number (backend fix 2026-08-05: OFFSET =
        // (PageNumber-1)*Length) — derive the next page from how many
        // rows are already loaded, not the raw row count itself.
        const currentLength = employeeMyHistoryData?.workFlows?.length || 0;
        const pageSize = 10;
        const nextPageNumber = Math.floor(currentLength / pageSize) + 1;

        // build request based on current search/filter but override pagination
        const baseRequest = buildMyHistoryApiRequest(
          employeeMyHistorySearch,
          assetTypeListingData
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

        const newEmployees = res?.workFlows || [];

        if (newEmployees.length > 0) {
          // merge new employees into existing array and also update any other top-level response fields (e.g., totalRecords)
          setEmployeeMyHistoryData((prev = {}) => ({
            ...res, // take latest top-level fields (totalRecords etc.) from response
            workFlows: [...(prev.workFlows || []), ...newEmployees],
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
      assetTypeListingData
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
        /(\d{8})\s(\d{2}):(\d{2}):(\d{2})$/
      );

      const sendForApprovalStep = {
        status: isCreatedFromResubmit
          ? "Resubmit for Approval"
          : "Send for Approval",
        date:
          isCreatedFromResubmit && titleDateTimeMatch
            ? formatApiDateTime(
                `${titleDateTimeMatch[1]} ${titleDateTimeMatch[2]}${titleDateTimeMatch[3]}${titleDateTimeMatch[4]}`
              )
            : formatApiDateTime(`${wf.creationDate} ${wf.creationTime}`),
        ...(isCreatedFromResubmit && {
          requesterID: dashBetweenApprovalAssets(wf.resubmitRequestTrackingID),
        }),
        iconType: isCreatedFromResubmit ? "Resubmit" : "SendForApproval",
      };

      // Step 1: Bundle hierarchy
      const bundleSteps =
        wf.bundleHierarchy?.map((b) => ({
          status:
            b.bundleStatusState === 2
              ? "Approved"
              : b.bundleStatusState === 3
              ? "Declined"
              : "Pending",
          user: `${b.firstName} ${b.lastName}`,
          date: formatApiDateTime(
            `${b.bundleModifiedDate} ${b.bundleModifiedTime}`
          ),
          iconType: getBundleIconType(b.bundleStatusState),
        })) || [];

      // Step 2: Final workflow status
      const finalStepStatus = wf.workFlowStatusID;

      // ❗ EXCLUDE Compliant (ID 8) and Declined (ID 4)
      const shouldAddFinalStep = ![8, 4].includes(finalStepStatus);

      let finalStep = null;

      if (shouldAddFinalStep) {
        finalStep = {
          status: wf.workFlowStatus,
          date: formatApiDateTime(`${wf.creationDate} ${wf.creationTime}`),
          // Only show the tracking ID here when THIS request was itself
          // resubmitted (workFlowStatus === "Resubmit") — then
          // resubmitRequestTrackingID is the NEW REQ-ID it became. A
          // request merely created FROM a resubmission (e.g. now
          // Approved) also has resubmitRequestTrackingID set, but that
          // belongs on the "Resubmit for Approval" step above, not here.
          ...(wf.workFlowStatus === "Resubmit" && {
            requesterID: dashBetweenApprovalAssets(
              wf.resubmitRequestTrackingID
            ),
          }),
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
