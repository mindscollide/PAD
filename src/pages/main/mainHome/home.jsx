import React, { useEffect, useRef, useMemo } from "react";
import { Avatar, Col, Row } from "antd";
import { BarChartOutlined, FileDoneOutlined } from "@ant-design/icons";

// Reusable components
import { BoxCard, DocumentViewer, ReportCard, TextCard } from "../../../components";

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
//  const sampleDocs = [
//     {
//       fileName: "Sample.pdf",
//       mimeType: "application/pdf",
//       base64: "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MCBvYmoKPDwvVHlwZS9QYWdlL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KL1JvdGF0ZSAwL1BhcmVudCAzIDAgUgovUmVzb3VyY2VzPDwvUHJvY1NldFsvUERGIC9UZXh0XQovRXh0R1N0YXRlIDEwIDAgUgovRm9udCAxMSAwIFIKPj4KL0NvbnRlbnRzIDUgMCBSCj4+CmVuZG9iagozIDAgb2JqCjw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbCjQgMCBSCl0gL0NvdW50IDEKPj4KZW5kb2JqCjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMyAwIFIKL01ldGFkYXRhIDEzIDAgUgo+PgplbmRvYmoKNyAwIG9iago8PC9UeXBlL0V4dEdTdGF0ZQovT1BNIDE+PmVuZG9iagoxMCAwIG9iago8PC9SNwo3IDAgUj4+CmVuZG9iagoxMSAwIG9iago8PC9SOAo4IDAgUj4+CmVuZG9iago4IDAgb2JqCjw8L0Jhc2VGb250L01SVlpFVitDb3VyaWVyL0ZvbnREZXNjcmlwdG9yIDkgMCBSL1R5cGUvRm9udAovRmlyc3RDaGFyIDMyL0xhc3RDaGFyIDEyNC9XaWR0aHNbCjYwMCAwIDAgMCAwIDAgMCAwIDYwMCA2MDAgMCAwIDYwMCA2MDAgNjAwIDYwMAo2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDAgMCA2MDAgMCAwCjAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAKNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCAwIDYwMCA2MDAgMCAwIDAgMCAwCjAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgMCA2MDAgNjAwIDYwMCA2MDAgNjAwCjYwMCAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgNjAwIDYwMCA2MDAgMCAwIDYwMF0KL0VuY29kaW5nL1dpbkFuc2lFbmNvZGluZy9TdWJ0eXBlL1R5cGUxPj4KZW5kb2JqCjkgMCBvYmoKPDwvVHlwZS9Gb250RGVzY3JpcHRvci9Gb250TmFtZS9NUlZa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YzlkMCcgeG1sbnM6eG1wPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvJz48eG1wOk1vZGlmeURhdGU+MjAyNS0wNy0yM1QyMzo1ODoxNiswNTowMDwveG1wOk1vZGlmeURhdGU+Cjx4bXA6Q3JlYXRlRGF0ZT4yMDI1LTA3LTIzVDIzOjU4OjE2KzA1OjAwPC94bXA6Q3JlYXRlRGF0ZT4KPHhtcDpDcmVhdG9yVG9vbD5HTlUgRW5zY3JpcHQgMS42LjY8L3htcDpDcmVhdG9yVG9vbD48L3JkZjpEZXNjcmlwdGlvbj4KPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9J3V1aWQ6OGE0ZTljMmEtYTAxMy0xMWZiLTAwMDAtYjMyNzAyM2JjOWQwJyB4bWxuczp4YXBNTT0naHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLycgeGFwTU06RG9jdW1lbnRJRD0ndXVpZDo4YTRlOWMyYS1hMDEzLTExZmItMDAwMC1iMzI3MDIzYmM5ZDAnLz4KPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9J3V1aWQ6OGE0ZTljMmEtYTAxMy0xMWZiLTAwMDAtYjMyNzAyM2JjOWQwJyB4bWxuczpkYz0naHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8nIGRjOmZvcm1hdD0nYXBwbGljYXRpb24vcGRmJz48ZGM6dGl0bGU+PHJkZjpBbHQ+PHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5FbnNjcmlwdCBPdXRwdXQ8L3JkZjpsaT48L3JkZjpBbHQ+PC9kYzp0aXRsZT48ZGM6Y3JlYXRvcj48cmRmOlNlcT48cmRmOmxpPjwvcmRmOmxpPjwvcmRmOlNlcT48L2RjOmNyZWF0b3I+PC9yZGY6RGVzY3JpcHRpb24+CjwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0ndyc/PgplbmRzdHJlYW0KZW5kb2JqCjIgMCBvYmoKPDwvUHJvZHVjZXIoR1BMIEdob3N0c2NyaXB0IDkuMjUpCi9DcmVhdGlvbkRhdGUoRDoyMDI1MDcyMzIzNTgxNiswNScwMCcpCi9Nb2REYXRlKEQ6MjAyNTA3MjMyMzU4MTYrMDUnMDAnKQovVGl0bGUoRW5zY3JpcHQgT3V0cHV0KQovQXV0aG9yKCkKL0NyZWF0b3IoR05VIEVuc2NyaXB0IDEuNi42KT4+ZW5kb2JqCnhyZWYKMCAxNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDQ3MTcgMDAwMDAgbiAKMDAwMDAxMjY0MCAwMDAwMCBuIAowMDAwMDA0NjU4IDAwMDAwIG4gCjAwMDAwMDQ0OTggMDAwMDAgbiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDA0NDc4IDAwMDAwIG4gCjAwMDAwMDQ3ODIgMDAwMDAgbiAKMDAwMDAwNDg4MyAwMDAwMCBuIAowMDAwMDA1MzU2IDAwMDAwIG4gCjAwMDAwMDQ4MjMgMDAwMDAgbiAKMDAwMDAwNDg1MyAwMDAwMCBuIAowMDAwMDA1ODIzIDAwMDAwIG4gCjAwMDAwMTExNTEgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSAxNCAvUm9vdCAxIDAgUiAvSW5mbyAyIDAgUgovSUQgWzxCRkUxNDEzNzYxOUNFRjAyODYyRjk5MjAxMThEM0NGMD48QkZFMTQxMzc2MTlDRUYwMjg2MkY5OTIwMTE4RDNDRjA+XQo+PgpzdGFydHhyZWYKMTI4MjYKJSVFT0YK" // your long base64 string
//     }
//   ];

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
            {/* <div style={{ padding: "16px 24px" }}>
            <h2 style={{ marginTop: "32px" }}>📄 Document Previews</h2>
            {sampleDocs.map((doc, index) => (
              <div key={index} style={{ margin: "12px 0" }}>
                <DocumentViewer
                  base64Data={doc.base64}
                  mimeType={doc.mimeType}
                  fileName={doc.fileName}
                />
              </div>
            ))}
          </div> */}
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