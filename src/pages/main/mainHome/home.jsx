import React, { useEffect, useRef } from "react";
import { Avatar, Col, Row } from "antd";
import { BarChartOutlined, FileDoneOutlined } from "@ant-design/icons";

// Reusable components
import { BoxCard, ReportCard, TextCard } from "../../../components";

// API call
import { GetUserDashBoardStats } from "../../../api/dashboardApi";

// Custom hooks and context
import useNotification from "antd/es/notification/useNotification";
import { useApi } from "../../../context/ApiContext";
import { useDashboardContext } from "../../../context/dashboardContaxt";
import { useUserProfileContext } from "../../../context/userProfileContext";

// Utility for mapping roles to keys
import { roleKeyMap } from "./utills";

const Home = () => {
  const { showNotification } = useNotification();
  const { dashboardData, setDashboardData } = useDashboardContext();
  const { callApi } = useApi();
  const { roles, setRoles } = useUserProfileContext();

  // Prevent multiple fetches on mount
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      if (!roles || roles.length === 0) {
        hasFetched.current = false;
        return;
      }

      try {
        const data = await GetUserDashBoardStats({ callApi, showNotification });
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

        setDashboardData(filteredData);
      } catch (error) {
        console.error("Failed to fetch home summary", error);
      }
    };

    fetchData();
  }, [roles]);

  return (
    <div style={{ padding: " 24px " }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={16}>
          <TextCard
            className="smallCard"
            title="Hi Shawn,"
            subtitle="Good Morning!"
          />
        </Col>

        <Col xs={24} md={12} lg={8}>
          <BoxCard
            locationStyle={"down"}
            title="Portfolio"
            mainClassName={"smallShareHomeCard"}
            boxes={[
              {
                count: 50322200,
                label: "No. of Shares",
                type: "Shares",
                textAlign: "right",
              },
              // { count: 2, label: "Declined", type: "Declined" },
              // { count: 1, label: "Verifications", type: "Verifications" },
            ]}
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
            boxes={[
              {
                count: 5,
                label: "APPROVED",
                type: "APPROVED",
                textAlign: "center",
              },
              {
                count: 2,
                label: "DECLINED",
                type: "DECLINED",
                textAlign: "center",
              },
              {
                count: 3,
                label: "PENDING",
                type: "PENDING",
                textAlign: "center",
              },
            ]}
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
            boxes={[
              {
                count: 10,
                label: "COMPLIANT",
                type: "COMPLIANT",
                textAlign: "center",
              },
              {
                count: 2,
                label: "NON-COMPLIANT",
                type: "noncomplaint",
                textAlign: "center",
              },
              // { count: 1, label: "Verifications", type: "Verifications" },
            ]}
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
            boxes={[
              {
                count: 15,
                label: "TOTAL APPROVAL",
                type: "APPROVAL",
                textAlign: "center",
              },
              {
                count: 2,
                label: "TOTAL VERIFICATIONS",
                type: "VERIFICATIONS",
                textAlign: "center",
              },
            ]}
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
    </div>
  );
};

export default Home;
