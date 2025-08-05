import React from "react";
import { Card, Typography } from "antd";
import styles from "./reportsCard.module.css";
import { Button } from "../..";
import { navigateToPage } from "./utill";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useNavigate } from "react-router-dom";

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
  const onRowButtonClick = () => {
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

      <div className={styles.reportList}>
        {data.map((report, index) => (
          <div key={index} className={styles[`${base}-reportItem`]}>
            <div className={styles.left}>
              <span className={styles.icon}>
                {report.icon || <span>📄</span>}
              </span>
              <span className={styles.label}>{report.label || "Untitled"}</span>
            </div>
            <Button
              className={rowButtonClassName}
              text={report.action || "View"}
              onClick={() => onRowButtonClick(report, index)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ReportCard;
