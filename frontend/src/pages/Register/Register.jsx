import "./Register.css";

import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaHandsHelping,
  FaArrowRight,
} from "react-icons/fa";

import brain from "../../assets/images/brain.png";
import { ROUTES } from "../../config/constants";

function Register() {
  const navigate = useNavigate();

  return (
    <div className="register-page">

      {/* LEFT */}

      <div className="register-left">

        <span className="register-tag">
          AI • HEALTHCARE • REGISTER
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
          Begin your journey toward
          <br />
          intelligent Alzheimer's care.
        </h2>

        <p>
          Create your secure account to access
          AI-powered Alzheimer's screening,
          cognitive assistance and patient support.
        </p>

      </div>

      {/* RIGHT */}

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

          {/* PATIENT */}

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
                navigate(ROUTES.PATIENT_REGISTER)
              }
            >
              Create Patient Account
              <FaArrowRight />
            </button>

          </div>

          {/* CAREGIVER */}

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
                navigate(ROUTES.CAREGIVER_REGISTER)
              }
            >
              Create Caregiver Account
              <FaArrowRight />
            </button>

          </div>

        </div>

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