import React, { useCallback, useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";

// 🔹 Components
import BorderlessTable from "../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../components/pageContainer/pageContainer";

// 🔹 Contexts
import { useGlobalModal } from "../../../context/GlobalModalContext";

// 🔹 Styles
import style from "./Broker.module.css";
import { buildApiRequest, getBrokerTableColumns } from "./utils";
import PDF from "../../../assets/img/pdf.png";
import Excel from "../../../assets/img/xls.png";
import CustomButton from "../../../components/buttons/button";
import AddNewBroker from "./modal/addNewBroker/AddNewBroker";
import EditBroker from "./modal/editBroker/EditBroker";
import AddBrokerConfirmationModal from "./modal/addBrokerConfimationModal/AddBrokerConfirmationModal";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  DownloadBrokerReportRequest,
  SearchBrokersAdminRequest,
  UpdateBrokersStatusRequest,
} from "../../../api/adminApi";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useApi } from "../../../context/ApiContext";
import { useMyAdmin } from "../../../context/AdminContext";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useTableScrollBottom } from "../../../common/funtions/scroll";

const Brokers = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollBrokersList = useRef(null);

  // 🔷 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const {
    adminBrokerSearch,
    setAdminBrokerSearch,
    resetAdminBrokersListSearch,
  } = useSearchBarContext();
  const {
    adminBrokerData,
    setAdminBrokerData,
    resetAdminBrokersDataContextState,
    adminBrokerMqtt,
    setAdminBrokerMqtt,
  } = useMyAdmin();
  const [loadingMore, setLoadingMore] = useState(false);

  const {
    addNewBrokerModal,
    setAddNewBrokerModal,
    editBrokerModal,
    setEditBrokerModal,
    setEditModalData,
    addBrokerConfirmationModal,
  } = useGlobalModal();

  // 🔷 UI State
  const [sortedInfo, setSortedInfo] = useState({});
  const [open, setOpen] = useState(false);

  // 🔷 Toggle Api Call For Active and InActive Statuses
  const onToggleStatusApiRequest = async (brokerID, isActive) => {
    showLoader(true);
    const payload = {
      BrokerID: brokerID,
      BrokerStatusID: isActive ? 1 : 2,
    };

    await UpdateBrokersStatusRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata: payload,
      navigate,
    });
  };

  // 🔷 Table Columns
  const columns = getBrokerTableColumns({
    sortedInfo,
    adminBrokerSearch,
    setAdminBrokerSearch,
    setEditBrokerModal,
    setEditModalData,
    onStatusChange: onToggleStatusApiRequest,
  });

  /** 🔹 Fetch approvals from API */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchBrokersAdminRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });
      const brokers = Array.isArray(res?.brokers) ? res.brokers : [];

      setAdminBrokerData((prev) => ({
        brokers: replace ? brokers : [...(prev?.brokers || []), ...brokers],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? brokers.length
          : adminBrokerData.totalRecordsTable + brokers.length,
      }));

      setAdminBrokerSearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace
            ? brokers.length
            : prev.pageNumber + brokers.length,
        };

        // this is for check if filter value get true only on that it will false
        if (prev.filterTrigger) {
          next.filterTrigger = false;
        }

        return next;
      });
    },
    [
      callApi,
      navigate,
      showLoader,
      showNotification,
      setAdminBrokerSearch,
      setAdminBrokerData,
    ]
  );

  // ----------------- Effects -----------------

  // 🔷 Initial Data Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildApiRequest(adminBrokerSearch);
      fetchApiCall(requestData, true, true);
    }
  }, [buildApiRequest, adminBrokerSearch, fetchApiCall]);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      resetAdminBrokersListSearch();
      resetAdminBrokersDataContextState();
    };
  }, []);

  // Fetch on Filter Trigger
  useEffect(() => {
    if (adminBrokerSearch.filterTrigger) {
      const requestData = buildApiRequest(adminBrokerSearch);

      fetchApiCall(requestData, true, true);
    }
  }, [adminBrokerSearch.filterTrigger]);

  // MQTT Updates
  useEffect(() => {
    if (adminBrokerMqtt) {
      setAdminBrokerMqtt(false);
      let requestData = buildApiRequest(adminBrokerSearch);
      requestData = {
        ...requestData,
        PageNumber: 0,
      };
      fetchApiCall(requestData, true, false);
    }
  }, [adminBrokerMqtt]);

  // Lazy loading
  useTableScrollBottom(
    async () => {
      if (
        adminBrokerData?.totalRecordsDataBase <=
        adminBrokerData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(adminBrokerSearch);
        await fetchApiCall(requestData, false, false);
      } catch (err) {
        console.error("Error loading more approvals:", err);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue"
  );

  // 🔷 Excel Report download Api Hit
  // Was hardcoded to an empty {BrokerName, PSXCode} stub, ignoring every
  // on-screen filter including StatusIds — export always returned every
  // broker regardless of the Active/Inactive filter applied on screen.
  // Build from the same filters the live listing uses; PageNumber/Length
  // excluded since sp_GetBrokersReport takes no pagination params at all
  // (confirmed via SQL_Scripts/sp_GetBrokersReport_AddStatusFilter.sql).
  const downloadReportInExcelFormat = async () => {
    showLoader(true);
    const { PageNumber, Length, ...requestdata } =
      buildApiRequest(adminBrokerSearch);

    await DownloadBrokerReportRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata: requestdata,
      setOpen,
      navigate,
    });
  };

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      brokerName: { brokerName: "" },
      psxCode: { psxCode: "" },
    };

    setAdminBrokerSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setAdminBrokerSearch((prev) => ({
      ...prev,
      brokerName: "",
      psxCode: "",
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { brokerName, psxCode } = adminBrokerSearch || {};

    return [
      brokerName && {
        key: "brokerName",
        value:
          brokerName.length > 13 ? brokerName.slice(0, 13) + "..." : brokerName,
      },
      psxCode && {
        key: "psxCode",
        value: psxCode.length > 13 ? psxCode.slice(0, 13) + "..." : psxCode,
      },
    ].filter(Boolean);
  })();

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

      {/* 🔷 Main Page Layout */}
      <PageLayout
        background="white"
        className={activeFilters.length > 0 && "changeHeight"}
      >
        <div className="px-4 md:px-6 lg:px-8">
          {/* 🔷 Header with Add/Export buttons */}
          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              <h2 className={style["heading"]}>Brokers</h2>
            </Col>
            <Col>
              <div className={style.mainDivForAddorExportBtn}>
                <CustomButton
                  text={"Add Broker"}
                  className="small-light-button"
                  onClick={() => setAddNewBrokerModal(true)}
                />
                <CustomButton
                  text={
                    <span className={style.exportButtonText}>
                      Export
                      <span className={style.iconContainer}>
                        {open ? <UpOutlined /> : <DownOutlined />}
                      </span>
                    </span>
                  }
                  className="small-light-button"
                  onClick={() => setOpen((prev) => !prev)}
                />
                {/* 🔷 Export Dropdown */}
                {open && (
                  <div className={style.dropdownExport}>
                    <div
                      className={style.dropdownItem}
                      onClick={downloadReportInExcelFormat}
                    >
                      <img src={Excel} alt="Excel" draggable={false} />
                      <span>Export XLS</span>
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* 🔷 Brokers Table */}
          <BorderlessTable
            rows={adminBrokerData?.brokers || []}
            classNameTable="border-less-table-blue"
            scroll={
              adminBrokerData?.brokers?.length
                ? { x: "max-content", y: activeFilters.length > 0 ? 450 : 500 }
                : undefined
            }
            columns={columns}
            onChange={(pagination, filters, sorter) => {
              setSortedInfo(sorter);
            }}
            loading={loadingMore}
            ref={tableScrollBrokersList}
          />
        </div>
      </PageLayout>

      {/* 🔷 Modals */}
      {/* To Open Add Modal While click on Add Broker */}
      {addNewBrokerModal && <AddNewBroker />}
      {editBrokerModal && <EditBroker />}
      {addBrokerConfirmationModal && <AddBrokerConfirmationModal />}
    </>
  );
};

export default Brokers;
