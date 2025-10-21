import React, { useState } from "react";
import { Col, Row } from "antd";

// 🔹 Components
import BorderlessTable from "../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../components/pageContainer/pageContainer";

// 🔹 Contexts
import { useGlobalModal } from "../../../context/GlobalModalContext";

// 🔹 Styles
import style from "./Instruments.module.css";
import { getInstrumentTableColumns } from "./utils";
import EditInstrument from "./modal/editInstrument/EditInstrument";

const Instruments = () => {
  const { setEditModalData, editInstrumentModal, setEditInstrumentModal } =
    useGlobalModal();

  const [sortedInfo, setSortedInfo] = useState({});

  let data = [
    {
      key: 1,
      instrument: "HUBC - Hub Power Limited",
      status: true,
      startDate: "7 Nov 2025",
      endDate: "9 Nov 2025",
    },
    {
      key: 1,
      instrument: "KEL - K-electric Limited",
      status: false,
      startDate: "7 Nov 2025",
      endDate: "10 Nov 2025",
    },
    {
      key: 1,
      instrument: "PIBTL - Pakistan International Bulk Terminal",
      status: true,
      startDate: "-",
      endDate: "-",
    },
    {
      key: 1,
      instrument: "Faysal Securities (Private) Limited",
      status: false,
      startDate: "10 Nov 2025",
      endDate: "13 Nov 2025",
    },
    {
      key: 1,
      instrument: "CNERGY - Cnergycio PK Ltd",
      status: false,
      startDate: "-",
      endDate: "-",
    },
    {
      key: 1,
      instrument: "FABL - Faysal Bank Limited",
      status: true,
      startDate: "13 Nov 2025",
      endDate: "15 Nov 2025",
    },
    {
      key: 1,
      instrument: "SSGC - Sui Northern Gas Company Ltd",
      status: false,
      startDate: "7 Nov 2025",
      endDate: "10 Nov 2025",
    },
  ];

  const columns = getInstrumentTableColumns(
    sortedInfo,
    setEditModalData,
    setEditInstrumentModal
  );

  return (
    <>
      {/* Render Filter Tags */}

      {/* Table Layout */}
      <PageLayout background="white">
        <div className="px-4 md:px-6 lg:px-8">
          {/* Header */}
          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              <h2 className={style["heading"]}>Instruments</h2>
            </Col>
          </Row>

          <BorderlessTable
            rows={data}
            classNameTable="border-less-table-blue"
            scroll={{ x: "max-content", y: 550 }}
            columns={columns}
            onChange={(pagination, filters, sorter) => {
              setSortedInfo(sorter);
            }}
          />
        </div>
      </PageLayout>

      {/* Import Edit Instrument Modal */}
      {editInstrumentModal && <EditInstrument />}
    </>
  );
};

export default Instruments;
