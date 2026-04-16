import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Auth صفحات
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";

// Researcher pages
import Dashboard from "./pages/researcher/Dashboard";
import ResearchProject from "./pages/researcher/Projects";
import CreateProposal from "./pages/researcher/Proposals";

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


        {/* DEFAULT REDIRECT */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 404 FALLBACK */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />

      </Routes>
    </Router>
  );
}

export default App;