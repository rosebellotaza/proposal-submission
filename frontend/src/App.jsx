import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";


// Researcher pages
import Dashboard from "./pages/researcher/Dashboard";
import ResearchProject from "./pages/researcher/Projects";
import CreateProposal from "./pages/researcher/Proposals";
import ProjectView from "./pages/researcher/ProjectView";
import TeamManagement from "./pages/researcher/Team";
import Outputs from "./pages/researcher/Outputs";
import OutputsDetail from "./pages/researcher/OutputsDetail";
import StatusTracking from "./pages/researcher/StatusTracking";
import Profile from "./pages/researcher/Profile";

//Evaluator pages
import EvaluatorDashboard from "./pages/evaluator/Dashboard";
import Evaluations from "./pages/evaluator/Evaluations";
import EvaluatorStatusTracking from "./pages/evaluator/StatusTracking";
import EvaluatorProfile from "./pages/evaluator/Profile";


// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminFaculty from "./pages/admin/Faculty";
import AdminEvaluators from "./pages/admin/evaluators";
import AdminProposals from "./pages/admin/Proposals";
import AdminProjects from "./pages/admin/Projects";
import AdminReports from "./pages/admin/Reports";
import AdminProfile from "./pages/admin/Profile";

// Approver page
import ApproverDashboard from "./pages/approver/Dashboard";
import ApproverPage from "./pages/approver/Approvals";
import ApproverProfile from "./pages/approver/Profile";


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
        <Route path="/profile" element={<Profile />} />

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
          path="/researcher/team"
          element={
            <ProtectedRoute allowedRoles={["researcher"]}>
              <TeamManagement />
            </ProtectedRoute>
          }
        />

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

        {/* EVALUATOR ROUTES */}
        <Route
        path="/evaluator/dashboard"
          element={
            <ProtectedRoute allowedRoles={["evaluator","rde_division_chief", "campus_director"]}>
              <EvaluatorDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/evaluator/evaluations"
          element={
          <ProtectedRoute allowedRoles={["evaluator","rde_division_chief", "campus_director"]}>
            <Evaluations />
          </ProtectedRoute>}
        />

        <Route
          path="/evaluator/status-tracking"
          element={
            <ProtectedRoute allowedRoles={["evaluator","rde_division_chief", "campus_director"]}>
              <EvaluatorStatusTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluator/profile"
          element={
            <ProtectedRoute allowedRoles={["evaluator","rde_division_chief", "campus_director"]}>
              <EvaluatorProfile />
            </ProtectedRoute>
          }
        />


        {/* DEFAULT REDIRECT */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 404 FALLBACK */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />

        {/* ADMIN ROUTES */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faculty"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminFaculty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/evaluators"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminEvaluators />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/proposals"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProposals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/approver/dashboard"
            element={
              <ProtectedRoute allowedRoles={["vprie", "president"]}>
                <ApproverDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/approver/approvals"
            element={
              <ProtectedRoute allowedRoles={["vprie", "president"]}>
                <ApproverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approver/profile"
            element={
              <ProtectedRoute allowedRoles={["vprie", "president"]}>
                <ApproverProfile />
              </ProtectedRoute>
            }
          />
          
      </Routes>
    </Router>
  );
}

export default App;