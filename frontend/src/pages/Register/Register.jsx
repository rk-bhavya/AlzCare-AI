import "./Register.css";

import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaHandsHelping,
  FaUserMd,
  FaArrowRight,
} from "react-icons/fa";

import brain from "../../assets/images/brain.png";
import { ROUTES } from "../../config/constants";

function Register() {
  const navigate = useNavigate();

  return (
    <div className="register">

      {/* =====================================================
          LEFT
      ====================================================== */}

      <div className="register-left">

        <span className="register-tag">
          AI • HEALTHCARE
        </span>

        <img
          src={brain}
          alt="Brain"
          className="register-brain"
        />

        <h1>
          Join <span>AlzCare AI</span>
        </h1>

        <h2>
          Begin your journey towards
          <br />
          intelligent Alzheimer's care.
        </h2>

        <p>
          Create your secure account to access
          AI-powered Alzheimer's screening,
          cognitive assistance and patient support.
        </p>

      </div>

      {/* =====================================================
          RIGHT
      ====================================================== */}

      <div className="register-right">

        <div className="register-header">

          <span className="step">
            STEP 1
          </span>

          <h2>Choose Account Type</h2>

          <p>
            Select the account you wish to create.
          </p>

        </div>

        <div className="register-cards">

          {/* =================================================
              PATIENT
          ================================================== */}

          <div className="register-card">

            <div className="register-icon patient">
              <FaUser />
            </div>

            <h3>Patient</h3>

            <p>
              Access AI screening,
              MRI upload,
              reminders and cognitive activities.
            </p>

            <ul>
              <li>✓ AI Cognitive Screening</li>
              <li>✓ MRI Upload</li>
              <li>✓ Daily Reminders</li>
              <li>✓ Progress Tracking</li>
            </ul>

            <button
              onClick={() =>
                navigate(
                  ROUTES.PATIENT_REGISTER
                )
              }
            >
              Create Patient Account
              <FaArrowRight />
            </button>

          </div>

          {/* =================================================
              CAREGIVER
          ================================================== */}

          <div className="register-card">

            <div className="register-icon caregiver">
              <FaHandsHelping />
            </div>

            <h3>Caregiver</h3>

            <p>
              Manage medication schedules,
              monitor patients and receive alerts.
            </p>

            <ul>
              <li>✓ Medication Management</li>
              <li>✓ Patient Monitoring</li>
              <li>✓ Cognitive Assistance</li>
              <li>✓ Emergency Alerts</li>
            </ul>

            <button
              onClick={() =>
                navigate(
                  ROUTES.CAREGIVER_REGISTER
                )
              }
            >
              Create Caregiver Account
              <FaArrowRight />
            </button>

          </div>

          {/* =================================================
              DOCTOR
          ================================================== */}

          <div className="register-card">

            <div className="register-icon doctor">
              <FaUserMd />
            </div>

            <h3>Doctor</h3>

            <p>
              Review AI predictions,
              monitor patient reports
              and provide clinical insights.
            </p>

            <ul>
              <li>✓ MRI / CT Reports</li>
              <li>✓ AI Predictions</li>
              <li>✓ Patient Analytics</li>
              <li>✓ Clinical Remarks</li>
            </ul>

            <button
              onClick={() =>
                navigate(
                  ROUTES.DOCTOR_REGISTER
                )
              }
            >
              Create Doctor Account
              <FaArrowRight />
            </button>

          </div>

        </div>

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <div className="register-footer">

          Already have an account?

          <Link to={ROUTES.LOGIN}>
            Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;