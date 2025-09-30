// src/main.jsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// 🔹 Routes
import router from "./routes/router";

// 🔹 Global styles
import "./index.css";

// 🔹 Context Providers
import { SidebarProvider } from "./context/sidebarContaxt";
import { SearchBarProvider } from "./context/SearchBarContaxt";
import { NotificationProvider } from "./components/NotificationProvider/NotificationProvider";
import { PortfolioProvider } from "./context/portfolioContax";
import { ApiProvider } from "./context/ApiContext";
import { DashboardProvider } from "./context/dashboardContaxt";
import { LoaderProvider } from "./context/LoaderContext";
import { MyApprovalProvider } from "./context/myApprovalContaxt";
import { GlobalModalProvider } from "./context/GlobalModalContext";
import { MyTransactionsProvider } from "./context/myTransaction";

// 🔹 Components
import { Loader } from "./components";
import { ReconcileProvider } from "./context/reconsileContax";
import { MyEscalatedApprovalsProvider } from "./context/escalatedApprovalContext";

/**
 * 🌍 RootComponent
 *
 * The main wrapper for the application. It:
 * - Ensures authentication token exists in `sessionStorage`
 * - Redirects to login if the token is missing
 * - Wraps the app with all required context providers
 */
const RootComponent = () => {
  useEffect(() => {
    /**
     * 🔒 Session Storage Listener
     *
     * Ensures that if `auth_token` is removed from sessionStorage (e.g. logout in another tab),
     * the user is redirected to `/` (login page).
     */
    const handleStorageChange = () => {
      const token = sessionStorage.getItem("auth_token");

      // If no token → redirect to login page
      if (!token && window.location.pathname !== "/") {
        window.history.replaceState(null, "", "/"); // push `/` without reload loop
        window.location.reload(); // full reload to reset app state
      }
    };

    // Listen for sessionStorage changes (cross-tab sync)
    window.addEventListener("storage", handleStorageChange);

    // Run initial check on mount
    handleStorageChange();

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    /**
     * ⚡ Context Providers Wrapping Order
     *
     * Order matters → some contexts depend on others.
     * Example: `LoaderProvider` must wrap components that call `showLoader()`.
     */
    <NotificationProvider>
      <LoaderProvider>
        <GlobalModalProvider>
          <MyApprovalProvider>
            <MyTransactionsProvider>
              <ApiProvider>
                <DashboardProvider>
                  <PortfolioProvider>
                    <ReconcileProvider>
                      <MyEscalatedApprovalsProvider>
                        <SidebarProvider>
                          <SearchBarProvider>
                            {/* 🔹 Main App Router */}
                            <RouterProvider router={router} />
                            {/* 🔹 Global Loader Component */}
                            <Loader />
                          </SearchBarProvider>
                        </SidebarProvider>
                      </MyEscalatedApprovalsProvider>
                    </ReconcileProvider>
                  </PortfolioProvider>
                </DashboardProvider>
              </ApiProvider>
            </MyTransactionsProvider>
          </MyApprovalProvider>
        </GlobalModalProvider>
      </LoaderProvider>
    </NotificationProvider>
  );
};

/**
 * 🚀 Application Entry Point
 *
 * Mounts the React app into the root DOM node (`#root`).
 * `React.StrictMode` is used in development to highlight potential issues.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);
