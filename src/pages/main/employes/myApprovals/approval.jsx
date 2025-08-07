import React, { useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";
import { ComonDropDown } from "../../../../components";
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import { getBorderlessTableColumns } from "./utill";
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
import { apiCallSeacrch } from "../../../../components/dropdowns/searchableDropedown/utill";
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
  const { employeeBasedBrokersData, allInstrumentsData } =
    useDashboardContext();
  console.log("employeeBasedBrokersData", employeeBasedBrokersData);
  console.log("allInstrumentsDataallInstrumentsData", allInstrumentsData);
  console.log("employeeBasedBrokersData", allInstrumentsData);
  const [sortedInfo, setSortedInfo] = useState({});
  const [approvalData, setApprovalData] = useState([]);
  console.log(employeeMyApprovalSearch, "checkerapprovalaproval");

  // Confirmed filters displayed as tags
  const [submittedFilters, setSubmittedFilters] = useState([]);

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
    showLoader(true);

    const requestdata = {
      InstrumentName:
        employeeMyApprovalSearch.instrumentName ||
        employeeMyApprovalSearch.mainInstrumentName,
      StartDate: employeeMyApprovalSearch.date || "",
      Quantity: employeeMyApprovalSearch.quantity || 0,
      StatusIds: employeeMyApprovalSearch.status || [],
      TypeIds: employeeMyApprovalSearch.type || [],
      PageNumber: employeeMyApprovalSearch.pageNumber || 1,
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
    if (employeeMyApprovalSearch.tableFilterTrigger) {
      const snapshot = filterKeys
        .filter(({ key }) => employeeMyApprovalSearch[key])
        .map(({ key }) => ({
          key,
          value: employeeMyApprovalSearch[key],
        }));

      apiCallSeacrch({
        selectedKey,
        employeeMyApprovalSearch,
        callApi,
        showNotification,
        showLoader,
        navigate,
      });

      setSubmittedFilters(snapshot);

      setEmployeeMyApprovalSearch((prev) => ({
        ...prev,
        tableFilterTrigger: false,
      }));
    }
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

  useEffect(() => {
    if (employeeMyApproval) {
      const transformed = employeeMyApproval?.map((item) => ({
        id: item.approvalID,
        instrument: item.instrumentName,
        type: item.tradeType?.typeName || "-",
        requestDateTime: `${item.requestDate} | ${item.requestTime}`,
        status: item.approvalStatus?.approvalStatusName || "-",
        quantity: Number(item.quantity) || 0,
        timeRemaining: item.timeRemainingToTrade || "-",
      }));

      setApprovalData(transformed);
    }
  }, [employeeMyApproval]);

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
            <BorderlessTable
              rows={approvalData}
              columns={columns}
              scroll={{
                x: "max-content",
                y: submittedFilters.length > 0 ? 510 : 550,
              }}
              classNameTable="border-less-table-orange"
              onChange={(pagination, filters, sorter) => {
                setSortedInfo(sorter);
              }}
            />
          ) : (
            <EmptyState type="request" />
          )}
        </div>
      </PageLayout>

      {isEquitiesModalVisible && <EquitiesApproval />}

      {isSubmit && <SubmittedModal />}

      {isTradeRequestRestricted && <RequestRestrictedModal />}

      {isViewDetail && <ViewDetailModal />}

      {isViewComments && <ViewComment />}

      {isResubmitted && <ResubmitModal />}

      {resubmitIntimation && <ResubmitIntimationModal />}

      {isConductedTransaction && <ConductTransaction />}
    </>
  );
};

export default Approval;
