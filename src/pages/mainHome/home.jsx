import React, { useEffect, useRef, useMemo, useState } from "react";
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
    setAllBrokersData,
    setAllInstrumentsData,
    setAssetTypeListingData,
    setGetAllPredefineReasonData,
    urgentAlert,
    setUrgentAlert,
  } = useDashboardContext();
  const { setWebNotificationData, webNotificationDataMqtt } =
    useWebNotification();
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const roles = JSON.parse(sessionStorage.getItem("user_assigned_roles"));
  // Prevent multiple fetches on mount
  const hasFetched = useRef(false);
  const userRoleIDs = roles.map((r) => r.roleID);

  // remove role 1 if present
  const filteredRoles = userRoleIDs.filter((id) => id !== 1);

  // find the first valid matched role (ignoring 1)
  const firstMatchedRole = filteredRoles.find((roleId) =>
    checkRoleMatch(roles, roleId),
  );
  // Employee
  const employeeApprovals = useMemo(
    () => dashboardData?.employee?.myApprovals?.data || [],
    [dashboardData?.employee?.myApprovals?.data],
  );
  const employeePortfolio = useMemo(
    () => dashboardData?.employee?.portfolio?.data || [],
    [dashboardData?.employee?.portfolio?.data],
  );
  const employeeMyHistory = useMemo(
    () => dashboardData?.employee?.myHistory?.data || [],
    [dashboardData?.employee?.myHistory?.data],
  );
  const employeeTransactions = useMemo(
    () => dashboardData?.employee?.myTransactions?.data || [],
    [dashboardData?.employee?.myTransactions?.data],
  );
  const employeeReports = useMemo(
    () => dashboardData?.employee?.reports?.data || [],
    [dashboardData?.employee?.reports?.data],
  );
  // Lime Manager
  const lineManagerApprovals = useMemo(
    () => dashboardData?.lineManager?.myApprovals?.data || [],
    [dashboardData?.lineManager?.myApprovals?.data],
  );
  const lineManagerAction = useMemo(
    () => dashboardData?.lineManager?.myActions?.data || [],
    [dashboardData?.lineManager?.myActions?.data],
  );
  const lineManagerReports = useMemo(
    () => dashboardData?.lineManager?.reports?.data || [],
    [dashboardData?.lineManager?.reports?.data],
  );
  // Compliance Officer
  const complianceOfficerMyActions = useMemo(
    () => dashboardData?.complianceOfficer?.myActions?.data || [],
    [dashboardData?.complianceOfficer?.myActions?.data],
  );
  const complianceOfficerReconsileTransactions = useMemo(
    () => dashboardData?.complianceOfficer?.myApprovals?.data || [],
    [dashboardData?.complianceOfficer?.myApprovals?.data],
  );
  const complianceOfficerReports = useMemo(
    () => dashboardData?.complianceOfficer?.reports?.data || [],
    [dashboardData?.complianceOfficer?.reports?.data],
  );
  // head Of Compliance Approval
  const headofComplianceOfficerMyActions = useMemo(
    () => dashboardData?.headofComplianceOfficer?.myActions?.data || [],
    [dashboardData?.headofComplianceOfficer?.myActions?.data],
  );
  const headofComplianceOfficerVerificationRequest = useMemo(
    () =>
      dashboardData?.headofComplianceOfficer?.verificationRequests?.data || [],
    [dashboardData?.headofComplianceOfficer?.verificationRequests?.data],
  );
  const headofComplianceOfficerReports = useMemo(
    () => dashboardData?.headofComplianceOfficer?.reports?.data || [],
    [dashboardData?.headofComplianceOfficer?.reports?.data],
  );
  // This is For HTA Dashboard
  const headofComplianceFlowMyAction = useMemo(
    () => dashboardData?.headofTradeApproval?.myActions?.data || [],
    [dashboardData?.headofTradeApproval?.myActions?.data],
  );

  // This is For HTA Dashboard Verification Request
  const headofApprovalEscalatedRequest = useMemo(
    () => dashboardData?.headofTradeApproval?.escalatedApprovals?.data || [],
    [dashboardData?.headofTradeApproval?.escalatedApprovals?.data],
  );
  const headofApprovalReports = useMemo(
    () => dashboardData?.headofTradeApproval?.reports?.data || [],
    [dashboardData?.headofTradeApproval?.reports?.data],
  );

  // Admin
  const policyAssign = useMemo(
    () => dashboardData?.admin?.policyAssignedToUsers?.data || [],
    [dashboardData?.admin?.policyAssignedToUsers?.data],
  );
  const instrument = useMemo(
    () => dashboardData?.admin?.instruments?.data || [],
    [dashboardData?.admin?.instruments?.data],
  );
  const brokers = useMemo(
    () => dashboardData?.admin?.brokers?.data || [],
    [dashboardData?.admin?.brokers?.data],
  );
  const groupPolicy = useMemo(
    () => dashboardData?.admin?.groupPolicies?.data || [],
    [dashboardData?.admin?.groupPolicies?.data],
  );
  const reports = useMemo(
    () => dashboardData?.admin?.reports?.data || [],
    [dashboardData?.admin?.reports?.data],
  );

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
        setAllBrokersData,
        setAllInstrumentsData,
        setAssetTypeListingData,
        setGetAllPredefineReasonData,
        setWebNotificationData,
        showNotification,
        showLoader,
        webNotificationDataMqtt,
        navigate,
      });
      // Handle session expiration
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
      await setDashboardData(filteredData);
    } catch (error) {
      showLoader(false);
      console.error("Failed to fetch home summary", error);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    if (userRoleIDs.includes(3)) {
      const urgent_flag = JSON.parse(sessionStorage.getItem("urgent_flag"));

      if (urgent_flag) {
        setUrgentAlert(true);
      } else {
        setUrgentAlert(false);
      }
    }

    fetchData();
  }, []);

  // useEffect(() => {}, [dashboardData]);
  // roles = dynamic roles array (e.g. [{ roleID: 1 }, { roleID: 3 }])

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
                  mainClassName={"smallShareHomeCard2"}
                  boxes={policyAssign}
                  buttonTitle={"See More"}
                  buttonId={"policy-assign-view-btn-admin"}
                  buttonClassName={"big-white-card-button"}
                  userRole={"Admin"}
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
                  boxes={instrument}
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
                  boxes={brokers}
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
                  boxes={groupPolicy}
                  buttonTitle="See More"
                  buttonClassName={"big-white-card-button"}
                  buttonId={"group-policy-view-btn-admin"}
                  userRole="Admin"
                  route="grouppolicies"
                />
              </Col>
              <Col xs={24} md={12} lg={12}>
                <MemoizedReportCard
                  mainClassName="home-reprot-card"
                  title="Reports"
                  buttonTitle="See More"
                  buttonClassName={"big-white-card-button"}
                  data={reports}
                  buttonId={"Reports-view-btn-admin"}
                  rowButtonClassName={"small-card-light-button"}
                  userRole={"Admin"}
                  route={"reports"}
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
                    <Col xs={24} md={12} lg={12}>
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

                  <Col xs={24} md={12} lg={12}>
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
                    <MemoizedBoxCard
                      locationStyle={"side"}
                      title="My History"
                      mainClassName={"mediumHomeSideCard"}
                      boxes={employeeMyHistory}
                      buttonTitle={"See More"}
                      buttonId={"History-view-btn"}
                      buttonClassName={"big-white-card-button"}
                      userRole={"employee"}
                      route={"history"}
                    />
                  </Col>
                  <Col xs={24} md={12} lg={12}>
                    <MemoizedReportCard
                      mainClassName={"home-reprot-card"}
                      title="Reports"
                      buttonTitle={"See More"}
                      buttonId={"Reports-view-btn-employee"}
                      buttonClassName={"big-white-card-button"}
                      rowButtonClassName={"small-card-light-button"}
                      data={employeeReports}
                      userRole={"employee"}
                      route={"reports"}
                    />
                  </Col>
                </Row>
              </>
            )}
            {filteredRoles?.length > 1 && <br />}
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
                      setUrgentAlert={setUrgentAlert}
                      warningFlag={urgentAlert}
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
                    <MemoizedReportCard
                      mainClassName={"home-reprot-card"}
                      title="Reports"
                      buttonTitle={"See More"}
                      buttonId={"Reports-view-btn-LM"}
                      buttonClassName={"big-white-card-button"}
                      rowButtonClassName={"small-card-light-button"}
                      data={lineManagerReports}
                      userRole={"LM"}
                      route={"reports"}
                    />
                  </Col>
                </Row>
              </>
            )}
            {filteredRoles?.length > 1 && <br />}
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
                    <MemoizedReportCard
                      mainClassName={"home-reprot-card"}
                      title="Reports"
                      buttonTitle={"See More"}
                      buttonId={"Reports-view-btn-co"}
                      buttonClassName={"big-white-card-button"}
                      rowButtonClassName={"small-card-light-button"}
                      data={complianceOfficerReports}
                      userRole={"CO"}
                      route={"reports"}
                    />
                  </Col>
                </Row>
              </>
            )}
            {filteredRoles?.length > 1 && <br />}
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
                    <MemoizedReportCard
                      mainClassName={"home-reprot-card"}
                      title="Reports"
                      buttonTitle={"See More"}
                      buttonId={"Reports-view-btn-hta"}
                      buttonClassName={"big-white-card-button"}
                      rowButtonClassName={"small-card-light-button"}
                      data={headofApprovalReports}
                      userRole={"HTA"}
                      route={"reports"}
                    />
                  </Col>
                </Row>
              </>
            )}
            {filteredRoles?.length > 1 && <br />}
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
                    <MemoizedReportCard
                      mainClassName={"home-reprot-card"}
                      title="Reports"
                      buttonTitle={"See More"}
                      buttonId={"Reports-view-btn-hca"}
                      buttonClassName={"big-white-card-button"}
                      rowButtonClassName={"small-card-light-button"}
                      data={headofComplianceOfficerReports}
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
