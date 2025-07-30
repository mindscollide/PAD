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

const sidebarItems = (collapsed, userRoles = [], selectedKey) => {
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
    employee: {
      title: "Employee",
      items: [
        {
          key: "1",
          icon: (
            <img
              src={getIcon("1", ApprovalLightIcon, ApprovalDarkIcon)}
              alt="My Approvals"
              className={getIconClasses()}
            />
          ),
          label: "My Approvals",
        },
        {
          key: "2",
          icon: (
            <img
              src={getIcon("2", TransactionLightIcon, TransactionDarkIcon)}
              alt="My Transactions"
              className={getIconClasses()}
            />
          ),
          label: "My Transactions",
        },
        {
          key: "3",
          icon: (
            <img
              src={getIcon("3", HistoryLightIcon, HistoryDarkIcon)}
              alt="My History"
              className={getIconClasses()}
            />
          ),
          label: "My History",
        },
        {
          key: "4",
          icon: (
            <img
              src={getIcon("4", PortfolioLightIcon, PortfolioDarkIcon)}
              alt="Portfolio"
              className={getIconClasses()}
            />
          ),
          label: "Portfolio",
        },
        {
          key: "5",
          icon: (
            <img
              src={getIcon("5", ReportsLightIcon, ReportsDarkIcon)}
              alt="Reports"
              className={getIconClasses()}
            />
          ),
          label: "Reports",
        },
      ],
    },
    lineManager: {
      title: "Line Manager",
      items: [
        {
          key: "6",
          icon: (
            <img
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
              src={getIcon("8", ReportsLightIcon, ReportsDarkIcon)}
              alt="Reports"
              className={getIconClasses()}
            />
          ),
          label: "Reports",
        },
      ],
    },
    complianceOfficer: {
      title: "Compliance Officer",
      items: [
        {
          key: "9",
          icon: (
            <img
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
              src={getIcon("11", ReportsLightIcon, ReportsDarkIcon)}
              alt="Reports"
              className={getIconClasses()}
            />
          ),
          label: "Reports",
        },
      ],
    },
    headOfTrade: {
      title: "Head of Trade Approval",
      items: [
        {
          key: "12",
          icon: (
            <img
              src={getIcon(
                "12",
                ApprovalRequestLightIcon,
                ApprovalRequestDarkIcon
              )}
              alt="Escalated Trade Approval Requests"
              className={getIconClasses()}
            />
          ),
          label: "Escalated Trade Approval Requests",
        },
        {
          key: "13",
          icon: (
            <img
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
              src={getIcon("14", ReportsLightIcon, ReportsDarkIcon)}
              alt="Reports"
              className={getIconClasses()}
            />
          ),
          label: "Reports",
        },
      ],
    },
    headOfCompliance: {
      title: "Head of Compliance",
      items: [
        {
          key: "15",
          icon: (
            <img
              src={getIcon("15", VerificationsLightIcon, VerificationsDarkIcon)}
              alt="Escalated Trade Approval Verifications"
              className={getIconClasses()}
            />
          ),
          label: "Escalated Trade Approval Verifications",
        },
        {
          key: "16",
          icon: (
            <img
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
  const visibleSections = Object.entries(roleSections)
    .filter(([role]) => userRoles.includes(role))
    .map(([_, section]) => section);

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

  // Add FAQ item
  resultItems.push({
    key: "faq",
    icon: (
      <img
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
  "1": "/PAD/approvals",
  "2": "/PAD/transactions",
  "3": "/PAD/history",
  "4": "/PAD/portfolios",
  "5": "/PAD/reports",
  "6": "/PAD/approval-requests",
  "7": "/PAD/my-actions",
  "8": "/PAD/reports",                   // Reuse or change path if needed
  "9": "/PAD/reconcile-transactions",
  "10": "/PAD/my-actions",
  "11": "/PAD/reports",
  "12": "/PAD/escalated-requests",
  "13": "/PAD/my-actions",
  "14": "/PAD/reports",
  "15": "/PAD/escalated-verifications",
  "16": "/PAD/my-actions",
  "17": "/PAD/reports",
  faq: "/PAD/faq",
};
