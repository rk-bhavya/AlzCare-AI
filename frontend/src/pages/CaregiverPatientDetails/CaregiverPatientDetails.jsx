import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaPills,
  FaCalendarAlt,
  FaBell,
  FaBrain,
  FaUserMd,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUsers,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaTimes,
  FaCamera,
  FaUserCircle,
  FaListUl,
  FaEdit,
  FaRegCircle,
  FaRegCheckCircle,
  FaMobileAlt,
  FaSyncAlt,
  FaCopy,
} from "react-icons/fa";

import { getCaregiverPatientDetails } from "../../api/caregiver.api.js";
import {
  createFamilyMember,
  deleteFamilyMember,
} from "../../api/familyMember.api.js";
import {
  getPatientDailyTasks,
  createDailyTask,
  updateDailyTask,
  completeDailyTask,
  deleteDailyTask,
} from "../../api/dailyTask.api.js";
import {
  getPatientDeviceStatus,
  setupPatientDevice,
  regeneratePatientDevice,
  revokePatientDevice,
} from "../../api/patientDevice.api.js";
import CaregiverPageLayout from "../../components/CaregiverDashboard/CaregiverPageLayout.jsx";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const predictionBadgeClass = (prediction) => {
  if (prediction === "Non Demented") return "cg-badge--green";
  if (prediction === "Moderate Dementia") return "cg-badge--red";
  if (prediction === "Mild Dementia") return "cg-badge--orange";
  return "cg-badge--orange";
};

const CaregiverPatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [familyForm, setFamilyForm] = useState({
    name: "",
    relationship: "",
  });
  const [familyPhoto, setFamilyPhoto] = useState(null);
  const [familyPhotoPreview, setFamilyPhotoPreview] = useState("");
  const [familyFormError, setFamilyFormError] = useState("");
  const [isSavingFamilyMember, setIsSavingFamilyMember] = useState(false);
  const [removingId, setRemovingId] = useState("");

  const [dailyTasks, setDailyTasks] = useState([]);
  const [taskSummary, setTaskSummary] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    category: "Other",
    scheduledTime: "",
    frequency: "daily",
  });
  const [taskFormError, setTaskFormError] = useState("");
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState("");

  const [deviceStatus, setDeviceStatus] = useState(null);
  const [isLoadingDevice, setIsLoadingDevice] = useState(true);
  const [isDeviceActionLoading, setIsDeviceActionLoading] = useState(false);
  const [deviceError, setDeviceError] = useState("");
  const [pairingCodeData, setPairingCodeData] = useState(null);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const loadDetails = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getCaregiverPatientDetails(patientId);
      setData(response);
    } catch (err) {
      console.error("Unable to load patient details:", err);
      setError(
        err.response?.data?.message || "Unable to load patient details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setIsLoadingTasks(true);
      const response = await getPatientDailyTasks(patientId);
      setDailyTasks(response.tasks || []);
      setTaskSummary(
        response.summary || { total: 0, completed: 0, pending: 0 }
      );
    } catch (err) {
      console.error("Unable to load daily tasks:", err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const loadDeviceStatus = async () => {
    try {
      setIsLoadingDevice(true);
      setDeviceError("");
      const response = await getPatientDeviceStatus(patientId);
      setDeviceStatus(response);
    } catch (err) {
      console.error("Unable to load device status:", err);
      setDeviceError(
        err.response?.data?.message || "Unable to load device status."
      );
    } finally {
      setIsLoadingDevice(false);
    }
  };

  useEffect(() => {
    loadDetails();
    loadTasks();
    loadDeviceStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const patient = data?.patient;
  const doctor = data?.doctor;
  const assessments = data?.assessments || [];
  const medications = data?.medications || [];
  const appointments = data?.appointments || [];
  const alerts = data?.alerts || [];
  const familyMembers = data?.familyMembers || [];

  const openAddFamilyMemberModal = () => {
    setFamilyForm({ name: "", relationship: "" });
    setFamilyPhoto(null);
    setFamilyPhotoPreview("");
    setFamilyFormError("");
    setShowAddModal(true);
  };

  const closeAddFamilyMemberModal = () => {
    if (isSavingFamilyMember) return;
    setShowAddModal(false);
  };

  const handleFamilyPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFamilyFormError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFamilyFormError("Photo must be less than 5 MB.");
      return;
    }

    setFamilyPhoto(file);
    setFamilyPhotoPreview(URL.createObjectURL(file));
    setFamilyFormError("");
  };

  const handleAddFamilyMember = async (event) => {
    event.preventDefault();

    if (!familyForm.name.trim() || !familyForm.relationship.trim()) {
      setFamilyFormError("Name and relationship are required.");
      return;
    }

    try {
      setIsSavingFamilyMember(true);
      setFamilyFormError("");

      const formData = new FormData();
      formData.append("patientId", patientId);
      formData.append("name", familyForm.name.trim());
      formData.append("relationship", familyForm.relationship.trim());

      if (familyPhoto) {
        formData.append("photo", familyPhoto);
      }

      await createFamilyMember(formData);

      setShowAddModal(false);
      await loadDetails();
    } catch (err) {
      console.error("Unable to add family member:", err);
      setFamilyFormError(
        err.response?.data?.message || "Unable to add family member."
      );
    } finally {
      setIsSavingFamilyMember(false);
    }
  };

  const handleRemoveFamilyMember = async (familyMemberId) => {
    if (!window.confirm("Remove this family member?")) return;

    try {
      setRemovingId(familyMemberId);
      await deleteFamilyMember(familyMemberId);
      await loadDetails();
    } catch (err) {
      console.error("Unable to remove family member:", err);
    } finally {
      setRemovingId("");
    }
  };

  const openAddTaskModal = () => {
    setEditingTaskId(null);
    setTaskForm({
      title: "",
      description: "",
      category: "Other",
      scheduledTime: "",
      frequency: "daily",
    });
    setTaskFormError("");
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTaskId(task._id);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      category: task.category,
      scheduledTime: task.scheduledTime || "",
      frequency: task.frequency,
    });
    setTaskFormError("");
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    if (isSavingTask) return;
    setShowTaskModal(false);
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();

    if (!taskForm.title.trim()) {
      setTaskFormError("Task title is required.");
      return;
    }

    try {
      setIsSavingTask(true);
      setTaskFormError("");

      const payload = {
        patientId,
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        category: taskForm.category,
        scheduledTime: taskForm.scheduledTime,
        frequency: taskForm.frequency,
      };

      if (editingTaskId) {
        await updateDailyTask(editingTaskId, payload);
      } else {
        await createDailyTask(payload);
      }

      setShowTaskModal(false);
      await loadTasks();
    } catch (err) {
      console.error("Unable to save task:", err);
      setTaskFormError(
        err.response?.data?.message || "Unable to save task."
      );
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      setTogglingTaskId(task._id);
      await completeDailyTask(task._id, !task.isCompleted);
      await loadTasks();
    } catch (err) {
      console.error("Unable to update task status:", err);
    } finally {
      setTogglingTaskId("");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Remove this task?")) return;

    try {
      await deleteDailyTask(taskId);
      await loadTasks();
    } catch (err) {
      console.error("Unable to remove task:", err);
    }
  };

  const handleSetupDevice = async () => {
    try {
      setIsDeviceActionLoading(true);
      setDeviceError("");

      const response = await setupPatientDevice(patientId);

      setPairingCodeData({
        code: response.pairingCode,
        expiresAt: response.expiresAt,
      });
      setShowPairingModal(true);
      await loadDeviceStatus();
    } catch (err) {
      console.error("Unable to set up device:", err);
      setDeviceError(
        err.response?.data?.message || "Unable to set up patient device."
      );
    } finally {
      setIsDeviceActionLoading(false);
    }
  };

  const handleRegenerateDevice = async () => {
    if (
      !window.confirm(
        "This will invalidate any existing device connection. Continue?"
      )
    ) {
      return;
    }

    try {
      setIsDeviceActionLoading(true);
      setDeviceError("");

      const response = await regeneratePatientDevice(patientId);

      setPairingCodeData({
        code: response.pairingCode,
        expiresAt: response.expiresAt,
      });
      setShowPairingModal(true);
      await loadDeviceStatus();
    } catch (err) {
      console.error("Unable to regenerate device pairing:", err);
      setDeviceError(
        err.response?.data?.message || "Unable to regenerate pairing code."
      );
    } finally {
      setIsDeviceActionLoading(false);
    }
  };

  const handleRevokeDevice = async () => {
    if (
      !window.confirm(
        "This will disconnect the patient's device immediately. Continue?"
      )
    ) {
      return;
    }

    try {
      setIsDeviceActionLoading(true);
      setDeviceError("");
      await revokePatientDevice(patientId);
      await loadDeviceStatus();
    } catch (err) {
      console.error("Unable to revoke device:", err);
      setDeviceError(
        err.response?.data?.message || "Unable to revoke device."
      );
    } finally {
      setIsDeviceActionLoading(false);
    }
  };

  const closePairingModal = () => {
    setShowPairingModal(false);
    setPairingCodeData(null);
    setCodeCopied(false);
  };

  const handleCopyPairingCode = () => {
    if (!pairingCodeData?.code) return;
    navigator.clipboard
      ?.writeText(pairingCodeData.code)
      .then(() => {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      })
      .catch(() => {});
  };

  const formatRelativeTime = (dateValue) => {
    if (!dateValue) return "Never";

    const diffMs = Math.max(0, Date.now() - new Date(dateValue).getTime());
    const minutes = Math.floor(diffMs / (1000 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  return (
    <CaregiverPageLayout
      activePage="My Patients"
      eyebrow="Patient Management"
      title="Patient Details"
      subtitle="Read-only clinical overview for your assigned patient."
    >
      <button
        type="button"
        className="cg-btn cg-btn--ghost cg-btn--sm"
        style={{ alignSelf: "flex-start" }}
        onClick={() => navigate("/caregiver/patients")}
      >
        <FaArrowLeft />
        Back to My Patients
      </button>

      {isLoading ? (
        <div className="cg-card">
          <div className="cg-state">
            <FaSpinner className="appointment-spinner" />
            Loading patient details...
          </div>
        </div>
      ) : error ? (
        <div className="cg-card">
          <div className="cg-state cg-state--error">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button className="cg-btn cg-btn--outline cg-btn--sm" onClick={loadDetails}>
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* PATIENT PROFILE */}
          <div className="cg-card">
            <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
              <div className="cg-avatar-sm" style={{ width: 64, height: 64, fontSize: 22 }}>
                {getInitials(patient?.fullName) || "P"}
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                  {patient?.fullName}
                </h2>
                <p style={{ fontSize: 14, color: "#6b7690" }}>
                  {patient?.age} years • {patient?.gender}
                </p>
              </div>
            </div>

            <div className="cg-form-grid" style={{ marginTop: 20 }}>
              <div className="cg-field">
                <label><FaEnvelope /> Email</label>
                <span>{patient?.email || "—"}</span>
              </div>
              <div className="cg-field">
                <label><FaPhone /> Phone</label>
                <span>{patient?.phone || "—"}</span>
              </div>
              <div className="cg-field cg-field--full">
                <label><FaMapMarkerAlt /> Address</label>
                <span>{patient?.address || "—"}</span>
              </div>
              <div className="cg-field">
                <label>Emergency Contact</label>
                <span>{patient?.emergencyContact || "Not available"}</span>
              </div>
              <div className="cg-field">
                <label><FaUserMd /> Assigned Doctor</label>
                <span>{doctor?.fullName || "Not assigned"}</span>
              </div>
            </div>
          </div>

          {/* PATIENT DEVICE */}
          <div className="cg-card">
            <div className="cg-card__header">
              <div>
                <span>PATIENT DEVICE FOUNDATION</span>
                <h2>Patient Device</h2>
              </div>
              <FaMobileAlt />
            </div>

            {isLoadingDevice ? (
              <div className="cg-state">
                <FaSpinner className="appointment-spinner" />
                Loading device status...
              </div>
            ) : (
              <>
                {deviceError && (
                  <p
                    className="cg-field-error"
                    style={{ marginBottom: 12 }}
                  >
                    {deviceError}
                  </p>
                )}

                {(!deviceStatus || deviceStatus.deviceStatus === "not_connected") && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="cg-badge cg-badge--gray">
                        Not Connected
                      </span>
                      <span style={{ fontSize: 13, color: "#8b96ab" }}>
                        No device has been paired with this patient yet.
                      </span>
                    </div>

                    <button
                      type="button"
                      className="cg-btn cg-btn--primary cg-btn--sm"
                      onClick={handleSetupDevice}
                      disabled={isDeviceActionLoading}
                    >
                      {isDeviceActionLoading ? (
                        <FaSpinner className="appointment-spinner" />
                      ) : (
                        "Set Up Device"
                      )}
                    </button>
                  </div>
                )}

                {deviceStatus?.deviceStatus === "pending" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="cg-badge cg-badge--orange">
                        Pairing In Progress
                      </span>
                      <span style={{ fontSize: 13, color: "#8b96ab" }}>
                        Waiting for the device to enter the pairing code.
                      </span>
                    </div>

                    <button
                      type="button"
                      className="cg-btn cg-btn--outline cg-btn--sm"
                      onClick={handleRegenerateDevice}
                      disabled={isDeviceActionLoading}
                    >
                      <FaSyncAlt />
                      {isDeviceActionLoading ? "Working..." : "Regenerate Code"}
                    </button>
                  </div>
                )}

                {deviceStatus?.deviceStatus === "connected" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="cg-badge cg-badge--green">
                          Connected 🟢
                        </span>
                        <strong style={{ fontSize: 14 }}>
                          {deviceStatus.device?.deviceName}
                        </strong>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#8b96ab",
                          display: "block",
                          marginTop: 4,
                        }}
                      >
                        Last Active: {formatRelativeTime(deviceStatus.device?.lastActiveAt)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="cg-btn cg-btn--danger cg-btn--sm"
                      onClick={handleRevokeDevice}
                      disabled={isDeviceActionLoading}
                    >
                      {isDeviceActionLoading ? (
                        <FaSpinner className="appointment-spinner" />
                      ) : (
                        "Revoke Device"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* LATEST AI ASSESSMENT (READ ONLY) */}
          <div className="cg-card">
            <div className="cg-card__header">
              <div>
                <span>CLINICAL — READ ONLY</span>
                <h2>Latest AI Assessment</h2>
              </div>
              <FaBrain />
            </div>

            {assessments.length === 0 ? (
              <div className="cg-state">
                <FaBrain />
                <strong>No assessments yet</strong>
                <span>AI assessment results will appear here.</span>
              </div>
            ) : (
              <div className="cg-table-wrapper">
                <table className="cg-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Prediction</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((assessment) => (
                      <tr key={assessment._id}>
                        <td>
                          {new Date(assessment.createdAt).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )}
                        </td>
                        <td>
                          <span
                            className={`cg-badge ${predictionBadgeClass(
                              assessment.prediction
                            )}`}
                          >
                            {assessment.prediction}
                          </span>
                        </td>
                        <td>{assessment.confidence?.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* MEDICATION SCHEDULE */}
          <div className="cg-card">
            <div className="cg-card__header">
              <div>
                <span>CARE PLAN</span>
                <h2>Medication Schedule</h2>
              </div>
              <FaPills />
            </div>

            {medications.length === 0 ? (
              <div className="cg-state">
                <FaPills />
                <strong>No medications added</strong>
                <span>Add medications from the Medications page.</span>
              </div>
            ) : (
              <div className="cg-table-wrapper">
                <table className="cg-table">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Times</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((med) => (
                      <tr key={med._id}>
                        <td>{med.name}</td>
                        <td>{med.dosage}</td>
                        <td>{med.frequency}</td>
                        <td>{med.times?.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* APPOINTMENTS */}
          <div className="cg-card">
            <div className="cg-card__header">
              <div>
                <span>SCHEDULE</span>
                <h2>Appointments</h2>
              </div>
              <FaCalendarAlt />
            </div>

            {appointments.length === 0 ? (
              <div className="cg-state">
                <FaCalendarAlt />
                <strong>No appointments</strong>
              </div>
            ) : (
              <div className="cg-table-wrapper">
                <table className="cg-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Doctor</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => (
                      <tr key={appt._id}>
                        <td>
                          {new Date(appt.appointmentDate).toLocaleString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </td>
                        <td>{appt.doctorId?.fullName || "—"}</td>
                        <td>{appt.type}</td>
                        <td>
                          <span className="cg-badge cg-badge--blue">
                            {appt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ALERTS */}
          <div className="cg-card">
            <div className="cg-card__header">
              <div>
                <span>SAFETY</span>
                <h2>Recent Activity & Alerts</h2>
              </div>
              <FaBell />
            </div>

            {alerts.length === 0 ? (
              <div className="cg-state">
                <FaBell />
                <strong>No recent alerts</strong>
              </div>
            ) : (
              <div className="cg-table-wrapper">
                <table className="cg-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Message</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert._id}>
                        <td>{alert.title}</td>
                        <td>{alert.message}</td>
                        <td>
                          {new Date(alert.createdAt).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FAMILY MEMBERS */}
          <div className="cg-card">
            <div className="cg-card__header">
              <div>
                <span>FACE RECOGNITION — REFERENCE DATA</span>
                <h2>Family Members</h2>
              </div>

              <button
                type="button"
                className="cg-btn cg-btn--primary cg-btn--sm"
                onClick={openAddFamilyMemberModal}
              >
                <FaPlus />
                Add Family Member
              </button>
            </div>

            {familyMembers.length === 0 ? (
              <div className="cg-state">
                <FaUsers />
                <strong>No family members added yet</strong>
                <span>
                  Add the people your patient should recognize day-to-day.
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 14,
                }}
              >
                {familyMembers.map((member) => (
                  <div
                    key={member._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 14,
                      borderRadius: 12,
                      border: "1px solid #eef1f6",
                    }}
                  >
                    {member.photo?.url ? (
                      <img
                        src={member.photo.url}
                        alt={member.name}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: "50%",
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        className="cg-avatar-sm"
                        style={{ width: 52, height: 52, fontSize: 18 }}
                      >
                        <FaUserCircle />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: 14, display: "block" }}>
                        {member.name}
                      </strong>
                      <span style={{ fontSize: 12, color: "#8b96ab" }}>
                        {member.relationship}
                      </span>

                      {member.faceProfileRegistered ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginTop: 4,
                            fontSize: 11,
                            color: "#15803d",
                            fontWeight: 700,
                          }}
                        >
                          <FaCheckCircle />
                          Face profile registered
                        </div>
                      ) : (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 11,
                            color: "#8b96ab",
                          }}
                        >
                          No photo yet
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="cg-btn cg-btn--ghost cg-btn--sm"
                      onClick={() => handleRemoveFamilyMember(member._id)}
                      disabled={removingId === member._id}
                      aria-label={`Remove ${member.name}`}
                    >
                      {removingId === member._id ? (
                        <FaSpinner className="appointment-spinner" />
                      ) : (
                        <FaTrash style={{ color: "#b91c1c" }} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DAILY CHECKLIST */}
          <div className="cg-card">
            <div className="cg-card__header">
              <div>
                <span>
                  {taskSummary.completed} / {taskSummary.total} COMPLETED
                </span>
                <h2>Daily Checklist</h2>
              </div>

              <button
                type="button"
                className="cg-btn cg-btn--primary cg-btn--sm"
                onClick={openAddTaskModal}
              >
                <FaPlus />
                Add Task
              </button>
            </div>

            {isLoadingTasks ? (
              <div className="cg-state">
                <FaSpinner className="appointment-spinner" />
                Loading tasks...
              </div>
            ) : dailyTasks.length === 0 ? (
              <div className="cg-state">
                <FaListUl />
                <strong>No daily tasks configured.</strong>
                <span>
                  Add tasks like medication, cognitive activities, or
                  personal care reminders.
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {dailyTasks.map((task) => (
                  <div
                    key={task._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid #eef1f6",
                      background: task.isCompleted ? "#f7fbfa" : "#ffffff",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      disabled={togglingTaskId === task._id}
                      aria-label={
                        task.isCompleted
                          ? "Mark as pending"
                          : "Mark as completed"
                      }
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 20,
                        color: task.isCompleted ? "#15803d" : "#c3cad9",
                        display: "flex",
                        flexShrink: 0,
                      }}
                    >
                      {togglingTaskId === task._id ? (
                        <FaSpinner className="appointment-spinner" />
                      ) : task.isCompleted ? (
                        <FaRegCheckCircle />
                      ) : (
                        <FaRegCircle />
                      )}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong
                        style={{
                          fontSize: 14,
                          display: "block",
                          textDecoration: task.isCompleted
                            ? "line-through"
                            : "none",
                          color: task.isCompleted ? "#8b96ab" : "#17233c",
                        }}
                      >
                        {task.title}
                      </strong>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 3,
                        }}
                      >
                        <span className="cg-badge cg-badge--blue">
                          {task.category}
                        </span>
                        {task.scheduledTime && (
                          <span style={{ fontSize: 12, color: "#8b96ab" }}>
                            {task.scheduledTime}
                          </span>
                        )}
                        <span
                          className={`cg-badge ${
                            task.isCompleted
                              ? "cg-badge--green"
                              : "cg-badge--orange"
                          }`}
                        >
                          {task.isCompleted ? "Completed" : "Pending"}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        type="button"
                        className="cg-btn cg-btn--outline cg-btn--sm"
                        onClick={() => openEditTaskModal(task)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="cg-btn cg-btn--danger cg-btn--sm"
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ADD FAMILY MEMBER MODAL */}
      {showAddModal && (
        <div className="cg-overlay" onClick={closeAddFamilyMemberModal}>
          <div className="cg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cg-modal-header">
              <div>
                <span>FAMILY MEMBER</span>
                <h3>Add Family Member</h3>
              </div>
              <button
                type="button"
                className="cg-modal-close"
                onClick={closeAddFamilyMemberModal}
                disabled={isSavingFamilyMember}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddFamilyMember}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 18,
                }}
              >
                <label
                  htmlFor="familyPhoto"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "#f1f4f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    overflow: "hidden",
                    flexShrink: 0,
                    border: "1px dashed #dbe1eb",
                  }}
                >
                  {familyPhotoPreview ? (
                    <img
                      src={familyPhotoPreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <FaCamera style={{ color: "#8b96ab", fontSize: 20 }} />
                  )}
                </label>

                <input
                  id="familyPhoto"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFamilyPhotoChange}
                />

                <div>
                  <strong style={{ fontSize: 13 }}>Face photo (optional)</strong>
                  <p style={{ fontSize: 12, color: "#8b96ab", marginTop: 2 }}>
                    One clear, front-facing face only · JPG, PNG or WEBP · Max 5 MB
                  </p>
                </div>
              </div>

              <div className="cg-form-grid">
                <div className="cg-field cg-field--full">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={familyForm.name}
                    onChange={(e) =>
                      setFamilyForm({ ...familyForm, name: e.target.value })
                    }
                    placeholder="e.g. Anitha"
                  />
                </div>

                <div className="cg-field cg-field--full">
                  <label>Relationship *</label>
                  <select
                    value={familyForm.relationship}
                    onChange={(e) =>
                      setFamilyForm({
                        ...familyForm,
                        relationship: e.target.value,
                      })
                    }
                  >
                    <option value="">Select relationship</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Son">Son</option>
                    <option value="Wife">Wife</option>
                    <option value="Husband">Husband</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Relative">Relative</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {familyFormError && (
                <p className="cg-field-error" style={{ marginTop: 10 }}>
                  {familyFormError}
                </p>
              )}

              <div className="cg-form-actions">
                <button
                  type="button"
                  className="cg-btn cg-btn--ghost"
                  onClick={closeAddFamilyMemberModal}
                  disabled={isSavingFamilyMember}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cg-btn cg-btn--primary"
                  disabled={isSavingFamilyMember}
                >
                  {isSavingFamilyMember ? "Saving..." : "Add Family Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT DAILY TASK MODAL */}
      {showTaskModal && (
        <div className="cg-overlay" onClick={closeTaskModal}>
          <div className="cg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cg-modal-header">
              <div>
                <span>DAILY CHECKLIST</span>
                <h3>{editingTaskId ? "Edit Task" : "Add Task"}</h3>
              </div>
              <button
                type="button"
                className="cg-modal-close"
                onClick={closeTaskModal}
                disabled={isSavingTask}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit}>
              <div className="cg-form-grid">
                <div className="cg-field cg-field--full">
                  <label>Task Title *</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, title: e.target.value })
                    }
                    placeholder="e.g. Take morning medication"
                  />
                </div>

                <div className="cg-field">
                  <label>Category</label>
                  <select
                    value={taskForm.category}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, category: e.target.value })
                    }
                  >
                    <option value="Medication">Medication</option>
                    <option value="Cognitive Activity">
                      Cognitive Activity
                    </option>
                    <option value="Appointment">Appointment</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="cg-field">
                  <label>Scheduled Time (optional)</label>
                  <input
                    type="time"
                    value={taskForm.scheduledTime}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        scheduledTime: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="cg-field">
                  <label>Frequency</label>
                  <select
                    value={taskForm.frequency}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, frequency: e.target.value })
                    }
                  >
                    <option value="daily">Daily</option>
                    <option value="once">Once</option>
                  </select>
                </div>

                <div className="cg-field cg-field--full">
                  <label>Description (optional)</label>
                  <textarea
                    rows={3}
                    value={taskForm.description}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Any extra notes for this task"
                  />
                </div>
              </div>

              {taskFormError && (
                <p className="cg-field-error" style={{ marginTop: 10 }}>
                  {taskFormError}
                </p>
              )}

              <div className="cg-form-actions">
                <button
                  type="button"
                  className="cg-btn cg-btn--ghost"
                  onClick={closeTaskModal}
                  disabled={isSavingTask}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cg-btn cg-btn--primary"
                  disabled={isSavingTask}
                >
                  {isSavingTask
                    ? "Saving..."
                    : editingTaskId
                    ? "Save Changes"
                    : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAIRING CODE MODAL — shown exactly once per generated code */}
      {showPairingModal && pairingCodeData && (
        <div className="cg-overlay" onClick={closePairingModal}>
          <div className="cg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cg-modal-header">
              <div>
                <span>PATIENT DEVICE</span>
                <h3>Pairing Code</h3>
              </div>
              <button
                type="button"
                className="cg-modal-close"
                onClick={closePairingModal}
              >
                <FaTimes />
              </button>
            </div>

            <p style={{ fontSize: 13, color: "#6b7690", marginBottom: 16 }}>
              Enter this code on the patient's device to complete pairing.
              For security, this code is shown only once and expires in 15
              minutes.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "22px 16px",
                borderRadius: 14,
                background: "#f0fbf9",
                border: "1px dashed #14b8a6",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  color: "#0f9e8e",
                  fontFamily: "monospace",
                }}
              >
                {pairingCodeData.code}
              </span>

              <button
                type="button"
                className="cg-btn cg-btn--outline cg-btn--sm"
                onClick={handleCopyPairingCode}
                aria-label="Copy pairing code"
              >
                {codeCopied ? (
                  <>
                    <FaCheckCircle style={{ color: "#15803d" }} />
                    Copied!
                  </>
                ) : (
                  <>
                    <FaCopy />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            {pairingCodeData.expiresAt && (
              <p style={{ fontSize: 12, color: "#8b96ab", textAlign: "center", marginBottom: 16 }}>
                Expires at{" "}
                {new Date(pairingCodeData.expiresAt).toLocaleTimeString(
                  "en-IN",
                  { hour: "2-digit", minute: "2-digit" }
                )}
              </p>
            )}

            <div className="cg-form-actions" style={{ justifyContent: "center" }}>
              <button
                type="button"
                className="cg-btn cg-btn--primary"
                onClick={closePairingModal}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </CaregiverPageLayout>
  );
};

export default CaregiverPatientDetails;
