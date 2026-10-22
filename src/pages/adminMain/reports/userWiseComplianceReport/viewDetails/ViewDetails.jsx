import React, { useEffect, useRef, useState } from "react";
import { Breadcrumb, Col, Row } from "antd";
import style from "./ViewDetails.module.css";
import Excel from "../../../../../assets/img/xls.png";
import PDF from "../../../../../assets/img/pdf.png";
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
import { toYYMMDD } from "../../../../../common/funtions/rejex";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const componentRef = useRef(null); // Ref for PDF export

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

  // Clearing the picker falls back to BE's default range (last 6 months).
  const handleDateClear = () => {
    const next = { startDate: null, endDate: null };
    setDateRange(next);
    fetchDetails(next);
  };

  // The picker shows the range the report actually used
  // (API_Changes/2026-09-24_admin_user_wise_compliance_details_chart_and_
  // calendar.md #2): the user's own pick if any, otherwise the BE's
  // effective range from the response. `dateRange` itself stays empty until
  // the user picks, so the request keeps sending empty dates (BE default).
  const isRealDate = (d) => d && d !== "—";
  const pickerValue = [
    dateRange.startDate ||
      (isRealDate(details?.reportStartDate) ? details.reportStartDate : null),
    dateRange.endDate ||
      (isRealDate(details?.reportEndDate) ? details.reportEndDate : null),
  ];

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
            const scenario =
              details?.policyBreachBar?.scenarios?.[context.dataIndex];
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
        grid: {
          display: true,
          drawBorder: false,
          color: "#E0E0E0",
          lineWidth: 1,
        },
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
  /** "YYYY-MM-DD", formatted from a date/dayjs-like value via toYYMMDD's
   * "YYYYMMDD" digits - display-only, matches the dashed style used
   * elsewhere in the app instead of the raw digit string. */
  const formatDisplayDate = (value) => {
    const raw = value ? toYYMMDD(value) : "";
    if (!raw || raw.length < 8) return "";
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  };
  // Range shown in the picker (user pick or BE default) as plain text,
  // used only for the PDF's "Report for the duration:" line.
  const fmtDate = (v) =>
    typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)
      ? v.slice(0, 10)
      : formatDisplayDate(v);
  const [rangeStart, rangeEnd] = pickerValue;
  const durationText =
    rangeStart && rangeEnd
      ? `${fmtDate(rangeStart)} - ${fmtDate(rangeEnd)}`
      : "";

  // Function to export PDF - still generated client-side (screenshot +
  // jsPDF), per explicit instruction not to move this to the backend.
  // Header block below mirrors the Excel export's own header layout
  // (ExportEmployeeTransactionSummary, Reports/ExcelReportService.cs):
  // title block, then Exported On directly above Exported By (Excel has
  // these as adjacent rows, not side by side), then a "Searching Criteria"
  // heading above the Date Range value - same fields/order, just drawn
  // with jsPDF's text API instead of worksheet cells.
  const handleExportPDF = async () => {
    const input = componentRef.current;
    if (!input) return;
    showLoader(true);
    // Give React a moment to paint the loader before html2canvas
    // starts its heavy work and blocks the main thread.
    await new Promise((resolve) => setTimeout(resolve, 50));

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      onclone: (clonedDoc) => {
        // PDF only: hide the date picker box, show the date as plain text
        clonedDoc
          .querySelectorAll("[data-pdf-hide]")
          .forEach((el) => (el.style.display = "none"));
        clonedDoc
          .querySelectorAll("[data-pdf-only]")
          .forEach((el) => (el.style.display = "inline"));
      },
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        let profile = {};
        try {
          profile =
            JSON.parse(sessionStorage.getItem("user_profile_data")) || {};
        } catch {
          profile = {};
        }
        const exportedBy =
          [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
          "Unknown";

        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        let hours = now.getHours();
        const ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12 || 12;
        const exportedOn = `${now.getFullYear()}-${pad(
          now.getMonth() + 1
        )}-${pad(now.getDate())} | ${pad(hours)}:${pad(
          now.getMinutes()
        )} ${ampm}`;

        // Use the range actually shown in the picker (user pick or BE default)
        // const [rangeStart, rangeEnd] = pickerValue;
        // const fmt = (v) =>
        //   typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)
        //     ? v.slice(0, 10)
        //     : formatDisplayDate(v);
        const dateRangeText = durationText
          ? durationText.replace(" - ", " to ")
          : "All";

        let y = 15;
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(14);
        pdf.text("Personal Account Details (PAD)", pdfWidth / 2, y, {
          align: "center",
        });
        y += 7;
        pdf.text("User Wise Compliance Report", pdfWidth / 2, y, {
          align: "center",
        });

        y += 10;
        const rowsStartY = y;

        pdf.setFont(undefined, "bold");
        pdf.setFontSize(11);
        pdf.text("Searching Criteria", 14, rowsStartY);
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(10);
        pdf.text(`Employee: ${details?.fullName || "—"}`, 14, rowsStartY + 6);
        // pdf.text(`Date Range: ${dateRangeText}`, 14, rowsStartY + 12);

        pdf.text(`Exported On: ${exportedOn}`, pdfWidth - 14, rowsStartY, {
          align: "right",
        });
        pdf.text(`Exported By: ${exportedBy}`, pdfWidth - 14, rowsStartY + 6, {
          align: "right",
        });

        y = rowsStartY + 20;

        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 20;
        let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        let finalWidth = imgWidth;

        // Scale down if the content is taller than the remaining page space
        const maxHeight = pdfHeight - y - 10;
        if (imgHeight > maxHeight) {
          const ratio = maxHeight / imgHeight;
          imgHeight = maxHeight;
          finalWidth = imgWidth * ratio;
        }

        pdf.addImage(
          imgData,
          "PNG",
          (pdfWidth - finalWidth) / 2,
          y,
          finalWidth,
          imgHeight
        );
        pdf.save("User-Wise-Compliance-Report.pdf");
        setOpen(false);
      })
      .catch((err) => {
        console.error("PDF export failed:", err);
        showNotification?.("Failed to export PDF", "error");
      })
      .finally(() => {
        showLoader(false);
      });
  };

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
            <div
              className={style.dropdownExport}
              // onClick={
              //   downloadAdminDateWiseTransactionReportInExcelFormat}
            >
              <div className={style.dropdownItem} onClick={handleExportPDF}>
                <img src={PDF} alt="PDF" draggable={false} />
                <span>Export PDF</span>
              </div>
              {/* <div className={style.dropdownItem}>
                <img src={Excel} alt="Excel" draggable={false} />
                <span>Export Excel</span>
              </div> */}
            </div>
          )}
        </Col>
      </Row>
      <div ref={componentRef}>
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
                  <span className={style.infoValue}>
                    {details?.email || "—"}
                  </span>
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
                      <span
                        data-pdf-only
                        style={{
                          display: "none",
                          marginLeft: 6,
                          fontWeight: 400,
                        }}
                      >
                        {durationText}
                      </span>
                    </p>
                  </Col>
                  <Col span={8}>
                    <div data-pdf-hide>
                      <DateRangePicker
                        size="medium"
                        onChange={handleDateChange}
                        onClear={handleDateClear}
                        value={pickerValue}
                      />
                    </div>
                  </Col>
                </Row>
                {/* Trade Approvals */}
                <Row className="g-3">
                  {tradeApprovalSummary.map((item, index) => (
                    <Col xs={12} md={6} lg={6} key={index}>
                      <div
                        className={`${style.approvalBox} ${
                          style[item.variant]
                        }`}
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
                        className={`${style.approvalBox} ${
                          style[item.variant]
                        }`}
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
                        percentages={
                          details?.transactionsDonut?.percentages || []
                        }
                        totalCount={details?.transactionsDonut?.totalCount || 0}
                        showLegend
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </div>
      {policyHistoryOpen && (
        <PolicyHistoryModal
          open={policyHistoryOpen}
          onClose={() => setPolicyHistoryOpen(false)}
          currentPolicy={policyHistory?.currentPolicy}
          previouslyAssignedPolicies={
            policyHistory?.previouslyAssignedPolicies || []
          }
        />
      )}
    </>
  );
};

export default ViewDetailsAdmin;
