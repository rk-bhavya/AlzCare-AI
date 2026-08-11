import {
  FaBrain,
  FaArrowRight,
} from "react-icons/fa";

const PredictionCard = () => {
  return (
    <section className="doctor-dashboard__card doctor-prediction">

      <div className="doctor-card-header">

        <div>
          <span>
            AI ASSESSMENT
          </span>

          <h2>
            Latest AI Report
          </h2>
        </div>

        <div className="doctor-card-icon">
          <FaBrain />
        </div>

      </div>

      <div className="doctor-prediction__content">

        <div className="doctor-prediction__patient">

          <div className="doctor-patient-avatar doctor-patient-avatar--large">
            L
          </div>

          <div>
            <strong>
              Lakshmi Devi
            </strong>

            <span>
              MRI Assessment
            </span>
          </div>

        </div>

        <div className="doctor-prediction__result">

          <span>
            AI Prediction
          </span>

          <strong>
            Mild Alzheimer's
          </strong>

          <div className="doctor-confidence">
            <div className="doctor-confidence__label">
              <span>Confidence</span>
              <strong>92%</strong>
            </div>

            <div className="doctor-confidence__bar">
              <div />
            </div>
          </div>

        </div>

        <div className="doctor-prediction__date">
          <span>Assessment Date</span>
          <strong>10 Aug 2026</strong>
        </div>

      </div>

      <button
        type="button"
        className="doctor-report-button"
      >
        View Full Report
        <FaArrowRight />
      </button>

      <p className="doctor-ai-disclaimer">
        AI output is an assistive prediction
        and should not be considered an
        independent medical diagnosis.
      </p>

    </section>
  );
};

export default PredictionCard;