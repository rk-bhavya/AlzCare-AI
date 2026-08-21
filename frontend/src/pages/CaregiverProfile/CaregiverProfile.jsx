import { useEffect, useState } from "react";

import {
  FaUser,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

import {
  getCaregiverProfile,
  updateCaregiverProfile,
} from "../../api/caregiver.api.js";

import { STORAGE_KEYS } from "../../config/constants.js";
import CaregiverPageLayout from "../../components/CaregiverDashboard/CaregiverPageLayout.jsx";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Child",
  "Sibling",
  "Parent",
  "Relative",
  "Professional Caregiver",
  "Friend",
  "Other",
];

const CaregiverProfile = () => {
  const [caregiver, setCaregiver] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    relationship: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getCaregiverProfile();
      setCaregiver(response.caregiver);
      setForm({
        fullName: response.caregiver.fullName || "",
        phone: response.caregiver.phone || "",
        address: response.caregiver.address || "",
        relationship: response.caregiver.relationship || "",
      });
    } catch (err) {
      console.error("Unable to load profile:", err);
      setError(err.response?.data?.message || "Unable to load profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setSaveError("");

    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim()) {
      setSaveError("Full name, phone, and address are required.");
      return;
    }

    try {
      setIsSaving(true);

      const response = await updateCaregiverProfile(form);
      setCaregiver(response.caregiver);
      setSuccessMessage("Profile updated successfully.");

      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        localStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify({ ...parsed, fullName: response.caregiver.fullName })
        );
      }
    } catch (err) {
      console.error("Unable to update profile:", err);
      setSaveError(
        err.response?.data?.message || "Unable to update profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CaregiverPageLayout
      activePage="Profile"
      eyebrow="Account"
      title="Caregiver Profile"
      subtitle="Manage your personal information."
    >
      {isLoading ? (
        <div className="cg-card">
          <div className="cg-state">
            <FaSpinner className="appointment-spinner" />
            Loading profile...
          </div>
        </div>
      ) : error ? (
        <div className="cg-card">
          <div className="cg-state cg-state--error">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button className="cg-btn cg-btn--outline cg-btn--sm" onClick={loadProfile}>
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="cg-card">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div className="cg-avatar-sm" style={{ width: 64, height: 64, fontSize: 22 }}>
              {getInitials(caregiver?.fullName) || "C"}
            </div>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 700 }}>
                {caregiver?.fullName}
              </h2>
              <p style={{ fontSize: 14, color: "#6b7690" }}>
                {caregiver?.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="cg-form-grid">
              <div className="cg-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />
              </div>

              <div className="cg-field">
                <label>Email (not editable)</label>
                <input type="email" value={caregiver?.email || ""} disabled />
              </div>

              <div className="cg-field">
                <label>Phone *</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>

              <div className="cg-field">
                <label>Relationship to Patient</label>
                <select
                  value={form.relationship}
                  onChange={(e) =>
                    setForm({ ...form, relationship: e.target.value })
                  }
                >
                  <option value="">Select relationship</option>
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cg-field cg-field--full">
                <label>Address *</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
            </div>

            {saveError && (
              <p className="cg-field-error" style={{ marginTop: 10 }}>
                {saveError}
              </p>
            )}

            {successMessage && (
              <p
                style={{
                  color: "#15803d",
                  fontSize: 13,
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FaCheckCircle /> {successMessage}
              </p>
            )}

            <div className="cg-form-actions">
              <button
                type="submit"
                className="cg-btn cg-btn--primary"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </CaregiverPageLayout>
  );
};

export default CaregiverProfile;
