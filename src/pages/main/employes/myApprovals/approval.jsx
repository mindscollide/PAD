import React, { useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";
import { Button, ComonDropDown } from "../../../../components";
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import { getBorderlessTableColumns } from "./utill";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
import PageLayout from "../../../../components/pageContainer/pageContainer";
import EmptyState from "../../../../components/emptyStates/empty-states";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import style from "./approval.module.css";
import { SearchTadeApprovals } from "../../../../api/myApprovalApi";
// import { useGlobalModal } from "../../../../context/GlobalModalContext";
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
  } = useGlobalModal();

  const { showNotification } = useNotification();
  const { isLoading, showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const { employeeMyApproval, setIsEmployeeMyApproval } = useMyApproval();

  // Global state for filter/search values
  const {
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch,
    resetEmployeeMyApprovalSearch,
  } = useSearchBarContext();

  // Sort state for AntD Table
  const [sortedInfo, setSortedInfo] = useState({});
  const [approvalData, setApprovalData] = useState([]);

  // Confirmed filters displayed as tags
  const [submittedFilters, setSubmittedFilters] = useState([]);

  // Keys to track which filters to sync/display
  const filterKeys = [
    { key: "instrumentName", label: "Instrument" },
    { key: "mainInstrumentName", label: "Main Instrument" },
    { key: "date", label: "Date" },
    { key: "quantity", label: "Quantity" },
  ];

  // Dropdown menu items for Add Approval Request
  const menuItems = [
    {
      key: "1",
      label: "Equities",
      onClick: () => {
        setIsTradeRequestRestricted(false);
        // setIsSubmit(false); // Reset submitted state
        setIsEquitiesModalVisible(true);
      },
    },
  ];

  // Table columns with integrated filters
  const columns = getBorderlessTableColumns(
    approvalStatusMap,
    sortedInfo,
    employeeMyApprovalSearch,
    setEmployeeMyApprovalSearch,
    setIsViewDetail
  );
  const fetchApprovals = async () => {
    showLoader(true);
    let requestdata = {
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
    console.log("handleOk", requestdata);

    const data = await SearchTadeApprovals({
      callApi,
      showNotification,
      showLoader,
      requestdata, // ✅ pass filters
      navigate,
    });
    setIsEmployeeMyApproval(data);
  };
  useEffect(() => {
    //  this is only used for not to recall more then 1 time
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchApprovals();
  }, []);

  /**
   * Removes a filter from both context and UI tags
   */

  const handleRemoveFilter = (key) => {
    // Pehlay puranay filters copy karo aur jis key ko remove karna hai usko empty string set karo
    const updatedFilters = {
      ...employeeMyApprovalSearch,
      [key]: "",
    };

    // SubmittedFilters array mein se sirf woh filters rakho jo remove nahi kiya gaya
    const updatedSubmitted = submittedFilters.filter(
      (item) => item.key !== key
    );

    // SubmittedFilters update karo
    setSubmittedFilters(updatedSubmitted);

    // Filter state update karo, agar sare filters hat chuke hain toh filterTrigger true kar do
    setEmployeeMyApprovalSearch({
      ...updatedFilters,
      filterTrigger: updatedSubmitted.length === 0, // Trigger fetch if this was the last tag
    });

    // Agar last tag bhi remove ho gaya hai (yani sab filters hat gaye)
    if (updatedSubmitted.length === 0) {
      // Toh search filters ko bilkul default values par reset kar do
      setEmployeeMyApprovalSearch({
        instrumentName: "",
        mainInstrumentName: "",
        date: "",
        quantity: "",
        statusIds: [],
        typeIds: [],
        pageNumber: 1,
        length: 10,
        filterTrigger: true, // filterTrigger ko true kar ke API call karni hai dobara
      });
    }
  };

  /**
   * Syncs filters on `filterTrigger` from context
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

      // Reset filter trigger to avoid infinite loop
      setEmployeeMyApprovalSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
      if (hasFetchedOnTriiger.current) {
        fetchApprovals();
      } else {
        hasFetchedOnTriiger.current = true;
      }
    }
  }, [employeeMyApprovalSearch.filterTrigger]);

  useEffect(() => {
    try {
      // Get browser navigation entries (used to detect reload)
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries.length > 0) {
        const navigationType = navigationEntries[0].type;
        if (navigationType === "reload") {
          // Check localStorage for previously saved selectedKey
          resetEmployeeMyApprovalSearch();
        }
      }
    } catch (error) {
      console.error(
        "❌ Error detecting page reload or restoring state:",
        error
      );
    }
  }, []);
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
      console.log("handleOk sss", transformed);
      setApprovalData(transformed);
    }
  }, [employeeMyApproval]);
  return (
    <>
      {/* Filter Tags Display */}
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

      {/* Page Content */}
      <PageLayout background="white">
        <div className="px-4 md:px-6 lg:px-8">
          {/* Page Header */}
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
              scroll={{ x: "max-content", y: 550 }}
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
    </>
  );
};

export default Approval;
