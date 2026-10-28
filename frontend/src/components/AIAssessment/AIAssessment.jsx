
import { useRef, useState } from "react";

import {
  FaBrain,
  FaCloudUploadAlt,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

import { createAssessment } from "../../api/assessment.api.js";

import "./AIAssessment.css";

const AIAssessment = ({ patients = [] }) => {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  /* ============================================================
     FILE SELECTION
  ============================================================ */

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setResult(null);

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, JPEG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /* ============================================================
     REMOVE IMAGE
  ============================================================ */

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ============================================================
     SUBMIT ASSESSMENT
  ============================================================ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!selectedPatient) {
      setError("Please select a patient.");
      return;
    }

    if (!selectedFile) {
      setError("Please upload an MRI or image.");
      return;
    }

    try {
      setIsAnalyzing(true);

      const response = await createAssessment(
        selectedPatient,
        selectedFile,
        notes
      );

      if (!response?.success || !response?.assessment) {
        throw new Error(
          response?.message || "Assessment result was not returned."
        );
      }

      console.log("Complete assessment response:", response.assessment);
      console.log("Grad-CAM received:", Boolean(response.assessment.gradCAM));
      console.log(
        "Medical indicators:",
        response.assessment.medicalIndicators
      );

      setResult(response.assessment);
    } catch (err) {
      console.error("AI assessment error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to complete the AI assessment."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ============================================================
     RESET
  ============================================================ */

  const handleReset = () => {
    handleRemoveFile();
    setSelectedPatient("");
    setNotes("");
    setResult(null);
    setError("");
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <section className="ai-assessment">
      {/* HEADER */}

      <div className="ai-assessment__header">
        <div className="ai-assessment__heading">
          <div className="ai-assessment__icon">
            <FaBrain />
          </div>

          <div>
            <span>AI-ASSISTED ANALYSIS</span>
            <h2>AI Assessment</h2>
            <p>Upload a patient's brain scan for AI-assisted assessment.</p>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div
          className="ai-assessment__message ai-assessment__message--error"
          role="alert"
        >
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* RESULT */}

      {result ? (
        <div className="ai-assessment__result">
          <div className="ai-assessment__result-header">
            <div>
              <span>AI ASSESSMENT COMPLETE</span>
              <h3>Assessment Result</h3>
            </div>
            <FaCheckCircle />
          </div>

          {/* PREDICTION */}

          <div className="ai-assessment__prediction">
            <span>Predicted Classification</span>
            <strong>{result.prediction || "Unavailable"}</strong>

            <div className="ai-assessment__confidence">
              <span>Confidence</span>
              <strong>
                {Number.isFinite(Number(result.confidence))
                  ? `${Number(result.confidence).toFixed(2)}%`
                  : "Unavailable"}
              </strong>
            </div>
          </div>

          {/* CLASS PROBABILITIES */}

          {result.probabilities && (
            <div className="ai-assessment__probabilities">
              <h4>Class Probabilities</h4>

              <div className="ai-assessment__probability-list">
                <ProbabilityRow
                  label="Confidence Score 1"
                  value={result.probabilities.nonDemented}
                />

                <ProbabilityRow
                  label="Confidence Score 2"
                  value={result.probabilities.mildDementia}
                />

                <ProbabilityRow
                  label="Confidence Score 3"
                  value={result.probabilities.moderateDementia}
                />

                <ProbabilityRow
                  label="Confidence Score 4"
                  value={result.probabilities.severeDementia}
                />
              </div>
            </div>
          )}

          {/* MEDICAL INDICATORS */}

          <section className="ai-assessment__indicators">
            <h4>Brain Image-Derived Indicators</h4>

            <p className="ai-assessment__section-note">
              Experimental estimates derived from a 2D image. These are not
              validated clinical measurements.
            </p>

            {result.medicalIndicators ? (
              <div className="ai-assessment__indicator-grid">
                {[
                  ["Hippocampal Volume", "hippocampalVolume"],
                  ["Cortical Thickness", "corticalThickness"],
                  ["Ventricular Volume", "ventricularVolume"],
                  ["Hippocampal Asymmetry", "hippocampalAsymmetry"],
                  ["Brain Atrophy", "brainAtrophy"],
                ].map(([label, key]) => {
                  const value = result.medicalIndicators[key];

                  const valid =
                    value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    Number.isFinite(Number(value));

                  return (
                    <div
                      className="ai-assessment__indicator-card"
                      key={key}
                    >
                      <span>{label}</span>
                      <strong>
                        {valid ? Number(value).toFixed(2) : "Unavailable"}
                      </strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>Medical indicators are unavailable for this assessment.</p>
            )}
          </section>

          
{/* ORIGINAL SCAN VS GRAD-CAM */}

<section className="ai-assessment__comparison">
  <div className="ai-assessment__comparison-heading">
    <span>MODEL EXPLAINABILITY</span>
    <h4>Why did the AI make this prediction?</h4>
    <p>
      Compare the uploaded scan with the regions highlighted by
      the model during prediction.
    </p>
  </div>

  <div className="ai-assessment__comparison-grid">
    <div className="ai-assessment__scan-panel">
      <h5>Original Brain Scan</h5>
      {previewUrl ? (
        <img src={previewUrl} alt="Original uploaded brain scan" />
      ) : (
        <p>Original scan is unavailable.</p>
      )}
    </div>

    <div className="ai-assessment__scan-panel">
      <h5>Grad-CAM HeatMap</h5>
      {result.gradCAM ? (
        <img
          src={
            result.gradCAM.startsWith("data:")
              ? result.gradCAM
              : `data:image/png;base64,${result.gradCAM}`
          }
          alt="Grad-CAM attention heatmap"
        />
      ) : (
        <p>Grad-CAM is unavailable for this assessment.</p>
      )}
    </div>
  </div>

  <div className="ai-assessment__prediction-explanation">
    <span>MODEL PREDICTION</span>
    <h4>{result.prediction}</h4>

    {result.prediction === "Normal" ||
    result.prediction === "Non Demented" ? (
      <p>
        The model classified this scan as non-demented.
        Review the highlighted attention regions to see which image
        areas influenced its prediction. This does not rule out disease.
      </p>
    ) : result.prediction === "Mild Dementia" ? (
      <p>
        The model classified this scan as mild dementia.
        The heatmap shows image regions that influenced this prediction;
        it does not establish that those regions are diseased.
      </p>
    ) : result.prediction === "Moderate Dementia" ? (
      <p>
        The model classified this scan as moderate dementia.
        Inspect the highlighted regions alongside the original scan
        to understand where the model focused.
      </p>
    ) : result.prediction === "Severe Dementia" ? (
      <p>
        The model classified this scan as severe dementia.
        The highlighted regions indicate model attention, not proof
        of severe damage or a clinical measurement of disease severity.
      </p>
    ) : (
      <p>
        Review the prediction and attention map together.
        The heatmap alone cannot establish a clinical diagnosis.
      </p>
    )}
  </div>
</section>


          {/* DISCLAIMER */}

          <div className="ai-assessment__disclaimer">
            <FaExclamationTriangle />

            <span>
              This is an AI-assisted prediction, not a medical diagnosis.
              The image-derived indicators are experimental estimates and
              should not be used independently to make clinical decisions.
            </span>
          </div>

          {/* RESET */}

          <button
            type="button"
            className="ai-assessment__reset"
            onClick={handleReset}
          >
            Analyze Another Scan
          </button>
        </div>
      ) : (
        /* UPLOAD FORM */

        <form className="ai-assessment__form" onSubmit={handleSubmit}>
          {/* PATIENT */}

          <div className="ai-assessment__field">
            <label htmlFor="assessment-patient">Patient</label>

            <select
              id="assessment-patient"
              value={selectedPatient}
              onChange={(event) => {
                setSelectedPatient(event.target.value);
                setError("");
              }}
              disabled={isAnalyzing}
              required
            >
              <option value="">Select a patient</option>

              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.fullName}
                  {patient.age ? ` — ${patient.age} years` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* IMAGE UPLOAD */}

          <div className="ai-assessment__field">
            <label htmlFor="assessment-image">MRI / CT Scan</label>

            {!selectedFile ? (
              <button
                type="button"
                className="ai-assessment__upload"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
              >
                <FaCloudUploadAlt />
                <strong>Upload Brain Scan</strong>
                <span>JPG, PNG or WEBP · Max 5 MB</span>
              </button>
            ) : (
              <div className="ai-assessment__file">
                <div className="ai-assessment__preview">
                  <img src={previewUrl} alt="Selected brain scan" />
                </div>

                <div className="ai-assessment__file-info">
                  <strong>{selectedFile.name}</strong>
                  <span>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>

                <button
                  type="button"
                  className="ai-assessment__remove"
                  onClick={handleRemoveFile}
                  disabled={isAnalyzing}
                  aria-label="Remove image"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            <input
              id="assessment-image"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              hidden
              disabled={isAnalyzing}
            />
          </div>

          {/* CLINICAL NOTES */}

          <div className="ai-assessment__field">
            <label htmlFor="assessment-notes">
              Clinical Notes <span>Optional</span>
            </label>

            <textarea
              id="assessment-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add any relevant clinical observations..."
              maxLength={2000}
              disabled={isAnalyzing}
              rows={4}
            />
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            className="ai-assessment__submit"
            disabled={isAnalyzing || patients.length === 0}
          >
            {isAnalyzing ? (
              <>
                <FaSpinner className="ai-assessment__spinner" />
                Analyzing Scan...
              </>
            ) : (
              <>
                <FaBrain />
                Analyze Scan
              </>
            )}
          </button>
        </form>
      )}
    </section>
  );
};

/* ============================================================
   PROBABILITY ROW
============================================================ */

const ProbabilityRow = ({ label, value }) => {
  const parsedValue = Number(value);
  const percentage = Number.isFinite(parsedValue) ? parsedValue : 0;

  return (
    <div className="ai-assessment__probability">
      <div className="ai-assessment__probability-top">
        <span>{label}</span>
        <strong>{percentage.toFixed(2)}%</strong>
      </div>

      <div className="ai-assessment__progress">
        <div
          style={{
            width: `${Math.min(Math.max(percentage, 0), 100)}%`,
          }}
        />
      </div>
    </div>
  );
};

export default AIAssessment;
