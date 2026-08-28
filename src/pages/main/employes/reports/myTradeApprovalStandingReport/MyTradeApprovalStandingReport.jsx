import React, { useCallback, useEffect, useRef, useState } from "react";
import { Row, Col, Breadcrumb } from "antd";
import PageLayout from "../../../../../components/pageContainer/pageContainer";
import style from "./MyTradeApprovalStandingReport.module.css";
import DonutChart from "../../../../../components/donutChart/donutChart";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useApi } from "../../../../../context/ApiContext";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useMyApproval } from "../../../../../context/myApprovalContaxt";
import {
  DownloadMyTradeApprovalStandingRequestAPI,
  GetEmployeeTradeApprovalReportRequestApi,
} from "../../../../../api/myApprovalApi";
import PDF from "../../../../../assets/img/pdf.png";
import Excel from "../../../../../assets/img/xls.png";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import CustomButton from "../../../../../components/buttons/button";
import { DateRangePicker } from "../../../../../components";
import {
  formatToYYYYMMDD,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";

const statusColorMap = {
  Pending: "#717171",
  Approved: "#00640A",
  Declined: "#A50000",
  Traded: "#30426A",
  "Not-Traded": "#424242",
  Resubmitted: "#F67F29",
  Resubmit: "#F67F29",
};

const MyTradeApprovalStandingReport = () => {
  const navigate = useNavigate();
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { getEmployeeTradeApprovalReport, setGetEmployeeTradeApprovalReport } =
    useMyApproval();

  console.log(getEmployeeTradeApprovalReport, "getEmployeeTradeApprovalReport");
  const hasFetched = useRef(false);
  const componentRef = useRef(null); // Ref for PDF export

  //local state
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    StartDate: null,
    EndDate: null,
  });

  //Extract data from the context state and save in variable
  const apiSummary = getEmployeeTradeApprovalReport?.summary || [];

  // For donut chart
  const labels = apiSummary.map((i) => i.statusName);
  const counts = apiSummary.map((i) => i.statusCount);
  const percentages = apiSummary.map((i) => i.percentage);
  const totalCount = counts.reduce((a, b) => a + b, 0);
  // FIXED: plain float addition of per-status percentages (e.g. 33.33 +
  // 33.34 + 33.34) lands on binary-float noise like 100.00999999999999
  // instead of a clean 100 - rounds to 2dp, and never displays above 100
  // even if the underlying percentages themselves summed past it.
  const totalPercentage = Math.min(
    100,
    Math.round(percentages.reduce((acc, curr) => acc + curr, 0) * 100) / 100
  );

  // ---------------- FETCH API FUNCTION ----------------
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      try {
        const res = await GetEmployeeTradeApprovalReportRequestApi({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        console.log(res, "checkebhdvwcec");

        if (res && res.summary) {
          setGetEmployeeTradeApprovalReport({ summary: res.summary });
        }
      } catch (err) {
        console.error("API error:", err);
      } finally {
        if (showLoaderFlag) showLoader(false);
      }
    },
    [
      callApi,
      navigate,
      showLoader,
      showNotification,
      setGetEmployeeTradeApprovalReport,
    ]
  );

  // ---------------- CALL API ON MOUNT ----------------
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    setDateRange({
      StartDate: formatToYYYYMMDD(startDate),
      EndDate: formatToYYYYMMDD(endDate),
    });

    const requestData = {
      // build your request payload here
      StartDate: startDate ? toYYMMDD(startDate) : "",
      EndDate: endDate ? toYYMMDD(endDate) : "",
    };

    fetchApiCall(requestData, true, true);
  }, [fetchApiCall]);

  //OnCHange of date Handler
  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      const start = toYYMMDD(dates[0]);
      const end = toYYMMDD(dates[1]);

      setDateRange({
        StartDate: dates?.[0] || null,
        EndDate: dates?.[1] || null,
      });

      // Call API immediately after date change
      fetchApiCall(
        {
          StartDate: start,
          EndDate: end,
        },
        true,
        true
      );
    }
  };

  // Function to export PDF - still generated client-side (screenshot +
  // jsPDF). Header block below mirrors the Excel export's own header
  // layout (ExportEmployeeTradeApprovalStandingSummary,
  // Reports/ExcelReportService.cs) and the same treatment already applied
  // to the sibling My Compliance Standing report: title block, then
  // Searching Criteria (left) opposite Exported On/By (right) on the same
  // two rows, same fields/order as Excel, just drawn with jsPDF's text API
  // instead of worksheet cells.
  const handleExportPDF = async () => {
    const input = componentRef.current;

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true, // ✅ IMPORTANT
        allowTaint: false, // ✅ Prevents blocked canvas
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      // "Exported By" - same sessionStorage profile the header/profile
      // dropdown already reads the logged-in user's name from
      // (profileDropdown.jsx) - there's no dedicated auth context for it.
      let profile = {};
      try {
        profile = JSON.parse(sessionStorage.getItem("user_profile_data")) || {};
      } catch {
        profile = {};
      }
      const exportedBy =
        [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
        "Unknown";

      // Local "now" formatted the same "YYYY-MM-DD | hh:mm am/pm" style
      // formatApiDateTime (rejex.js) produces elsewhere in the app - no
      // UTC conversion needed here, this moment is already the viewer's
      // local time.
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      let hours = now.getHours();
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12;
      const exportedOn = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )} | ${pad(hours)}:${pad(now.getMinutes())} ${ampm}`;

      // FIXED: dateRange.StartDate/EndDate are already "YYYY-MM-DD" strings
      // (formatToYYYYMMDD on mount, the DateRangePicker's own onChange
      // format otherwise - see handleDateChange/dateRange.jsx) - the
      // previous formatDisplayDate here wrongly assumed an 8-digit
      // "YYYYMMDD" string and sliced this already-dashed value at the
      // wrong positions, producing "2026--0-2-" instead of "2026-02-28".
      // These are ready to use as-is.
      const dateRangeText =
        dateRange.StartDate && dateRange.EndDate
          ? `${dateRange.StartDate} to ${dateRange.EndDate}`
          : "All";

      let y = 15;
      pdf.setFont(undefined, "bold");
      pdf.setFontSize(14);
      pdf.text("Personal Account Details (PAD)", pdfWidth / 2, y, {
        align: "center",
      });
      y += 7;
      pdf.text("My Trade Approval Standing", pdfWidth / 2, y, {
        align: "center",
      });

      y += 10;
      const rowsStartY = y;

      pdf.setFont(undefined, "bold");
      pdf.setFontSize(11);
      pdf.text("Searching Criteria", 14, rowsStartY);
      pdf.setFont(undefined, "normal");
      pdf.setFontSize(10);
      pdf.text(`Date Range: ${dateRangeText}`, 14, rowsStartY + 6);

      pdf.text(`Exported On: ${exportedOn}`, pdfWidth - 14, rowsStartY, {
        align: "right",
      });
      pdf.text(`Exported By: ${exportedBy}`, pdfWidth - 14, rowsStartY + 6, {
        align: "right",
      });

      y = rowsStartY + 14;

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - 20;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 10, y, imgWidth, imgHeight);

      pdf.save("MyTrade-Approval-Report.pdf");
      setOpen(false);
    } catch (error) {
      console.error("PDF Export Failed:", error);
    }
  };

  // 🔷 Excel Report download Api Hit
  const downloadMyTradeApprovalReportInExcelFormat = async () => {
    showLoader(true);

    const requestdata = {
      StartDate: dateRange.StartDate,
      EndDate: dateRange.EndDate,
    };

    await DownloadMyTradeApprovalStandingRequestAPI({
      callApi,
      showLoader,
      requestdata,
      navigate,
      setOpen,
    });
  };

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
                    onClick={() => navigate("/PAD/reports")}
                    className={style.breadcrumbLink}
                  >
                    Reports
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>
                    My Trade Approvals Standing
                  </span>
                ),
              },
            ]}
          />
        </Col>
        <Col>
          <div className={style.headerActionsRow}>
            <DateRangePicker
              size="medium"
              value={[dateRange.StartDate, dateRange.EndDate]}
              className={"range-picker-small"}
              onChange={handleDateChange}
            />

            <CustomButton
              disabled={getEmployeeTradeApprovalReport?.summary?.length === 0}
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
              <div className={style.dropdownItem} onClick={handleExportPDF}>
                <img src={PDF} alt="PDF" draggable={false} />
                <span>Export PDF</span>
              </div>
              <div
                className={style.dropdownItem}
                onClick={downloadMyTradeApprovalReportInExcelFormat}
              >
                <img src={Excel} alt="Excel" draggable={false} />
                <span>Export XLS</span>
              </div>
            </div>
          )}
        </Col>
      </Row>

      <PageLayout background="white" className={"changeHeightReport"}>
        <div className="px-4 md:px-6 lg:px-8" ref={componentRef}>
          {/* ------------------ MAIN LAYOUT ------------------ */}
          <Row className={style.gridContainer} gutter={24}>
            {/* ---------- LEFT TABLE ---------- */}
            <Col span={12} className={style.tableContainer}>
              <table className={style.table}>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Percent</th>
                  </tr>
                </thead>

                <tbody>
                  {apiSummary.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className={style.statusCell}>
                          <span
                            className={style.dot}
                            style={{
                              background: statusColorMap[item.statusName],
                            }}
                          ></span>
                          {item.statusName}
                        </div>
                      </td>

                      <td>{item.statusCount}</td>
                      <td>{item.percentage}%</td>
                    </tr>
                  ))}

                  {/* TOTAL ROW */}
                  <tr className={style.totalRow}>
                    <td>Total</td>
                    <td>{totalCount}</td>
                    <td>{totalPercentage}%</td>
                  </tr>
                </tbody>
              </table>
            </Col>

            {/* ---------- RIGHT DONUT CHART ---------- */}
            <Col span={12} className={style.chartContainer}>
              <div className={style.donutGraphClass}>
                <DonutChart
                  labels={labels}
                  counts={counts}
                  percentages={percentages}
                  totalCount={totalCount}
                />

                {/* Custom legend */}
                <div className={style.customLegend}>
                  {apiSummary.map((item, index) => (
                    <div key={index} className={style.legendItem}>
                      <span
                        className={style.legendBullet}
                        style={{
                          backgroundColor: statusColorMap[item.statusName],
                        }}
                      ></span>
                      <span
                        className={style.legendText}
                        style={{ color: statusColorMap[item.statusName] }}
                      >
                        {item.statusName} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </PageLayout>
    </>
  );
};

export default MyTradeApprovalStandingReport;
