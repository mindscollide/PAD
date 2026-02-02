import React, { useRef, useState, useMemo } from "react";
import { Breadcrumb, Col, Row } from "antd";
import style from "./ViewDetails.module.css";
import Excel from "../../../../../assets/img/xls.png";
import username from "../../../../../assets/img/username.png";
import EmployeeId from "../../../../../assets/img/EmployeeId.png";
import Department from "../../../../../assets/img/user-dark-icon.png";
import Email from "../../../../../assets/img/Email.png";
import phone from "../../../../../assets/img/phone.png";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import CustomButton from "../../../../../components/buttons/button";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import {
  DateRangePicker,
  DonutChart,
  BoxCard,
} from "../../../../../components";

/* 🔷 Register Chart.js Modules */
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ViewDetailsAdmin = () => {
  const navigate = useNavigate();
  // -------------------- Contexts --------------------

  /** Memoized version of BoxCard to prevent unnecessary re-renders */
  const MemoizedBoxCard = React.memo(BoxCard);
  const { setShowViewDetailOfUserwiseComplianceReportAdmin } = useGlobalModal();

  // -------------------- Local State --------------------
  const [open, setOpen] = useState(false);

  /* 🔷 Bar Chart Dummy Data */
  const barChartData = {
    labels: ["Pending", "Approved", "Declined", "Traded"],
    datasets: [
      {
        label: "Requests",
        data: [10, 20, 5, 10],
        backgroundColor: ["#717171", "#00640A", "#A50000", "#30426A"],
        borderRadius: 6,
        barThickness: 40, // 🔹 reduce bar width (px)
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: {
          display: false, // ❌ no vertical lines
          drawBorder: false,
        },
        ticks: {
          color: "#424242",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true, // ✅ horizontal lines
          drawBorder: false,
          color: "#E0E0E0",
          lineWidth: 1,
        },
        ticks: {
          stepSize: 5,
          color: "#424242",
        },
      },
    },
  };

  const summary = [
    { value: 82, label: "Total Approvals", variant: "totalApproval" },
    { value: 72, label: "Approved", variant: "approved" },
    { value: 8, label: "Declined", variant: "declined" },
    { value: "78%", label: "Approval Score", variant: "approvalScore" },
  ];

  // -------------------- Helpers --------------------

  return (
    <>
      <Row justify="start" align="middle" className={style.breadcrumbRow}>
        <Col>
          <Breadcrumb
            separator=">"
            className={style.customBreadcrumb}
            items={[
              {
                title: (
                  <span
                    onClick={() => {
                      navigate("/PAD/admin-reports");
                      setShowViewDetailOfUserwiseComplianceReportAdmin(false);
                    }}
                    className={style.breadcrumbLink}
                  >
                    Reports
                  </span>
                ),
              },
              {
                title: (
                  <span
                    onClick={() =>
                      setShowViewDetailOfUserwiseComplianceReportAdmin(false)
                    }
                    className={style.breadcrumbLink}
                  >
                    Users Wise Compliance Report
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}> Imran Qureshi</span>
                ),
              },
            ]}
          />
        </Col>

        <Col>
          <div className={style.headerActionsRow}>
            <CustomButton
              text={
                <span className={style.exportButtonText}>
                  Export
                  <span className={style.iconContainer}>
                    {open ? <UpOutlined /> : <DownOutlined />}
                  </span>
                </span>
              }
              className="small-light-button-report"
              onClick={() => setOpen((prev) => !prev)}
            />
          </div>

          {/* 🔷 Export Dropdown */}
          {open && (
            <div className={style.dropdownExport}>
              <div className={style.dropdownItem}>
                <img src={Excel} alt="Excel" draggable={false} />
                <span>Export Excel</span>
              </div>
            </div>
          )}
        </Col>
      </Row>

      <Row>
        <Col span={8}>
          <div className={style.ViewDetailAdminLeftCol}>
            {/* 🔹 User Basic Info */}
            <div className={style.userInfoSection}>
              <div className={style.infoRow}>
                <img src={username} />
                <span className={style.infoLabel}>Full Name:</span>
                <span className={style.infoValue}>Imran Qureshi</span>
              </div>

              <div className={style.infoRow}>
                <img src={EmployeeId} />
                <span className={style.infoLabel}>Employee ID:</span>
                <span className={style.infoValue}>123456</span>
              </div>

              <div className={style.infoRow}>
                <img src={phone} />
                <span className={style.infoLabel}>Status:</span>
                <span className={`${style.infoValue}`}>Active</span>
              </div>

              <div className={style.infoRow}>
                <img src={Department} />
                <span className={style.infoLabel}>Department:</span>
                <span className={style.infoValue}>Finance & Accounts</span>
              </div>

              <div className={style.infoRow}>
                <img src={Email} />
                <span className={style.infoLabel}>Email:</span>
                <span className={style.infoValue}>shawn.alex@example.com</span>
              </div>
            </div>

            {/* 🔹 Assigned Roles */}
            <div className={style.rolesSection}>
              <div className={style.sectionTitle}>Assigned Roles:</div>
              <div className={style.rolesWrapper}>
                <span className={style.roleChip}>Employee</span>
                <span className={style.roleChip}>Line Manager</span>
                <span className={style.roleChip}>Compliance Officer</span>
                <span className={style.roleChip}>
                  Head of compliance approval
                </span>
                <span className={style.roleChip}>Head of Approver</span>
              </div>
            </div>

            {/* 🔹 Account Info */}
            <div className={style.accountInfoSection}>
              <div className={style.infoRow}>
                <span className={style.infoLabel}>Account Created:</span>
                <span className={style.infoValue}>28-11-21</span>
              </div>

              <div className={style.infoRow}>
                <span className={style.infoLabel}>Activity Days:</span>
                <span className={style.infoValue}>190</span>
              </div>

              <div className={style.infoRow}>
                <span className={style.infoLabel}>Last Login:</span>
                <span className={style.infoValue}>2024-10-10 | 10:00 pm</span>
              </div>
            </div>

            {/* 🔹 Policy Info */}
            <div className={style.policySection}>
              <div className={style.infoRowColumn}>
                <span className={style.policyInfoLabel}>
                  Current Policy Assigned:
                </span>
                <span className={style.infoValue}>
                  Policy Management Hub – Streamlining Compliance...
                </span>
              </div>

              <div className={style.infoRowColumn}>
                <span className={style.policyInfoLabel}>Last Policy:</span>
                <span className={style.infoValue}>
                  Corporate Policy Exchange – Aligning Governance...
                </span>
              </div>

              <span className={style.viewDetailLink}>View Detail</span>
            </div>
          </div>
        </Col>
        <Col span={16}>
          <div className={style.ViewDetailAdminRightCol}>
            <div className={style.durationDivClass}>
              <Row>
                <Col span={16}>
                  <p className={style.reportDurationText}>
                    Report for the duration:
                  </p>
                </Col>
                <Col span={8}>
                  <DateRangePicker size="medium" />
                </Col>
              </Row>
              {/* For Card Boxes */}
              <Row className="g-3">
                {summary.map((item, index) => (
                  <Col xs={12} md={6} lg={6} key={index}>
                    <div
                      className={`${style.approvalBox} ${style[item.variant]}`}
                    >
                      <div className={style.count}>{item.value}</div>
                      <div className={style.label}>{item.label}</div>
                    </div>
                  </Col>
                ))}
              </Row>
              <Row className="g-3" style={{ marginTop: "20px" }}>
                {summary.map((item, index) => (
                  <Col xs={12} md={6} lg={6} key={index}>
                    <div
                      className={`${style.approvalBox} ${style[item.variant]}`}
                    >
                      <div className={style.count}>{item.value}</div>
                      <div className={style.label}>{item.label}</div>
                    </div>
                  </Col>
                ))}
              </Row>
              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <div className={style.barGraphClass}>
                    <p className={style.bartitleData}>Top Policy Breaches</p>
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                </Col>
                <Col span={12}>
                  <div className={style.donutGraphClass}>
                    <DonutChart
                      labels={["Pending", "Approved", "Declined", "Traded"]}
                      counts={[10, 10, 5, 10]}
                      percentages={[20, 40, 10, 30]}
                      totalCount={45}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ViewDetailsAdmin;
