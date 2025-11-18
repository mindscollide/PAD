import React, { useEffect, useState, useRef } from "react";
import { Col, Row } from "antd";

// 🔹 Components
import BorderlessTable from "../../../../components/tables/borderlessTable/borderlessTable";
import PageLayout from "../../../../components/pageContainer/pageContainer";

// 🔹 Table Config
import { getBorderlessTableColumns } from "./utill";
import { approvalStatusMap } from "../../../../components/tables/borderlessTable/utill";

// 🔹 Contexts
import { useTransaction } from "../../../../context/myTransaction";
import { useGlobalModal } from "../../../../context/GlobalModalContext";

// 🔹 Styles
import style from "./myTransaction.module.css";

const MyTransactionReport = () => {
  const tableScrollEmployeeTransaction = useRef(null);

  const { employeeTransactionsData } = useTransaction();

  const {
    viewDetailTransactionModal,
    viewCommentTransactionModal,
    isViewTicketTransactionModal,
  } = useGlobalModal();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);

  // -------------------- Helpers --------------------

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
  });

  // -------------------- Render --------------------
  return (
    <>
      {/* 🔹 Transactions Table */}
      <PageLayout
        background="white"
        style={{ marginTop: "10px" }}
        className={activeFilters.length > 0 && "changeHeight"}
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <Row>
            <Col>
              <h2 className={style["heading"]}>My Transactions</h2>
            </Col>
          </Row>
          <BorderlessTable
            rows={employeeTransactionsData?.transactions}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              employeeTransactionsData?.transactions?.length
                ? {
                    x: "max-content",
                    y: activeFilters.length > 0 ? 450 : 500,
                  }
                : undefined
            }
            onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
            loading={loadingMore}
            ref={tableScrollEmployeeTransaction}
          />
        </div>
      </PageLayout>
    </>
  );
};

export default MyTransactionReport;
