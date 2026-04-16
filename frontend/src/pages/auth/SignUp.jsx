import { useState } from "react";
import "../../styles/auth.css";
import { useNavigate } from "react-router-dom";

const roleThemes = {
  researcher: { color: "#1f7a1f", light: "#e6f4ea" },
  evaluator: { color: "#6a0dad", light: "#f3e8ff" },
  approver: { color: "#d4a017", light: "#fff8dc" },
};

export default function SignUp() {
  const [role, setRole] = useState("researcher");
  const navigate = useNavigate();
  const theme = roleThemes[role];

  return (
    <div className="split-container signup-page">
      <div className="left-panel" />

      <div className="right-panel">
        <div
          className="form-container"
          style={{
            "--main-color": theme.color,
            "--light-color": theme.light,
          }}
        >
          <div className="form-header">
            <h1>Research PMS</h1>
            <p>Project Proposal Management System</p>
          </div>

          <h2>Sign Up</h2>
          <p className="subtitle">Create your account to continue</p>

          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="researcher">Researcher</option>
              <option value="evaluator">Evaluator</option>
              <option value="approver">Approver</option>
            </select>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Juan Dela Cruz" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="name@university.edu" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <button className="primary-btn">Sign Up</button>

          <p className="signup">
            Already have an account?{" "}
            <span onClick={() => navigate("/")}>Sign In</span>
          </p>
        </div>
      </div>
    </div>
  );
}