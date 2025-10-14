import React, { useEffect, useRef, useMemo } from "react";
import { Avatar, Col, Row } from "antd";
import { BarChartOutlined, FileDoneOutlined } from "@ant-design/icons";

// Reusable components
import {
  BoxCard,
  DocumentViewer,
  ReportCard,
  TextCard,
} from "../../components";

// API call
import { GetUserDashBoardStats } from "../../api/dashboardApi";

// Custom hooks and context
import { useNotification } from "../../components/NotificationProvider/NotificationProvider";

import { useApi } from "../../context/ApiContext";
import { useDashboardContext } from "../../context/dashboardContaxt";

// Utility for mapping roles to keys
import { roleKeyMap, checkRoleMatch } from "./utills";
import { useGlobalLoader } from "../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import { useWebNotification } from "../../context/notificationContext";
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
    setAssetTypeListingData,
    setGetAllPredefineReasonData,
  } = useDashboardContext();
  const { setWebNotificationData } = useWebNotification();
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const roles = JSON.parse(sessionStorage.getItem("user_assigned_roles"));
  // Prevent multiple fetches on mount
  const hasFetched = useRef(false);
  console.log(dashboardData, "dashboardDatadashboardData");

  // Employee
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

  // Lime Manager
  const lineManagerApprovals = useMemo(
    () => dashboardData?.lineManager?.myApprovals?.data || [],
    [dashboardData?.lineManager?.myApprovals?.data]
  );
  const lineManagerAction = useMemo(
    () => dashboardData?.lineManager?.myActions?.data || [],
    [dashboardData?.lineManager?.myActions?.data]
  );

  // Compliance Officer
  const complianceOfficerMyActions = useMemo(
    () => dashboardData?.complianceOfficer?.myActions?.data || [],
    [dashboardData?.complianceOfficer?.myActions?.data]
  );
  const complianceOfficerReconsileTransactions = useMemo(
    () => dashboardData?.complianceOfficer?.myApprovals?.data || [],
    [dashboardData?.complianceOfficer?.myApprovals?.data]
  );

  // head Of Compliance Approval
  const headofComplianceOfficerMyActions = useMemo(
    () => dashboardData?.headofComplianceOfficer?.myActions?.data || [],
    [dashboardData?.headofComplianceOfficer?.myActions?.data]
  );
  const headofComplianceOfficerVerificationRequest = useMemo(
    () =>
      dashboardData?.headofComplianceOfficer?.verificationRequests?.data || [],
    [dashboardData?.headofComplianceOfficer?.verificationRequests?.data]
  );

  // This is For HTA Dashboard
  const headofComplianceFlowMyAction = useMemo(
    () => dashboardData?.headofTradeApproval?.myActions?.data || [],
    [dashboardData?.headofTradeApproval?.myActions?.data]
  );

  // This is For HTA Dashboard Verification Request
  const headofApprovalEscalatedRequest = useMemo(
    () => dashboardData?.headofTradeApproval?.escalatedApprovals?.data || [],
    [dashboardData?.headofTradeApproval?.escalatedApprovals?.data]
  );

  // Admin
  const policyAssign = useMemo(
    () => dashboardData?.admin?.policyAssign?.data || [],
    [dashboardData?.admin?.policyAssign?.data]
  );
  const instrument = useMemo(
    () => dashboardData?.admin?.instrument?.data || [],
    [dashboardData?.admin?.instrument?.data]
  );
  const brokers = useMemo(
    () => dashboardData?.admin?.brokers?.data || [],
    [dashboardData?.admin?.brokers?.data]
  );
  const groupPolicy = useMemo(
    () => dashboardData?.admin?.groupPolicy?.data || [],
    [dashboardData?.admin?.groupPolicy?.data]
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
          setAssetTypeListingData,
          setGetAllPredefineReasonData,
          setWebNotificationData,
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

  useEffect(() => {}, [dashboardData]);
  // roles = dynamic roles array (e.g. [{ roleID: 1 }, { roleID: 3 }])
  const userRoleIDs = roles.map((r) => r.roleID);

  // remove role 1 if present
  const filteredRoles = userRoleIDs.filter((id) => id !== 1);

  // find the first valid matched role (ignoring 1)
  const firstMatchedRole = filteredRoles.find((roleId) =>
    checkRoleMatch(roles, roleId)
  );
  return (
    <>
      <div style={{ padding: " 16px 24px 0px 24px " }}>
        {JSON.parse(sessionStorage.getItem("current_role_is_admin")) ? (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={12}>
                <TextCard
                  className="smallCardAdmin"
                  title={
                    <>
                      <span id="greeting-text-admin">Hi</span>{" "}
                      <span id="user-name-admin">{dashboardData?.title}</span>,
                    </>
                  }
                  subtitle="Welcome back, Admin!"
                />
              </Col>
              <Col xs={24} md={12} lg={12}>
                <MemoizedBoxCard
                  locationStyle={"up"}
                  title={"Policy Assign to the Users"}
                  mainClassName={"smallShareHomeCard"}
                  changeTextSize={true}
                  // boxes={policyAssign}
                  boxes={[
                    {
                      count: 13,
                      label: "unrestricted",
                      type: "unrestricted",
                    },
                    {
                      count: 2,
                      label: "restricted",
                      type: "restricted",
                    },
                  ]}
                  buttonTitle={"See More"}
                  buttonId={"policy-assign-view-btn-admin"}
                  buttonClassName={"big-white-card-button"}
                  userRole={"admin"}
                  route={"policies"}
                />
              </Col>
            </Row>

            {/* Example Admin Cards */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={12}>
                <MemoizedBoxCard
                  locationStyle={"up"}
                  title="Instruments"
                  mainClassName="mediumHomeCard"
                  // boxes={instrument}
                  boxes={[
                    {
                      count: 16,
                      label: "Active instruments",
                      type: "Active instruments",
                    },
                    {
                      count: 5,
                      label: "Inactive instruments",
                      type: "Inactive instruments",
                    },
                  ]}
                  buttonTitle="See More"
                  buttonClassName={"big-white-card-button"}
                  buttonId={"instruments-view-btn-admin"}
                  userRole="Admin"
                  route="instruments"
                />
              </Col>
              <Col xs={24} md={12} lg={12}>
                <MemoizedBoxCard
                  locationStyle={"up"}
                  title="Brokers"
                  mainClassName="mediumHomeCard"
                  // boxes={brokers}
                  boxes={[
                    {
                      count: 13,
                      label: "Active Brokers",
                      type: "Active Brokers",
                    },
                    {
                      count: 2,
                      label: "Inactive Brokers",
                      type: "Inactive Brokers",
                    },
                  ]}
                  buttonTitle="See More"
                  buttonClassName={"big-white-card-button"}
                  buttonId={"brokers-view-btn-admin"}
                  userRole="Admin"
                  route="brokers"
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={12}>
                <MemoizedBoxCard
                  locationStyle={"up"}
                  title="Group Policies"
                  mainClassName="mediumHomeCard"
                  // boxes={groupPolicy}
                  boxes={[
                    {
                      count: 4,
                      label: "Groups",
                      type: "Groups",
                    },
                    {
                      count: 32,
                      label: "Total users",
                      type: "Total users",
                    },
                  ]}
                  buttonTitle="See More"
                  buttonClassName={"big-white-card-button"}
                  buttonId={"group-policy-view-btn-admin"}
                  userRole="Admin"
                  route="grouppolicies"
                />
              </Col>
              <Col xs={24} md={12} lg={12}>
                <ReportCard
                  mainClassName="home-reprot-card"
                  title="Reports"
                  buttonTitle="See More"
                  buttonClassName={"big-white-card-button"}
                  data={[
                    {
                      icon: <Avatar icon={<BarChartOutlined />} />,
                      label: "Usage Reports",
                      action: "View Report",
                    },
                  ]}
                  buttonId={"Reports-view-btn-admin"}
                  rowButtonClassName={"small-card-light-button"}
                  userRole="Admin"
                  route="reports"
                />
              </Col>
            </Row>
          </>
        ) : (
          <>
            {" "}
            {checkRoleMatch(roles, 2) && (
              <>
                <Row gutter={[16, 16]}>
                  {firstMatchedRole === 2 && (
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
                  )}

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
            <br />
            {checkRoleMatch(roles, 3) && (
              <>
                <Row gutter={[16, 16]}>
                  {firstMatchedRole === 3 && (
                    <Col xs={24} md={24} lg={24}>
                      <TextCard
                        className="smallCard"
                        title={
                          <>
                            <span id="greeting-text-LM">Hi</span>{" "}
                            <span id="user-name-LM">
                              {dashboardData?.title}
                            </span>
                            ,
                          </>
                        }
                        subtitle="Good Morning!"
                      />
                    </Col>
                  )}
                </Row>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12} lg={12}>
                    <MemoizedBoxCard
                      // warningFlag={true}
                      locationStyle={"up"}
                      title="Approval Requests"
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
            <br />
            {checkRoleMatch(roles, 4) && (
              <>
                <Row gutter={[16, 16]}>
                  {firstMatchedRole === 4 && (
                    <Col xs={24} md={24} lg={24}>
                      <TextCard
                        className="smallCard"
                        title={
                          <>
                            <span id="greeting-text-LM">Hi</span>{" "}
                            <span id="user-name-LM">
                              {dashboardData?.title}
                            </span>
                            ,
                          </>
                        }
                        subtitle="Good Morning!"
                      />
                    </Col>
                  )}
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
                      boxes={complianceOfficerMyActions}
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
            <br />
            {checkRoleMatch(roles, 5) && (
              <>
                <Row gutter={[16, 16]}>
                  {firstMatchedRole === 5 && (
                    <Col xs={24} md={24} lg={24}>
                      <TextCard
                        className="smallCard"
                        title={
                          <>
                            <span id="greeting-text-LM">Hi</span>{" "}
                            <span id="user-name-LM">
                              {dashboardData?.title}
                            </span>
                            ,
                          </>
                        }
                        subtitle="Good Morning!"
                      />
                    </Col>
                  )}
                </Row>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12} lg={12}>
                    <MemoizedBoxCard
                      // warningFlag={true}
                      locationStyle={"up"}
                      title="Escalated Approvals"
                      buttonId={"Reconcile-transactions-view-btn-hta"}
                      mainClassName={"mediumHomeCard"}
                      boxes={headofApprovalEscalatedRequest}
                      buttonTitle={"See More"}
                      buttonClassName={"big-white-card-button"}
                      userRole={"HTA"}
                      route={"escalated"}
                    />
                  </Col>

                  <Col xs={24} md={12} lg={12}>
                    <MemoizedBoxCard
                      buttonId={"my-action-view-btn-hca"}
                      locationStyle={"up"}
                      title="My Actions"
                      mainClassName={"mediumHomeCard"}
                      boxes={headofComplianceFlowMyAction}
                      buttonTitle={"See More"}
                      buttonClassName={"big-white-card-button"}
                      userRole={"HTA"}
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
                      userRole={"HTA"}
                      route={"reports"}
                    />
                  </Col>
                </Row>
              </>
            )}
            <br />
            {checkRoleMatch(roles, 6) && (
              <>
                <Row gutter={[16, 16]}>
                  {firstMatchedRole === 6 && (
                    <Col xs={24} md={24} lg={24}>
                      <TextCard
                        className="smallCard"
                        title={
                          <>
                            <span id="greeting-text-LM">Hi</span>{" "}
                            <span id="user-name-LM">
                              {dashboardData?.title}
                            </span>
                            ,
                          </>
                        }
                        subtitle="Good Morning!"
                      />
                    </Col>
                  )}
                </Row>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12} lg={12}>
                    <MemoizedBoxCard
                      // warningFlag={true}
                      locationStyle={"up"}
                      title="Verification Requests"
                      buttonId={"Reconcile-transactions-view-btn-hca"}
                      mainClassName={"mediumHomeCard"}
                      boxes={headofComplianceOfficerVerificationRequest}
                      buttonTitle={"See More"}
                      buttonClassName={"big-white-card-button"}
                      userRole={"HCA"}
                      route={"verification"}
                    />
                  </Col>

                  <Col xs={24} md={12} lg={12}>
                    <MemoizedBoxCard
                      buttonId={"my-action-view-btn-hca"}
                      locationStyle={"up"}
                      title="My Actions"
                      mainClassName={"mediumHomeCard"}
                      boxes={headofComplianceOfficerMyActions}
                      buttonTitle={"See More"}
                      buttonClassName={"big-white-card-button"}
                      userRole={"HCA"}
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
                      userRole={"HCA"}
                      route={"reports"}
                    />
                  </Col>
                </Row>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Home;
