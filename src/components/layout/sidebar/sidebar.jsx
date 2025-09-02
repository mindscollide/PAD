import React, { useEffect, useState } from "react";
import { Layout, Menu, Button } from "antd";
import MenuIcon from "../../../assets/img/menu-side-bar.png";
import BackArrowIcon from "../../../assets/img/back-arrow-side-bar.png";
import "./sidebar.css";

import sidebarItems, { routeMap } from "./utils";
import { useNavigate } from "react-router-dom";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useDashboardContext } from "../../../context/dashboardContaxt";

const { Sider } = Layout;

const SideBar = () => {
  const navigate = useNavigate(); // ✅ Add navigate hook
  const { collapsed, setCollapsed, selectedKey, setSelectedKey } =
    useSidebarContext();
  const {
    employeeBasedBrokersData,
    setEmployeeBasedBrokersData,
    allInstrumentsData,
    setAllInstrumentsData,
    addApprovalRequestData,
    setAddApprovalRequestData,
    getAllPredefineReasonData,
    setGetAllPredefineReasonData,
  } = useDashboardContext();
  let roles = JSON.parse(sessionStorage.getItem("user_assigned_roles"));
  const allRoleIDs = roles.map((role) => role.roleID);
  /**
   * Restores the last selected sidebar key from sessionStorage after a full page reload.
   */
  useEffect(() => {
    try {
      // Get browser navigation entries (used to detect reload)
      const navigationEntries = performance.getEntriesByType("navigation");

      if (navigationEntries.length > 0) {
        const navigationType = navigationEntries[0].type;

        if (navigationType === "reload") {
          // Check sessionStorage for previously saved selectedKey
          const lastSelectedKey = sessionStorage.getItem("selectedKey");
          let getEmployeeBasedBrokersData = JSON.parse(
            sessionStorage.getItem("employeeBasedBrokersData")
          );
          let getAllInstrumentsData = JSON.parse(
            sessionStorage.getItem("allInstrumentsData")
          );
          let getAllAddTradeApprovalData = JSON.parse(
            sessionStorage.getItem("addApprovalRequestData")
          );
          let getAllPredefineReasonNewData = JSON.parse(
            sessionStorage.getItem("getAllPredefineReasonData")
          );

          if (lastSelectedKey) {
            setSelectedKey(lastSelectedKey); // Restore key to context
            if (lastSelectedKey !== "0") {
              setCollapsed(true);
            }
            sessionStorage.removeItem("selectedKey"); // Clear it after usage
          }
          if (getEmployeeBasedBrokersData) {
            setEmployeeBasedBrokersData(getEmployeeBasedBrokersData); // Restore key to context
            sessionStorage.removeItem("employeeBasedBrokersData"); // Clear it after usage
          }
          if (getAllInstrumentsData) {
            setAllInstrumentsData(getAllInstrumentsData); // Restore key to context
            sessionStorage.removeItem("allInstrumentsData"); // Clear it after usage
          }
          if (getAllAddTradeApprovalData) {
            setAddApprovalRequestData(getAllAddTradeApprovalData); // Restore key to context
            sessionStorage.removeItem("addApprovalRequestData"); // Clear it after usage
          }
          if (getAllPredefineReasonNewData) {
            setGetAllPredefineReasonData(getAllPredefineReasonNewData); // Restore key to context
            sessionStorage.removeItem("getAllPredefineReasonData"); // Clear it after usage
          }

          console.log("🔄 Page was reloaded by browser.");
        } else if (navigationType === "navigate") {
          console.log("🚀 Initial page load or route navigation.");
        }
      }
    } catch (error) {
      console.error(
        "❌ Error detecting page reload or restoring state:",
        error
      );
    }
  }, [setSelectedKey]);

  /**
   * Saves the currently selected sidebar key to sessionStorage
   * before the page is refreshed or closed.
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedKey !== "0") {
        setCollapsed(true);
        sessionStorage.setItem("selectedKey", selectedKey);
        sessionStorage.setItem(
          "employeeBasedBrokersData",
          JSON.stringify(employeeBasedBrokersData)
        );
        sessionStorage.setItem(
          "allInstrumentsData",
          JSON.stringify(allInstrumentsData)
        );
        sessionStorage.setItem(
          "addApprovalRequestData",
          JSON.stringify(addApprovalRequestData)
        );
        sessionStorage.setItem(
          "getAllPredefineReasonData",
          JSON.stringify(getAllPredefineReasonData)
        );
      }

      // Optional: Show confirmation dialog (only in some browsers)
      // e.preventDefault();
      // e.returnValue = '';
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedKey]);
  console.log("selectedKey", selectedKey);
  console.log("selectedKey", collapsed);

  return (
    <Sider
      collapsedWidth={66}
      width={263}
      collapsed={collapsed}
      trigger={null}
      prefixCls={`${"sidebar-container"} ${
        collapsed ? "collapsed" : "expanded"
      }`}
    >
      <div
        className={`${"toggle-button-container"} ${
          collapsed ? "collapsed" : "expanded"
        }`}
      >
        <Button
          type="text"
          disabled={selectedKey !== "0"}
          onClick={() => setCollapsed(!collapsed)}
          className={"toggle-button"}
          icon={
            <img
              src={collapsed ? MenuIcon : BackArrowIcon}
              alt={collapsed ? "Open Menu" : "Collapse Menu"}
              className={"toggle-icon"}
            />
          }
        />
      </div>

      {/* Scrollable Menu Area */}
      <div className={"menu-scroll-container"}>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[""]}
          selectedKeys={[selectedKey]}
          onSelect={({ key }) => {
            setSelectedKey(key);

            // collapse automatically if key is not "0"
            if (key !== "0") {
              setCollapsed(true);
            }
            const path = routeMap[key]; // ✅ Correct usage
            if (path) navigate(path); // ✅ Navigation
          }}
          items={sidebarItems(collapsed, allRoleIDs, selectedKey)}
          inlineCollapsed={collapsed}
          inlineIndent={20}
          prefixCls={"custom-menu"}
        />
      </div>
    </Sider>
  );
};

export default SideBar;
