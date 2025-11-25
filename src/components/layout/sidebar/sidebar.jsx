// src/components/SideBar/SideBar.jsx
import React, { useEffect } from "react";
import { Layout, Menu, Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

// Assets
import MenuIcon from "../../../assets/img/menu-side-bar.png";
import BackArrowIcon from "../../../assets/img/back-arrow-side-bar.png";

// Contexts
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useDashboardContext } from "../../../context/dashboardContaxt";

// Utilities
import sidebarItems, { routeMap } from "./utils";

// Styles
import "./sidebar.css";

const { Sider } = Layout;
const ROOT_KEY = "0"; // Default root menu key

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar state/context
  const { collapsed, setCollapsed, selectedKey, setSelectedKey } =
    useSidebarContext();

  // Dashboard context states
  const {
    employeeBasedBrokersData,
    setEmployeeBasedBrokersData,
    allInstrumentsData,
    setAllInstrumentsData,
    assetTypeListingData,
    setAssetTypeListingData,
    getAllPredefineReasonData,
    setGetAllPredefineReasonData,
    currentRoleIsAdmin,
  } = useDashboardContext();

  // Roles
  const roles = JSON.parse(sessionStorage.getItem("user_assigned_roles")) || [];
  const allRoleIDs = roles.map((role) => role.roleID);

  /**
   * 🔄 Restore state after browser reload
   */
  useEffect(() => {
    try {
      const navigationEntries = performance.getEntriesByType("navigation");

      if (navigationEntries.length > 0) {
        const navigationType = navigationEntries[0].type;

        if (navigationType === "reload") {
          // Restore sidebar key
          const lastSelectedKey = sessionStorage.getItem("selectedKey");
          if (lastSelectedKey) {
            console.log("Navigating");
            setSelectedKey(lastSelectedKey);
            if (lastSelectedKey !== ROOT_KEY) setCollapsed(true);
            sessionStorage.removeItem("selectedKey");
          }

          // Restore cached dashboard data
          const restoreAndRemove = (key, setter) => {
            const data = JSON.parse(sessionStorage.getItem(key));
            if (data) {
              setter(data);
              sessionStorage.removeItem(key);
            }
          };

          restoreAndRemove(
            "employeeBasedBrokersData",
            setEmployeeBasedBrokersData
          );
          restoreAndRemove("allInstrumentsData", setAllInstrumentsData);
          if (lastSelectedKey === "0") {
            restoreAndRemove("assetTypeListingData", setAssetTypeListingData);
          }
          restoreAndRemove(
            "getAllPredefineReasonData",
            setGetAllPredefineReasonData
          );

          console.log("🔄 State restored after reload");
        }
      }
    } catch (error) {
      console.error("❌ Error restoring state after reload:", error);
    }
  }, [
    setSelectedKey,
    setEmployeeBasedBrokersData,
    setAllInstrumentsData,
    setAssetTypeListingData,
    setGetAllPredefineReasonData,
  ]);

  /**
   * 💾 Save sidebar state before page unload
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedKey !== ROOT_KEY) {
        setCollapsed(true);

        // Save sidebar key
        sessionStorage.setItem("selectedKey", selectedKey);

        // Save dashboard context data
        sessionStorage.setItem(
          "employeeBasedBrokersData",
          JSON.stringify(employeeBasedBrokersData)
        );
        sessionStorage.setItem(
          "allInstrumentsData",
          JSON.stringify(allInstrumentsData)
        );
        sessionStorage.setItem(
          "assetTypeListingData",
          JSON.stringify(assetTypeListingData)
        );
        sessionStorage.setItem(
          "getAllPredefineReasonData",
          JSON.stringify(getAllPredefineReasonData)
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    selectedKey,
    employeeBasedBrokersData,
    allInstrumentsData,
    assetTypeListingData,
    getAllPredefineReasonData,
  ]);

  /**
   * 🔗 Sync sidebar with current route (handles browser back/forward)
   */
  const pathToKey = Object.entries(routeMap).reduce((acc, [key, path]) => {
    acc[path] = key;
    return acc;
  }, {});

  useEffect(() => {
    const currentKey = pathToKey[location.pathname] || ROOT_KEY;
    if (currentKey !== selectedKey) {
      console.log("Navigating");
      if (
        (currentKey === "5" &&
          (location.pathname !== "/PAD/reports/my-trade-approvals" ||
            location.pathname !== "/PAD/reports/my-transactions" ||
            location.pathname !== "/PAD/reports/my-trade-approvals-standing" ||
            location.pathname !== "/PAD/reports/my-compliance-approvals")) ||
        (currentKey === "8" &&
          (location.pathname !== "/PAD/lm-reports/lm-pending-request" ||
            location.pathname !== "/PAD/lm-reports/lm-tradeapproval-request"))
      ) {
        setSelectedKey(currentKey);
      }
    }
  }, [location.pathname, selectedKey, setSelectedKey, pathToKey]);

  // useEffect(() => {}, [currentRoleIsAdmin]);

  return (
    <Sider
      collapsedWidth={66}
      width={263}
      collapsed={collapsed}
      trigger={null}
      prefixCls={`sidebar-container ${collapsed ? "collapsed" : "expanded"}`}
    >
      {/* 🔘 Toggle Button */}
      <div
        className={`toggle-button-container ${
          collapsed ? "collapsed" : "expanded"
        }`}
      >
        <Button
          type="text"
          disabled={selectedKey !== ROOT_KEY}
          onClick={() => setCollapsed(!collapsed)}
          className="toggle-button"
          icon={
            <img
              draggable={false}
              src={collapsed ? MenuIcon : BackArrowIcon}
              alt={collapsed ? "Open Menu" : "Collapse Menu"}
              className="toggle-icon"
            />
          }
        />
      </div>

      {/* 📜 Scrollable Sidebar Menu */}
      <div className="menu-scroll-container">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onSelect={({ key }) => {
            console.log("Navigating");
            setSelectedKey(key);

            // Collapse automatically if not root
            if (key !== ROOT_KEY) setCollapsed(true);

            const path = routeMap[key];
            if (path) navigate(path);
          }}
          items={sidebarItems(
            collapsed,
            allRoleIDs,
            selectedKey,
            currentRoleIsAdmin
          )}
          inlineCollapsed={collapsed}
          inlineIndent={20}
          prefixCls="custom-menu"
        />
      </div>
    </Sider>
  );
};

export default SideBar;
