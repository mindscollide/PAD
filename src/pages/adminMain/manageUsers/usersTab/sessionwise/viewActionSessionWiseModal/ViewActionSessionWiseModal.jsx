import React, { useEffect, useState } from "react";
import { Col, Row, Tooltip } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { BorderlessTable, GlobalModal } from "../../../../../../components";
import CustomButton from "../../../../../../components/buttons/button";
import PDF from "../../../../../../assets/img/pdf.png";
import styles from "./ViewActionSessionWiseModal.module.css";
import { getBorderlessTableColumns } from "./utils";
import { formatApiDateTime } from "../../../../../../common/funtions/rejex";

const ViewActionSessionWiseModal = () => {
  const {
    // For Session Wise View Action Modal in Admin Role
    viewActionSessionWiseModal,
    setViewActionSessionWiseModal,
    viewActionSessionWiseModalData,
  } = useGlobalModal();
  console.log("viewActionSessionWiseModalData", viewActionSessionWiseModalData);
  // local sorted info used by your utils sorting UI
  const [sortedInfo, setSortedInfo] = useState({});

  // create columns with current sortedInfo
  const columns = getBorderlessTableColumns({ sortedInfo });

  const user = viewActionSessionWiseModalData?.userSessionActivityUserDetails;

  const Employeeid = user?.userID || "";
  const EmployeeName = `${user?.firstName ?? ""} ${
    user?.lastName ?? ""
  }`.trim();
  const IP = user?.ipAddress || "";
  const LoginDateandTime =
    `${user?.loginDate ?? ""} ${user?.loginTime ?? ""}`.trim() || "—";
  const LoginOutDateandTime =
    `${user?.logoutDate ?? ""} ${user?.logoutTime ?? ""}`.trim() || "—";
  const SessionDuration = user?.sessionDuration || "";

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
                  <span className={styles.subTopTextLabelStyling}>
                    {Employeeid}
                  </span>
                </p>
              </Col>
              <Col span={8}>
                <p className={styles.topTextLabelsStyling}>
                  Employee Name:
                  <span className={styles.subTopTextLabelStyling}>
                    {EmployeeName}
                  </span>
                </p>
              </Col>
              <Col span={8}>
                <p className={styles.topTextLabelsStyling}>
                  IP:
                  <span className={styles.subTopTextLabelStyling}>{IP}</span>
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "-10px" }}>
              <Col span={8}>
                <p className={styles.topTextLabelsStyling}>
                  Login Date and Time:
                  <span className={styles.subTopTextLabelStyling}>
                    {formatApiDateTime(LoginDateandTime)}
                  </span>
                </p>
              </Col>
              <Col span={8}>
                <p className={styles.topTextLabelsStyling}>
                  Log Out Date and Time:
                  <span className={styles.subTopTextLabelStyling}>
                    {formatApiDateTime(LoginOutDateandTime)}
                  </span>
                </p>
              </Col>
              <Col span={4}>
                <p className={styles.topTextLabelsStyling}>
                  Session Duration:
                  <span className={styles.subTopTextLabelStyling}>
                    {SessionDuration}
                  </span>
                </p>
              </Col>
              <Col span={4} className={styles.downloadAndSessionStyle}>
                {/* SRS: "On click Download, the system will perform same
                    functionality as it does on Export." No export/download
                    endpoint exists for session-wise activity yet (adminApi.jsx
                    has only DownloadBrokerReportRequest and
                    ExportManageUsersUsersTabExcelReportRequest), so this had
                    no onClick at all and silently did nothing when clicked.
                    Disabled with an explanatory tooltip until the backend
                    endpoint lands, rather than looking functional but dead. */}
                <Tooltip title="Export is not available yet.">
                  <span>
                    <CustomButton
                      text={"Download"}
                      className={"small-light-button"}
                      icon={<img src={PDF} />}
                      iconPosition="start"
                      disabled
                    />
                  </span>
                </Tooltip>
              </Col>
            </Row>

            <div className={styles.tableContainer}>
              <div className="px-4 md:px-6 lg:px-8">
                <BorderlessTable
                  rows={viewActionSessionWiseModalData?.userSessionActions}
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
