import React, { useEffect, useRef } from "react";
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

const Home = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const { dashboardData, setDashboardData } = useDashboardContext();
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const roles=JSON.parse(sessionStorage.getItem("user_assigned_roles"));

  // Prevent multiple fetches on mount
  const hasFetched = useRef(false);

  useEffect(() => {
    // if (hasFetched.current) return;
    // hasFetched.current = true;

    const fetchData = async () => {
      if (!roles || roles.length === 0) {
        hasFetched.current = false;
        return;
      }

      try {
        const data = await GetUserDashBoardStats({
          callApi,
          showNotification,
          showLoader,
          navigate
        });
        // Handle session expiration
        console.log("res", data);
        if (!data) return;

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

        console.log("GetUserDashBoardStats", filteredData);
        setDashboardData(filteredData);
      } catch (error) {
        console.error("Failed to fetch home summary", error);
      }
    };

    fetchData();
  }, []);
  console.log("Failed to fetch home summary", dashboardData);

  return (
    <div style={{ padding: " 16px 24px 0px 24px " }}>
      {checkRoleMatch(roles, 2) && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={16}>
              <TextCard
                className="smallCard"
                title={`Hi ${dashboardData?.title},`}
                subtitle="Good Morning!"
              />
            </Col>

            <Col xs={24} md={12} lg={8}>
              <BoxCard
                locationStyle={"down"}
                title={"Portfolio"}
                mainClassName={"smallShareHomeCard"}
                boxes={dashboardData?.employee?.portfolio?.data}
                buttonTitle={"View Portfolio"}
                buttonClassName={"big-white-card-button"}
                userRole={"employee"}
                route={"portfolio"}
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={12}>
              <BoxCard
                locationStyle={"up"}
                title="My Approvals"
                mainClassName={"mediumHomeCard"}
                boxes={dashboardData?.employee?.myApprovals?.data}
                buttonTitle={"See More"}
                buttonClassName={"big-white-card-button"}
                userRole={"employee"}
                route={"approvals"}
              />
            </Col>

            <Col xs={24} md={12} lg={12}>
              <BoxCard
                locationStyle={"up"}
                title="My Transactions"
                mainClassName={"mediumHomeCard"}
                boxes={dashboardData?.employee?.myTransactions?.data}
                buttonTitle={"See More"}
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
                buttonClassName={"big-white-card-button"}
                userRole={"employee"}
                route={"history"}
              />
            </Col>
            <Col sxs={24} md={12} lg={12}>
              <ReportCard
                mainClassName={"home-reprot-card"}
                title="Reports"
                buttonTitle={"See More"}
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
    </div>
  );
};

export default Home;
