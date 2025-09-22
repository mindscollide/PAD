import React, { useMemo, useState } from "react";
import { Button, Input, Row, Col, Menu } from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import {
  AcordianTable,
  ComonDropDown,
  PageLayout,
} from "../../../../components";
import CustomButton from "../../../../components/buttons/button";
import style from "./myHistory.module.css";
import EmptyState from "../../../../components/emptyStates/empty-states";
import CheckIcon from "../../../../assets/img/Check.png";
import EllipsesIcon from "../../../../assets/img/Ellipses.png";
import CrossIcon from "../../../../assets/img/Cross.png";
import PDF from "../../../../assets/img/pdf.png";
import Excel from "../../../../assets/img/xls.png";
import { Stepper, Step } from "react-form-stepper";
import { getColumns } from "./utils";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";
const MyHistory = () => {
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({});

  const [open, setOpen] = useState(false);

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
          iconType: "Approval",
        },
        {
          status: "In Review",
          user: "Muhammad Saif ul Islam Yousuf Zai",
          date: "2025-08-07",
          iconType: "check",
        },
        {
          status: "In Review",
          user: "Syed Muhammad Aun Raza Naqvi",
          date: "2025-08-07",
          iconType: "check",
        },
        {
          status: "In Review",
          user: "Muhammad Saroush Yahya Chisti",
          date: "2025-08-07",
          iconType: "NotTraded",
        },
        {
          status: "In Review",
          user: "Sara Ahmed",
          date: "2025-08-07",
          iconType: "Resubmitted",
        },
        {
          status: "In Review",
          user: "Sara Ahmed",
          date: "2025-08-07",
          iconType: "Decline",
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
          iconType: "Approval",
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
        {
          status: "Approved",
          user: "Emily Johnson",
          date: "2025-08-07",
          iconType: "check",
        },
        {
          status: "Approved",
          user: "Emily Johnson",
          date: "2025-08-07",
          iconType: "Dollar",
        },
        ,
        {
          status: "In Review",
          user: "Sara Ahmed",
          date: "2025-08-07",
          iconType: "EscaltedOn",
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

  const getIcon = (type, altText) => {
    switch (type) {
      case "check":
        return <img src={CheckIcon} alt={altText} width={24} height={24} />;
      case "ellipsis":
        return <img src={EllipsesIcon} alt={altText} width={24} height={24} />;
      case "cross":
        return <img src={CrossIcon} alt={altText} width={24} height={24} />;
      default:
        return null;
    }
  };

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
          <Col style={{ position: "relative" }}>
            <CustomButton
              text={"Export"}
              className="big-light-button"
              icon={<DownloadOutlined />}
              iconPosition="end"
              onClick={() => setOpen((prev) => !prev)}
            />

            {open && (
              <div className={style.dropdownExport}>
                <div className={style.dropdownItem}>
                  <img src={PDF} alt="PDF" draggable={false} />
                  <span>Export PDF</span>
                </div>
                <div className={style.dropdownItem}>
                  <img src={Excel} alt="Excel" draggable={false} />
                  <span>Export Excel</span>
                </div>
                <div className={style.dropdownItem}>
                  <img src={PDF} alt="PDF" draggable={false} />
                  <span>Export CSV</span>
                </div>
              </div>
            )}
          </Col>
        </Row>
        {/* Table */}
        {rawData.length > 0 ? (
          <AcordianTable
            className={style["accordian-table-blue"]}
            columns={columns}
            dataSource={filteredData}
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
