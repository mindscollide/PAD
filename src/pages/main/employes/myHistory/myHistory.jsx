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

  const { setEmployeeMyHistoryData, employeeMyHistoryData } = useMyApproval();

  console.log(
    employeeMyHistoryData,
    "employeeMyHistoryDataemployeeMyHistoryData"
  );

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
      const requestData = buildMyHistoryApiRequest(employeeMyHistorySearch);

      fetchApiCall(requestData, true, true);
    }
  }, [buildMyHistoryApiRequest, employeeMyHistorySearch, fetchApiCall]);

  /** 🔹 this useEffect is for Search Filter */
  useEffect(() => {
    if (employeeMyHistorySearch?.filterTrigger) {
      hasFetched.current = true;
      const requestData = buildMyHistoryApiRequest(employeeMyHistorySearch);

      fetchApiCall(requestData, true, true);
      setEmployeeMyHistorySearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [buildMyHistoryApiRequest, employeeMyHistorySearch, fetchApiCall]);

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
      type: { type: [] },
      status: { status: [] },
    };

    setEmployeeMyHistorySearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
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
      pageNumber: 0,
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
        // calculate current offset (PageNumber) as current loaded employees length
        const currentLength = employeeMyHistoryData?.workFlows?.length || 0;

        // build request based on current search/filter but override pagination
        const baseRequest = buildMyHistoryApiRequest(employeeMyHistorySearch);
        const requestData = {
          ...baseRequest,
          PageNumber: currentLength, // sRow
          Length: 10, // eRow (static 10)
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
  const downloadMyHistoryReportInExcelFormat = async () => {
    showLoader(true);
    const requestdata = {
      RequestID: "",
      InstrumentName: "",
      Quantity: 0,
      StartDate: "",
      EndDate: "",
      Nature: "",
      StatusIDs: [],
      TradeApprovalTypeIDs: [],
    };
    await DownloadMyHistoryReportRequest({
      callApi,
      showLoader,
      requestdata: requestdata,
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
      // Step 0: Send For Approval
      const sendForApprovalStep = {
        status: "Send for Approval",
        date: formatApiDateTime(`${wf.creationDate} ${wf.creationTime}`),
        iconType: "SendForApproval",
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
          requesterID: dashBetweenApprovalAssets(wf.tradeApprovalID),
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
              <span className={style["heading"]}>My History</span>
            </Col>
            <Col style={{ position: "relative" }}>
              <CustomButton
                text={"Export"}
                className="big-light-button"
                icon={<DownloadOutlined />}
                iconPosition="end"
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
                  <div className={style.dropdownItem}>
                    <img src={PDF} alt="PDF" draggable={false} />
                    <span onClick={() => setUploadComplianceModal(true)}>
                      Export CSV
                    </span>
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
