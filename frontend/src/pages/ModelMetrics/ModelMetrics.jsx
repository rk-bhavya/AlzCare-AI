import React from "react";
import "./ModelMetrics.css";

const metrics = [
  {
    title: "Accuracy",
    value: "96.60%",
    description: "Overall correct predictions",
    color: "#2563eb",
  },
  {
    title: "Precision",
    value: "93.13%",
    description: "Correct positive predictions",
    color: "#7c3aed",
  },
  {
    title: "Recall",
    value: "93.12%",
    description: "Actual positives correctly identified",
    color: "#059669",
  },
  {
    title: "F1-Score",
    value: "91.54%",
    description: "Balance of precision and recall",
    color: "#ea580c",
  },
];

const comparisonModels = [
  {
    name: "DenseNet121",
    accuracy: 88.36,
    precision: 89.96,
    recall: 89.50,
    f1: 90.03,
  },
  {
    name: "3D-CNN + Video Swin",
    accuracy: 92.00,
    precision: 96.50,
    recall: 91.00,
    f1: 90.90,
  },
  {
    name: "Multi-CNN Ensemble",
    accuracy: 99.43,
    precision: 98.50,
    recall: 98.60,
    f1: 98.50,
  },
  {
    name: "SVM and RF",
    accuracy: 91.30,
    precision: 90.80,
    recall: null,
    f1: null,
  },
  {
    name: "Proposed EfficientNetB0",
    accuracy: 96.60,
    precision: 93.13,
    recall: 93.12,
    f1: 91.54,
  },
];

const ComparisonChart = () => {
  const metrics = [
    { key: "accuracy", label: "Accuracy", color: "#6366f1" },
    { key: "precision", label: "Precision", color: "#14b8a6" },
    { key: "recall", label: "Recall", color: "#f59e0b" },
    { key: "f1", label: "F1-Score", color: "#ec4899" },
  ];

  const width = 900;
  const height = 440;
  const left = 65;
  const right = 30;
  const top = 35;
  const bottom = 100;
  const minY = 85;
  const maxY = 100;

  const x = (index) =>
    left + (index * (width - left - right)) /
      (comparisonModels.length - 1);

  const y = (value) =>
    top + ((maxY - value) / (maxY - minY)) *
      (height - top - bottom);

  const modelLabels = [
  "DenseNet121",
  "3D-CNN + Swin",
  "EfficientNetB0",
  "SVM / RF",
  "Multi-CNN",
];

  return (
    <section className="model-metrics__section">
      <div className="chart-heading">
        <div>
          <span className="chart-eyebrow">MODEL EVALUATION</span>
          <h2>Comparative Model Performance</h2>
          <p>
            Compare Accuracy, Precision, Recall and F1-Score
            across different models.
          </p>
        </div>
      </div>

      <div className="performance-legend">
        {metrics.map((metric) => (
          <div className="legend-item" key={metric.key}>
            <span
              className="legend-line"
              style={{ background: metric.color }}
            />
            <span>{metric.label}</span>
          </div>
        ))}
      </div>

      <div className="performance-chart-card">
        <div className="performance-chart-scroll">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="performance-chart"
            role="img"
            aria-label="Four-line comparison of model evaluation metrics"
          >
            <defs>
              {metrics.map((metric) => (
                <linearGradient
                  key={metric.key}
                  id={`gradient-${metric.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={metric.color}
                    stopOpacity="0.18"
                  />
                  <stop
                    offset="100%"
                    stopColor={metric.color}
                    stopOpacity="0"
                  />
                </linearGradient>
              ))}
            </defs>

            {[85, 90, 95, 100].map((tick) => (
              <g key={tick}>
                <line
                  x1={left}
                  y1={y(tick)}
                  x2={width - right}
                  y2={y(tick)}
                  stroke="#e8edf5"
                  strokeDasharray="5 6"
                />
                <text
                  x={left - 12}
                  y={y(tick) + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#64748b"
                >
                  {tick}%
                </text>
              </g>
            ))}

            {comparisonModels.map((model, index) => (
              <g key={model.name}>
                <line
                  x1={x(index)}
                  y1={top}
                  x2={x(index)}
                  y2={height - bottom}
                  stroke="#f1f5f9"
                />
                <text
  x={x(index)}
  y={height - bottom + 25}
  textAnchor="middle"
  fontSize="11"
  fontWeight="500"
  fill="#64748b"
>
  {modelLabels[index]}
</text>
              </g>
            ))}

            {metrics.map((metric) => {
              const points = comparisonModels
                .map((model, index) => ({
                  index,
                  value: model[metric.key],
                }))
                .filter((point) => point.value != null);

              const linePoints = points
                .map((point) =>
                  `${x(point.index)},${y(point.value)}`
                )
                .join(" ");

              const areaPoints =
                `${x(points[0].index)},${height - bottom} ` +
                linePoints +
                ` ${x(points[points.length - 1].index)},${height - bottom}`;

              return (
                <g key={metric.key}>
                  <polygon
                    points={areaPoints}
                    fill={`url(#gradient-${metric.key})`}
                  />

                  <polyline
                    points={linePoints}
                    fill="none"
                    stroke={metric.color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {points.map((point) => (
                    <g key={point.index}>
                      <circle
                        cx={x(point.index)}
                        cy={y(point.value)}
                        r={point.index === 4 ? 5.5 : 4}
                        fill="#ffffff"
                        stroke={metric.color}
                        strokeWidth="3"
                      />
                      <title>
                        {modelLabels[point.index]} — {metric.label}:{" "}
                        {point.value.toFixed(2)}%
                      </title>
                    </g>
                  ))}
                </g>
              );
            })}

            <text
              x={left}
              y={height - 18}
              fontSize="12"
              fill="#64748b"
            >
            </text>
          </svg>
        </div>

        <div className="proposed-model-summary">
          <div>
            <span className="summary-dot" />
            <span>Proposed Model</span>
            <strong>EfficientNetB0</strong>
          </div>

          <div className="summary-metrics">
            <span>
              ACC <b>96.60%</b>
            </span>
            <span>
              PRE <b>93.13%</b>
            </span>
            <span>
              REC <b>93.12%</b>
            </span>
            <span>
              F1 <b>91.54%</b>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};


const ModelMetrics = () => {
  return (
    <main className="model-metrics">
      {/* Page Header */}
      <section className="model-metrics__hero">
        <span className="model-metrics__eyebrow">
          MODEL PERFORMANCE
        </span>

        <h1>Model Evaluation Metrics</h1>

        <p>
          An overview of the evaluation measures used to assess the
          EfficientNetB0-based brain image classification model in AlzCare AI.
        </p>

        <span className="model-metrics__status">
          Based on recorded evaluation results
        </span>
      </section>

      {/* Evaluation Metric Cards */}
      <section className="model-metrics__cards">
        {metrics.map((metric) => (
          <article
            className="model-metrics__card"
            key={metric.title}
          >
            <h2>{metric.title}</h2>

            <p
              className="model-metrics__value"
              style={{ color: metric.color }}
            >
              {metric.value}
            </p>

            <p className="model-metrics__description">
              {metric.description}
            </p>
          </article>
        ))}
      </section>

      {/* Model Comparison Graph */}
      <ComparisonChart />

      {/* Confusion Matrix Image */}
      <section className="model-metrics__section model-metrics__confusion">
        <h2>Confusion Matrix</h2>

        <p className="model-metrics__subtitle">
          Visual representation of actual versus predicted classifications
          across the four model classes.
        </p>

        <div className="model-metrics__image-container">
          <img
            src="/cm.png"
            alt="AlzCare AI model confusion matrix"
            className="model-metrics__confusion-image"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>

        <p className="model-metrics__note">
          Rows represent actual classes and columns represent predicted
          classes. The matrix is reproduced from the model evaluation output.
        </p>
      </section>

      {/* Metric Definitions */}
      <section className="model-metrics__section">
        <h2>Understanding the Metrics</h2>

        <div className="model-metrics__definitions">
          <article>
            <h3>Accuracy</h3>
            <p>
              The proportion of all test images classified correctly.
            </p>
          </article>

          <article>
            <h3>Precision</h3>
            <p>
              The proportion of positive predictions that are correct.
            </p>
          </article>

          <article>
            <h3>Recall</h3>
            <p>
              The proportion of actual positive cases correctly identified.
            </p>
          </article>

          <article>
            <h3>F1-Score</h3>
            <p>
              A measure combining precision and recall.
            </p>
          </article>
        </div>
      </section>

      {/* Disclaimer */}
      <p className="model-metrics__disclaimer">
        These metrics describe model evaluation results and are not a
        clinical diagnosis. Individual prediction confidence differs from
        overall model accuracy. Performance should be interpreted in the
        context of the evaluation dataset and its class distribution.
      </p>
    </main>
  );
};

export default ModelMetrics;