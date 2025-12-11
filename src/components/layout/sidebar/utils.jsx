/**
 * SIDEBAR ITEMS GENERATOR UTILITY
 *
 * This module generates role-based sidebar menu items with:
 * - Dynamic icon switching between light/dark variants based on selection state
 * - Role-based menu item filtering
 * - Proper spacing dividers between role sections
 * - FAQ item always appended at the bottom
 *
 * @param {boolean} collapsed - Whether sidebar is in collapsed state
 * @param {string[]} userRoles - Array of user's assigned roles
 * @param {string} selectedKey - Currently selected menu item key
 * @returns {Array} Menu items array compatible with Ant Design Menu component
 */

// ==============================
// ICON IMPORTS (ORGANIZED BY CATEGORY)
// ==============================

// Action Management Icons
import ActionDarkIcon from "../../../assets/img/action-dark.png";
import ActionLightIcon from "../../../assets/img/action-light.png";

// Approval Management Icons
import ApprovalDarkIcon from "../../../assets/img/approval-dark.png";
import ApprovalLightIcon from "../../../assets/img/approval-light.png";
import ApprovalRequestDarkIcon from "../../../assets/img/approval-request-dark.png";
import ApprovalRequestLightIcon from "../../../assets/img/approvals-request-light.png";

// FAQ Icon
import FaqDarkIcon from "../../../assets/img/faq-dark.png";
import FaqLightIcon from "../../../assets/img/faq-light.png";

// History Tracking Icons
import HistoryDarkIcon from "../../../assets/img/history-dark.png";
import HistoryLightIcon from "../../../assets/img/history-light.png";

// Portfolio Management Icons
import PortfolioDarkIcon from "../../../assets/img/portfolio-dark.png";
import PortfolioLightIcon from "../../../assets/img/portfolio-light.png";

// Reports Icons
import ReportsDarkIcon from "../../../assets/img/reports-dark.png";
import ReportsLightIcon from "../../../assets/img/reports-light.png";

// Transaction Icons
import TransactionDarkIcon from "../../../assets/img/transaction-arrow-dark.png";
import TransactionLightIcon from "../../../assets/img/transaction-arrow-light.png";

// Verification Icons
import VerificationsDarkIcon from "../../../assets/img/verifications-dark.png";
import VerificationsLightIcon from "../../../assets/img/verifications-light.png";

// Admin Icon
import SystemSettingLightIcon from "../../../assets/img/system-setting-light-icon.png";
import SystemSettingDarktIcon from "../../../assets/img/system-setting-dark-icon.png";
import UserLightIcon from "../../../assets/img/user-light-icon.png";
import UserDarkIcon from "../../../assets/img/user-dark-icon.png";
import GroupPoliciesLightIcon from "../../../assets/img/group-policies-light-icon.png";
import GroupPoliciesDarkIcon from "../../../assets/img/group-policies-dark-icon.png";
import BrokerLightIcon from "../../../assets/img/broker-light-icon.png";
import BrokerDarkIcon from "../../../assets/img/broker-dark-icon.png";
import InstrumentsLightIcon from "../../../assets/img/instruments-light-icon.png";
import InstrumentsDarkIcon from "../../../assets/img/instruments-dark-icon.png";
// ==============================
// UTILITY FUNCTIONS
// ==============================

/**
 * Selects appropriate icon based on current selection state
 * @param {string} key - Menu item's unique key
 * @param {string} defaultIcon - Light variant icon (unselected state)
 * @param {string} selectedIcon - Dark variant icon (selected state)
 * @returns {string} The icon path to use
 */

const sidebarItems = (
  collapsed,
  userRoles = [],
  selectedKey,
  currentRoleIsAdmin = false
) => {
  // Helper to get appropriate icon based on selection
  const getIcon = (key, defaultIcon, selectedIcon) =>
    selectedKey === key ? selectedIcon : defaultIcon;

  /**
   * Generates CSS classes for menu icons based on sidebar state
   * @returns {string} Combined CSS classes including:
   * - Base 'menu-icon' class
   * - 'collapsed' or 'expanded' state class
   */
  const getIconClasses = () =>
    `menu-icon ${collapsed ? "collapsed" : "expanded"}`;

  // ==============================
  // COMPLETE ROLE DEFINITIONS
  // ==============================

  /**
   * Complete role-based menu configuration with:
   * - Employee
   * - Line Manager
   * - Compliance Officer
   * - Head of Trade Approval
   * - Head of Compliance
   */
  const roleSections = {
    1: {
      title: "Admin",
      items: [
        {
          key: "18",
          icon: (
            <img
              draggable={false}
              src={getIcon("18", InstrumentsLightIcon, InstrumentsDarkIcon)}
              alt="Instrument"
              className={getIconClasses()}
            />
          ),
          label: "Instrument",
        },
        {
          key: "19",
          icon: (
            <img
              draggable={false}
              src={getIcon("19", BrokerLightIcon, BrokerDarkIcon)}
              alt="Brokers"
              className={getIconClasses()}
            />
          ),
          label: "Brokers",
        },
        {
          key: "20",
          icon: (
            <img
              draggable={false}
              src={getIcon("20", GroupPoliciesLightIcon, GroupPoliciesDarkIcon)}
              alt="Group Policies"
              className={getIconClasses()}
            />
          ),
          label: "Group Policies",
        },
        {
          key: "21",
          icon: (
            <img
              draggable={false}
              src={getIcon("21", UserLightIcon, UserDarkIcon)}
              alt="Users"
              className={getIconClasses()}
            />
          ),
          label: "Users",
        },
        {
          key: "22",
          icon: (
            <img
              draggable={false}
              src={getIcon(
                "22",
                SystemSettingLightIcon,
                SystemSettingDarktIcon
              )}
              alt="System Settings"
              className={getIconClasses()}
            />
          ),
          label: "System Configurations",
        },
        {
          key: "23",
          icon: (
            <img
              draggable={false}
              src={getIcon("23", ReportsLightIcon, ReportsDarkIcon)}
              alt="Reports"
              className={getIconClasses()}
            />
          ),
          label: "Reports",
        },
      ],
    },
    2: {
      title: "Employee",
      items: [
        {
          key: "1",
          icon: (
            <img
              draggable={false}
              src={getIcon("1", ApprovalLightIcon, ApprovalDarkIcon)}
              alt="My Approvals"
              className={getIconClasses()}
              data-testid="employee-my-approvals-icon"
            />
          ),
          label: "My Approvals",
        },
        {
          key: "2",
          icon: (
            <img
              draggable={false}
              src={getIcon("2", TransactionLightIcon, TransactionDarkIcon)}
              alt="My Transactions"
              className={getIconClasses()}
              data-testid="employee-my-transactions-icon"
            />
          ),
          label: "My Transactions",
        },
        {
          key: "3",
          icon: (
            <img
              draggable={false}
              src={getIcon("3", HistoryLightIcon, HistoryDarkIcon)}
              alt="My History"
              className={getIconClasses()}
              data-testid="employee-my-history-icon"
            />
          ),
          label: "My History",
        },
        {
          key: "4",
          icon: (
            <img
              draggable={false}
              src={getIcon("4", PortfolioLightIcon, PortfolioDarkIcon)}
              alt="Portfolio"
              className={getIconClasses()}
              data-testid="employee-portfolio-icon"
            />
          ),
          label: "Portfolio",
        },
        {
          key: "5",
          icon: (
            <img
              draggable={false}
              src={getIcon("5", ReportsLightIcon, ReportsDarkIcon)}
              alt="Reports"
              className={getIconClasses()}
              data-testid="employee-reports-icon"
            />
          ),
          label: "Reports",
        },
      ],
    },
    3: {
      title: "Line Manager",
      items: [
        {
          key: "6",
          icon: (
            <img
              draggable={false}
              src={getIcon(
                "6",
                ApprovalRequestLightIcon,
                ApprovalRequestDarkIcon
              )}
              alt="Approval Requests"
              className={getIconClasses()}
            />
          ),
          label: "Approval Requests",
        },
        {
          key: "7",
          icon: (
            <img
              draggable={false}
              src={getIcon("7", ActionLightIcon, ActionDarkIcon)}
              alt="My Actions"
              className={getIconClasses()}
            />
          ),
          label: "My Actions",
        },
        {
          key: "8",
          icon: (
            <img
              draggable={false}
              src={getIcon("8", ReportsLightIcon, ReportsDarkIcon)}
              alt="Reports"
              className={getIconClasses()}
            />
          ),
          label: "Reports",
        },
      ],
    },
    4: {
      title: "Compliance Officer",
      items: [
        {
          key: "9",
          icon: (
            <img
              draggable={false}
              src={getIcon("9", VerificationsLightIcon, VerificationsDarkIcon)}
              alt="Reconcile Transactions"
              className={getIconClasses()}
            />
          ),
          label: "Reconcile Transactions",
        },
        {
          key: "10",
          icon: (
            <img
              draggable={false}
              src={getIcon("10", ActionLightIcon, ActionDarkIcon)}
              alt="My Actions"
              className={getIconClasses()}
            />
          ),
          label: "My Actions",
        },
        {
          key: "11",
          icon: (
            <img
              draggable={false}
              src={getIcon("11", ReportsLightIcon, ReportsDarkIcon)}
              alt="Reports"
              className={getIconClasses()}
            />
          ),
          label: "Reports",
        },
      ],
    },
    5: {
      title: "Head of Trade Approval",
      items: [
        {
          key: "12",
          icon: (
            <img
              draggable={false}
              src={getIcon("12", VerificationsLightIcon, VerificationsDarkIcon)}
              alt="'Escalated Approvals"
              className={getIconClasses()}
            />
          ),
          label: "'Escalated Approvals",
        },
        {
          key: "13",
          icon: (
            <img
              draggable={false}
              src={getIcon("13", ActionLightIcon, ActionDarkIcon)}
              alt="My Actions"
              className={getIconClasses()}
            />
          ),
          label: "My Actions",
        },
        {
          key: "14",
          icon: (
            <img
              draggable={false}
              src={getIcon("14", ReportsLightIcon, ReportsDarkIcon)}
              alt="Reports"
              className={getIconClasses()}
            />
          ),
          label: "Reports",
        },
      ],
    },
    6: {
      title: "Head of Compliance Approval",
      items: [
        {
          key: "15",
          icon: (
            <img
              draggable={false}
              src={getIcon("15", VerificationsLightIcon, VerificationsDarkIcon)}
              alt="Escalated Transactions Verifications"
              className={getIconClasses()}
            />
          ),
          label: "Escalated Transactions Verifications",
        },
        {
          key: "16",
          icon: (
            <img
              draggable={false}
              src={getIcon("16", ActionLightIcon, ActionDarkIcon)}
              alt="My Actions"
              className={getIconClasses()}
            />
          ),
          label: "My Actions",
        },
        {
          key: "17",
          icon: (
            <img
              draggable={false}
              src={getIcon("17", ReportsLightIcon, ReportsDarkIcon)}
              alt="Reports"
              className={getIconClasses()}
            />
          ),
          label: "Reports",
        },
      ],
    },
  };

  // Filter sections based on user roles
  let visibleSections;

  if (currentRoleIsAdmin) {
    // ✅ Admin only — show only Admin role section
    visibleSections = [roleSections[1]];
  } else {
    // ✅ Regular user — exclude Admin (role 1)
    visibleSections = Object.entries(roleSections)
      .filter(
        ([role]) => userRoles.includes(Number(role)) && Number(role) !== 1
      )
      .map(([_, section]) => section);
  }

  // Build final items array
  const resultItems = [];
  visibleSections.forEach((section, index) => {
    if (index > 0) {
      resultItems.push({
        key: `divider-${index}`,
        type: "divider",
        className: "role-divider",
      });
    }
    resultItems.push(...section.items);
  });
  // Add Spacer before FAQ
  resultItems.push({
    key: "faq-spacer",
    type: "group",
    className: "faq-spacer-group", // You can target this in CSS
  });

  // Add FAQ item
  resultItems.push({
    key: "50",
    icon: (
      <img
        draggable={false}
        src={getIcon("faq", FaqLightIcon, FaqDarkIcon)}
        alt="FAQ"
        className={getIconClasses()}
      />
    ),
    label: "FAQ's",
    className: "menu-faq-item",
  });

  return resultItems;
};

export default sidebarItems;

// src/constants/routeMap.js or wherever you keep your constants

export const routeMap = {
  1: "/PAD/approvals",
  2: "/PAD/transactions",
  3: "/PAD/history",
  4: "/PAD/portfolios",
  5: "/PAD/reports",
  6: "/PAD/lm-approval-requests",
  7: "/PAD/lm-my-actions",
  8: "/PAD/lm-reports", // Reuse or change path if needed
  9: "/PAD/co-reconcile-transactions",
  10: "/PAD/co-my-actions",
  11: "/PAD/co-reports",
  12: "/PAD/hta-escalated-requests",
  13: "/PAD/hta-my-actions",
  14: "/PAD/hta-reports",
  15: "/PAD/hca-escalated-transactions-verifications",
  16: "/PAD/hca-my-actions",
  17: "/PAD/hca-reports",
  18: "/PAD/admin-instruments",
  19: "/PAD/admin-brokers",
  20: "/PAD/admin-group-policies",
  21: "/PAD/admin-users",
  22: "/PAD/admin-system-configurations",
  23: "/PAD/admin-reports",

  50: "/PAD/faq",
};
