import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaComments,
  FaSearch,
  FaPaperPlane,
  FaUser,
  FaCircle,
  FaPhone,
  FaVideo,
  FaEllipsisV,
  FaSpinner,
} from "react-icons/fa";

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";

import {
  getDoctorCaregivers,
  getConversation,
  sendMessage,
} from "../../api/message.api.js";

import "./DoctorMessages.css";


const DoctorMessages = () => {

  const [
    contacts,
    setContacts,
  ] = useState([]);

  const [
    selectedContactId,
    setSelectedContactId,
  ] = useState(null);

  const [
    currentMessages,
    setCurrentMessages,
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    messageText,
    setMessageText,
  ] = useState("");

  const [
    isLoadingContacts,
    setIsLoadingContacts,
  ] = useState(true);

  const [
    isLoadingMessages,
    setIsLoadingMessages,
  ] = useState(false);

  const [
    isSending,
    setIsSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  /* ============================================================
     LOAD CAREGIVERS
  ============================================================ */

  const loadContacts = async () => {

    try {

      setIsLoadingContacts(true);
      setError("");

      const response =
        await getDoctorCaregivers();

      const caregivers =
        response.caregivers || [];

      setContacts(
        caregivers
      );

      if (
        caregivers.length > 0
      ) {
        setSelectedContactId(
          caregivers[0]._id
        );
      }

    } catch (error) {

      console.error(
        "Unable to load caregivers:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load caregivers."
      );

    } finally {

      setIsLoadingContacts(false);

    }
  };


  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {

    loadContacts();

  }, []);


  /* ============================================================
     SELECTED CONTACT
  ============================================================ */

  const selectedContact =
    contacts.find(
      (contact) =>
        contact._id ===
        selectedContactId
    ) || null;


  /* ============================================================
     LOAD CONVERSATION
  ============================================================ */

  const loadConversation =
    async (
      caregiverId
    ) => {

      if (!caregiverId) {
        return;
      }

      try {

        setIsLoadingMessages(
          true
        );

        setError("");

        const response =
          await getConversation(
            caregiverId
          );

        setCurrentMessages(
          response.messages || []
        );


        /* ------------------------------------------------------
           Update unread count locally
        ------------------------------------------------------ */

        setContacts(
          (previous) =>
            previous.map(
              (contact) =>
                contact._id ===
                caregiverId
                  ? {
                      ...contact,
                      unread: 0,
                    }
                  : contact
            )
        );

      } catch (error) {

        console.error(
          "Unable to load conversation:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load conversation."
        );

      } finally {

        setIsLoadingMessages(
          false
        );

      }
    };


  useEffect(() => {

    if (
      selectedContactId
    ) {

      loadConversation(
        selectedContactId
      );

    }

  }, [selectedContactId]);


  /* ============================================================
     FILTER CONTACTS
  ============================================================ */

  const filteredContacts =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();

      if (!search) {
        return contacts;
      }

      return contacts.filter(
        (contact) =>
          contact.fullName
            ?.toLowerCase()
            .includes(search)
      );

    }, [
      contacts,
      searchTerm,
    ]);


  /* ============================================================
     FORMAT TIME
  ============================================================ */

  const formatTime =
    (date) => {

      if (!date) {
        return "";
      }

      return new Date(
        date
      ).toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };


  /* ============================================================
     SEND MESSAGE
  ============================================================ */

  const handleSendMessage =
    async () => {

      const text =
        messageText.trim();

      if (
        !text ||
        !selectedContactId ||
        isSending
      ) {
        return;
      }

      try {

        setIsSending(true);
        setError("");

        const response =
          await sendMessage(
            selectedContactId,
            text
          );


        const newMessage =
          response.data;


        setCurrentMessages(
          (previous) => [
            ...previous,
            newMessage,
          ]
        );


        /* ------------------------------------------------------
           Update contact preview
        ------------------------------------------------------ */

        setContacts(
          (previous) =>
            previous.map(
              (contact) =>
                contact._id ===
                selectedContactId
                  ? {
                      ...contact,
                      lastMessage:
                        text,
                      lastMessageAt:
                        newMessage.createdAt,
                    }
                  : contact
            )
        );


        setMessageText("");

      } catch (error) {

        console.error(
          "Unable to send message:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to send message."
        );

      } finally {

        setIsSending(false);

      }
    };


  /* ============================================================
     ENTER TO SEND
  ============================================================ */

  const handleKeyDown =
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        handleSendMessage();

      }
    };


  /* ============================================================
     LOADING CONTACTS
  ============================================================ */

  if (
    isLoadingContacts
  ) {

    return (
      <div className="doctor-dashboard">

        <DoctorSidebar
          activePage="Messages"
        />

        <main className="doctor-dashboard__main">

          <DoctorHeader />

          <div className="doctor-dashboard__content">

            <section className="doctor-dashboard__card">

              <div
                style={{
                  minHeight: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  fontSize: "14px",
                  color: "#718295",
                }}
              >

                <FaSpinner />

                Loading caregivers...

              </div>

            </section>

          </div>

        </main>

      </div>
    );
  }


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="doctor-dashboard">


      <DoctorSidebar
        activePage="Messages"
      />


      <main className="doctor-dashboard__main">

        <DoctorHeader />


        <div className="doctor-dashboard__content doctor-messages">


          {/* ==================================================
              HEADER
          ================================================== */}

          <section className="doctor-messages__header">

            <div>

              <span>
                COMMUNICATION
              </span>

              <h1>
                Messages
              </h1>

              <p>
                Communicate with caregivers
                about your patients.
              </p>

            </div>

          </section>


          {/* ERROR */}

          {error && (

            <div
              style={{
                marginBottom: "15px",
                padding: "12px 15px",
                borderRadius: "7px",
                background: "#fcf5f6",
                color: "#98656b",
                fontSize: "14px",
              }}
            >
              {error}
            </div>

          )}


          {/* ==================================================
              MESSAGES CONTAINER
          ================================================== */}

          <section className="doctor-messages__container">


            {/* ==================================================
                CONTACTS
            ================================================== */}

            <aside className="doctor-messages__contacts">

              <div className="doctor-messages__contacts-header">

                <div>

                  <strong>
                    Caregivers
                  </strong>

                  <span>
                    {contacts.length} contacts
                  </span>

                </div>

              </div>


              {/* SEARCH */}

              <div className="doctor-messages__search">

                <FaSearch />

                <input
                  type="text"
                  placeholder="Search caregivers..."
                  value={
                    searchTerm
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />

              </div>


              {/* CONTACT LIST */}

              <div className="doctor-messages__contact-list">

                {filteredContacts.length ===
                0 ? (

                  <div className="doctor-messages__no-contacts">

                    <FaUser />

                    <span>
                      No caregivers found
                    </span>

                  </div>

                ) : (

                  filteredContacts.map(
                    (contact) => (

                      <button
                        type="button"
                        key={
                          contact._id
                        }
                        className={`doctor-message-contact ${
                          selectedContactId ===
                          contact._id
                            ? "doctor-message-contact--active"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedContactId(
                            contact._id
                          )
                        }
                      >

                        <div className="doctor-message-contact__avatar">

                          {contact.fullName
                            ?.charAt(0)
                            .toUpperCase()}

                        </div>


                        <div className="doctor-message-contact__content">

                          <div>

                            <strong>
                              {
                                contact.fullName
                              }
                            </strong>

                            <span>
                              {contact.lastMessageAt
                                ? formatTime(
                                    contact.lastMessageAt
                                  )
                                : ""}
                            </span>

                          </div>


                          <p>

                            {contact.lastMessage ||
                              "No messages yet."}

                          </p>

                        </div>


                        {contact.unread >
                          0 && (

                          <span className="doctor-message-contact__unread">

                            {
                              contact.unread
                            }

                          </span>

                        )}

                      </button>

                    )
                  )

                )}

              </div>

            </aside>


            {/* ==================================================
                CHAT
            ================================================== */}

            <div className="doctor-messages__chat">


              {!selectedContact ? (

                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "10px",
                    color: "#7b8999",
                    fontSize: "14px",
                  }}
                >

                  <FaComments
                    style={{
                      fontSize: "35px",
                    }}
                  />

                  <span>
                    Select a caregiver to start messaging.
                  </span>

                </div>

              ) : (

                <>


                  {/* CHAT HEADER */}

                  <header className="doctor-messages__chat-header">

                    <div className="doctor-messages__chat-user">

                      <div className="doctor-messages__chat-avatar">

                        {selectedContact.fullName
                          ?.charAt(0)
                          .toUpperCase()}

                      </div>


                      <div>

                        <strong>
                          {
                            selectedContact.fullName
                          }
                        </strong>

                        <span>
                          Caregiver
                        </span>

                      </div>

                    </div>


                    <div className="doctor-messages__chat-actions">

                      <button
                        type="button"
                        title="Call"
                        onClick={() =>
                          alert(
                            "Calling feature will be connected later."
                          )
                        }
                      >
                        <FaPhone />
                      </button>

                      <button
                        type="button"
                        title="Video call"
                        onClick={() =>
                          alert(
                            "Video calling feature will be connected later."
                          )
                        }
                      >
                        <FaVideo />
                      </button>

                      <button
                        type="button"
                        title="More"
                      >
                        <FaEllipsisV />
                      </button>

                    </div>

                  </header>


                  {/* MESSAGE BODY */}

                  <div className="doctor-messages__body">

                    {isLoadingMessages ? (

                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          color: "#7b8999",
                          fontSize: "14px",
                        }}
                      >

                        <FaSpinner />

                        Loading messages...

                      </div>

                    ) : currentMessages.length ===
                      0 ? (

                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#7b8999",
                          fontSize: "14px",
                        }}
                      >

                        No messages yet. Start the conversation.

                      </div>

                    ) : (

                      currentMessages.map(
                        (message) => {

                          const isDoctor =
                            message.senderId
                              ?._id !==
                            selectedContactId;

                          return (

                            <div
                              className={`doctor-message ${
                                isDoctor
                                  ? "doctor-message--doctor"
                                  : "doctor-message--caregiver"
                              }`}
                              key={
                                message._id
                              }
                            >

                              <div className="doctor-message__bubble">

                                <p>
                                  {
                                    message.text
                                  }
                                </p>

                                <span>
                                  {
                                    formatTime(
                                      message.createdAt
                                    )
                                  }
                                </span>

                              </div>

                            </div>

                          );
                        }
                      )

                    )}

                  </div>


                  {/* COMPOSER */}

                  <div className="doctor-messages__composer">

                    <textarea
                      value={
                        messageText
                      }
                      onChange={(
                        event
                      ) =>
                        setMessageText(
                          event.target.value
                        )
                      }
                      onKeyDown={
                        handleKeyDown
                      }
                      placeholder="Type a message..."
                      rows="1"
                      disabled={
                        isSending
                      }
                    />


                    <button
                      type="button"
                      onClick={
                        handleSendMessage
                      }
                      disabled={
                        !messageText.trim() ||
                        isSending
                      }
                      title="Send message"
                    >

                      {isSending ? (
                        <FaSpinner />
                      ) : (
                        <FaPaperPlane />
                      )}

                    </button>

                  </div>

                </>

              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
};


export default DoctorMessages;