import React, { useState } from "react";
import { Row, Col, DatePicker, Table } from "antd";
import CustomButton from "../../../../../components/buttons/button";
import { BorderlessTable, GlobalModal } from "../../../../../components";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import styles from "./EditInstrument.module.css";
import {
  previousClosedPeriodsTable,
  upcomingClosedPeriodsTable,
} from "./utils";
import EmptyState from "../../../../../components/emptyStates/empty-states";

const EditInstrument = () => {
  const { editInstrumentModal, setEditInstrumentModal } = useGlobalModal();
  const [sortedInfo, setSortedInfo] = useState({});

  // 🔹 State
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 🔹 Dummy data for demonstration
  const upcomingClosedPeriods = [
    {
      key: 1,
      dateRange: "7 Nov 2024 - 14 Nov 2025",
      duration: "7 Days",
    },
    {
      key: 1,
      dateRange: "7 Nov 2024 - 14 Nov 2025",
      duration: "7 Days",
    },
    {
      key: 1,
      dateRange: "7 Nov 2024 - 14 Nov 2025",
      duration: "7 Days",
    },
    {
      key: 1,
      dateRange: "7 Nov 2024 - 14 Nov 2025",
      duration: "7 Days",
    },
    {
      key: 1,
      dateRange: "7 Nov 2024 - 14 Nov 2025",
      duration: "7 Days",
    },
    {
      key: 1,
      dateRange: "7 Nov 2024 - 14 Nov 2025",
      duration: "7 Days",
    },
    {
      key: 1,
      dateRange: "7 Nov 2024 - 14 Nov 2025",
      duration: "7 Days",
    },
    {
      key: 1,
      dateRange: "7 Nov 2024 - 14 Nov 2025",
      duration: "7 Days",
    },
    {
      key: 1,
      dateRange: "7 Nov 2024 - 14 Nov 2025",
      duration: "7 Days",
    },
    {
      key: 1,
      dateRange: "7 Nov 2024 - 14 Nov 2025",
      duration: "7 Days",
    },
    {
      key: 1,
      dateRange: "7 Nov 2024 - 14 Nov 2025",
      duration: "7 Days",
    },
    {
      key: 1,
      dateRange: "7 Nov 2024 - 14 Nov 2025",
      duration: "7 Days",
    },
  ];

  const previousClosedPeriods = [
    ...upcomingClosedPeriods,
    ...upcomingClosedPeriods,
  ]; // just duplicating for visual scroll

  const handleDelete = (key) => {
    console.log("Delete record key:", key);
    // optional: remove from state here
  };

  const columns = upcomingClosedPeriodsTable(sortedInfo, handleDelete);

  const mergedPreviousClosedPeriods = upcomingClosedPeriods.map(
    (item, index) => ({
      key: index,
      dateRange1: item.dateRange,
      duration1: item.duration,
      dateRange2:
        upcomingClosedPeriods[index + upcomingClosedPeriods.length / 2]
          ?.dateRange,
      duration2:
        upcomingClosedPeriods[index + upcomingClosedPeriods.length / 2]
          ?.duration,
    })
  );

  return (
    <GlobalModal
      visible={editInstrumentModal}
      width="1400px"
      centered
      onCancel={() => setEditInstrumentModal(false)}
      modalBody={
        <div className={styles.modalContainer}>
          <Row gutter={[16, 16]}>
            {/* Left Side */}
            <Col xs={24} md={8}>
              <div className={styles.sectionBox}>
                <h2 className={styles.modalTitle}>Closed Period - HUBC</h2>
                <label className={styles.label}>Closed Period Start Date</label>
                <DatePicker
                  className={styles.datePicker}
                  value={startDate}
                  onChange={(value) => setStartDate(value)}
                />

                <label className={styles.label}>Closed Period End Date</label>
                <DatePicker
                  className={styles.datePicker}
                  value={endDate}
                  onChange={(value) => setEndDate(value)}
                />

                <div className={styles.buttonRightAligned}>
                  <CustomButton
                    text="Add Close Period"
                    className="big-dark-button"
                  />
                </div>

                <h3 className={styles.sectionTitle}>Upcoming Closed Periods</h3>
                {upcomingClosedPeriods && upcomingClosedPeriods.length > 0 ? (
                  <BorderlessTable
                    columns={columns}
                    rows={upcomingClosedPeriods}
                    pagination={false}
                    size="small"
                    classNameTable="border-less-table-blue"
                    scroll={{ x: "max-content", y: 240 }}
                    locale={{
                      emptyText: <EmptyState type="noUpcomingInstrument" />,
                    }}
                  />
                ) : (
                  <EmptyState type="noUpcomingInstrument" />
                )}
              </div>
            </Col>

            {/* Right Side */}
            <Col xs={24} md={16}>
              <div className={styles.sectionBoxPrevious}>
                <h3 className={styles.sectionTitle}>Previous Closed Periods</h3>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <BorderlessTable
                      columns={previousClosedPeriodsTable(
                        sortedInfo,
                        handleDelete
                      )}
                      rows={mergedPreviousClosedPeriods}
                      pagination={false}
                      size="small"
                      classNameTable="border-less-table-blue"
                      scroll={
                        mergedPreviousClosedPeriods.length > 0
                          ? { x: "max-content", y: 500 }
                          : { x: "max-content" } // don't set y at all
                      }
                      locale={{
                        emptyText: <EmptyState type="noPreviousInstrument" />,
                      }}
                    />
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
