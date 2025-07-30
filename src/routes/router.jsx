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
} from "../pages";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Public Route */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Suspense fallback={<LoadingSpinner tip="Loading login..." />}>
              <Login />
            </Suspense>
          </PublicRoute>
        }
      />

      {/* Protected Dashboard Route */}
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
        {/* Employee  */}
        <Route path="approvals" element={<EmployeApproval />} />
        <Route path="portfolios" element={<EmployeProtfolio />} />
        <Route path="transactions" element={<EmployeMyTransaction />} />
        <Route path="history" element={<EmployeMyhistory />} />
        <Route path="reports" element={<EmpolyesReportsIndex />} />
        {/* Faq's */}
        <Route path="faq" element={<Faqs />} />
      </Route>

      {/* Redirect anything else to /login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  )
);

export default router;
