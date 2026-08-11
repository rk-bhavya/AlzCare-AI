import {
  FaArrowRight,
} from "react-icons/fa";

const patients = [
  {
    id: 1,
    name: "Lakshmi Devi",
    age: 68,
    gender: "Female",
    caregiver: "Anita Sharma",
    status: "Mild Alzheimer's",
    risk: "Monitoring",
    assessment: "10 Aug 2026",
  },
  {
    id: 2,
    name: "Ramesh Kumar",
    age: 72,
    gender: "Male",
    caregiver: "Suresh Kumar",
    status: "Moderate Alzheimer's",
    risk: "Needs Attention",
    assessment: "09 Aug 2026",
  },
  {
    id: 3,
    name: "Meena Rao",
    age: 65,
    gender: "Female",
    caregiver: "Arjun Rao",
    status: "Stable",
    risk: "Stable",
    assessment: "08 Aug 2026",
  },
  {
    id: 4,
    name: "Krishna Murthy",
    age: 70,
    gender: "Male",
    caregiver: "Priya Murthy",
    status: "Mild Alzheimer's",
    risk: "Monitoring",
    assessment: "07 Aug 2026",
  },
];

const PatientOverview = () => {
  return (
    <section className="doctor-dashboard__section">

      <div className="doctor-section-header">

        <div>
          <span>
            PATIENT MANAGEMENT
          </span>

          <h2>
            My Patients
          </h2>
        </div>

        <button
          type="button"
          className="doctor-view-all"
        >
          View All
          <FaArrowRight />
        </button>

      </div>

      <div className="doctor-patient-table-wrapper">

        <table className="doctor-patient-table">

          <thead>
            <tr>
              <th>Patient</th>
              <th>Age</th>
              <th>Caregiver</th>
              <th>Status</th>
              <th>Last Assessment</th>
              <th>Risk Level</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {patients.map((patient) => (
              <tr key={patient.id}>

                <td>
                  <div className="doctor-patient-name">
                    <div className="doctor-patient-avatar">
                      {patient.name.charAt(0)}
                    </div>

                    <div>
                      <strong>
                        {patient.name}
                      </strong>

                      <span>
                        {patient.gender}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  {patient.age}
                </td>

                <td>
                  {patient.caregiver}
                </td>

                <td>
                  <span className="doctor-status status-blue">
                    {patient.status}
                  </span>
                </td>

                <td>
                  {patient.assessment}
                </td>

                <td>
                  <span
                    className={`doctor-status ${
                      patient.risk ===
                      "Needs Attention"
                        ? "status-red"
                        : patient.risk ===
                          "Stable"
                        ? "status-green"
                        : "status-orange"
                    }`}
                  >
                    {patient.risk}
                  </span>
                </td>

                <td>
                  <button
                    type="button"
                    className="doctor-table-action"
                  >
                    View
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </section>
  );
};

export default PatientOverview;