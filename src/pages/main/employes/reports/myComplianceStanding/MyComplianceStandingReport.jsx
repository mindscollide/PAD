import React, { useCallback, useEffect, useRef, useState } from "react";
import { Row, Col, Breadcrumb } from "antd";
import PageLayout from "../../../../../components/pageContainer/pageContainer";
import style from "./MyComplianceStandingReport.module.css";
import DonutChart from "../../../../../components/donutChart/donutChart";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useApi } from "../../../../../context/ApiContext";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useMyApproval } from "../../../../../context/myApprovalContaxt";
import {
  DownloadMyComplianceStandingRequestAPI,
  GetEmployeeComplianceStandingReportRequestApi,
} from "../../../../../api/myApprovalApi";
import PDF from "../../../../../assets/img/pdf.png";
import Excel from "../../../../../assets/img/xls.png";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import CustomButton from "../../../../../components/buttons/button";
import { DateRangePicker } from "../../../../../components";
import { toYYMMDD } from "../../../../../common/funtions/rejex";

const statusColorMap = {
  Pending: "#717171",
  Compliant: "#00640A",
  "Non-Compliant": "#A50000",
};

const MyComplianceStandingReport = () => {
  const navigate = useNavigate();
  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { getEmployeeMyComplianceReport, setGetEmployeeMyComplianceReport } =
    useMyApproval();

  console.log(getEmployeeMyComplianceReport, "getEmployeeMyComplianceReport");
  const hasFetched = useRef(false);
  const componentRef = useRef(null); // Ref for PDF export

  //local state
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    StartDate: null,
    EndDate: null,
  });
  //Extract data from the context state and save in variable
  const apiSummary = getEmployeeMyComplianceReport?.summary || [];

  // For donut chart
  const labels = apiSummary.map((i) => i.statusName);
  const counts = apiSummary.map((i) => i.totalCount);
  const percentages = apiSummary.map((i) => i.percentage);
  const totalCount = counts.reduce((a, b) => a + b, 0);
console.log(
  "labels type:", typeof labels,
  "counts:", counts,
  "percentages:", percentages,
  "totalCount:", totalCount
);

  // ---------------- FETCH API FUNCTION ----------------
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      try {
        const res = await GetEmployeeComplianceStandingReportRequestApi({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        console.log(res, "checkebhdvwcec");

        if (res && res.summary) {
          setGetEmployeeMyComplianceReport({ summary: res.summary });
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
      setGetEmployeeMyComplianceReport,
    ]
  );

  // ---------------- CALL API ON MOUNT ----------------
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const requestData = {
      // build your request payload here
      StartDate: "",
      EndDate: "",
    };

    fetchApiCall(requestData, true, true);
  }, [fetchApiCall]);

  //OnCHange of date Handler
  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange({
        StartDate: dates?.[0] || null,
        EndDate: dates?.[1] || null,
      });

      // Call API immediately after date change
      fetchApiCall(
        {
          StartDate: toYYMMDD(dates[0]) || null,
          EndDate: toYYMMDD(dates[1]) || null,
        },
        true,
        true
      );
    }
  };

  const handleClearDates = () => {
    // Reset state
    setDateRange({
      StartDate: null,
      EndDate: null,
    });

    // Call API with empty values
    fetchApiCall(
      {
        StartDate: "",
        EndDate: "",
      },
      true,
      true
    );
  };

  // Function to export PDF
  const handleExportPDF = () => {
    const input = componentRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("My-Compliance-Report.pdf");
    });
  };

  // 🔷 Excel Report download Api Hit
  const downloadMyComplianceReportInExcelFormat = async () => {
    showLoader(true);
    const requestdata = {
      StartDate: dateRange.StartDate,
      EndDate: dateRange.EndDate,
    };

    await DownloadMyComplianceStandingRequestAPI({
      callApi,
      showLoader,
      requestdata: requestdata,
      navigate,
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
                    My Compliance Standing
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
              className={style.dateRangePickerClass}
              onChange={handleDateChange}
              value={[dateRange.StartDate, dateRange.EndDate]}
              onClear={handleClearDates}
              format="YYYY-MM-DD"
            />

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
              <div className={style.dropdownItem} onClick={handleExportPDF}>
                <img src={PDF} alt="PDF" draggable={false} />
                <span>Export PDF</span>
              </div>
              <div
                className={style.dropdownItem}
                onClick={downloadMyComplianceReportInExcelFormat}
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

                      <td>{item.totalCount}</td>
                      <td>{item.percentage}%</td>
                    </tr>
                  ))}

                  {/* TOTAL ROW */}
                  <tr className={style.totalRow}>
                    <td>Total</td>
                    <td>{totalCount}</td>
                    <td>100%</td>
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

export default MyComplianceStandingReport;
