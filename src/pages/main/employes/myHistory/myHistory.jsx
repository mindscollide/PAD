import React, { useMemo, useState } from "react";
import { Button, Input, Row, Col } from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import { AcordianTable, PageLayout } from "../../../../components";
import style from "./myHistory.module.css";
import EmptyState from "../../../../components/emptyStates/empty-states";
import CheckIcon from "../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../assets/img/Cross.png";
import { Stepper, Step } from "react-form-stepper";
import { getColumns } from "./utils";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
const MyHistory = () => {
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({});

  const {
    employeeMyHistorySearch,
    setEmployeeMyHistorySearch,
    resetEmployeeMyHistorySearch,
  } = useSearchBarContext();

  const rawData = [
    {
      id: "REQ-001",
      instrument: "HUBC-OCT",
      date: "2025-08-07 10:30",
      nature: "Approval",
      type: "Buy",
      status: "Approved",
      quantity: 1000,
      trail: [
        {
          status: "Requested",
          user: "Ali Khan",
          date: "2025-08-06",
          iconType: "check",
        },
        {
          status: "In Review",
          user: "Sara Ahmed",
          date: "2025-08-07",
          iconType: "check",
        },
        {
          status: "Approved",
          user: "Emily Johnson",
          date: "2025-08-07",
          iconType: "check",
        },
      ],
    },
    {
      id: "REQ-002",
      instrument: "HUBC-OCT",
      date: "2025-08-07 10:30",
      nature: "Approval",
      type: "Buy",
      status: "Pending",
      quantity: 1000,
      trail: [
        {
          status: "Requested",
          user: "Ali Khan",
          date: "2025-08-06",
          iconType: "check",
        },
        {
          status: "In Review",
          user: "Sara Ahmed",
          date: "2025-08-07",
          iconType: "ellipsis",
        },
      ],
    },
  ];

  const columns = useMemo(
    () =>
      getColumns(
        approvalStatusMap,
        sortedInfo,
        employeeMyHistorySearch,
        setEmployeeMyHistorySearch
      ),
    [
      approvalStatusMap,
      sortedInfo,
      employeeMyHistorySearch,
      setEmployeeMyHistorySearch,
    ]
  );

  const filteredData = useMemo(() => {
    return rawData.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchText.toLowerCase()) ||
        item.instrument.toLowerCase().includes(searchText.toLowerCase());

      const matchesDate =
        dateRange.length === 0 ||
        (new Date(item.date) >= dateRange[0] &&
          new Date(item.date) <= dateRange[1]);

      return matchesSearch && matchesDate;
    });
  }, [searchText, dateRange]);

  const getIcon = (type) => {
    let icon;
    switch (type) {
      case "check":
        icon = CheckIcon;
        break;
      case "cross":
        icon = CrossIcon;
        break;
      case "ellipsis":
        icon = EllipsesIcon;
        break;
      default:
        icon = EllipsesIcon;
    }
    console.log("Resolved icon for", type, "=", icon);
    return icon;
  };

  // 🔹 Render Stepper inside accordion row
  const renderTrailStepper = (trail) => (
    <Row>
      <div className={style.backgrounColorOfStepper}>
        <Stepper
          activeStep={trail.length - 1}
          connectorStyleConfig={{
            activeColor: "#00640A",
            completedColor: "#00640A",
            disabledColor: "#d9d9d9",
            size: 1,
          }}
          styleConfig={{
            size: "2em",
            circleFontSize: "0px",
            labelFontSize: "15px",
            borderRadius: "50%",
          }}
        >
          {trail.map((step, index) => (
            <Step
              key={index}
              label={
                <div className={style.customlabel}>
                  <div className={style.customtitle}>{step.user}</div>
                  <div className={style.customdesc}>
                    {step.date} | {step.status}
                  </div>
                </div>
              }
              children={
                <div className={style.stepCircle}>
                  <img
                    src={getIcon(step.iconType)}
                    alt={step.status}
                    className={style.circleImg}
                  />
                </div>
              }
            />
          ))}
        </Stepper>
      </div>
    </Row>
  );

  return (
    <PageLayout>
      <div>
        {/* Header & Actions */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16, marginTop: 26 }}
        >
          <Col>
            <span className={style["heading"]}>My History</span>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              style={{ marginRight: 8 }}
            >
              Export
            </Button>
          </Col>
        </Row>
        {/* Table */}
        {rawData.length > 0 ? (
          <AcordianTable
            className="accordian-table-blue"
            columns={columns}
            dataSource={filteredData}
            expandable={{
              expandedRowRender: (record) => renderTrailStepper(record.trail),
            }}
            onChange={(pagination, filters, sorter) => {
              setSortedInfo(sorter);
            }}
            rowClassName={(record) =>
              record.status === "Approved" ? "approved-row" : ""
            }
          />
        ) : (
          <EmptyState type="history" />
        )}
      </div>
    </PageLayout>
  );
};

export default MyHistory;
