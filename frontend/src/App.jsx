import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Auth صفحات
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";

// Researcher pages
import Dashboard from "./pages/researcher/Dashboard";
import ResearchProject from "./pages/researcher/Projects";
import CreateProposal from "./pages/researcher/Proposals";
import ProjectView from "./pages/researcher/ProjectView";
import ProjectCreate from "./pages/researcher/ProjectCreate";
import TeamManagement from "./pages/researcher/Team";
import WorkPlan from "./pages/researcher/WorkPlan";
import WorkPlanDetail from "./pages/researcher/WorkPlanDetail";
import BudgetPlan from "./pages/researcher/BudgetPlan";
import BudgetPlanDetail from "./pages/researcher/BudgetPlanDetail";
import Framework from "./pages/researcher/Framework";
import FrameworkDetail from "./pages/researcher/FrameworkDetail";
import References from "./pages/researcher/References";
import ReferencesDetail from "./pages/researcher/ReferencesDetail";
import Outputs from "./pages/researcher/Outputs";
import OutputsDetail from "./pages/researcher/OutputsDetail";
import StatusTracking from "./pages/researcher/StatusTracking";


// Styles
import "./App.css";

// Dummy role (replace with real auth logic later)
const getUserRole = () => {
  return localStorage.getItem("role"); // 'researcher', 'evaluator', 'approver'
};

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = getUserRole();

  if (!role) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* RESEARCHER ROUTES */}
        <Route
          path="/researcher/dashboard"
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/researcher/projects"
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <ResearchProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/researcher/proposals"
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <CreateProposal />
            </ProtectedRoute>
          }
        />

        <Route path="/researcher/projects/:id" element={<ProjectView />} />

        <Route
            path="/researcher/projects/create"
            element={
              <ProtectedRoute allowedRoles={["researcher"]}>
                <ProjectCreate />
              </ProtectedRoute>
            }
          />

        <Route
          path="/researcher/team"
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <TeamManagement />
            </ProtectedRoute>
          }
        />

        <Route path="/researcher/work-plan" 
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <WorkPlan />
            </ProtectedRoute>} />
        <Route path="/researcher/work-plan/:id" 
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <WorkPlanDetail />
            </ProtectedRoute>} />

        <Route path="/researcher/budget-plan" 
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <BudgetPlan />
            </ProtectedRoute>} />
        <Route path="/researcher/budget-plan/:id" 
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <BudgetPlanDetail />
            </ProtectedRoute>} />

        <Route path="/researcher/framework" 
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <Framework />
            </ProtectedRoute>} />

        <Route path="/researcher/framework/:id" 
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <FrameworkDetail />
            </ProtectedRoute>} />

        <Route path="/researcher/references" 
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <References />
            </ProtectedRoute>} />

        <Route path="/researcher/references/:id" 
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <ReferencesDetail />
            </ProtectedRoute>} />

        <Route path="/researcher/outputs" 
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <Outputs />
            </ProtectedRoute>} />
        
        <Route path="/researcher/outputs/:id" 
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <OutputsDetail />
              </ProtectedRoute>} />

        <Route
          path="/researcher/status-tracking"
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <StatusTracking />
            </ProtectedRoute>
          }
        />


        {/* DEFAULT REDIRECT */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 404 FALLBACK */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />

      </Routes>
    </Router>
  );
}

export default App;