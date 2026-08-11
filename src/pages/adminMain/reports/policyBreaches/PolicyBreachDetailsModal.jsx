import React from "react";
import { CloseOutlined } from "@ant-design/icons";
import { GlobalModal } from "../../../../components";
import style from "./AdminPolicyBreachesReport.module.css";

/**
 * "Policies Breached" drill-down modal - opened by clicking a Policy
 * Breaches list row's Policy Count, backed by GetAdminPolicyBreachDetailsAPI
 * per API_Changes/2026-08-11_admin_reports_all_apis.md.
 */
const PolicyBreachDetailsModal = ({
  visible,
  onClose,
  loading,
  records = [],
}) => {
  return (
    <GlobalModal
      visible={visible}
      width="700px"
      onCancel={onClose}
      closable={false}
      maskClosable
      modalHeader={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className={style.breadcrumbText} style={{ fontWeight: 600 }}>
            Policies Breached
          </span>
          <CloseOutlined style={{ cursor: "pointer" }} onClick={onClose} />
        </div>
      }
      modalBody={
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : records.length === 0 ? (
            <p>No policy breaches found for this request.</p>
          ) : (
            records.map((record, index) => (
              <div
                key={record.policyID || index}
                style={{
                  padding: "12px 0",
                  borderBottom:
                    index < records.length - 1 ? "1px solid #eee" : "none",
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {record.policyID ? `${record.policyID} - ` : ""}
                  {record.scenario}
                </div>
                {record.consequence && (
                  <div style={{ color: "#666", marginTop: 4 }}>
                    {record.consequence}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      }
    />
  );
};

export default PolicyBreachDetailsModal;
