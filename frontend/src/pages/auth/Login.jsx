import { useState } from "react";
import "../../styles/auth.css";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import logo from "../../assets/logo.png";
import schoolBg from "../../assets/school.png";

const roleThemes = {
  researcher: { color: "#1a6b1a", light: "#e6f4ea" },
  evaluator: { color: "#6a0dad", light: "#f3e8ff" },
};

export default function Login() {
  const [role, setRole] = useState("researcher");
  const navigate = useNavigate();
  const theme = roleThemes[role];

  const handleSignIn = () => {
    localStorage.setItem("role", role);
    const routes = {
        researcher: "/researcher/dashboard",
        evaluator:  "/evaluator/dashboard",
      };
    navigate(routes[role]);
  };

  return (
<div className="auth-bg" style={{ backgroundImage: `url(${schoolBg})` }}>
      <div
        className="auth-card"
        style={{ "--main-color": theme.color, "--light-color": theme.light }}
      >
        {/* Green Header */}
        <div className="card-header">
          <img src={logo} alt="CSU Logo" className="school-logo" />
          <h1 className="school-name">Research PMS</h1>
          <div className="school-divider">
            <span className="divider-line" />
            <span className="school-sub">GRADUATE SCHOOL</span>
            <span className="divider-line" />
          </div>
        </div>

        {/* Form Body */}
        <div className="card-body">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to continue to your account</p>

          <div className="form-group">
            <label>Select Role</label>
            <div className="select-wrapper">
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="researcher">Researcher</option>
                <option value="evaluator">Evaluator</option>
              </select>
              <span className="select-dot" />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="name@csu.edu.ph" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" />
          </div>

          <button className="primary-btn" onClick={handleSignIn}>
            <LogIn size={18} />
            Sign In
          </button>

          <p className="auth-link">
            Don't have an account?{" "}
            <span onClick={() => navigate("/signup")}>Sign Up</span>
          </p>
        </div>
      </div>
    </div>
  );
}