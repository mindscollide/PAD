import { Breadcrumb, Col, Row } from "antd";
import style from "./ViewDetails.module.css";
import Excel from "../../../../../../assets/img/xls.png";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import CustomButton from "../../../../../../components/buttons/button";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchBarContext } from "../../../../../../context/SearchBarContaxt";
import { useMyApproval } from "../../../../../../context/myApprovalContaxt";
import { SearchHTATurnAroundTimeDetailsRequestApi } from "../../../../../../api/myApprovalApi";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../../context/LoaderContext";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";
import {
  buildApiRequest,
  getBorderlessTableColumns,
  mapListData,
} from "./utils";
import { useTableScrollBottom } from "../../../../../../common/funtions/scroll";
import { approvalStatusMap } from "../../../../../../components/tables/borderlessTable/utill";
import { BorderlessTable, PageLayout } from "../../../../../../components";
import { getSafeAssetTypeData } from "../../../../../../common/funtions/assetTypesList";
import { useSidebarContext } from "../../../../../../context/sidebarContaxt";

const ViewDetails = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollEmployeeTransaction = useRef(null);
  // -------------------- Contexts --------------------

  const { callApi } = useApi();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { assetTypeListingData, setAssetTypeListingData } =
    useDashboardContext();

  const {
    setShowViewDetailPageInTatOnHta,
    showSelectedTatDataOnViewDetailHTA,
  } = useGlobalModal();

  const {
    htaTATViewDetailsData,
    setHTATATViewDetailsData,
    resetHTATATViewDetails,
  } = useMyApproval();

  const {
    htaTATViewDetailsSearch,
    setHTATATViewDetailsSearch,
    resetHTATATViewDetailSearch,
  } = useSearchBarContext();

  // -------------------- Local State --------------------
  const [sortedInfo, setSortedInfo] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [open, setOpen] = useState(false);

  // -------------------- Helpers --------------------

  /**
   * Fetches transactions from API.
   * @param {boolean} flag - whether to show loader
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchHTATurnAroundTimeDetailsRequestApi({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });
      console.log("res".res);

      // ✅ Always get the freshest version (from memory or session)
      const currentAssetTypeData = getSafeAssetTypeData(
        assetTypeListingData,
        setAssetTypeListingData
      );

      const workFlows = Array.isArray(res?.workFlows) ? res.workFlows : [];
      console.log("records", workFlows);
      const mapped = mapListData(currentAssetTypeData?.Equities, workFlows);
      if (!mapped || typeof mapped !== "object") return;
      console.log("records", mapped);

      setHTATATViewDetailsData((prev) => ({
        workFlows: replace ? mapped : [...(prev?.workFlows || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : htaTATViewDetailsData.totalRecordsTable + mapped.length,
      }));
      setHTATATViewDetailsSearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace ? mapped.length : prev.pageNumber + mapped.length,
        };

        // this is for check if filter value get true only on that it will false
        if (prev.filterTrigger) {
          next.filterTrigger = false;
        }

        return next;
      });
    },
    [
      assetTypeListingData,
      callApi,
      navigate,
      setHTATATViewDetailsSearch,
      showLoader,
      showNotification,
    ]
  );

  // -------------------- Effects --------------------

  // 🔹 Initial Fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const requestData = buildApiRequest(
      htaTATViewDetailsSearch,
      showSelectedTatDataOnViewDetailHTA
    );
    fetchApiCall(requestData, true, true);
  }, []);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      // Reset search state for fresh load
      resetHTATATViewDetailSearch();
      resetHTATATViewDetails();
    };
  }, []);

  // 🔹 call api on search
  useEffect(() => {
    if (htaTATViewDetailsSearch?.filterTrigger) {
      console.log("htaTATViewDetailsSearch", htaTATViewDetailsSearch);
      const requestData = buildApiRequest(
        htaTATViewDetailsSearch,
        showSelectedTatDataOnViewDetailHTA
      );
      fetchApiCall(requestData, true, true);
    }
  }, [htaTATViewDetailsSearch?.filterTrigger]);

  // 🔹 Infinite Scroll (lazy loading)
  useTableScrollBottom(
    async () => {
      if (
        htaTATViewDetailsData?.totalRecordsDataBase <=
        htaTATViewDetailsData?.totalRecordsTable
      )
        return;

      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(
          htaTATViewDetailsSearch,
          showSelectedTatDataOnViewDetailHTA
        );
        await fetchApiCall(requestData, false, false);
      } catch (err) {
        console.error("Error loading more approvals:", err);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-blue"
  );

  // -------------------- Table Columns --------------------
  const columns = getBorderlessTableColumns({
    approvalStatusMap,
    sortedInfo,
    htaTATViewDetailsSearch,
    setHTATATViewDetailsSearch,
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      instrumentName: { instrumentName: "" },
      quantity: { quantity: 0 },
      actionBy: { actionBy: "" },
      tat: { tat: 0 },
      requestDateRange: { startDate: null, endDate: null },
      actionDateRange: { actionStartDate: null, actionEndDate: null },
    };

    setHTATATViewDetailsSearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setHTATATViewDetailsSearch((prev) => ({
      ...prev,
      instrumentName: "",
      quantity: 0,
      startDate: null,
      endDate: null,
      actionStartDate: null,
      actionEndDate: null,
      actionBy: "",
      tat: 0,
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const {
      instrumentName,
      quantity,
      startDate,
      endDate,
      actionStartDate,
      actionEndDate,
      actionBy,
      tat,
    } = htaTATViewDetailsSearch || {};

    return [
      instrumentName && {
        key: "instrumentName",
        label: "Instrument",
        value:
          instrumentName.length > 13
            ? instrumentName.slice(0, 13) + "..."
            : instrumentName,
      },

      quantity > 0 && {
        key: "quantity",
        label: "Quantity",
        value: Number(quantity).toLocaleString("en-US"),
      },

      actionBy && {
        key: "actionBy",
        label: "Action By",
        value: actionBy.length > 13 ? actionBy.slice(0, 13) + "..." : actionBy,
      },

      tat > 0 && {
        key: "tat",
        label: "TAT",
        value: Number(tat).toLocaleString("en-US"),
      },

      startDate &&
        endDate && {
          key: "requestDateRange",
          value: `${startDate} → ${endDate}`,
        },

      actionStartDate &&
        actionEndDate && {
          key: "actionDateRange",
          value: `${actionStartDate} → ${actionEndDate}`,
        },
    ].filter(Boolean);
  })();

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
                    onClick={() => {
                      navigate("/PAD/hta-reports");
                      setShowViewDetailPageInTatOnHta(false);
                    }}
                    className={style.breadcrumbLink}
                  >
                    Reports
                  </span>
                ),
              },
              {
                title: (
                  <span
                    onClick={() => setShowViewDetailPageInTatOnHta(false)}
                    className={style.breadcrumbLink}
                  >
                    TAT Request Approvals
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>View Details</span>
                ),
              },
            ]}
          />
        </Col>

        <Col>
          <div className={style.headerActionsRow}>
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
              <div className={style.dropdownItem}>
                <img src={Excel} alt="Excel" draggable={false} />
                <span>Export Excel</span>
              </div>
            </div>
          )}
        </Col>
      </Row>

      {/* 🔹 Active Filter Tags */}
      {activeFilters.length > 0 && (
        <Row gutter={[12, 12]} className={style["filter-tags-container"]}>
          {activeFilters.map(({ key, value }) => (
            <Col key={key}>
              <div className={style["filter-tag"]}>
                <span>{value}</span>
                <span
                  className={style["filter-tag-close"]}
                  onClick={() => handleRemoveFilter(key)}
                >
                  &times;
                </span>
              </div>
            </Col>
          ))}

          {/* 🔹 Show Clear All only if more than one filter */}
          {activeFilters.length > 1 && (
            <Col>
              <div
                className={`${style["filter-tag"]} ${style["clear-all-tag"]}`}
                onClick={handleRemoveAllFilters}
              >
                <span>Clear All</span>
              </div>
            </Col>
          )}
        </Row>
      )}

      <Row className={style.breadcrumbRowBelowData}>
        <Col span={6}>
          <p className={style.mainTitleTextClass}>
            Employee ID:{" "}
            <span className={style.subTitleTextClass}>
              {showSelectedTatDataOnViewDetailHTA.employeeID}
            </span>
          </p>
        </Col>
        <Col span={6}>
          <p className={style.mainTitleTextClass}>
            Employee Name:{" "}
            <span className={style.subTitleTextClass}>
              {showSelectedTatDataOnViewDetailHTA.employeeName}
            </span>
          </p>
        </Col>{" "}
        <Col span={6}>
          <p className={style.mainTitleTextClass}>
            Department:{" "}
            <span className={style.subTitleTextClass}>
              {showSelectedTatDataOnViewDetailHTA.departmentName}
            </span>
          </p>
        </Col>
        <Col span={6}>
          <p className={style.mainTitleTextClass}>Date Range: </p>
        </Col>
      </Row>

      {/* 🔹 Transactions Table */}
      <PageLayout
        background="white"
        style={{ marginTop: "3px" }}
        className={
          activeFilters.length > 0
            ? "TATHTAchangeHeightreports2"
            : "TATHTArepotsHeight"
        }
      >
        <div className="px-4 md:px-6 lg:px-8 ">
          <BorderlessTable
            rows={htaTATViewDetailsData?.workFlows}
            columns={columns}
            classNameTable="border-less-table-blue"
            scroll={
              htaTATViewDetailsData?.workFlows?.length
                ? {
                    x: "max-content",
                    y: activeFilters.length > 0 ? 400 : 450,
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

export default ViewDetails;
