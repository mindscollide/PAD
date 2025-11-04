import React, { useMemo, useState, useEffect } from "react";
import { Row, Col, DatePicker, Table } from "antd";
import CustomButton from "../../../../../components/buttons/button";
import { BorderlessTable, GlobalModal } from "../../../../../components";
import HistoryRecordIcon from "../../../../../assets/img/history-record-icon.png";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import styles from "./EditInstrument.module.css";
import {
  previousClosedPeriodsTable,
  upcomingClosedPeriodsTable,
  useMultiTableScrollBottom,
} from "./utils";
import { useMyAdmin } from "../../../../../context/AdminContext";
import dayjs from "dayjs";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useApi } from "../../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import {
  AddInstrumentClosingPeriodRequest,
  DeleteUpcomingInstrumentCosingPeriodRequest,
  GetPreviousClosingPeriodInstrumentRequest,
  GetUpcomingClosingPeriodInstrumentRequest,
} from "../../../../../api/adminApi";
import {
  formatDateToUTCString,
  formatShowOnlyDateForDateRange,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";

const EditInstrument = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  const {
    // For Upcoming Closing Periods
    adminInstrumentUpcomingClosingData,
    setAdminInstrumentUpcomingClosingData,
    // For Previous Closing Periods
    adminInstrumentPreviousClosingData,
    setAdminInstrumentPreviousClosingData,
    selectedInstrumentOnClick,
  } = useMyAdmin();

  const {
    editInstrumentModal,
    setEditInstrumentModal,
    setDeleteConfirmationEditModal,
    setDeleteEditModalData,
  } = useGlobalModal();
  const [sortedInfo, setSortedInfo] = useState({});

  // 🔹 State
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [previousLoadingMore, setPreviousLoadingMore] = useState(false);

  console.log(
    adminInstrumentPreviousClosingData,
    "adminInstrumentPreviousClosingData"
  );

  /**
   * 🧠 Convert API data into Ant Design Table-friendly rows
   * - Uses `formatShowOnlyDateForDateRange` to format start/end dates
   * - Displays `periodDays` as duration text
   */
  const upcomingClosedPeriods = useMemo(() => {
    if (!adminInstrumentUpcomingClosingData?.closingPeriods) return [];

    return adminInstrumentUpcomingClosingData.closingPeriods.map(
      (period, index) => ({
        key: period.instrumentID ?? index, // ✅ Prefer using instrumentID as unique key
        instrumentID: period.instrumentID, // ✅ Add this field for later use
        instrumentName: period.instrumentName, // ✅ Add this field for later use
        instrumentHistoryID: period.instrumentHistoryID, // ✅ Add this field for later use
        periodDays: period.periodDays,
        dateRange: `${formatShowOnlyDateForDateRange(
          period.instrumentStartDate
        )} - ${formatShowOnlyDateForDateRange(period.instrumentEndDate)}`,
        duration: `${period.periodDays} Days`,
      })
    );
  }, [adminInstrumentUpcomingClosingData]);

  // 🔷 Upcoming Closing Period Borderless Table
  const columns = upcomingClosedPeriodsTable({
    sortedInfo,
    setDeleteConfirmationEditModal,
    setDeleteEditModalData,
  });

  // 🔹 Disable past dates for start date
  const disablePastDates = (current) => {
    // disable today and earlier
    return current && current < dayjs().startOf("day").add(1, "day");
  };

  // 🔹 Disable end dates that are same or before startDate
  const disableBeforeStartDate = (current, startDate) => {
    if (!startDate) return true; // disable everything until startDate is picked
    return current && current <= dayjs(startDate).startOf("day");
  };

  const mergedPreviousClosedPeriods = useMemo(() => {
    const list = adminInstrumentPreviousClosingData?.closingPeriods || [];
    const formatted = list.map((period) => ({
      dateRange: `${formatShowOnlyDateForDateRange(
        period.instrumentStartDate
      )} - ${formatShowOnlyDateForDateRange(period.instrumentEndDate)}`,
      duration: `${period.periodDays} Days`,
    }));

    const merged = [];
    for (let i = 0; i < formatted.length; i += 2) {
      merged.push({
        key: i,
        dateRange1: formatted[i]?.dateRange || "",
        duration1: formatted[i]?.duration || "",
        dateRange2: formatted[i + 1]?.dateRange || "",
        duration2: formatted[i + 1]?.duration || "",
      });
    }

    return merged;
  }, [adminInstrumentPreviousClosingData]);

  // 🔷 Upcoming Closing Period Borderless Table
  const columnPrevious = previousClosedPeriodsTable(sortedInfo);

  // 🔹 Add Dates in Upcoming Data in Upcoming Table
  const handleClickAddClosePeriod = async () => {
    if (!startDate && !endDate) {
      return;
    }

    let getStartDateObj = new Date(dayjs(startDate));
    let getEndDateObj = new Date(dayjs(endDate));
    getEndDateObj.setHours(23, 59, 58);

    //Exporting UTC function (formatDateToUTCString)
    let convertStartDate = formatDateToUTCString(getStartDateObj);
    let convertEndDate = formatDateToUTCString(getEndDateObj);

    showLoader(true);
    let payload = {
      InstrumentID: selectedInstrumentOnClick,
      InstrumentStartDate: convertStartDate,
      InstrumentEndDate: convertEndDate,
    };

    await AddInstrumentClosingPeriodRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata: payload,
      navigate,
    });
  };

  // 🔹 useTableScrollBottom in which I add another class of borderless because it make an impact in other class also
  // ✅ Upcoming Lazy Loader
  const loadUpcoming = async () => {
    console.log("check Its occuring");
    const { totalRecordsDataBase, totalRecordsTable } =
      adminInstrumentUpcomingClosingData;

    if (totalRecordsTable >= totalRecordsDataBase) return;

    try {
      console.log(totalRecordsTable, "check Its occuring");
      setLoadingMore(true);
      const payload = {
        InstrumentID: selectedInstrumentOnClick,
        pageNumber: totalRecordsTable,
        length: 10,
      };

      const response = await GetUpcomingClosingPeriodInstrumentRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: payload,
        navigate,
      });

      if (response) {
        const newList = response?.closingPeriods || [];
        setAdminInstrumentUpcomingClosingData((prev) => ({
          closingPeriods: [...prev.closingPeriods, ...newList],
          totalRecordsDataBase:
            response?.totalRecords || prev.totalRecordsDataBase,
          totalRecordsTable: prev.totalRecordsTable + newList.length,
        }));
      }
    } catch (error) {
      console.error("Lazy loading error (Upcoming Closing Periods):", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // ✅ Previous Lazy Loader
  const loadPrevious = async () => {
    console.log("check Its occuring");
    const { totalRecordsDataBase, totalRecordsTable } =
      adminInstrumentPreviousClosingData;
    if (totalRecordsTable >= totalRecordsDataBase) return;

    try {
      setPreviousLoadingMore(true);
      console.log(
        { totalRecordsTable, totalRecordsDataBase },
        "check Its occuring"
      );
      const payload = {
        InstrumentID: selectedInstrumentOnClick,
        pageNumber: totalRecordsTable,
        length: 20,
      };

      const response = await GetPreviousClosingPeriodInstrumentRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: payload,
        navigate,
      });

      if (response) {
        const newList = response?.closingPeriods || [];
        setAdminInstrumentPreviousClosingData((prev) => ({
          closingPeriods: [...prev.closingPeriods, ...newList],
          totalRecordsDataBase:
            response?.totalRecords || prev.totalRecordsDataBase,
          totalRecordsTable: prev.totalRecordsTable + newList.length,
        }));
      }
    } catch (error) {
      console.error("Lazy loading error (Previous Closing Periods):", error);
    } finally {
      setPreviousLoadingMore(false);
    }
  };

  useMultiTableScrollBottom([
    {
      callback: loadUpcoming,
      offset: 0,
      className: "border-less-table-upcomingTable",
    },
    {
      callback: loadPrevious,
      offset: 0,
      className: "border-less-table-previousTable",
    },
  ]);

  useEffect(() => {
    if (!editInstrumentModal) {
      setAdminInstrumentUpcomingClosingData({
        closingPeriods: [],
        totalRecordsDataBase: 0,
        totalRecordsTable: 0,
      });
      setAdminInstrumentPreviousClosingData({
        closingPeriods: [],
        totalRecordsDataBase: 0,
        totalRecordsTable: 0,
      });
    }
  }, [editInstrumentModal]);

  return (
    <GlobalModal
      visible={editInstrumentModal}
      width="1400px"
      centered
      onCancel={() => setEditInstrumentModal(false)}
      modalBody={
        <div className={styles.modalContainer}>
          <Row gutter={[16, 16]}>
            {/* ================= LEFT SIDE ================= */}
            <Col xs={24} md={8}>
              <div className={styles.sectionBox}>
                <h2 className={styles.modalTitle}>Closed Period - HUBC</h2>
                <label className={styles.label}>Closed Period Start Date</label>
                <DatePicker
                  className={styles.datePicker}
                  value={startDate}
                  onChange={(value) => setStartDate(value)}
                  disabledDate={disablePastDates}
                />

                <label className={styles.label}>Closed Period End Date</label>
                <DatePicker
                  className={styles.datePicker}
                  value={endDate}
                  onChange={(value) => setEndDate(value)}
                  disabledDate={(current) =>
                    disableBeforeStartDate(current, startDate)
                  }
                />

                {/* Add Period Button */}
                <div className={styles.buttonRightAligned}>
                  <CustomButton
                    text="Add Close Period"
                    className="big-dark-button"
                    onClick={handleClickAddClosePeriod}
                    disabled={!startDate || !endDate}
                  />
                </div>

                {/* Upcoming Closed Periods Table */}
                <h3 className={styles.sectionTitle}>Upcoming Closed Periods</h3>
                {upcomingClosedPeriods && upcomingClosedPeriods.length > 0 ? (
                  <BorderlessTable
                    columns={columns}
                    rows={upcomingClosedPeriods}
                    pagination={false}
                    size="small"
                    classNameTable="border-less-table-upcomingTable"
                    scroll={{ x: "max-content", y: 240 }}
                    loading={loadingMore}
                    onChange={(pagination, filters, sorter) => {
                      setSortedInfo(sorter);
                    }}
                  />
                ) : (
                  <>
                    <div className={styles.emptyWrapper}>
                      <img
                        src={HistoryRecordIcon}
                        width={"298px"}
                        height={"211px"}
                      />
                      <p className={styles.NoUpcomingPeriodsText}>
                        No Upcoming Closing Periods
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Col>

            {/* ================= RIGHT SIDE ================= */}
            <Col xs={24} md={16}>
              <div className={styles.sectionBoxPrevious}>
                <h3 className={styles.sectionTitle}>Previous Closed Periods</h3>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    {mergedPreviousClosedPeriods &&
                    mergedPreviousClosedPeriods.length > 0 ? (
                      <BorderlessTable
                        columns={columnPrevious}
                        rows={mergedPreviousClosedPeriods}
                        pagination={false}
                        size="small"
                        classNameTable="border-less-table-previousTable"
                        loading={previousLoadingMore}
                        onChange={(pagination, filters, sorter) => {
                          setSortedInfo(sorter);
                        }}
                        scroll={
                          mergedPreviousClosedPeriods.length > 0
                            ? { x: "max-content", y: 500 }
                            : { x: "max-content" } // don't set y at all
                        }
                      />
                    ) : (
                      <>
                        <div className={styles.emptyWrapperPrevious}>
                          <img
                            src={HistoryRecordIcon}
                            width={"362px"}
                            height={"255px"}
                          />
                          <p className={styles.NoUpcomingPeriodsText}>
                            No Previous Closing Periods
                          </p>
                        </div>
                      </>
                    )}
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default EditInstrument;
