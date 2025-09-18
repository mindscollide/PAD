// src/router.js
import React, { Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from "react-router-dom";

import App from "../App";
import LoadingSpinner from "../components/spiner/spiner";
import PrivateRoute from "../routes/PrivateRoute";
import PublicRoute from "../routes/PublicRoute";

import Dashboard from "../components/layout/dashboard/dashboard";
import {
  Login,
  Home,
  EmployeApproval,
  EmployeProtfolio,
  Faqs,
  EmployeMyTransaction,
  EmployeMyhistory,
  EmpolyesReportsIndex,

  //For Line Manager
  ApprovalRequest,
} from "../pages";
import RoleBasedRoute from "./RoleBasedRoute";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Public Route for login only */}
      <Route
        index
        element={
          <PublicRoute>
            <Suspense fallback={<LoadingSpinner tip="Loading login..." />}>
              <Login />
            </Suspense>
          </PublicRoute>
        }
      />
      {/* Protected Route - Requires auth_token */}
      <Route
        path="PAD"
        element={
          <PrivateRoute>
            <Suspense fallback={<LoadingSpinner tip="Loading dashboard..." />}>
              <Dashboard />
            </Suspense>
          </PrivateRoute>
        }
      >
        <Route index element={<Home />} />
        <Route
          path="approvals"
          element={
            <RoleBasedRoute allowedRoles={[2]}>
              <EmployeApproval />
            </RoleBasedRoute>
          }
        />
        <Route
          path="portfolios"
          element={
            <RoleBasedRoute allowedRoles={[2]}>
              <EmployeProtfolio />{" "}
            </RoleBasedRoute>
          }
        />
        <Route
          path="transactions"
          element={
            <RoleBasedRoute allowedRoles={[2]}>
              <EmployeMyTransaction />{" "}
            </RoleBasedRoute>
          }
        />
        <Route
          path="history"
          element={
            <RoleBasedRoute allowedRoles={[2]}>
              <EmployeMyhistory />{" "}
            </RoleBasedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <RoleBasedRoute allowedRoles={[2]}>
              <EmpolyesReportsIndex />{" "}
            </RoleBasedRoute>
          }
        />
        {/* Line Manager */}
        <Route
          path="lm-approval-requests"
          element={
            <RoleBasedRoute allowedRoles={[3]}>
              {/* <EmployeApproval /> */}
              {<ApprovalRequest />}
            </RoleBasedRoute>
          }
        />
        <Route
          path="lm-my-actions"
          element={
            <RoleBasedRoute allowedRoles={[3]}>
              <EmployeMyTransaction />{" "}
            </RoleBasedRoute>
          }
        />
        <Route
          path="lm-reports"
          element={
            <RoleBasedRoute allowedRoles={[3]}>
              <EmpolyesReportsIndex />{" "}
            </RoleBasedRoute>
          }
        />
        {/* Compliance Officer */}
        <Route
          path="co-reconcile-transactions"
          element={
            <RoleBasedRoute allowedRoles={[4]}>
              {<ApprovalRequest />}
            </RoleBasedRoute>
          }
        />
        <Route
          path="co-my-actions"
          element={
            <RoleBasedRoute allowedRoles={[4]}>
              <EmployeMyTransaction />{" "}
            </RoleBasedRoute>
          }
        />
        <Route
          path="co-reports"
          element={
            <RoleBasedRoute allowedRoles={[4]}>
              <EmpolyesReportsIndex />{" "}
            </RoleBasedRoute>
          }
        />
        <Route path="faq" element={<Faqs />} />
      </Route>

      {/* Redirect all unknown routes to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  )
);

export default router;
