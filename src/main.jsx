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
import { UserProfileProvider } from "./context/userProfileContext";
import { DashboardProvider } from "./context/dashboardContaxt";
import { Loader } from "./components";
import { LoaderProvider } from "./context/LoaderContext";
import { MyApprovalProvider } from "./context/myApprovalContaxt";
import { GlobalModalProvider } from "./context/GlobalModalContext";

const RootComponent = () => {
  return (
    <NotificationProvider>
      <LoaderProvider>
        <MyApprovalProvider>
          <ApiProvider>
            <UserProfileProvider>
              <DashboardProvider>
                <PortfolioProvider>
                  <SidebarProvider>
                    <SearchBarProvider>
                      <GlobalModalProvider>
                        <RouterProvider router={router} />
                        <Loader />
                      </GlobalModalProvider>
                    </SearchBarProvider>
                  </SidebarProvider>
                </PortfolioProvider>
              </DashboardProvider>
            </UserProfileProvider>
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
