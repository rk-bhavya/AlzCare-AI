import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button/Button.jsx";
import Card from "../../components/Card/Card.jsx";
import Loader from "../../components/Loader/Loader.jsx";
import { getServerHealth } from "../../api/health.api.js";
import { APP_NAME, ROUTES } from "../../config/constants.js";
import "./Home.css";

const MODULES = [
  {
    id: "patient",
    initials: "P",
    title: "Patient",
    subtitle: "Screening & daily support",
    color: "var(--color-patient)",
    points: [
      "Take AI-assisted cognitive tests",
      "Upload MRI scans for prediction",
      "Medicine and task reminders",
    ],
  },
  {
    id: "caregiver",
    initials: "C",
    title: "Caregiver",
    subtitle: "Monitoring & assistance",
    color: "var(--color-caregiver)",
    points: [
      "Track patient activity and progress",
      "Manage reminders and routines",
      "Receive risk alerts instantly",
    ],
  },
  {
    id: "doctor",
    initials: "D",
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
    initials: "A",
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

    // Cleanup prevents "setState on unmounted component" warnings
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
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content animate-fade-up">
            <span className="hero__tag">Deep Learning · CNN · Healthcare</span>
            <h1 className="hero__title">
              Detect Alzheimer's Early.<br />
              <span className="hero__title-accent">Support Memory Daily.</span>
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

            <div className="hero__status">{renderStatus()}</div>
          </div>

          <div className="hero__visual animate-fade-up" aria-hidden="true">
            <div className="brain-card">
              <div className="brain-card__header">
                <span>MRI Analysis</span>
                <span className="badge badge--info">CNN v1</span>
              </div>
              <div className="brain-card__scan">
                <div className="brain-card__pulse" />
                <span className="brain-card__emoji">🧠</span>
              </div>
              <div className="brain-card__bars">
                <div className="bar">
                  <span className="bar__label">Non-Demented</span>
                  <div className="bar__track"><i style={{ width: "82%" }} /></div>
                </div>
                <div className="bar">
                  <span className="bar__label">Very Mild</span>
                  <div className="bar__track"><i style={{ width: "46%" }} /></div>
                </div>
                <div className="bar">
                  <span className="bar__label">Mild</span>
                  <div className="bar__track"><i style={{ width: "24%" }} /></div>
                </div>
                <div className="bar">
                  <span className="bar__label">Moderate</span>
                  <div className="bar__track"><i style={{ width: "11%" }} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MODULES ================= */}
      <section className="section modules" id="modules">
        <div className="container">
          <div className="section__head text-center">
            <h2>Four Connected Modules</h2>
            <p>
              Role-based access ensures every user sees exactly what they need —
              nothing more.
            </p>
          </div>

          <div className="modules__grid">
            {MODULES.map((module) => (
              <Card
                key={module.id}
                hoverable
                accent={module.color}
                icon={module.initials}
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

      {/* ================= ABOUT / HOW IT WORKS ================= */}
      <section className="section about" id="about">
        <div className="container">
          <div className="section__head text-center">
            <h2>How the System Works</h2>
            <p>From data capture to clinical validation in four steps.</p>
          </div>

          <div className="steps">
            <div className="step">
              <span className="step__num">01</span>
              <h4>Capture</h4>
              <p>
                The patient completes cognitive assessments and uploads an MRI
                scan through a guided, accessible interface.
              </p>
            </div>
            <div className="step">
              <span className="step__num">02</span>
              <h4>Analyse</h4>
              <p>
                A TensorFlow CNN served over a Flask API classifies the scan and
                returns a stage prediction with confidence scores.
              </p>
            </div>
            <div className="step">
              <span className="step__num">03</span>
              <h4>Assist</h4>
              <p>
                Caregivers receive alerts and manage reminders, routines, and
                memory-support tools for the patient.
              </p>
            </div>
            <div className="step">
              <span className="step__num">04</span>
              <h4>Validate</h4>
              <p>
                Doctors review the AI output, add clinical remarks, and generate
                a final downloadable report.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
