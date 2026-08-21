import { useRef, useState } from "react";

import {
  FaBrain,
  FaCloudUploadAlt,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

import {
  createAssessment,
} from "../../api/assessment.api.js";

import "./AIAssessment.css";


const AIAssessment = ({
  patients = [],
}) => {

  /* ============================================================
     STATE
  ============================================================ */

  const [selectedPatient, setSelectedPatient] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);

  const fileInputRef =
    useRef(null);


  /* ============================================================
     FILE SELECTION
  ============================================================ */

  const handleFileChange = (event) => {

    const file =
      event.target.files?.[0];

    setError("");
    setResult(null);

    if (!file) {
      return;
    }


    /* ----------------------------------------------------------
       FILE TYPE VALIDATION
    ---------------------------------------------------------- */

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Please upload a JPG, JPEG, PNG, or WEBP image."
      );

      event.target.value = "";
      return;
    }


    /* ----------------------------------------------------------
       FILE SIZE VALIDATION
       Backend currently allows maximum 5 MB.
    ---------------------------------------------------------- */

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image size must be less than 5 MB."
      );

      event.target.value = "";
      return;
    }


    setSelectedFile(file);

    setPreviewUrl(
      URL.createObjectURL(file)
    );
  };


  /* ============================================================
     REMOVE SELECTED IMAGE
  ============================================================ */

  const handleRemoveFile = () => {

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
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

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");
    setResult(null);


    /* ----------------------------------------------------------
       VALIDATION
    ---------------------------------------------------------- */

    if (!selectedPatient) {
      setError(
        "Please select a patient."
      );
      return;
    }

    if (!selectedFile) {
      setError(
        "Please upload an MRI or CT image."
      );
      return;
    }


    try {

      setIsAnalyzing(true);


      /* --------------------------------------------------------
         CALL BACKEND
      -------------------------------------------------------- */

      const response =
        await createAssessment(
          selectedPatient,
          selectedFile,
          notes
        );


      /* --------------------------------------------------------
         STORE RESULT
      -------------------------------------------------------- */

      setResult(
        response.assessment
      );

    } catch (err) {

      console.error(
        "AI assessment error:",
        err
      );

      setError(
        err.response?.data?.message ||
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

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="ai-assessment__header">

        <div className="ai-assessment__heading">

          <div className="ai-assessment__icon">
            <FaBrain />
          </div>

          <div>

            <span>
              AI-ASSISTED ANALYSIS
            </span>

            <h2>
            AI Assessment
            </h2>

            <p>
              Upload a patient's brain scan
              for AI-assisted assessment.
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="ai-assessment__message ai-assessment__message--error">

          <FaExclamationTriangle />

          <span>
            {error}
          </span>

        </div>
      )}


      {/* ======================================================
          RESULT
      ====================================================== */}

      {result ? (

        <div className="ai-assessment__result">

          <div className="ai-assessment__result-header">

            <div>

              <span>
                AI ASSESSMENT COMPLETE
              </span>

              <h3>
                Assessment Result
              </h3>

            </div>

            <FaCheckCircle />

          </div>


          <div className="ai-assessment__prediction">

            <span>
              Predicted Classification
            </span>

            <strong>
              {result.prediction}
            </strong>

            <div className="ai-assessment__confidence">

              <span>
                Confidence
              </span>

              <strong>
                {Number(
                  result.confidence
                ).toFixed(2)}
                %
              </strong>

            </div>

          </div>


          {/* PROBABILITIES */}

          {result.probabilities && (
            <div className="ai-assessment__probabilities">

              <h4>
                Class Probabilities
              </h4>

              <div className="ai-assessment__probability-list">

                <ProbabilityRow
                  label="Non Demented"
                  value={
                    result.probabilities
                      .nonDemented
                  }
                />

                <ProbabilityRow
                  label="Very Mild Dementia"
                  value={
                    result.probabilities
                      .veryMildDementia
                  }
                />

                <ProbabilityRow
                  label="Mild Dementia"
                  value={
                    result.probabilities
                      .mildDementia
                  }
                />

                <ProbabilityRow
                  label="Moderate Dementia"
                  value={
                    result.probabilities
                      .moderateDementia
                  }
                />

              </div>

            </div>
          )}


          {/* DISCLAIMER */}

          <div className="ai-assessment__disclaimer">

            <FaExclamationTriangle />

            <span>
              This result is an AI-assisted
              prediction and should not be
              considered an independent medical
              diagnosis.
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

        /* ====================================================
           FORM
        ==================================================== */

        <form
          className="ai-assessment__form"
          onSubmit={handleSubmit}
        >

          {/* PATIENT */}

          <div className="ai-assessment__field">

            <label htmlFor="assessment-patient">
              Patient
            </label>

            <select
              id="assessment-patient"
              value={selectedPatient}
              onChange={(event) => {
                setSelectedPatient(
                  event.target.value
                );
                setError("");
              }}
              disabled={isAnalyzing}
            >

              <option value="">
                Select a patient
              </option>

              {patients.map(
                (patient) => (
                  <option
                    key={patient._id}
                    value={patient._id}
                  >
                    {patient.fullName}
                    {patient.age
                      ? ` — ${patient.age} years`
                      : ""}
                  </option>
                )
              )}

            </select>

          </div>


          {/* IMAGE UPLOAD */}

          <div className="ai-assessment__field">

            <label>
              MRI / CT Scan
            </label>

            {!selectedFile ? (

              <button
                type="button"
                className="ai-assessment__upload"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={isAnalyzing}
              >

                <FaCloudUploadAlt />

                <strong>
                  Upload Brain Scan
                </strong>

                <span>
                  JPG, PNG or WEBP · Max 5 MB
                </span>

              </button>

            ) : (

              <div className="ai-assessment__file">

                <div className="ai-assessment__preview">

                  <img
                    src={previewUrl}
                    alt="Selected brain scan"
                  />

                </div>

                <div className="ai-assessment__file-info">

                  <strong>
                    {selectedFile.name}
                  </strong>

                  <span>
                    {(
                      selectedFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}
                    {" MB"}
                  </span>

                </div>

                <button
                  type="button"
                  className="ai-assessment__remove"
                  onClick={
                    handleRemoveFile
                  }
                  disabled={isAnalyzing}
                  aria-label="Remove image"
                >
                  <FaTimes />
                </button>

              </div>

            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={
                handleFileChange
              }
              hidden
            />

          </div>


          {/* NOTES */}

          <div className="ai-assessment__field">

            <label htmlFor="assessment-notes">
              Clinical Notes
              <span>
                Optional
              </span>
            </label>

            <textarea
              id="assessment-notes"
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
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
            disabled={
              isAnalyzing ||
              !patients.length
            }
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

const ProbabilityRow = ({
  label,
  value,
}) => {

  const percentage =
    Number(value) || 0;

  return (
    <div className="ai-assessment__probability">

      <div className="ai-assessment__probability-top">

        <span>
          {label}
        </span>

        <strong>
          {percentage.toFixed(2)}%
        </strong>

      </div>

      <div className="ai-assessment__progress">

        <div
          style={{
            width: `${Math.min(
              Math.max(
                percentage,
                0
              ),
              100
            )}%`,
          }}
        />

      </div>

    </div>
  );
};


export default AIAssessment;