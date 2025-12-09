import React, { useState } from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { BorderlessTable, GlobalModal } from "../../../../../../components";
import CustomButton from "../../../../../../components/buttons/button";
import PDF from "../../../../../../assets/img/pdf.png";
import styles from "./ViewActionSessionWiseModal.module.css";
import { getBorderlessTableColumns } from "./utils";

const ViewActionSessionWiseModal = () => {
  const {
    // For Session Wise View Action Modal in Admin Role
    viewActionSessionWiseModal,
    setViewActionSessionWiseModal,
  } = useGlobalModal();

  // local sorted info used by your utils sorting UI
  const [sortedInfo, setSortedInfo] = useState({});

  // create columns with current sortedInfo
  const columns = getBorderlessTableColumns({ sortedInfo });

  // ✅ TABLE ROW DATA GOES HERE
  const rows = [
    {
      id: 1,
      date: "2024-10-15",
      TimeStamp: "09:45 AM",
      action:
        "Viewed and Reviewed Requested Approval for ENGRO-OCT Transaction",
    },
    {
      id: 2,
      date: "2024-10-15",
      TimeStamp: "09:55 AM",
      action: "Sent New Approval Request to Compliance Team for LUCK-OCT",
    },
    {
      id: 3,
      date: "2024-10-15",
      TimeStamp: "10:12 AM",
      action: "Accepted and Finalized Approval Request for PPL-OCT Submission",
    },
    {
      id: 4,
      date: "2024-10-15",
      TimeStamp: "10:45 AM",
      action: "Verified and Confirmed Transaction Details for LUCK-OCT Order",
    },
    {
      id: 5,
      date: "2024-10-15",
      TimeStamp: "10:12 AM",
      action:
        "Rejected Approval Request for SEARL-OCT Due to Missing Documentation",
    },
    {
      id: 6,
      date: "2024-10-15",
      TimeStamp: "10:55 AM",
      action:
        "Verified Transaction for NESTLE-OCT with Supporting Evidence Attached",
    },
    {
      id: 7,
      date: "2024-10-15",
      TimeStamp: "10:40 AM",
      action: "Accepted and Finalized Approval Request for PPL-OCT Submission",
    },
    {
      id: 8,
      date: "2024-10-15",
      TimeStamp: "10:40 AM",
      action: "Accepted for PPL-OCT Submission",
    },
    
  ];

  return (
    <GlobalModal
      visible={viewActionSessionWiseModal}
      width={"1480px"}
      centered={true}
      onCancel={() => setViewActionSessionWiseModal(false)}
      modalBody={
        <>
          <div className={styles.modalContainer}>
            <Row>
              <Col span={8}>
                <p className={styles.topTextLabelsStyling}>
                  Employee ID:
                  <span className={styles.subTopTextLabelStyling}>123456</span>
                </p>
              </Col>
              <Col span={8}>
                <p className={styles.topTextLabelsStyling}>
                  Employee Name:
                  <span className={styles.subTopTextLabelStyling}>
                    James Miller
                  </span>
                </p>
              </Col>
              <Col span={8}>
                <p className={styles.topTextLabelsStyling}>
                  IP:
                  <span className={styles.subTopTextLabelStyling}>
                    192.168.45.23
                  </span>
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "-10px" }}>
              <Col span={8}>
                <p className={styles.topTextLabelsStyling}>
                  Login Date and Time:
                  <span className={styles.subTopTextLabelStyling}>
                    2024-10-15 | 09:45 AM
                  </span>
                </p>
              </Col>
              <Col span={8}>
                <p className={styles.topTextLabelsStyling}>
                  Log Out Date and Time:
                  <span className={styles.subTopTextLabelStyling}>
                    2024-10-15 |10:45 AM
                  </span>
                </p>
              </Col>
              <Col span={4}>
                <p className={styles.topTextLabelsStyling}>
                  Session Duration:
                  <span className={styles.subTopTextLabelStyling}>
                    04H, 32M
                  </span>
                </p>
              </Col>
              <Col span={4} className={styles.downloadAndSessionStyle}>
                <CustomButton
                  text={"Download"}
                  className={"small-light-button"}
                  icon={<img src={PDF} />}
                  iconPosition="start"
                />
              </Col>
            </Row>

            <div className={styles.tableContainer}>
              <div className="px-4 md:px-6 lg:px-8">
                <BorderlessTable
                  rows={rows}
                  columns={columns}
                  classNameTable="border-less-table-noColorTable"
                  rowKey="id"
                  onChange={(pagination, filters, sorter) =>
                    setSortedInfo(sorter)
                  }
                />
              </div>
            </div>
          </div>
        </>
      }
    />
  );
};

export default ViewActionSessionWiseModal;
