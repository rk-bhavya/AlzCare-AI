import { useEffect, useMemo, useState } from "react";

import {
  FaPills,
  FaPlus,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTrash,
  FaEdit,
  FaTimes,
  FaHistory,
} from "react-icons/fa";

import { getCaregiverPatients } from "../../api/caregiver.api.js";

import {
  getTodaysMedicationSchedule,
  getMedicationsForPatient,
  getMedicationHistory,
  createMedication,
  updateMedication,
  deleteMedication,
  markMedicationTaken,
} from "../../api/medication.api.js";

import CaregiverPageLayout from "../../components/CaregiverDashboard/CaregiverPageLayout.jsx";

const emptyForm = {
  name: "",
  dosage: "",
  frequency: "",
  times: "",
  startDate: "",
  endDate: "",
  instructions: "",
};

const formatTime12h = (time24) => {
  if (!time24) return "—";
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const CaregiverMedications = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  const [schedule, setSchedule] = useState([]);
  const [medications, setMedications] = useState([]);
  const [history, setHistory] = useState([]);

  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [error, setError] = useState("");

  const [showHistory, setShowHistory] = useState(false);
  const [markingKey, setMarkingKey] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadPatients = async () => {
    try {
      setIsLoadingPatients(true);
      const response = await getCaregiverPatients();
      const list = response.patients || [];
      setPatients(list);

      if (list.length > 0) {
        setSelectedPatientId((prev) => prev || list[0]._id);
      }
    } catch (err) {
      console.error("Unable to load patients:", err);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatientData = async () => {
    if (!selectedPatientId) return;

    try {
      setIsLoadingSchedule(true);
      setError("");

      const [scheduleRes, medsRes] = await Promise.all([
        getTodaysMedicationSchedule(selectedPatientId),
        getMedicationsForPatient(selectedPatientId),
      ]);

      setSchedule(scheduleRes.schedule || []);
      setMedications(medsRes.medications || []);
    } catch (err) {
      console.error("Unable to load medications:", err);
      setError(
        err.response?.data?.message || "Unable to load medications."
      );
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  useEffect(() => {
    loadPatientData();
    setShowHistory(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatientId]);

  const loadHistory = async () => {
    try {
      const response = await getMedicationHistory(selectedPatientId);
      setHistory(response.history || []);
      setShowHistory(true);
    } catch (err) {
      console.error("Unable to load history:", err);
    }
  };

  const handleMarkTaken = async (medicationId, time) => {
    const key = `${medicationId}_${time}`;

    try {
      setMarkingKey(key);
      await markMedicationTaken(medicationId, time);
      await loadPatientData();
    } catch (err) {
      console.error("Unable to mark medication as taken:", err);
    } finally {
      setMarkingKey("");
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (medication) => {
    setEditingId(medication._id);
    setForm({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      times: medication.times.join(", "),
      startDate: medication.startDate
        ? medication.startDate.slice(0, 10)
        : "",
      endDate: medication.endDate ? medication.endDate.slice(0, 10) : "",
      instructions: medication.instructions || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setShowModal(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.dosage.trim() || !form.frequency.trim() || !form.times.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }

    const times = form.times
      .split(",")
      .map((time) => time.trim())
      .filter(Boolean);

    const payload = {
      patientId: selectedPatientId,
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      frequency: form.frequency.trim(),
      times,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      instructions: form.instructions.trim(),
    };

    try {
      setIsSaving(true);
      setFormError("");

      if (editingId) {
        await updateMedication(editingId, payload);
      } else {
        await createMedication(payload);
      }

      setShowModal(false);
      await loadPatientData();
    } catch (err) {
      console.error("Unable to save medication:", err);
      setFormError(
        err.response?.data?.message || "Unable to save medication."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (medicationId) => {
    if (!window.confirm("Remove this medication? This cannot be undone.")) {
      return;
    }

    try {
      await deleteMedication(medicationId);
      await loadPatientData();
    } catch (err) {
      console.error("Unable to delete medication:", err);
    }
  };

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient._id === selectedPatientId),
    [patients, selectedPatientId]
  );

  return (
    <CaregiverPageLayout
      activePage="Medications"
      eyebrow="Care Plan"
      title="Medication Management"
      subtitle="Track, schedule, and confirm your patient's medications."
    >
      {isLoadingPatients ? (
        <div className="cg-card">
          <div className="cg-state">
            <FaSpinner className="appointment-spinner" />
            Loading patients...
          </div>
        </div>
      ) : patients.length === 0 ? (
        <div className="cg-card">
          <div className="cg-state">
            <FaPills />
            <strong>No patients assigned</strong>
            <span>Medication management will be available once a patient is assigned to you.</span>
          </div>
        </div>
      ) : (
        <>
          <div className="cg-card">
            <div className="cg-toolbar" style={{ marginBottom: 0 }}>
              <div className="cg-field" style={{ minWidth: 240 }}>
                <label>Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(event) =>
                    setSelectedPatientId(event.target.value)
                  }
                >
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }} />

              <button
                type="button"
                className="cg-btn cg-btn--outline cg-btn--sm"
                onClick={loadHistory}
              >
                <FaHistory />
                History
              </button>

              <button
                type="button"
                className="cg-btn cg-btn--primary cg-btn--sm"
                onClick={openAddModal}
              >
                <FaPlus />
                Add Medication
              </button>
            </div>
          </div>

          {/* TODAY'S SCHEDULE */}
          <div className="cg-card">
            <div className="cg-card__header">
              <div>
                <span>TODAY'S SCHEDULE</span>
                <h2>{selectedPatient?.fullName}'s Medications</h2>
              </div>
            </div>

            {isLoadingSchedule ? (
              <div className="cg-state">
                <FaSpinner className="appointment-spinner" />
                Loading schedule...
              </div>
            ) : error ? (
              <div className="cg-state cg-state--error">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            ) : schedule.length === 0 ? (
              <div className="cg-state">
                <FaPills />
                <strong>No medications today</strong>
                <span>Add a medication to see today's schedule.</span>
              </div>
            ) : (
              <div className="cg-table-wrapper">
                <table className="cg-table">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((dose) => {
                      const key = `${dose.medicationId}_${dose.time}`;
                      const isMarking = markingKey === key;

                      return (
                        <tr key={key}>
                          <td>{dose.name}</td>
                          <td>{dose.dosage}</td>
                          <td>{formatTime12h(dose.time)}</td>
                          <td>
                            <span
                              className={`cg-badge ${
                                dose.status === "taken"
                                  ? "cg-badge--green"
                                  : dose.status === "missed"
                                  ? "cg-badge--red"
                                  : "cg-badge--orange"
                              }`}
                            >
                              {dose.status === "taken" && <FaCheckCircle />}
                              {dose.status.charAt(0).toUpperCase() +
                                dose.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            {dose.status === "taken" ? (
                              "—"
                            ) : (
                              <button
                                type="button"
                                className="cg-btn cg-btn--outline cg-btn--sm"
                                disabled={isMarking}
                                onClick={() =>
                                  handleMarkTaken(dose.medicationId, dose.time)
                                }
                              >
                                {isMarking ? (
                                  <FaSpinner className="appointment-spinner" />
                                ) : (
                                  "Mark as Taken"
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ALL MEDICATIONS */}
          <div className="cg-card">
            <div className="cg-card__header">
              <div>
                <span>CARE PLAN</span>
                <h2>All Medications</h2>
              </div>
            </div>

            {medications.length === 0 ? (
              <div className="cg-state">
                <FaPills />
                <strong>No medications added yet</strong>
              </div>
            ) : (
              <div className="cg-table-wrapper">
                <table className="cg-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Times</th>
                      <th>Instructions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((medication) => (
                      <tr key={medication._id}>
                        <td>{medication.name}</td>
                        <td>{medication.dosage}</td>
                        <td>{medication.frequency}</td>
                        <td>{medication.times.join(", ")}</td>
                        <td>{medication.instructions || "—"}</td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              type="button"
                              className="cg-btn cg-btn--outline cg-btn--sm"
                              onClick={() => openEditModal(medication)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              className="cg-btn cg-btn--danger cg-btn--sm"
                              onClick={() => handleDelete(medication._id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* HISTORY */}
          {showHistory && (
            <div className="cg-card">
              <div className="cg-card__header">
                <div>
                  <span>LOG</span>
                  <h2>Medication History</h2>
                </div>
                <button
                  type="button"
                  className="cg-btn cg-btn--ghost cg-btn--sm"
                  onClick={() => setShowHistory(false)}
                >
                  <FaTimes />
                </button>
              </div>

              {history.length === 0 ? (
                <div className="cg-state">
                  <strong>No history yet</strong>
                </div>
              ) : (
                <div className="cg-table-wrapper">
                  <table className="cg-table">
                    <thead>
                      <tr>
                        <th>Medication</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((log) => (
                        <tr key={log._id}>
                          <td>{log.medication?.name || "—"}</td>
                          <td>{log.date}</td>
                          <td>{formatTime12h(log.time)}</td>
                          <td>
                            <span
                              className={`cg-badge ${
                                log.status === "taken"
                                  ? "cg-badge--green"
                                  : "cg-badge--red"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="cg-overlay" onClick={closeModal}>
          <div className="cg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cg-modal-header">
              <div>
                <span>MEDICATION</span>
                <h3>{editingId ? "Edit Medication" : "Add Medication"}</h3>
              </div>
              <button
                type="button"
                className="cg-modal-close"
                onClick={closeModal}
                disabled={isSaving}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="cg-form-grid">
                <div className="cg-field cg-field--full">
                  <label>Medication Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g. Donepezil"
                  />
                </div>

                <div className="cg-field">
                  <label>Dosage *</label>
                  <input
                    type="text"
                    value={form.dosage}
                    onChange={(e) =>
                      setForm({ ...form, dosage: e.target.value })
                    }
                    placeholder="e.g. 5 mg"
                  />
                </div>

                <div className="cg-field">
                  <label>Frequency *</label>
                  <input
                    type="text"
                    value={form.frequency}
                    onChange={(e) =>
                      setForm({ ...form, frequency: e.target.value })
                    }
                    placeholder="e.g. Once daily"
                  />
                </div>

                <div className="cg-field cg-field--full">
                  <label>Time(s) * — comma separated, 24hr HH:mm</label>
                  <input
                    type="text"
                    value={form.times}
                    onChange={(e) =>
                      setForm({ ...form, times: e.target.value })
                    }
                    placeholder="e.g. 08:00, 20:00"
                  />
                </div>

                <div className="cg-field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>

                <div className="cg-field">
                  <label>End Date (optional)</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>

                <div className="cg-field cg-field--full">
                  <label>Instructions</label>
                  <textarea
                    rows={3}
                    value={form.instructions}
                    onChange={(e) =>
                      setForm({ ...form, instructions: e.target.value })
                    }
                    placeholder="e.g. Take with food"
                  />
                </div>
              </div>

              {formError && (
                <p className="cg-field-error" style={{ marginTop: 10 }}>
                  {formError}
                </p>
              )}

              <div className="cg-form-actions">
                <button
                  type="button"
                  className="cg-btn cg-btn--ghost"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cg-btn cg-btn--primary"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Add Medication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CaregiverPageLayout>
  );
};

export default CaregiverMedications;
