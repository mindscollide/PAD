// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import "./index.css";
import { SidebarProvider } from "./context/sidebarContaxt";
import { SearchBarProvider } from "./context/SearchBarContaxt";
import { NotificationProvider } from "./components/NotificationProvider/NotificationProvider";
import { PortfolioProvider } from "./context/portfolioContax";
import { ApiProvider } from "./context/ApiContext";
import { DashboardProvider } from "./context/dashboardContaxt";
import { Loader } from "./components";
import { LoaderProvider } from "./context/LoaderContext";
import { MyApprovalProvider } from "./context/myApprovalContaxt";

const RootComponent = () => {
  return (
    <NotificationProvider>
      <LoaderProvider>
        <MyApprovalProvider>
          <ApiProvider>
            <DashboardProvider>
              <PortfolioProvider>
                <SidebarProvider>
                  <SearchBarProvider>
                    <RouterProvider router={router} />
                    <Loader />
                  </SearchBarProvider>
                </SidebarProvider>
              </PortfolioProvider>
            </DashboardProvider>
          </ApiProvider>
        </MyApprovalProvider>
      </LoaderProvider>
    </NotificationProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);
