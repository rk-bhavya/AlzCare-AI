import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FaUserInjured,
  FaHandsHelping,
  FaUserMd,
  FaUserShield,
  FaBrain,
  FaLock,
  FaBolt,
  FaChartLine,
  FaFileMedicalAlt,
  FaClipboardCheck,
} from "react-icons/fa";

import Button from "../../components/Button/Button.jsx";
import Card from "../../components/Card/Card.jsx";
import Loader from "../../components/Loader/Loader.jsx";
import { getServerHealth } from "../../api/health.api.js";
import { APP_NAME, ROUTES } from "../../config/constants.js";
import "./Home.css";

const MODULES = [
  {
    id: "patient",
    icon: <FaUserInjured />,
    title: "Patient",
    subtitle: "Screening & daily support",
    color: "var(--color-patient)",
    points: [
      "Take AI-assisted cognitive tests",
      "Medicine and task reminders",
      "Receive risk alerts instantly",
    ],
  },
  {
    id: "caregiver",
    icon: <FaHandsHelping />,
    title: "Caregiver",
    subtitle: "Monitoring & assistance",
    color: "var(--color-caregiver)",
    points: [
      "Track patient activity and progress",
      "Manage medications and appointments",
      "Message the care team directly",
    ],
  },
  {
    id: "doctor",
    icon: <FaUserMd />,
    title: "Doctor",
    subtitle: "Clinical review & reports",
    color: "var(--color-doctor)",
    points: [
      "Review AI prediction results",
      "Validate and add clinical remarks",
      "Generate diagnostic reports",
    ],
  },
  {
    id: "admin",
    icon: <FaUserShield />,
    title: "Admin",
    subtitle: "Control & analytics",
    color: "var(--color-admin)",
    points: [
      "Manage users and roles",
      "Monitor model performance",
      "View system-wide analytics",
    ],
  },
];

const STEPS = [
  {
    icon: <FaFileMedicalAlt />,
    title: "Capture",
    text: "The patient completes cognitive assessments and uploads an MRI scan through a guided, accessible interface.",
  },
  {
    icon: <FaBrain />,
    title: "Analyse",
    text: "A TensorFlow CNN served over a FastAPI service classifies the scan and returns a stage prediction with confidence scores.",
  },
  {
    icon: <FaHandsHelping />,
    title: "Assist",
    text: "Caregivers receive alerts and manage reminders, medications, and memory-support tools for the patient.",
  },
  {
    icon: <FaClipboardCheck />,
    title: "Validate",
    text: "Doctors review the AI output, add clinical remarks, and generate a final downloadable report.",
  },
];

const HIGHLIGHTS = [
  { icon: <FaBrain />, label: "AI-Powered Screening" },
  { icon: <FaBolt />, label: "Real-Time Alerts" },
  { icon: <FaLock />, label: "Private & Secure" },
];

const Home = () => {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchHealth = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await getServerHealth();
        if (isMounted) setHealth(data);
      } catch (err) {
        if (isMounted) setError(err.message || "Unable to reach the API.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderStatus = () => {
    if (isLoading) {
      return (
        <div className="status__row">
          <Loader size="sm" />
          <span>Checking backend connection…</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="status__row">
          <span className="badge badge--danger">Offline</span>
          <span className="status__text">{error}</span>
        </div>
      );
    }

    const isDbConnected = health?.database === "connected";

    return (
      <div className="status__row">
        <span className="badge badge--success">API Online</span>
        <span
          className={`badge ${isDbConnected ? "badge--success" : "badge--warning"}`}
        >
          DB {health?.database}
        </span>
        <span className="status__text">
          {health?.environment} · uptime {health?.uptimeInSeconds}s
        </span>
      </div>
    );
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content animate-fade-up">
            <span className="hero__tag">AI-Powered Care Platform</span>

            <h1 className="hero__title">
              Detect Alzheimer's Early.
              <br />
              <span className="hero__title-accent">
                Support Memory Daily.
              </span>
            </h1>

            <p className="hero__subtitle">
              {APP_NAME} combines a convolutional neural network for MRI-based
              risk prediction with cognitive screening tests and everyday
              assistance tools — connecting patients, caregivers, and doctors on
              a single platform.
            </p>

            <div className="hero__actions">
              <Link to={ROUTES.REGISTER}>
                <Button size="lg">Create Account</Button>
              </Link>

              <Link to={ROUTES.LOGIN}>
                <Button size="lg" variant="outline">
                  Login
                </Button>
              </Link>
            </div>

            <div className="hero__highlights">
              {HIGHLIGHTS.map((item) => (
                <div className="hero__highlight" key={item.label}>
                  <span className="hero__highlight-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="hero__status">{renderStatus()}</div>
          </div>

          <div className="hero__visual animate-fade-up" aria-hidden="true">
            <div className="care-network">
              <svg
                className="care-network__lines"
                viewBox="0 0 400 400"
                preserveAspectRatio="xMidYMid meet"
              >
                <line x1="200" y1="200" x2="200" y2="60" className="care-network__line care-network__line--patient" />
                <line x1="200" y1="200" x2="82" y2="285" className="care-network__line care-network__line--caregiver" />
                <line x1="200" y1="200" x2="318" y2="285" className="care-network__line care-network__line--doctor" />
              </svg>

              <div className="care-network__core">
                <FaBrain />
                <span className="care-network__ring care-network__ring--1" />
                <span className="care-network__ring care-network__ring--2" />
              </div>

              <div className="care-network__node care-network__node--patient">
                <span className="care-network__node-icon"><FaUserInjured /></span>
                <span className="care-network__node-label">Patient</span>
              </div>

              <div className="care-network__node care-network__node--caregiver">
                <span className="care-network__node-icon"><FaHandsHelping /></span>
                <span className="care-network__node-label">Caregiver</span>
              </div>

              <div className="care-network__node care-network__node--doctor">
                <span className="care-network__node-icon"><FaUserMd /></span>
                <span className="care-network__node-label">Doctor</span>
              </div>

              <div className="care-network__badge care-network__badge--1">
                <FaChartLine />
                AI Risk Scoring
              </div>

              <div className="care-network__badge care-network__badge--2">
                <FaLock />
                Secure & Private
              </div>

              <div className="care-network__badge care-network__badge--3">
                <FaBolt />
                Real-Time Alerts
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section modules" id="modules">
        <div className="container">
          <div className="section__head text-center">
            <h2>Four Connected Modules</h2>

            <p>
              Role-based access ensures every user sees exactly what they need.
            </p>
          </div>

          <div className="modules__grid">
            {MODULES.map((module) => (
              <Card
                key={module.id}
                hoverable
                accent={module.color}
                icon={module.icon}
                title={module.title}
                subtitle={module.subtitle}
              >
                <ul className="module__points">
                  {module.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section about" id="about">
        <div className="container">
          <div className="section__head text-center">
            <h2>How the System Works</h2>

            <p>From data capture to clinical validation in four steps.</p>
          </div>

          <div className="steps">
            {STEPS.map((step, index) => (
              <div className="step" key={step.title}>
                <div className="step__top">
                  <span className="step__num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="step__icon">{step.icon}</span>
                </div>

                <h4>{step.title}</h4>

                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta">
        <div className="container cta__inner">
          <div>
            <h2>Ready to start monitoring cognitive health?</h2>
            <p>
              Create an account as a patient, caregiver, or doctor and join a
              connected care experience built around early detection.
            </p>
          </div>

          <Link to={ROUTES.REGISTER}>
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
