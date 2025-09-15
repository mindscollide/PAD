import React, { useEffect, useRef, useMemo } from "react";
import { Avatar, Col, Row } from "antd";
import { BarChartOutlined, FileDoneOutlined } from "@ant-design/icons";

// Reusable components
import { BoxCard, ReportCard, TextCard } from "../../../components";

// API call
import { GetUserDashBoardStats } from "../../../api/dashboardApi";

// Custom hooks and context
import { useNotification } from "../../../components/NotificationProvider/NotificationProvider";

import { useApi } from "../../../context/ApiContext";
import { useDashboardContext } from "../../../context/dashboardContaxt";

// Utility for mapping roles to keys
import { roleKeyMap, checkRoleMatch } from "./utills";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
// ✅ Memoized versions so they only re-render if props actually change
const MemoizedBoxCard = React.memo(BoxCard);
const MemoizedReportCard = React.memo(ReportCard);
const Home = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const {
    dashboardData,
    setDashboardData,
    setEmployeeBasedBrokersData,
    setAllInstrumentsData,
    setAddApprovalRequestData,
    setGetAllPredefineReasonData,
  } = useDashboardContext();
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const roles = JSON.parse(sessionStorage.getItem("user_assigned_roles"));
  const { setAllyType } = useSearchBarContext();
  // Prevent multiple fetches on mount
  const hasFetched = useRef(false);
  console.log(dashboardData, "dashboardDatadashboardData");
  const employeeApprovals = useMemo(
    () => dashboardData?.employee?.myApprovals?.data || [],
    [dashboardData?.employee?.myApprovals?.data]
  );
  const employeePortfolio = useMemo(
    () => dashboardData?.employee?.portfolio?.data || [],
    [dashboardData?.employee?.portfolio?.data]
  );
  const employeeTransactions = useMemo(
    () => dashboardData?.employee?.myTransactions?.data || [],
    [dashboardData?.employee?.myTransactions?.data]
  );

  const lineManagerApprovals = useMemo(
    () => dashboardData?.lineManager?.myApprovals?.data || [],
    [dashboardData?.lineManager?.myApprovals?.data]
  );
  const lineManagerAction = useMemo(
    () => dashboardData?.lineManager?.myActions?.data || [],
    [dashboardData?.lineManager?.myActions?.data]
  );

    const complianceOfficerYyActions = useMemo(
    () => dashboardData?.complianceOfficer?.myActions?.data || [],
    [dashboardData?.complianceOfficer?.myActions?.data]
  );
  const complianceOfficerReconsileTransactions = useMemo(
    () => dashboardData?.complianceOfficer?.myApprovals?.data || [],
    [dashboardData?.complianceOfficer?.myApprovals?.data]
  );
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const fetchData = async () => {
      if (!roles || roles.length === 0) {
        hasFetched.current = false;
        return;
      }

      try {
        await showLoader(true);
        const data = await GetUserDashBoardStats({
          callApi,
          setEmployeeBasedBrokersData,
          setAllInstrumentsData,
          setAddApprovalRequestData,
          setGetAllPredefineReasonData,
          showNotification,
          showLoader,
          navigate,
        });
        // Handle session expiration
        console.log("res", data);
        if (!data) return showLoader(false);

        // Filter data based on user roles
        const filteredData = {
          title: data.title, // Include title if needed
        };
        roles.forEach(({ roleID }) => {
          const roleKey = roleKeyMap[roleID];
          if (roleKey && data[roleKey]) {
            filteredData[roleKey] = data[roleKey];
          }
        });
        showLoader(false);
        setDashboardData(filteredData);
      } catch (error) {
        showLoader(false);
        console.error("Failed to fetch home summary", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("dashboardData", dashboardData);
  }, [dashboardData]);


  return (
    <div style={{ padding: " 16px 24px 0px 24px " }}>
      {checkRoleMatch(roles, 2) && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={16}>
              <TextCard
                className="smallCard"
                title={
                  <>
                    <span id="greeting-text">Hi</span>{" "}
                    <span id="user-name">{dashboardData?.title}</span>,
                  </>
                }
                subtitle="Good Morning!"
              />
            </Col>

            <Col xs={24} md={12} lg={8}>
              <MemoizedBoxCard
                locationStyle={"down"}
                title={"Portfolio"}
                mainClassName={"smallShareHomeCard"}
                boxes={employeePortfolio}
                buttonTitle={"View Portfolio"}
                buttonId={"portfolio-view-btn"}
                buttonClassName={"big-white-card-button"}
                userRole={"employee"}
                route={"portfolio"}
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={12}>
              <MemoizedBoxCard
                locationStyle={"up"}
                title="My Approvals"
                mainClassName={"mediumHomeCard"}
                boxes={employeeApprovals}
                buttonTitle={"See More"}
                buttonId={"Approvals-view-btn"}
                buttonClassName={"big-white-card-button"}
                userRole={"employee"}
                route={"approvals"}
              />
            </Col>

            <Col xs={24} md={12} lg={12}>
              <MemoizedBoxCard
                locationStyle={"up"}
                title="My Transactions"
                mainClassName={"mediumHomeCard"}
                boxes={employeeTransactions}
                buttonTitle={"See More"}
                buttonId={"Transactions-view-btn"}
                buttonClassName={"big-white-card-button"}
                userRole={"employee"}
                route={"transactions"}
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={12}>
              <BoxCard
                locationStyle={"side"}
                title="My History"
                mainClassName={"mediumHomeSideCard"}
                boxes={dashboardData?.employee?.myHistory?.data}
                buttonTitle={"See More"}
                buttonId={"History-view-btn"}
                buttonClassName={"big-white-card-button"}
                userRole={"employee"}
                route={"history"}
              />
            </Col>
            <Col xs={24} md={12} lg={12}>
              <ReportCard
                mainClassName={"home-reprot-card"}
                title="Reports"
                buttonTitle={"See More"}
                buttonId={"Reports-view-btn"}
                buttonClassName={"big-white-card-button"}
                rowButtonClassName={"small-card-light-button"}
                data={[
                  {
                    icon: <Avatar icon={<FileDoneOutlined />} />,
                    label: "My Compliance",
                    action: "View Report",
                  },
                  {
                    icon: <Avatar icon={<BarChartOutlined />} />,
                    label: "My Transactions",
                    action: "View Report",
                  },
                  {
                    icon: <Avatar icon={<BarChartOutlined />} />,
                    label: "My Transactions",
                    action: "View Report",
                  },
                ]}
                userRole={"employee"}
                route={"reports"}
              />
            </Col>
          </Row>
        </>
      )}
      {checkRoleMatch(roles, 3) && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={24} lg={24}>
              <TextCard
                className="smallCard"
                title={
                  <>
                    <span id="greeting-text-LM">Hi</span>{" "}
                    <span id="user-name-LM">{dashboardData?.title}</span>,
                  </>
                }
                subtitle="Good Morning!"
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={12}>
              <MemoizedBoxCard
                // warningFlag={true}
                locationStyle={"up"}
                title="Approvals Request"
                buttonId={"Approvals-view-btn-LM"}
                mainClassName={"mediumHomeCard"}
                boxes={lineManagerApprovals}
                buttonTitle={"See More"}
                buttonClassName={"big-white-card-button"}
                userRole={"LM"}
                route={"approvals"}
              />
            </Col>

            <Col xs={24} md={12} lg={12}>
              <MemoizedBoxCard
                locationStyle={"up"}
                title="My Actions"
                mainClassName={"mediumHomeCard"}
                boxes={lineManagerAction}
                buttonTitle={"See More"}
                buttonId={"mediumHomeCard-view-btn-LM"}
                buttonClassName={"big-white-card-button"}
                userRole={"LM"}
                route={"actions"}
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={12}>
              <ReportCard
                mainClassName={"home-reprot-card"}
                title="Reports"
                buttonTitle={"See More"}
                buttonId={"Reports-view-btn-LM"}
                buttonClassName={"big-white-card-button"}
                rowButtonClassName={"small-card-light-button"}
                data={[
                  {
                    icon: <Avatar icon={<FileDoneOutlined />} />,
                    label: "My Compliance",
                    action: "View Report",
                  },
                  {
                    icon: <Avatar icon={<BarChartOutlined />} />,
                    label: "My Transactions",
                    action: "View Report",
                  },
                  {
                    icon: <Avatar icon={<BarChartOutlined />} />,
                    label: "My Transactions",
                    action: "View Report",
                  },
                ]}
                userRole={"LM"}
                route={"reports"}
              />
            </Col>
          </Row>
        </>
      )}
      {checkRoleMatch(roles, 4) && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={24} lg={24}>
              <TextCard
                className="smallCard"
                title={
                  <>
                    <span id="greeting-text-LM">Hi</span>{" "}
                    <span id="user-name-LM">{dashboardData?.title}</span>,
                  </>
                }
                subtitle="Good Morning!"
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={12}>
              <MemoizedBoxCard
                // warningFlag={true}
                locationStyle={"up"}
                title="Reconcile Transactions"
                buttonId={"Reconcile-transactions-view-btn-co"}
                mainClassName={"mediumHomeCard"}
                boxes={complianceOfficerReconsileTransactions}
                buttonTitle={"See More"}
                buttonClassName={"big-white-card-button"}
                userRole={"CO"}
                route={"reconcile"}
              />
            </Col>

            <Col xs={24} md={12} lg={12}>
              <MemoizedBoxCard
                buttonId={"my-action-view-btn-co"}
                locationStyle={"up"}
                title="My Actions"
                mainClassName={"mediumHomeCard"}
                boxes={complianceOfficerYyActions}
                buttonTitle={"See More"}
                buttonClassName={"big-white-card-button"}
                userRole={"CO"}
                route={"action"}
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={12}>
              <ReportCard
                mainClassName={"home-reprot-card"}
                title="Reports"
                buttonTitle={"See More"}
                buttonId={"Reports-view-btn-LM"}
                buttonClassName={"big-white-card-button"}
                rowButtonClassName={"small-card-light-button"}
                data={[
                  {
                    icon: <Avatar icon={<FileDoneOutlined />} />,
                    label: "My Compliance",
                    action: "View Report",
                  },
                  {
                    icon: <Avatar icon={<BarChartOutlined />} />,
                    label: "My Transactions",
                    action: "View Report",
                  },
                  {
                    icon: <Avatar icon={<BarChartOutlined />} />,
                    label: "My Transactions",
                    action: "View Report",
                  },
                ]}
                userRole={"LM"}
                route={"reports"}
              />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Home;
