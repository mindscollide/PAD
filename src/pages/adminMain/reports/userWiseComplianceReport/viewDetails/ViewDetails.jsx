import React, { useEffect, useState } from "react";
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

import { DateRangePicker, DonutChart } from "../../../../../components";
import PolicyHistoryModal from "./PolicyHistoryModal";
import {
  buildDetailsRequest,
  buildPolicyHistoryRequest,
  formatScore,
  mapDetailsResponse,
  mapPolicyHistoryResponse,
} from "./utils";
import {
  GetAdminUserWiseComplianceReportDetailsAPI,
  GetAdminUserWiseComplianceReportPolicyHistoryAPI,
} from "../../../../../api/myApprovalApi";
import { useApi } from "../../../../../context/ApiContext";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";

/* 🔷 Register Chart.js Modules */
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/**
 * Admin > Reports > User-wise Compliance Report > View Details, per
 * API_Changes/2026-08-27_admin_user_wise_compliance_report_details.md
 * (deployed 2026-08-27). Previously 100% hardcoded dummy data with no API
 * call at all - now wired to GetAdminUserWiseComplianceReportDetailsAPI
 * for the employee whose row's "View Details" button was clicked
 * (userWiseComplianceReport/utils.jsx sets selectedUserwiseComplianceReportEmployee
 * right before opening this screen).
 */
const ViewDetailsAdmin = () => {
  const navigate = useNavigate();
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();

  const {
    setShowViewDetailOfUserwiseComplianceReportAdmin,
    selectedUserwiseComplianceReportEmployee,
    setSelectedUserwiseComplianceReportEmployee,
  } = useGlobalModal();

  const employeeID = selectedUserwiseComplianceReportEmployee?.employeeID;

  // -------------------- Local State --------------------
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [policyHistoryOpen, setPolicyHistoryOpen] = useState(false);
  const [policyHistory, setPolicyHistory] = useState(null);

  // -------------------- Fetch --------------------

  const fetchDetails = async (searchState) => {
    if (!employeeID) return;
    showLoader(true);
    const res = await GetAdminUserWiseComplianceReportDetailsAPI({
      callApi,
      showNotification,
      showLoader,
      requestdata: buildDetailsRequest(employeeID, searchState),
      navigate,
    });
    setDetails(mapDetailsResponse(res));
  };

  // Initial fetch (and refetch if a different employee's row is opened
  // while this screen is already mounted) - dates left empty so BE
  // applies its own default (last 6 months).
  useEffect(() => {
    if (!employeeID) return;
    setDateRange({ startDate: null, endDate: null });
    fetchDetails({ startDate: null, endDate: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeID]);

  const handleDateChange = (dates) => {
    const next = {
      startDate: dates?.[0] || null,
      endDate: dates?.[1] || null,
    };
    setDateRange(next);
    fetchDetails(next);
  };

  const handleGoBack = () => {
    setShowViewDetailOfUserwiseComplianceReportAdmin(false);
    setSelectedUserwiseComplianceReportEmployee(null);
  };

  const handleViewMorePolicies = async () => {
    if (!employeeID) return;
    showLoader(true);
    const res = await GetAdminUserWiseComplianceReportPolicyHistoryAPI({
      callApi,
      showNotification,
      showLoader,
      requestdata: buildPolicyHistoryRequest(employeeID),
      navigate,
    });
    if (res) {
      setPolicyHistory(mapPolicyHistoryResponse(res));
      setPolicyHistoryOpen(true);
    }
  };

  // -------------------- Charts --------------------

  const barChartData = {
    labels: details?.policyBreachBar?.labels || [],
    datasets: [
      {
        label: "Breaches",
        data: details?.policyBreachBar?.counts || [],
        backgroundColor: "#F67F29",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      // policyScenario is the only human-readable label the source data
      // has (per the doc, no separate short "policy name" field) - shown
      // on hover since the x-axis itself uses the shorter policyCode.
      tooltip: {
        callbacks: {
          label: (context) => {
            const scenario = details?.policyBreachBar?.scenarios?.[context.dataIndex];
            return scenario
              ? `${scenario}: ${context.parsed.y}`
              : `${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: "#424242" },
      },
      y: {
        beginAtZero: true,
        grid: { display: true, drawBorder: false, color: "#E0E0E0", lineWidth: 1 },
        ticks: { color: "#424242" },
      },
    },
  };

  const tradeApprovalSummary = [
    {
      value: details?.totalTradeApprovalsInitiated ?? 0,
      label: "Total Trade Approvals",
      variant: "totalApproval",
    },
    {
      value: details?.totalTradeApprovalsApproved ?? 0,
      label: "Approved",
      variant: "approved",
    },
    {
      value: details?.totalTradeApprovalsDeclined ?? 0,
      label: "Declined",
      variant: "declined",
    },
    {
      value: formatScore(details?.approvalScore),
      label: "Approval Score",
      variant: "approvalScore",
    },
  ];

  const transactionSummary = [
    {
      value: details?.totalTransactionsInitiated ?? 0,
      label: "Total Transactions",
      variant: "totalApproval",
    },
    {
      value: details?.totalTransactionsApproved ?? 0,
      label: "Approved",
      variant: "approved",
    },
    {
      value: details?.totalTransactionsDeclined ?? 0,
      label: "Declined",
      variant: "declined",
    },
    {
      value: formatScore(details?.complianceScore),
      label: "Compliance Score",
      variant: "approvalScore",
    },
  ];

  // -------------------- Render --------------------

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
                      handleGoBack();
                    }}
                    className={style.breadcrumbLink}
                  >
                    Reports
                  </span>
                ),
              },
              {
                title: (
                  <span onClick={handleGoBack} className={style.breadcrumbLink}>
                    Users Wise Compliance Report
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>
                    {" "}
                    {details?.fullName || "—"}
                  </span>
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

          {/* 🔷 Export Dropdown - out of scope for this endpoint (not part
              of API_Changes/2026-08-27_admin_user_wise_compliance_report_*.md),
              left as a visible-but-inert placeholder same as before. */}
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
                <span className={style.infoValue}>
                  {details?.fullName || "—"}
                </span>
              </div>

              <div className={style.infoRow}>
                <img src={EmployeeId} />
                <span className={style.infoLabel}>Employee ID:</span>
                <span className={style.infoValue}>
                  {details?.employeeID ?? "—"}
                </span>
              </div>

              <div className={style.infoRow}>
                <img src={phone} />
                <span className={style.infoLabel}>Status:</span>
                <span className={`${style.infoValue}`}>
                  {details?.status || "—"}
                </span>
              </div>

              <div className={style.infoRow}>
                <img src={Department} />
                <span className={style.infoLabel}>Department:</span>
                <span className={style.infoValue}>
                  {details?.departmentName || "—"}
                </span>
              </div>

              <div className={style.infoRow}>
                <img src={Email} />
                <span className={style.infoLabel}>Email:</span>
                <span className={style.infoValue}>{details?.email || "—"}</span>
              </div>
            </div>

            {/* 🔹 Assigned Roles */}
            <div className={style.rolesSection}>
              <div className={style.sectionTitle}>Assigned Roles:</div>
              <div className={style.rolesWrapper}>
                {details?.roles?.length ? (
                  details.roles.map((role) => (
                    <span className={style.roleChip} key={role}>
                      {role}
                    </span>
                  ))
                ) : (
                  <span className={style.infoValue}>—</span>
                )}
              </div>
            </div>

            {/* 🔹 Account Info - all-time, not date-range-scoped per SRS */}
            <div className={style.accountInfoSection}>
              <div className={style.infoRow}>
                <span className={style.infoLabel}>Account Created:</span>
                <span className={style.infoValue}>
                  {details?.accountCreatedDisplay || "—"}
                </span>
              </div>

              <div className={style.infoRow}>
                <span className={style.infoLabel}>Activity Days:</span>
                <span className={style.infoValue}>
                  {details?.activityDays ?? "—"}
                </span>
              </div>

              <div className={style.infoRow}>
                <span className={style.infoLabel}>Last Login:</span>
                <span className={style.infoValue}>
                  {details?.lastLoginDisplay || "—"}
                </span>
              </div>
            </div>

            {/* 🔹 Policy Info */}
            <div className={style.policySection}>
              <div className={style.infoRowColumn}>
                <span className={style.policyInfoLabel}>
                  Current Policy Assigned:
                </span>
                <span className={style.infoValue}>
                  {details?.currentPolicyName
                    ? `${details.currentPolicyName} - ${details.currentPolicyAssignedDate}`
                    : "No policy assigned"}
                </span>
              </div>

              <div className={style.infoRowColumn}>
                <span className={style.policyInfoLabel}>Last Policy:</span>
                <span className={style.infoValue}>
                  {details?.lastPolicyName
                    ? `${details.lastPolicyName} - ${details.lastPolicyAssignedDate}`
                    : "—"}
                </span>
              </div>

              <span
                className={style.viewDetailLink}
                onClick={handleViewMorePolicies}
              >
                View More
              </span>
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
                    {details?.reportStartDate && details?.reportEndDate && (
                      <span className={style.infoValue}>
                        {" "}
                        ({details.reportStartDate} to {details.reportEndDate})
                      </span>
                    )}
                  </p>
                </Col>
                <Col span={8}>
                  <DateRangePicker
                    size="medium"
                    onChange={handleDateChange}
                    value={[dateRange.startDate, dateRange.endDate]}
                  />
                </Col>
              </Row>
              {/* Trade Approvals */}
              <Row className="g-3">
                {tradeApprovalSummary.map((item, index) => (
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
              {/* Transactions */}
              <Row className="g-3" style={{ marginTop: "20px" }}>
                {transactionSummary.map((item, index) => (
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
                    {barChartData.labels.length ? (
                      <Bar data={barChartData} options={barChartOptions} />
                    ) : (
                      <span className={style.infoValue}>
                        No policy breaches in this range
                      </span>
                    )}
                  </div>
                </Col>
                <Col span={12}>
                  <div className={style.donutGraphClass}>
                    <DonutChart
                      labels={details?.transactionsDonut?.labels || []}
                      counts={details?.transactionsDonut?.counts || []}
                      percentages={details?.transactionsDonut?.percentages || []}
                      totalCount={details?.transactionsDonut?.totalCount || 0}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>

      {policyHistoryOpen && (
        <PolicyHistoryModal
          open={policyHistoryOpen}
          onClose={() => setPolicyHistoryOpen(false)}
          currentPolicy={policyHistory?.currentPolicy}
          previouslyAssignedPolicies={policyHistory?.previouslyAssignedPolicies || []}
        />
      )}
    </>
  );
};

export default ViewDetailsAdmin;
