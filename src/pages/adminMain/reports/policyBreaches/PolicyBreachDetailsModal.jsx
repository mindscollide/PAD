import React from "react";
import { CloseOutlined } from "@ant-design/icons";
import { GlobalModal } from "../../../../components";
import CustomButton from "../../../../components/buttons/button";
import Excel from "../../../../assets/img/xls.png";
import style from "./PolicyBreachDetailsModal.module.css";

/**
 * "Policies Breached" drill-down modal - opened by clicking a Policy
 * Breaches list row's Policy Count, backed by GetAdminPolicyBreachDetailsAPI
 * per API_Changes/2026-08-11_admin_reports_all_apis.md.
 *
 * FIXED: was missing the Employee ID/Name header context, a real Download
 * button, and a proper table (Policy ID/Scenario/Consequences columns,
 * scrollable) - just a bare list of {policyID, scenario, consequence}.
 * Rebuilt to match HTA's own version of this exact modal
 * (headOfTradeApprover/reports/policyBreaches/PolicyBreachDetailsModal.jsx),
 * which was already built to the real SRS spec.
 */
const PolicyBreachDetailsModal = ({
  visible,
  onClose,
  loading,
  records = [],
  employeeID,
  employeeName,
  onDownload,
  downloading = false,
}) => {
  return (
    <GlobalModal
      visible={visible}
      width="800px"
      onCancel={onClose}
      closable={false}
      maskClosable
      modalHeader={
        <div className={style.headerRow}>
          <span className={style.heading}>Policies Breached</span>
          <CloseOutlined className={style.closeIcon} onClick={onClose} />
        </div>
      }
      modalBody={
        <div>
          <div className={style.employeeRow}>
            <div className={style.employeeInfo}>
              <span className={style.employeeLabel}>Employee ID</span>
              <span className={style.employeeValue}>{employeeID ?? "—"}</span>
            </div>
            <div className={style.employeeInfo}>
              <span className={style.employeeLabel}>Employee Name</span>
              <span className={style.employeeValue}>
                {employeeName || "—"}
              </span>
            </div>
            <CustomButton
              text={
                <span className={style.downloadButtonText}>
                  <img src={Excel} alt="Excel" draggable={false} />
                  Download
                </span>
              }
              className="small-light-button"
              disabled={records.length === 0 || downloading}
              onClick={onDownload}
            />
          </div>

          <div className={style.tableWrapper}>
            {loading ? (
              <p className={style.emptyText}>Loading...</p>
            ) : records.length === 0 ? (
              <p className={style.emptyText}>
                No policy breaches found for this request.
              </p>
            ) : (
              <table className={style.table}>
                <thead>
                  <tr>
                    <th>Policy ID</th>
                    <th>Scenario</th>
                    <th>Consequences</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record.policyID || index}>
                      <td>{record.policyID || "—"}</td>
                      <td>{record.scenario || "—"}</td>
                      <td>{record.consequence || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      }
    />
  );
};

export default PolicyBreachDetailsModal;
