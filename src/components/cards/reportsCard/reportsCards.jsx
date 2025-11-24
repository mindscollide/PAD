import React from "react";
import { Card, Typography } from "antd";
import styles from "./reportsCard.module.css";
import { Button } from "../..";
import { navigateToPage } from "./utill";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../emptyStates/empty-states";
import MyComplianceIcon from "../../../assets/img/shield-check.png";
import MyTradeApprovalIcon from "../../../assets/img/shield-check-round.png";
import MyTransactionsIcon from "../../../assets/img/arrow-left-right.png";
import PendingRequestIcon from "../../../assets/img/shield-doted.png";
import CalenderIcon from "../../../assets/img/calender.png";
import PolicyBreachesIcon from "../../../assets/img/policy-report.png";
import ReportIcon from "../../../assets/img/repot-activity.png";

const { Title } = Typography;

const ReportCard = ({
  data = [],
  mainClassName = "card",
  title = "Reports",
  buttonTitle = "See More",
  buttonClassName = "",
  rowButtonClassName = "",
  userRole,
  route,
}) => {
  const base = mainClassName || "home-reprot-card"; // fallback class name
  const navigate = useNavigate();
  const { setSelectedKey } = useSidebarContext();
  const onHeaderButtonClick = () => {
    navigateToPage(userRole, route, setSelectedKey, navigate);
  };
  const onRowButtonClick = (data) => {
    console.log("onRowButtonClick", data);

    if (data?.label === "My Trade Approvals" && userRole === "employee") {
      setSelectedKey("5"); // update your menu/side bar state
      navigate("/PAD/reports/my-trade-approvals"); // route change
    }
  };

  const reportIcons = {
    "my compliance": (
      <img
        draggable={false}
        src={MyComplianceIcon}
        alt="Compliance"
        className={styles.urgentImg}
      />
    ),
    "my trade approvals": (
      <img
        draggable={false}
        src={MyComplianceIcon}
        alt="Compliance"
        className={styles.urgentImg}
      />
    ),
    "my trade approvals standing": (
      <img
        draggable={false}
        src={MyTradeApprovalIcon}
        alt="Compliance"
        className={styles.urgentImg}
      />
    ),
    "my transactions": (
      <img
        draggable={false}
        src={MyTransactionsIcon}
        alt="Transactions"
        className={styles.urgentImg}
      />
    ),
    "pending requests": (
      <img
        draggable={false}
        src={PendingRequestIcon}
        alt="Pending"
        className={styles.urgentImg}
      />
    ),
    "trade approval requests": (
      <img
        draggable={false}
        src={MyTradeApprovalIcon}
        alt="Approval"
        className={styles.urgentImg}
      />
    ),
    "portfolio history": (
      <img
        draggable={false}
        src={MyTradeApprovalIcon}
        alt="Portfolio"
        className={styles.urgentImg}
      />
    ),
    "date-wise transaction report": (
      <img
        draggable={false}
        src={CalenderIcon}
        alt="Date"
        className={styles.urgentImg}
      />
    ),
    "date wise transaction report": (
      <img
        draggable={false}
        src={CalenderIcon}
        alt="Date"
        className={styles.urgentImg}
      />
    ),
    "transactions summary report": (
      <img
        draggable={false}
        src={CalenderIcon}
        alt="Approval"
        className={styles.urgentImg}
      />
    ),
    "overdue verifications": (
      <img
        draggable={false}
        src={MyComplianceIcon}
        alt="Overdue"
        className={styles.urgentImg}
      />
    ),
    "policy breaches": (
      <img
        draggable={false}
        src={PolicyBreachesIcon}
        alt="Policy"
        className={styles.urgentImg}
      />
    ),
    "tat request approvals": (
      <img
        draggable={false}
        src={MyTradeApprovalIcon}
        alt="TAT"
        className={styles.urgentImg}
      />
    ),
    "trades uploaded via portfolio": (
      <img
        draggable={false}
        src={MyTradeApprovalIcon}
        alt="TAT"
        className={styles.urgentImg}
      />
    ),
    "user activity report": (
      <img
        draggable={false}
        src={ReportIcon}
        alt="TAT"
        className={styles.urgentImg}
      />
    ),
    "user-wise compliance report": (
      <img
        draggable={false}
        src={MyComplianceIcon}
        alt="TAT"
        className={styles.urgentImg}
      />
    ),
  };
  return (
    <Card className={styles[base]} style={{ padding: "10px 20px" }}>
      <div className={styles[`${base}-header`]}>
        <span className={styles[`${base}-title`]}>{title}</span>

        {buttonTitle && (
          <div className={styles[`${base}-buttonContainer`]}>
            <Button
              type="primary"
              text={buttonTitle}
              className={buttonClassName}
              onClick={onHeaderButtonClick}
            />
          </div>
        )}
      </div>
      {data?.length > 0 ? (
        <div className={styles.reportListWrapper}>
          <div className={styles.reportList}>
            {data.map((report, index) => (
              <div key={index} className={styles[`${base}-reportItem`]}>
                <div className={styles.left}>
                  {console.log("datadata", data)}
                  <span className={styles.icon}>
                    {reportIcons[report.label.toLowerCase()] || report.icon || (
                      <span>📄</span>
                    )}
                  </span>
                  <span className={styles.label}>
                    {report.label || "Untitled"}
                  </span>
                </div>
                <Button
                  className={rowButtonClassName}
                  text={report.action || "View"}
                  onClick={() => onRowButtonClick(report, index)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState style={{ display: "contents" }} type={"reports"} />
      )}
    </Card>
  );
};

export default ReportCard;
