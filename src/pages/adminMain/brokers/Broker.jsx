import React, { useState } from "react";
import { Col, Row } from "antd";

// 🔹 Components
import { ComonDropDown } from "../../../components";
import BorderlessTable from "../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../components/pageContainer/pageContainer";

// 🔹 Contexts
import { useGlobalModal } from "../../../context/GlobalModalContext";

// 🔹 Styles
import style from "./Broker.module.css";
import { getBrokerTableColumns } from "./utils";
import PDF from "../../../assets/img/pdf.png";
import Excel from "../../../assets/img/xls.png";
import CustomButton from "../../../components/buttons/button";
import AddNewBroker from "./modal/addNewBroker/AddNewBroker";
import EditBroker from "./modal/editBroker/EditBroker";
import AddBrokerConfirmationModal from "./modal/addBrokerConfimationModal/AddBrokerConfirmationModal";

const Brokers = () => {
  const {
    addNewBrokerModal,
    setAddNewBrokerModal,
    editBrokerModal,
    setEditBrokerModal,
    setEditModalData,
    addBrokerConfirmationModal,
  } = useGlobalModal();

  const [sortedInfo, setSortedInfo] = useState({});

  const [open, setOpen] = useState(false);

  let data = [
    {
      key: 1,
      brokerName:
        "Axis Global Limited Comprehensive Brokerage, Trading & Investment Advisory",
      status: true,
      psxCode: "1023876189",
    },
    {
      key: 1,
      brokerName:
        "Alfalah Securities (Private) Limited – Comprehensive Brokerage, Trading inc",
      status: false,
      psxCode: "1023876189",
    },
    {
      key: 1,
      brokerName:
        "Foundation Securities (Private) Limited – Licensed Brokerage, Research",
      status: true,
      psxCode: "1023876189",
    },
    {
      key: 1,
      brokerName: "Faysal Securities (Private) Limited",
      status: false,
      psxCode: "1023876189",
    },
    {
      key: 1,
      brokerName:
        "Alfalah Securities (Private) Limited – Comprehensive Brokerage, Trading inc",
      status: false,
      psxCode: "1023876189",
    },
    {
      key: 1,
      brokerName:
        "Foundation Securities (Private) Limited – Licensed Brokerage, Research",
      status: true,
      psxCode: "1023876189",
    },
    {
      key: 1,
      brokerName: "Faysal Securities (Private) Limited",
      status: false,
      psxCode: "1023876189",
    },
  ];

  const columns = getBrokerTableColumns(
    sortedInfo,
    setEditBrokerModal,
    setEditModalData
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
              <h2 className={style["heading"]}>Brokers</h2>
            </Col>
            <Col>
              <div className={style.mainDivForAddorExportBtn}>
                <CustomButton
                  text={"Add Broker"}
                  className="small-light-button"
                  onClick={() => setAddNewBrokerModal(true)}
                />
                <CustomButton
                  text={"Export"}
                  className="small-light-button"
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
                      <span>Export XLS</span>
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {data && data.length > 0 ? (
            <BorderlessTable
              rows={data}
              classNameTable="border-less-table-blue"
              scroll={{ x: "max-content", y: 550 }}
              columns={columns}
              onChange={(pagination, filters, sorter) => {
                setSortedInfo(sorter);
              }}
            />
          ) : (
            <EmptyState type="broker" />
          )}
        </div>
      </PageLayout>

      {/* To Open Add Modal While click on Add Broker */}
      {addNewBrokerModal && <AddNewBroker />}

      {editBrokerModal && <EditBroker />}

      {addBrokerConfirmationModal && <AddBrokerConfirmationModal />}
    </>
  );
};

export default Brokers;
