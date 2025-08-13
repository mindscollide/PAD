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
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [row, setRow] = useState(0); // current number of loaded rows
  const [totalRecords, setTotalRecords] = useState(0); // total from API
  const [loadingMore, setLoadingMore] = useState(false); // spinner at bottom

  console.log({ loadingMore }, "loadingMoreloadingMoreloadingMore");
  console.log(
    employeeMyApprovalSearch,
    employeeMyApproval,
    "employeeMyApproval"
  );

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

    const requestdata = {
      InstrumentName:
        employeeMyApprovalSearch.instrumentName ||
        employeeMyApprovalSearch.mainInstrumentName,
      StartDate: employeeMyApprovalSearch.date || "",
      Quantity: employeeMyApprovalSearch.quantity || 0,
      StatusIds: employeeMyApprovalSearch.status || [],
      TypeIds: employeeMyApprovalSearch.type || [],
      PageNumber: employeeMyApprovalSearch.pageNumber || 0,
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
    const updatedFilters = {
      ...employeeMyApprovalSearch,
      [key]: "",
    };

    const updatedSubmitted = submittedFilters.filter(
      (item) => item.key !== key
    );

    setSubmittedFilters(updatedSubmitted);

    const TypeIds = mapBuySellToIds(employeeMyApprovalSearch.type);
    const statusIds = mapStatusToIds(employeeMyApprovalSearch.status);

    const requestdata = {
      InstrumentName:
        employeeMyApprovalSearch.instrumentName ||
        employeeMyApprovalSearch.mainInstrumentName,
      StartDate: employeeMyApprovalSearch.date || "",
      Quantity: employeeMyApprovalSearch.quantity || 0,
      StatusIds: statusIds || [],
      TypeIds: TypeIds || [],
      PageNumber: employeeMyApprovalSearch.pageNumber || 1,
      Length: employeeMyApprovalSearch.pageSize || 10,
    };

    const normalizedKey = key?.toLowerCase();

    if (normalizedKey === "quantity") {
      requestdata.Quantity = 0;
    }

    if (
      normalizedKey === "instrumentname" ||
      normalizedKey === "maininstrumentname"
    ) {
      requestdata.InstrumentName = "";
    }

    if (normalizedKey === "startdate") {
      requestdata.StartDate = "";
    }

    showLoader(true);

    const data = await SearchTadeApprovals({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      navigate,
    });
    console.log("heloo log");
    setIsEmployeeMyApproval(data);
  };

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
  console.log("Filter Snapshot:", employeeMyApproval);

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
  console.log(employeeMyApproval, "employeeMyApprovalemployeeMyApproval");

  useEffect(() => {
    try {
      if (
        employeeMyApproval !== null &&
        Array.isArray(employeeMyApproval.approvals)
      ) {
        if (!hasReachedBottom) {
          // 🔹 Initial load or refresh
          setApprovalData(
            employeeMyApproval.approvals.map((item) => ({
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
            }))
          );
          setTotalRecords(employeeMyApproval.totalRecords || 0);
          setRow(employeeMyApproval.approvals.length);
        }
      } else if (employeeMyApproval === null) {
        setApprovalData([]);
        setTotalRecords(0);
        setRow(0);
      }
    } catch (error) {
      console.error(error, "error");
    }
  }, [employeeMyApproval, hasReachedBottom]);

  // Lazy Loading
  // Inside your component
  useTableScrollBottom(
    () => {
      if (totalRecords > approvalData.length) {
        console.log("Checker 23444");
        // showLoader(false);
        console.log(showLoader, "checkerLoader");
        // Prevent duplicate calls
        if (!loadingMore) {
          console.log("Checker 23444");
          setLoadingMore(true);

          // sRow = current loaded rows count
          const sRow = approvalData.length;
          const length = employeeMyApprovalSearch.pageSize || 10;

          // Updated request data
          const requestdata = {
            InstrumentName:
              employeeMyApprovalSearch.instrumentName ||
              employeeMyApprovalSearch.mainInstrumentName,
            StartDate: employeeMyApprovalSearch.date || "",
            Quantity: employeeMyApprovalSearch.quantity || 0,
            StatusIds: employeeMyApprovalSearch.status || [],
            TypeIds: employeeMyApprovalSearch.type || [],
            PageNumber: sRow, // ✅ acts like sRow for API
            Length: length,
          };

          SearchTadeApprovals({
            callApi,
            showNotification,
            showLoader: false, // ✅ Don't trigger full loader for lazy load
            requestdata,
            navigate,
          })
            .then((res) => {
              console.log("Checker 23444");
              if (res?.approvals?.length) {
                console.log("Checker 23444");
                setApprovalData((prev) => [
                  ...prev,
                  ...res.approvals.map((item) => ({
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
                  })),
                ]);

                // Update page number in search state
                setEmployeeMyApprovalSearch((prev) => ({
                  ...prev,
                  pageNumber: nextPage,
                }));
              }
            })
            .finally(() => {
              setLoadingMore(false);
            });
        }
      }
    },
    0,
    "border-less-table-orange" // ✅ container selector
  );

  // Lazy Loading Work Start
  console.log(employeeMyApprovalSearch, "employeeMyApprovalSearch");
  console.log(totalRecords, "totalRecordstotalRecords");
  console.log(approvalData, "approvalDataapprovalData");

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
                className="dropedown-dark"
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
