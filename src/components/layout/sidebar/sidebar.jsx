import React, { useEffect, useState } from "react";
import { Layout, Menu, Button } from "antd";
import MenuIcon from "../../../assets/img/menu-side-bar.png";
import BackArrowIcon from "../../../assets/img/back-arrow-side-bar.png";
import "./sidebar.css";

import sidebarItems, { routeMap } from "./utils";
import { useNavigate } from "react-router-dom";
import { useSidebarContext } from "../../../context/sidebarContaxt";

const { Sider } = Layout;

const SideBar = () => {
  const navigate = useNavigate(); // ✅ Add navigate hook
  const { collapsed, setCollapsed, selectedKey, setSelectedKey } =
    useSidebarContext();

  /**
   * Restores the last selected sidebar key from localStorage after a full page reload.
   */
  useEffect(() => {
    try {
      // Get browser navigation entries (used to detect reload)
      const navigationEntries = performance.getEntriesByType("navigation");

      if (navigationEntries.length > 0) {
        const navigationType = navigationEntries[0].type;

        if (navigationType === "reload") {
          // Check localStorage for previously saved selectedKey
          const lastSelectedKey = localStorage.getItem("selectedKey");

          if (lastSelectedKey) {
            setSelectedKey(lastSelectedKey); // Restore key to context
            localStorage.removeItem("selectedKey"); // Clear it after usage
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
   * Saves the currently selected sidebar key to localStorage
   * before the page is refreshed or closed.
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedKey !== "") {
        localStorage.setItem("selectedKey", selectedKey);
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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // You can do things here like saving state
      if (selectedKey !== "") {
        localStorage.setItem("selectedKey", selectedKey);
      }
      // Optional: Show confirmation dialog (only in some browsers)
      // e.preventDefault();
      // e.returnValue = '';
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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
            const path = routeMap[key]; // ✅ Correct usage
            if (path) navigate(path); // ✅ Navigation
          }}
          items={sidebarItems(
            collapsed,
            [
              "employee",
              // "lineManager", "complianceOfficer", "headOfTrade"
            ],
            selectedKey
          )}
          inlineCollapsed={collapsed}
          inlineIndent={20}
          prefixCls={"custom-menu"}
        />
      </div>
    </Sider>
  );
};

export default SideBar;
