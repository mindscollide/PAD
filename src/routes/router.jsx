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
  ReconcileIndex,
  EscalatedTransactionsIndex,
  Brokers,
  Instruments,
  GroupsAndPolicy,
  ManageUsers,
  SystemConfigurations,
  MytradeapprovalsReport,
  PendingRequest,
  ComplianceOfficerReportsIndex,
  COMyAction,
  COdataWiseTransactionsReports,
  UserSessionWiseActivity,
  COTransactionsSummarysReports,
  TradesUploadViaPortfolio,
} from "../pages";
import RoleBasedRoute from "./RoleBasedRoute";
import EscalatedApprovals from "../pages/main/headOfTradeApprover/escalatedApprovals/escalatedApprovals";
import MyAction from "../pages/main/lineManager/myActions/myActions";
import LineManagerReportsIndex from "../pages/main/lineManager/reports";
import ReportsLayout from "./ReportsLayout";
import MyTradeApprovalStandingReport from "../pages/main/employes/reports/myTradeApprovalStandingReport/MyTradeApprovalStandingReport";
import MyComplianceStandingReport from "../pages/main/employes/reports/myComplianceStanding/MyComplianceStandingReport";
import MyTransactionReport from "../pages/main/employes/reports/myTransactionReport/MyTransactionReport";
import TradeApprovalRequest from "../pages/main/lineManager/reports/tradeApprovalsRequest/tradeApprovalRequest";
import CompianceOfficerOverdueVerificationReports from "../pages/main/complianceOfficer/reports/overDueVerificationsReports";
import HCATransactionsSummarysReports from "../pages/main/headOfComplianceOffice/reports/transactionsSummary";
import HCADateWiseTransactionsReports from "../pages/main/headOfComplianceOffice/reports/dataWiseTransactionsReports";
import HeadOFComplianceApprovalReportsIndex from "../pages/main/headOfComplianceOffice/reports";
import HTAReportsIndex from "../pages/main/headOfTradeApprover/reports";
import HeadCompianceOfficerOverdueVerificationReports from "../pages/main/headOfComplianceOffice/reports/overDueVerificationsReports";
import HTATradeApprovalRequest from "../pages/main/headOfTradeApprover/reports/tradeApprovalsRequest/HTATradeApprovalRequest";

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
        path={"PAD"}
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
            <RoleBasedRoute isAdmin={false} allowedRoles={[2]}>
              <EmployeApproval />
            </RoleBasedRoute>
          }
        />
        <Route
          path="portfolios"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[2]}>
              <EmployeProtfolio />{" "}
            </RoleBasedRoute>
          }
        />
        <Route
          path="transactions"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[2]}>
              <EmployeMyTransaction />{" "}
            </RoleBasedRoute>
          }
        />
        <Route
          path="history"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[2]}>
              <EmployeMyhistory />{" "}
            </RoleBasedRoute>
          }
        />

        <Route
          path="reports"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[2]}>
              <ReportsLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<EmpolyesReportsIndex />} />
          <Route
            path="my-trade-approvals"
            element={<MytradeapprovalsReport />}
          />
          <Route path="my-transactions" element={<MyTransactionReport />} />
          <Route
            path="my-trade-approvals-standing"
            element={<MyTradeApprovalStandingReport />}
          />
          <Route
            path="my-compliance-approvals"
            element={<MyComplianceStandingReport />}
          />
        </Route>

        {/* Line Manager */}
        <Route
          path="lm-approval-requests"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[3]}>
              {/* <EmployeApproval /> */}
              {<ApprovalRequest />}
            </RoleBasedRoute>
          }
        />

        <Route
          path="lm-my-actions"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[3]}>
              <MyAction />{" "}
            </RoleBasedRoute>
          }
        />
        <Route
          path="lm-reports"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[3]}>
              <ReportsLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<LineManagerReportsIndex />} />
          <Route path="lm-pending-request" element={<PendingRequest />} />
          <Route
            path="lm-tradeapproval-request"
            element={<TradeApprovalRequest />}
          />
        </Route>

        {/* Head Of Trade Approval */}
        <Route
          path="hta-escalated-requests"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[5]}>
              {/* <EmployeApproval /> */}
              {<EscalatedApprovals />}
              {/* {<ReconcileIndex />} */}
            </RoleBasedRoute>
          }
        />

        <Route
          path="hta-my-actions"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[5]}>
              <EmployeMyTransaction />{" "}
            </RoleBasedRoute>
          }
        />

        <Route
          path="hta-reports"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[5]}>
              <ReportsLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<HTAReportsIndex />} />
          <Route path="lm-pending-request" element={<PendingRequest />} />
          <Route
            path="hta-trade-approval-requests"
            element={<HTATradeApprovalRequest />}
          />
        </Route>
        {/* Compliance Officer */}
        <Route
          path="co-reconcile-transactions"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[4]}>
              {<ReconcileIndex />}
            </RoleBasedRoute>
          }
        />
        <Route
          path="co-my-actions"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[4]}>
              <COMyAction />{" "}
            </RoleBasedRoute>
          }
        />
        <Route
          path="co-reports"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[4]}>
              <ReportsLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<ComplianceOfficerReportsIndex />} />
          <Route
            path="co-date-wise-transaction-report"
            element={<COdataWiseTransactionsReports />}
          />

          <Route
            path="co-overdue-verifications"
            element={<CompianceOfficerOverdueVerificationReports />}
          />
          <Route
            path="co-transactions-summary-report"
            element={<COTransactionsSummarysReports />}
          />
        </Route>

        {/* Head of Compliance Approval */}
        <Route
          path="hca-escalated-transactions-verifications"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[6]}>
              {<EscalatedTransactionsIndex />}
            </RoleBasedRoute>
          }
        />
        <Route
          path="hca-my-actions"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[6]}>
              <EmployeMyTransaction />{" "}
            </RoleBasedRoute>
          }
        />

        <Route
          path="hca-reports"
          element={
            <RoleBasedRoute isAdmin={false} allowedRoles={[6]}>
              <ReportsLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<HeadOFComplianceApprovalReportsIndex />} />
          <Route
            path="hca-date-wise-transaction-report"
            element={<HCADateWiseTransactionsReports />}
          />
          <Route
            path="hca-transactions-summary-report"
            element={<HCATransactionsSummarysReports />}
          />
          <Route
            path="hca-overdue-verifications"
            element={<HeadCompianceOfficerOverdueVerificationReports />}
          />
          <Route path="hca-upload-portfolio" element={<TradesUploadViaPortfolio />} />
          
          <Route path="hca-portfolio-history" element={<PendingRequest />} />
        </Route>
        {/* For Admin Roles Start here*/}

        <Route
          path="admin-group-policies"
          element={
            <RoleBasedRoute isAdmin={true} allowedRoles={[1]}>
              {<GroupsAndPolicy />}
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin-brokers"
          element={
            <RoleBasedRoute isAdmin={true} allowedRoles={[1]}>
              <Brokers />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin-instruments"
          element={
            <RoleBasedRoute isAdmin={true} allowedRoles={[1]}>
              <Instruments />
            </RoleBasedRoute>
          }
        />
        {/*  */}
        <Route
          path="admin-users"
          element={
            <RoleBasedRoute isAdmin={true} allowedRoles={[1]}>
              <ReportsLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<ManageUsers />} />
          <Route
            path="session-wise-activity"
            element={<UserSessionWiseActivity />}
          />
        </Route>

        {/*  */}
        {/* <Route
          path="admin-users"
          element={
            <RoleBasedRoute isAdmin={true} allowedRoles={[1]}>
              <ManageUsers />
            </RoleBasedRoute>
          }
        />
        <Route
          path="session-wise-activity"
          element={
            <RoleBasedRoute isAdmin={true} allowedRoles={[1]}>
              <UserSessionWiseActivity />
            </RoleBasedRoute>
          }
        /> */}

        <Route
          path="admin-system-configurations"
          element={
            <RoleBasedRoute isAdmin={true} allowedRoles={[1]}>
              <SystemConfigurations />{" "}
            </RoleBasedRoute>
          }
        />

        <Route
          path="admin-reports"
          element={
            <RoleBasedRoute isAdmin={true} allowedRoles={[1]}>
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
