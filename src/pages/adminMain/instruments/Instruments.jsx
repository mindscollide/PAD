import React, { useCallback, useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";

// 🔹 Components
import BorderlessTable from "../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../components/pageContainer/pageContainer";

// 🔹 Contexts
import { useGlobalModal } from "../../../context/GlobalModalContext";

// 🔹 Styles
import style from "./Instruments.module.css";
import {
  buildApiRequest,
  getInstrumentTableColumns,
  mapAdminInstrumentListData,
} from "./utils";
import EditInstrument from "./modal/editInstrument/EditInstrument";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useApi } from "../../../context/ApiContext";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { useMyAdmin } from "../../../context/AdminContext";
import {
  getPreviousClosingPeriodInstrumentRequest,
  getUpcomingClosingPeriodInstrumentRequest,
  SearchGetInstrumentsWithClosingPeriod,
  UpdateInstrumentStatus,
} from "../../../api/adminApi";
import { useTableScrollBottom } from "../../../common/funtions/scroll";
import DeleteConfirmationModal from "./modal/deleteConfirmationModal/DeleteConfirmationModal";

const Instruments = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollInstrumentList = useRef(null);

  // 🔷 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const {
    adminIntrumentListSearch,
    setAdminIntrumentListSearch,
    resetAdminInstrumentListSearch,
  } = useSearchBarContext();
  const {
    adminIntrumentsData,
    setAdminIntrumentsData,
    adminIntrumentsMqtt,
    setAdminIntrumentsMqtt,
    resetAdminInstrumentsContextState,
    //For Upcoming Closing Data
    setAdminInstrumentUpcomingClosingData,
    //For Upcoming Previous Data
    setAdminInstrumentPreviousClosingData,
    //For Add and Delete Mqtt on Edit Modal Instrument
    adminAddDeleteClosingInstrument,
    setAdminAddDeleteClosingInstrument,
    selectedInstrumentOnClick,
    setSelectedInstrumentOnClick,
  } = useMyAdmin();

  const [loadingMore, setLoadingMore] = useState(false);

  const {
    setEditModalData,
    editInstrumentModal,
    setEditInstrumentModal,
    deleteConfirmationEditModal,
  } = useGlobalModal();

  console.log("adminIntrumentsDataadminIntrumentsData", adminIntrumentsData);

  const [sortedInfo, setSortedInfo] = useState({});

  // 🔷 Toggle Api Call For Active and InActive Statuses
  const onToggleStatusApiRequest = async (instrumentID, isActive) => {
    console.log("onToggleStatusApiRequest", instrumentID, isActive);
    showLoader(true);
    const payload = {
      InstrumentID: instrumentID,
      InstrumentStatusID: isActive ? 1 : 2,
    };

    await UpdateInstrumentStatus({
      callApi,
      showNotification,
      showLoader,
      requestdata: payload,
      navigate,
    });
  };

  // 🔷 Api Call For Edit Button API is getUpcomingClosingPeriodInstrumentRequest
  const onEditupcomingClosingPeriodAPiRequest = async (instrumentID) => {
    showLoader(true);
    const payload = {
      InstrumentID: instrumentID,
      pageNumber: 0,
      length: 10,
    };

    const response = await getUpcomingClosingPeriodInstrumentRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata: payload,
      navigate,
    });

    // Set Data in the Edit Modal Instrument Upcoming Closing Period Table
    if (response) {
      const newList = response?.closingPeriods || [];
      setAdminInstrumentUpcomingClosingData({
        closingPeriods: newList,
        totalRecordsDataBase: response?.totalRecords || 0,
        totalRecordsTable: newList.length,
      });
    }
  };

  // 🔷 Api Call For Edit Button API is getUpcomingClosingPeriodInstrumentRequest
  const onEditPreviousClosingPeriodAPiRequest = async (instrumentID) => {
    showLoader(true);
    const payload = {
      InstrumentID: instrumentID,
      pageNumber: 0,
      length: 20,
    };

    const response = await getPreviousClosingPeriodInstrumentRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata: payload,
      navigate,
    });

    // Set Data in the Edit Modal Instrument Previous Closing Period Table
    if (response) {
      setAdminInstrumentPreviousClosingData(response);
    }
  };

  const columns = getInstrumentTableColumns({
    adminIntrumentListSearch,
    setAdminIntrumentListSearch,
    sortedInfo,
    onStatusChange: onToggleStatusApiRequest,
    // For Edit Upcoming Closing Preiods
    onEditUpcomingClosing: onEditupcomingClosingPeriodAPiRequest,
    // For Edit Previous Closing Periods
    onEditPreviousClosing: onEditPreviousClosingPeriodAPiRequest,
    setEditInstrumentModal,
    setEditModalData,
    setSelectedInstrumentOnClick,
  });

  /** 🔹 Fetch approvals from API */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchGetInstrumentsWithClosingPeriod({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });
      const instruments = Array.isArray(res?.instruments)
        ? res.instruments
        : [];
      const mapped = mapAdminInstrumentListData(instruments);

      setAdminIntrumentsData((prev) => ({
        instruments: replace
          ? mapped
          : [...(prev?.instruments || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : adminIntrumentsData.totalRecordsTable + mapped.length,
      }));

      setAdminIntrumentListSearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace ? mapped.length : prev.pageNumber + mapped.length,
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
      setAdminIntrumentListSearch,
      setAdminIntrumentsData,
    ]
  );
  // ----------------- Effects -----------------

  // 🔷 Initial Data Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildApiRequest(adminIntrumentListSearch);
      fetchApiCall(requestData, true, true);
    }
  }, [buildApiRequest, adminIntrumentListSearch, fetchApiCall]);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      resetAdminInstrumentListSearch();
      resetAdminInstrumentsContextState();
    };
  }, []);

  // Fetch on Filter Trigger
  useEffect(() => {
    if (adminIntrumentListSearch.filterTrigger) {
      const requestData = buildApiRequest(adminIntrumentListSearch);

      fetchApiCall(requestData, true, true);
    }
  }, [adminIntrumentListSearch.filterTrigger]);

  // 🔷 MQTT Updates
  useEffect(() => {
    if (adminIntrumentsMqtt) {
      setAdminIntrumentsMqtt(false);
      let requestData = buildApiRequest(adminIntrumentListSearch);
      requestData = {
        ...requestData,
        PageNumber: 0,
      };
      fetchApiCall(requestData, true, false);
    }
  }, [adminIntrumentsMqtt]);

  // 🔷 MQTT Updates for Add/Delete in Upcoming Closing Periods
  useEffect(() => {
    if (adminAddDeleteClosingInstrument) {
      console.log(" Detected MQTT Add/Delete event for closing periods");

      if (selectedInstrumentOnClick) {
        onEditupcomingClosingPeriodAPiRequest(selectedInstrumentOnClick);
      }

      setAdminAddDeleteClosingInstrument(false);
    }
  }, [adminAddDeleteClosingInstrument]);

  // 🔷 Lazy Loading
  useTableScrollBottom(
    async () => {
      if (
        adminIntrumentsData?.totalRecordsDataBase <=
        adminIntrumentsData?.totalRecordsTable
      )
        return;
      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(adminIntrumentListSearch);
        await fetchApiCall(requestData, false, false);
      } catch (err) {
        console.error("Error loading more Instruments:", err);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue"
  );

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      dateRange: { startDate: null, endDate: null },
    };

    setAdminIntrumentListSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setAdminIntrumentListSearch((prev) => ({
      ...prev,
      instrumentName: "",
      startDate: null,
      endDate: null,
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { instrumentName, startDate, endDate } =
      adminIntrumentListSearch || {};

    return [
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
    ].filter(Boolean);
  })();
  console.log("activeFilters", activeFilters);
  return (
    <>
      {/* 🔹 Active Filter Tags */}
      {activeFilters.length > 0 && (
        <Row gutter={[12, 12]} className={style["filter-tags-container"]}>
          {console.log("activeFilters", activeFilters)}

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

      {/* Table Layout */}
      <PageLayout
        background="white"
        className={activeFilters.length > 0 && "changeHeight"}
      >
        <div className="px-4 md:px-6 lg:px-8">
          {/* Header */}
          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              <h2 className={style["heading"]}>Instruments</h2>
            </Col>
          </Row>

          <BorderlessTable
            rows={adminIntrumentsData?.instruments}
            classNameTable="border-less-table-blue"
            scroll={
              adminIntrumentsData?.instruments?.length
                ? { x: "max-content", y: activeFilters.length > 0 ? 450 : 500 }
                : undefined
            }
            columns={columns}
            onChange={(pagination, filters, sorter) => {
              setSortedInfo(sorter);
            }}
            loading={loadingMore}
            ref={tableScrollInstrumentList}
          />
        </div>
      </PageLayout>

      {/* Import Edit Instrument Modal */}
      {editInstrumentModal && <EditInstrument />}

      {/* Edit Delete Modal Confirmation MODal */}
      {deleteConfirmationEditModal && <DeleteConfirmationModal />}
    </>
  );
};

export default Instruments;
