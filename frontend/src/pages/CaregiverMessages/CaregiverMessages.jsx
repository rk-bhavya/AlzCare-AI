import { useEffect, useRef, useState } from "react";

import {
  FaComments,
  FaSpinner,
  FaExclamationTriangle,
  FaPaperPlane,
  FaUserMd,
} from "react-icons/fa";

import {
  getCaregiverDoctors,
  getCaregiverConversation,
  sendMessage,
} from "../../api/message.api.js";

import CaregiverPageLayout from "../../components/CaregiverDashboard/CaregiverPageLayout.jsx";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const CaregiverMessages = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [conversation, setConversation] = useState(null);
  const [messageText, setMessageText] = useState("");

  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  const loadDoctors = async () => {
    try {
      setIsLoadingDoctors(true);
      setError("");

      const response = await getCaregiverDoctors();
      const list = response.doctors || [];
      setDoctors(list);

      if (list.length > 0) {
        setSelectedDoctorId((prev) => prev || list[0]._id);
      }
    } catch (err) {
      console.error("Unable to load doctors:", err);
      setError(err.response?.data?.message || "Unable to load messages.");
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadConversation = async () => {
    if (!selectedDoctorId) return;

    try {
      setIsLoadingConversation(true);
      const response = await getCaregiverConversation(selectedDoctorId);
      setConversation(response);
    } catch (err) {
      console.error("Unable to load conversation:", err);
    } finally {
      setIsLoadingConversation(false);
    }
  };

  useEffect(() => {
    loadConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctorId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleSend = async (event) => {
    event.preventDefault();

    if (!messageText.trim() || !selectedDoctorId) return;

    try {
      setIsSending(true);
      await sendMessage(selectedDoctorId, messageText.trim());
      setMessageText("");
      await loadConversation();
      await loadDoctors();
    } catch (err) {
      console.error("Unable to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <CaregiverPageLayout
      activePage="Messages"
      eyebrow="Care Team"
      title="Messages"
      subtitle="Communicate directly with your patient's doctor."
    >
      {isLoadingDoctors ? (
        <div className="cg-card">
          <div className="cg-state">
            <FaSpinner className="appointment-spinner" />
            Loading messages...
          </div>
        </div>
      ) : error ? (
        <div className="cg-card">
          <div className="cg-state cg-state--error">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="cg-card">
          <div className="cg-state">
            <FaComments />
            <strong>No doctor to message yet</strong>
            <span>
              Once a doctor is assigned to your patient, you'll be able to
              message them here.
            </span>
          </div>
        </div>
      ) : (
        <div
          className="cg-card"
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: 0,
            padding: 0,
            overflow: "hidden",
            minHeight: 520,
          }}
        >
          {/* CONTACT LIST */}
          <div
            style={{
              borderRight: "1px solid #eef1f6",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "18px 18px 10px" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: "#8b96ab",
                  textTransform: "uppercase",
                }}
              >
                Care Team
              </span>
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {doctors.map((doctor) => (
                <button
                  key={doctor._id}
                  type="button"
                  onClick={() => setSelectedDoctorId(doctor._id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "12px 18px",
                    border: "none",
                    background:
                      selectedDoctorId === doctor._id ? "#f0fbf9" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div className="cg-avatar-sm">
                    {getInitials(doctor.fullName) || "D"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 14, display: "block" }}>
                      Dr. {doctor.fullName}
                    </strong>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#8b96ab",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                      }}
                    >
                      {doctor.lastMessage || "No messages yet"}
                    </span>
                  </div>
                  {doctor.unread > 0 && (
                    <span className="cg-badge cg-badge--red">
                      {doctor.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CONVERSATION */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #eef1f6",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <FaUserMd style={{ color: "#8b96ab" }} />
              <strong style={{ fontSize: 15 }}>
                {conversation?.doctor
                  ? `Dr. ${conversation.doctor.fullName}`
                  : "Select a doctor"}
              </strong>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {isLoadingConversation ? (
                <div className="cg-state">
                  <FaSpinner className="appointment-spinner" />
                  Loading conversation...
                </div>
              ) : !conversation || conversation.messages.length === 0 ? (
                <div className="cg-state">
                  <FaComments />
                  <strong>No messages yet</strong>
                  <span>Send a message to start the conversation.</span>
                </div>
              ) : (
                conversation.messages.map((message) => {
                  const isMine = message.senderId?.role === "caregiver";

                  return (
                    <div
                      key={message._id}
                      style={{
                        alignSelf: isMine ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                      }}
                    >
                      <div
                        style={{
                          background: isMine ? "#14b8a6" : "#f1f4f9",
                          color: isMine ? "#ffffff" : "#17233c",
                          padding: "10px 14px",
                          borderRadius: 14,
                          fontSize: 14,
                        }}
                      >
                        {message.text}
                      </div>
                      <small
                        style={{
                          display: "block",
                          marginTop: 4,
                          fontSize: 11,
                          color: "#8b96ab",
                          textAlign: isMine ? "right" : "left",
                        }}
                      >
                        {new Date(message.createdAt).toLocaleTimeString(
                          "en-IN",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </small>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              style={{
                display: "flex",
                gap: 10,
                padding: "14px 20px",
                borderTop: "1px solid #eef1f6",
              }}
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  border: "1px solid #dbe1eb",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 14,
                  outline: "none",
                }}
                disabled={!selectedDoctorId || isSending}
              />
              <button
                type="submit"
                className="cg-btn cg-btn--primary"
                disabled={!messageText.trim() || isSending}
              >
                {isSending ? (
                  <FaSpinner className="appointment-spinner" />
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </CaregiverPageLayout>
  );
};

export default CaregiverMessages;
