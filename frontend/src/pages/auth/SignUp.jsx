import { useState } from "react";
import "../../styles/auth.css";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import logo from "../../assets/logo.png";
import schoolBg from "../../assets/school.png";
import { registerUser, dashboardRoute } from "../../utils/auth";

const roleThemes = {
  researcher: { color: "#1a6b1a", light: "#e6f4ea" },
  evaluator:  { color: "#6a0dad", light: "#f3e8ff" },
};

export default function SignUp() {
  const [role,     setRole]     = useState("researcher");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();
  const theme = roleThemes[role];

  const handleSignUp = async () => {
    setError("");

    if (!name || !email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(name, email, password, role);
      navigate(dashboardRoute(user.role));
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors)[0][0];
        setError(first);
      } else {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      }
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
          <h2>Create Account</h2>
          <p className="subtitle">Sign up to get started</p>

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
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Juan Dela Cruz"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@csu.edu.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
            />
          </div>

          <button className="primary-btn" onClick={handleSignUp} disabled={loading}>
            <UserPlus size={18} />
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <p className="auth-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Sign In</span>
          </p>
        </div>
      </div>
    </div>
  );
}