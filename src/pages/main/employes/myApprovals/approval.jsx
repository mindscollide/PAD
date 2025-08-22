import React, { useEffect, useRef, useState } from "react";
import { Col, Row, Spin } from "antd";
import { ComonDropDown } from "../../../../components";
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import { getBorderlessTableColumns, useTableScrollBottom } from "./utill";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import EmptyState from "../../../../components/emptyStates/empty-states";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import style from "./approval.module.css";
import EquitiesApproval from "./modal/equitiesApprovalModal/EquitiesApproval";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useApi } from "../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { useMyApproval } from "../../../../context/myApprovalContaxt";
import { useGlobalModal } from "../../../../context/GlobalModalContext";
import SubmittedModal from "./modal/submittedModal/SubmittedModal";
import RequestRestrictedModal from "./modal/requestRestrictedModal/RequestRestrictedModal";
import ViewDetailModal from "./modal/viewDetailModal/ViewDetailModal";
import { useSidebarContext } from "../../../../context/sidebarContaxt";
import {
  mapBuySellToIds,
  mapStatusToIds,
} from "../../../../components/dropdowns/filters/utils";
import { apiCallSearch } from "../../../../components/dropdowns/searchableDropedown/utill";
import { SearchTadeApprovals } from "../../../../api/myApprovalApi";
import ViewComment from "./modal/viewComment/ViewComment";
import ResubmitModal from "./modal/resubmitModal/ResubmitModal";
import ResubmitIntimationModal from "./modal/resubmitIntimationModal/ResubmitIntimationModal";
import ConductTransaction from "./modal/conductTransaction/ConductTransaction";
import { useDashboardContext } from "../../../../context/dashboardContaxt";

const Approval = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const hasFetchedOnTriiger = useRef(false);

  const {
    isEquitiesModalVisible,
    setIsEquitiesModalVisible,
    isSubmit,
    setIsSubmit,
    isTradeRequestRestricted,
    setIsTradeRequestRestricted,
    isViewDetail,
    setIsViewDetail,
    isViewComments,
    isResubmitted,
    setIsResubmitted,
    resubmitIntimation,
    isConductedTransaction,
  } = useGlobalModal();

  const { showNotification } = useNotification();
  const { selectedKey } = useSidebarContext();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const { employeeMyApproval, setIsEmployeeMyApproval } = useMyApproval();

  const {
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch,
    resetEmployeeMyApprovalSearch,
  } = useSearchBarContext();

  const [sortedInfo, setSortedInfo] = useState({});
  const [approvalData, setApprovalData] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false); // spinner at bottom

  // Confirmed filters displayed as tags
  const [submittedFilters, setSubmittedFilters] = useState([]);

  // Check Equities Approval Modal Is Open or not and send to The isSubmitted Modal
  const [isEquitiesModalOpen, setIsEquitiesModalOpen] = useState(false);

  // Keys used to generate filter tags
  const filterKeys = [
    { key: "instrumentName", label: "Instrument" },
    { key: "mainInstrumentName", label: "Main Instrument" },
    { key: "startDate", label: "Date" },
    { key: "quantity", label: "Quantity" },
  ];

  const menuItems = [
    {
      key: "1",
      label: "Equities",
      onClick: () => {
        // setIsTradeRequestRestricted(false);
        setIsEquitiesModalOpen(true);
        setIsEquitiesModalVisible(true);
      },
    },
  ];

  const columns = getBorderlessTableColumns(
    approvalStatusMap,
    sortedInfo,
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch,
    setIsViewDetail,
    setIsResubmitted
  );

  /**
   * Fetches approval data from API on component mount
   */
  const fetchApprovals = async () => {
    await showLoader(true);
    console.log("Checker APi Search");

    const requestdata = {
      InstrumentName:
        employeeMyApprovalSearch.instrumentName ||
        employeeMyApprovalSearch.mainInstrumentName,
      StartDate: employeeMyApprovalSearch.date || "",
      Quantity: employeeMyApprovalSearch.quantity || 0,
      StatusIds: employeeMyApprovalSearch.status || [],
      TypeIds: employeeMyApprovalSearch.type || [],
      PageNumber: 0,
      Length: employeeMyApprovalSearch.pageSize || 10,
    };

    const data = await SearchTadeApprovals({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    setIsEmployeeMyApproval(data);
  };

  /**
   * Runs only once to fetch approvals on initial render
   */
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchApprovals();
  }, []);

  /**
   * Removes a filter tag and re-fetches data
   */
  const handleRemoveFilter = async (key) => {
    const normalizedKey = key?.toLowerCase();
    console.log("Checker APi Search");
    // 1️⃣ Update UI state for removed filters
    setSubmittedFilters((prev) => prev.filter((item) => item.key !== key));

    // 2️⃣ Prepare API request parameters
    const TypeIds = mapBuySellToIds(employeeMyApprovalSearch.type);
    const statusIds = mapStatusToIds(employeeMyApprovalSearch.status);

    const requestdata = {
      InstrumentName:
        employeeMyApprovalSearch.instrumentName ||
        employeeMyApprovalSearch.mainInstrumentName ||
        "",
      StartDate: employeeMyApprovalSearch.date || "",
      Quantity: employeeMyApprovalSearch.quantity || 0,
      StatusIds: statusIds || [],
      TypeIds: TypeIds || [],
      PageNumber: 0,
      Length: employeeMyApprovalSearch.pageSize || 10,
    };

    // 3️⃣ Reset API params for the specific filter being removed
    if (normalizedKey === "quantity") {
      requestdata.Quantity = 0;
      // 5️⃣ Update search state — only reset the specific key + page number
      setEmployeeMyApprovalSearch((prev) => ({
        ...prev,
        quantity: 0,
        pageNumber: 0,
      }));
    } else if (
      normalizedKey === "instrumentname" ||
      normalizedKey === "maininstrumentname"
    ) {
      setEmployeeMyApprovalSearch((prev) => ({
        ...prev,
        instrumentName: "",
        mainInstrumentName: "",
        pageNumber: 0,
      }));
      requestdata.InstrumentName = "";
    } else if (normalizedKey === "startdate") {
      requestdata.StartDate = "";
      setEmployeeMyApprovalSearch((prev) => ({
        ...prev,
        startdate: "",
        pageNumber: 0,
      }));
    }

    // 4️⃣ Show loader and call API
    showLoader(true);
    const data = await SearchTadeApprovals({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });

    setIsEmployeeMyApproval(data);
  };
  console.log("employeeMyApprovalSearch", employeeMyApprovalSearch);
  /**
   * Syncs submittedFilters state when filters are applied
   */
  useEffect(() => {
    if (employeeMyApprovalSearch.filterTrigger) {
      const snapshot = filterKeys
        .filter(({ key }) => employeeMyApprovalSearch[key])
        .map(({ key }) => ({
          key,
          value: employeeMyApprovalSearch[key],
        }));

      setSubmittedFilters(snapshot);

      setEmployeeMyApprovalSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeeMyApprovalSearch.filterTrigger]);

  /**
   * Handles table-specific filter trigger
   */
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (!employeeMyApprovalSearch.tableFilterTrigger) return;

      const snapshot = filterKeys
        .filter(({ key }) => employeeMyApprovalSearch[key])
        .map(({ key }) => ({
          key,
          value: employeeMyApprovalSearch[key],
        }));

      await apiCallSearch({
        selectedKey,
        employeeMyApprovalSearch,
        callApi,
        showNotification,
        showLoader,
        navigate,
        setData: setIsEmployeeMyApproval,
      });

      setSubmittedFilters(snapshot);

      setEmployeeMyApprovalSearch((prev) => ({
        ...prev,
        tableFilterTrigger: false,
      }));
    };

    fetchFilteredData();
  }, [employeeMyApprovalSearch.tableFilterTrigger]);

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
        resetEmployeeMyApprovalSearch();
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
        employeeMyApproval?.approvals &&
        Array.isArray(employeeMyApproval.approvals)
      ) {
        // 🔹 Map and normalize data
        const mappedData = employeeMyApproval.approvals.map((item) => ({
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
        setApprovalData(mappedData);

        // 🔹 Update search state (avoid unnecessary updates)
        setEmployeeMyApprovalSearch((prev) => ({
          ...prev,
          totalRecords:
            prev.totalRecords !== employeeMyApproval.totalRecords
              ? employeeMyApproval.totalRecords
              : prev.totalRecords,
          pageNumber: prev.pageNumber + 10,
        }));
      } else if (employeeMyApproval === null) {
        // No data case
        setApprovalData([]);
      }
    } catch (error) {
      console.error("Error processing employee approvals:", error);
    } finally {
      // 🔹 Always stop loading state
      setLoadingMore(false);
    }
  }, [employeeMyApproval]);

  // Lazy Loading
  // Inside your component
  useTableScrollBottom(
    async () => {
      // ✅ Only load more if there are still records left
      if (employeeMyApproval?.totalRecords !== approvalData?.length) {
        try {
          setLoadingMore(true);

          // Build request payload
          const requestdata = {
            InstrumentName:
              employeeMyApprovalSearch.instrumentName ||
              employeeMyApprovalSearch.mainInstrumentName,
            StartDate: employeeMyApprovalSearch.date || "",
            Quantity: employeeMyApprovalSearch.quantity || 0,
            StatusIds: employeeMyApprovalSearch.status || [],
            TypeIds: employeeMyApprovalSearch.type || [],
            PageNumber: employeeMyApprovalSearch.pageNumber || 10, // Acts as offset for API
            Length: 10,
          };

          console.log("Fetching employee approvals with params:", requestdata);
          console.log("Checker APi Search");

          // Call API
          const data = await SearchTadeApprovals({
            callApi,
            showNotification,
            showLoader, // ✅ Don't trigger full loader for lazy load
            requestdata,
            navigate,
          });

          // Append new approvals
          setIsEmployeeMyApproval((prev) => ({
            ...prev,
            approvals: [...(prev?.approvals || []), ...(data.approvals || [])],
            totalRecords:
              prev?.totalRecords !== data.totalRecords
                ? data.totalRecords
                : prev?.totalRecords,
          }));

          console.log("employeeMyApproval", data);
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

  // Lazy Loading Work Start
  console.log("employeeMyApproval", employeeMyApproval);

  return (
    <>
      {/* Filter Tags */}
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

      {/* Page Layout */}
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

          {/* Table or Empty State */}
          {approvalData && approvalData.length > 0 ? (
            <>
              <BorderlessTable
                rows={approvalData}
                columns={columns}
                scroll={{
                  x: "max-content",
                  y: submittedFilters.length > 0 ? 450 : 500,
                }}
                classNameTable="border-less-table-orange"
                onChange={(pagination, filters, sorter) => {
                  setSortedInfo(sorter);
                }}
                loading={loadingMore}
              />

              {/* {loadingMore && (
                <div style={{ textAlign: "center", padding: "12px" }}>
                  <Spin size="small" />
                </div>
              )} */}
            </>
          ) : (
            <EmptyState type="request" />
          )}
        </div>
      </PageLayout>

      {/* Ye Modal hai Jab App Add Approval Request Pa Click krta My Approval K page pa */}
      {isEquitiesModalVisible && <EquitiesApproval />}

      {/* Ye hai jab ap Apprvoal Entities ka modal kholtay aur submit krta intimation */}
      {isSubmit && <SubmittedModal isEquitiesModalOpen={isEquitiesModalOpen} />}

      {/* Ye modal hai jab Trade resttrict hoti hai */}
      {isTradeRequestRestricted && <RequestRestrictedModal />}

      {/* ye modal hai view details ka My APproval ka page pa */}
      {/* {isViewDetail && <ViewDetailModal />} */}
      {isViewDetail && <ViewDetailModal />}

      {/* Ye Sirf Comment Show krwata jab app approved modal ka andar view Comment krta tab khulta */}
      {isViewComments && <ViewComment />}

      {/* Ye modal jab khulta jab Resubmit krtay view Detail on Not Traded ka andar button hai resubmit */}
      {isResubmitted && <ResubmitModal />}

      {/* Ye uska resubmit modal  */}
      {resubmitIntimation && <ResubmitIntimationModal />}

      {/* Ye Conduct transaction Ka modal hai Approved modal ka andar */}
      {isConductedTransaction && <ConductTransaction />}
    </>
  );
};

export default Approval;
