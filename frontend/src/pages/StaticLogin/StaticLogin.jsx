import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHandsHelping, FaUserMd, FaBrain } from "react-icons/fa";

import Button from "../../components/Button/Button.jsx";
import { APP_NAME } from "../../config/constants.js";

import "./StaticLogin.css";

/* ============================================================
   STATIC DEMO LOGIN PAGE

   UI-only demonstration page. No API calls, no real
   authentication. "Login" simply routes to the matching demo
   dashboard so the dashboards can be shown even with the
   backend completely offline.
============================================================ */

const StaticLogin = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("caregiver");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Static demo only — no backend call, no validation gate.
    navigate(
      role === "doctor" ? "/doctor-dashboard" : "/caregiver-dashboard"
    );
  };

  return (
    <div className="static-login">
      <div className="static-login__card">
        <div className="static-login__brand">
          <div className="static-login__brand-icon">
            <FaBrain />
          </div>
          <span>{APP_NAME}</span>
        </div>

        <h1>Welcome Back</h1>
        <p className="static-login__subtitle">
          Login to continue to {APP_NAME}
        </p>

        <div className="static-login__role-toggle">
          <button
            type="button"
            className={`static-login__role ${
              role === "caregiver" ? "static-login__role--active" : ""
            }`}
            onClick={() => setRole("caregiver")}
          >
            <FaHandsHelping />
            Caregiver
          </button>

          <button
            type="button"
            className={`static-login__role ${
              role === "doctor" ? "static-login__role--active" : ""
            }`}
            onClick={() => setRole("doctor")}
          >
            <FaUserMd />
            Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="static-login__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="static-login__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="static-login__row">
            <label className="static-login__remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>

            <span className="static-login__forgot">Forgot password?</span>
          </div>

          <Button type="submit" fullWidth size="lg">
            Login
          </Button>
        </form>

        <p className="static-login__footer">
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default StaticLogin;
