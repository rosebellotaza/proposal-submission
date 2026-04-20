import { useState } from "react";
import "../../styles/auth.css";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import logo from "../../assets/logo.png";
import schoolBg from "../../assets/school.png";
import { loginUser, dashboardRoute } from "../../utils/auth";

const roleThemes = {
  researcher: { color: "#1a6b1a", light: "#e6f4ea" },
  evaluator:  { color: "#6a0dad", light: "#f3e8ff" },
};

export default function Login() {
  const [role,     setRole]     = useState("researcher");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();
  const theme = roleThemes[role];

  const handleSignIn = async () => {
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(email, password, role);
      navigate(dashboardRoute(user.role));
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.email?.[0]
        || err.response?.data?.errors?.role?.[0]
        || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg" style={{ backgroundImage: `url(${schoolBg})` }}>
      <div
        className="auth-card"
        style={{ "--main-color": theme.color, "--light-color": theme.light }}
      >
        {/* Header */}
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

          {error && <div className="auth-error">{error}</div>}

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
            <input
              type="email"
              placeholder="name@csu.edu.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            />
          </div>

          <button className="primary-btn" onClick={handleSignIn} disabled={loading}>
            <LogIn size={18} />
            {loading ? "Signing in..." : "Sign In"}
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