import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHandsHelping, FaUserMd, FaBrain } from "react-icons/fa";

import Button from "../../components/Button/Button.jsx";
import { APP_NAME } from "../../config/constants.js";

import "./StaticRegister.css";

/* ============================================================
   STATIC DEMO REGISTRATION PAGE

   UI-only demonstration page. No API calls, no backend
   dependency. "Create Account" simply routes to the login demo.
============================================================ */

const StaticRegister = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "caregiver",
  });

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    // Static demo only — no backend call.
    navigate("/login");
  };

  return (
    <div className="static-register">
      <div className="static-register__card">
        <div className="static-register__brand">
          <div className="static-register__brand-icon">
            <FaBrain />
          </div>
          <span>{APP_NAME}</span>
        </div>

        <h1>Create Your Account</h1>

        <form onSubmit={handleSubmit}>
          <div className="static-register__field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              placeholder="Jane Doe"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
            />
          </div>

          <div className="static-register__grid">
            <div className="static-register__field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>

            <div className="static-register__field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="static-register__grid">
            <div className="static-register__field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
              />
            </div>

            <div className="static-register__field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) =>
                  updateField("confirmPassword", e.target.value)
                }
              />
            </div>
          </div>

          <div className="static-register__field">
            <label>Role</label>
            <div className="static-register__role-toggle">
              <button
                type="button"
                className={`static-register__role ${
                  form.role === "caregiver"
                    ? "static-register__role--active"
                    : ""
                }`}
                onClick={() => updateField("role", "caregiver")}
              >
                <FaHandsHelping />
                Caregiver
              </button>

              <button
                type="button"
                className={`static-register__role ${
                  form.role === "doctor"
                    ? "static-register__role--active"
                    : ""
                }`}
                onClick={() => updateField("role", "doctor")}
              >
                <FaUserMd />
                Doctor
              </button>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg">
            Create Account
          </Button>
        </form>

        <p className="static-register__footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default StaticRegister;
