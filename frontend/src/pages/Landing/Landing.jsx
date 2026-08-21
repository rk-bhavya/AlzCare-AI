import "./Landing.css";
import { useNavigate } from "react-router-dom";

import { FaUserMd, FaHandsHelping, FaArrowRight } from "react-icons/fa";
import brain from "../../assets/images/brain.png";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      {/* Left Section */}

      <div className="landing-left">

        <img
          src={brain}
          alt="Brain"
          className="landing-brain"
        />

        <h1>
          AlzCare <span>AI</span>
        </h1>

        <h2>
          AI-Based Early Alzheimer's Detection
          <br />
          & Cognitive Assistance Platform
        </h2>

        <p>
          Empowering early diagnosis through Deep Learning and
          providing continuous support for patients,
          caregivers and healthcare professionals.
        </p>

      </div>

      {/* Right Section */}

      <div className="landing-right">

        <div className="landing-header">

          <h2>Welcome!</h2>

          <p>
            CHOOSE YOUR PORTAL
          </p>

        </div>

        <div className="portal-container">

          {/* Doctor */}

          <div className="portal-card">

            <div className="portal-icon doctor">

              <FaUserMd />

            </div>

            <h3>Doctor Portal</h3>

            <p className="portal-description">

              Clinical dashboard for MRI review,
              AI prediction and patient reports.

            </p>

            <ul>

              <li>✓ MRI Analysis</li>

              <li>✓ AI Prediction Results</li>

              <li>✓ Clinical Notes</li>

              <li>✓ Download Reports</li>

            </ul>

            <button
              onClick={() => navigate("/doctor-login")}
            >
              Continue as Doctor

              <FaArrowRight />

            </button>

          </div>

          {/* Caregiver */}

          <div className="portal-card">

            <div className="portal-icon caregiver">

              <FaHandsHelping />

            </div>

            <h3>Caregiver Portal</h3>

            <p className="portal-description">

              Monitor patient activities,
              medication schedules and cognitive assistance.

            </p>

            <ul>

              <li>✓ Medication Reminders</li>

              <li>✓ Daily Monitoring</li>

              <li>✓ Cognitive Assistance</li>

              <li>✓ Emergency Alerts</li>

            </ul>

            <button
              onClick={() => navigate("/caregiver-login")}
            >
              Continue as Caregiver

              <FaArrowRight />

            </button>

          </div>

        </div>

        <div className="landing-note">
          Only authorized users can access their respective portals.

        </div>

      </div>

    </div>
  );
}

export default Landing;