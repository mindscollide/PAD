import React, { useCallback, useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";

// 🔹 Components
import BorderlessTable from "../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../components/pageContainer/pageContainer";

// 🔹 Contexts
import { useGlobalModal } from "../../../context/GlobalModalContext";

// 🔹 Styles
import style from "./Broker.module.css";
import { buildApiRequest, getBrokerTableColumns } from "./utils";
import PDF from "../../../assets/img/pdf.png";
import Excel from "../../../assets/img/xls.png";
import CustomButton from "../../../components/buttons/button";
import AddNewBroker from "./modal/addNewBroker/AddNewBroker";
import EditBroker from "./modal/editBroker/EditBroker";
import AddBrokerConfirmationModal from "./modal/addBrokerConfimationModal/AddBrokerConfirmationModal";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import {
  SearchBrokersAdminRequest,
  updateBrokersStatusRequest,
} from "../../../api/adminApi";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useApi } from "../../../context/ApiContext";
import { useMyAdmin } from "../../../context/AdminContext";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useWebNotification } from "../../../context/notificationContext";

const Brokers = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  // 🔷 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const { adminBrokerSearch, setAdminBrokerSearch } = useSearchBarContext();
  const { adminBrokerData, setAdminBrokerData } = useMyAdmin();

  const {
    addNewBrokerModal,
    setAddNewBrokerModal,
    editBrokerModal,
    setEditBrokerModal,
    setEditModalData,
    addBrokerConfirmationModal,
  } = useGlobalModal();

  // 🔷 UI State
  const [sortedInfo, setSortedInfo] = useState({});
  const [open, setOpen] = useState(false);

  // 🔷 Toggle Api Call For Active and InActive Statuses
  const onToggleStatusApiRequest = async (brokerID, isActive) => {
    showLoader(true);
    const payload = {
      BrokerID: brokerID,
      BrokerStatusID: isActive ? 1 : 2,
    };

    await updateBrokersStatusRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata: payload,
      navigate,
    });
  };

  // 🔷 Table Columns
  const columns = getBrokerTableColumns({
    sortedInfo,
    adminBrokerSearch,
    setAdminBrokerSearch,
    setEditBrokerModal,
    setEditModalData,
    onStatusChange: onToggleStatusApiRequest,
  });

  /** 🔹 Fetch approvals from API */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchBrokersAdminRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      setAdminBrokerData(res);
    },
    [callApi, navigate, setAdminBrokerData, showLoader, showNotification]
  );

  // ----------------- Effects -----------------

  // 🔷 Initial Data Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildApiRequest(adminBrokerSearch);

      fetchApiCall(requestData, true, true);
    }
  }, [buildApiRequest, adminBrokerSearch, fetchApiCall]);

  return (
    <>
      {/* 🔷 Main Page Layout */}
      <PageLayout background="white">
        <div className="px-4 md:px-6 lg:px-8">
          {/* 🔷 Header with Add/Export buttons */}
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
                  text={
                    <span className={style.exportButtonText}>
                      Export
                      <span className={style.iconContainer}>
                        {open ? <UpOutlined /> : <DownOutlined />}
                      </span>
                    </span>
                  }
                  className="small-light-button"
                  onClick={() => setOpen((prev) => !prev)}
                />
                {/* 🔷 Export Dropdown */}
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

          {/* 🔷 Brokers Table */}
          <BorderlessTable
            rows={adminBrokerData?.brokers}
            classNameTable="border-less-table-blue"
            scroll={{ x: "max-content", y: 550 }}
            columns={columns}
            onChange={(pagination, filters, sorter) => {
              setSortedInfo(sorter);
            }}
          />
        </div>
      </PageLayout>

      {/* 🔷 Modals */}
      {/* To Open Add Modal While click on Add Broker */}
      {addNewBrokerModal && <AddNewBroker />}
      {editBrokerModal && <EditBroker />}
      {addBrokerConfirmationModal && <AddBrokerConfirmationModal />}
    </>
  );
};

export default Brokers;
