import React, { useState } from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { BorderlessTable, GlobalModal } from "../../../../../components";
import styles from "./IntimationEditRoleAndPoliciesModal.module.css";
import CustomButton from "../../../../../components/buttons/button";
import { useMyAdmin } from "../../../../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useApi } from "../../../../../context/ApiContext";
import { intimationEditRoleAndPoliciesTable } from "./utils";

const IntimationEditRoleAndPoliciesModal = () => {
  const navigate = useNavigate();

  // 🔷 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  //This is the ContextApi Global States for Resubmit Intimation modal
  const {
    roleAndPoliciesIntimationModal,
    setRoleAndPoliciesIntimationModal,
    setEditrolesAndPoliciesUser,
  } = useGlobalModal();

  const [sortedInfo, setSortedInfo] = useState({});

  // 🔹  Context State of View Detail Modal in which All data store
  const { storeEditRolesAndPoliciesData } = useMyAdmin();
  console.log(storeEditRolesAndPoliciesData, "storeEditRolesAndPoliciesData");
  const employees = storeEditRolesAndPoliciesData?.employees || [];

  // 🔹 intimation EditRole And Policies Table Borderless Table
  const columns = intimationEditRoleAndPoliciesTable({
    sortedInfo,
  });

  // 🔹  API will be hit on unSavedData

  return (
    <GlobalModal
      visible={roleAndPoliciesIntimationModal}
      width={"915px"}
      height={"419px"}
      centered={true}
      onCancel={() => setRoleAndPoliciesIntimationModal(false)}
      modalBody={
        <>
          <div className={styles.unSaveChangesModal}>
            <Row>
              <Col>
                <h2 className={styles.listOfUserName}>List Of Users</h2>
              </Col>
            </Row>{" "}
            <Row>
              <Col>
                <BorderlessTable
                  columns={columns}
                  rows={employees}
                  pagination={false}
                  size="small"
                  classNameTable="border-less-table-upcomingTable"
                  scroll={{ x: "max-content", y: 240 }}
                  onChange={(pagination, filters, sorter) => {
                    setSortedInfo(sorter);
                  }}
                />
              </Col>
            </Row>
            <Row justify="end" className={styles.footerActions}>
              {" "}
              <CustomButton
                text={"Close"}
                className="big-light-button"
                onClick={() => setRoleAndPoliciesIntimationModal(false)}
              />
            </Row>
          </div>
        </>
      }
    />
  );
};

export default IntimationEditRoleAndPoliciesModal;
