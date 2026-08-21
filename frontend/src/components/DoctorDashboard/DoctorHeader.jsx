import {
  FaBell,
  FaChevronDown,
} from "react-icons/fa";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";


const DoctorHeader = () => {

  const navigate =
    useNavigate();


  const [doctor, setDoctor] =
    useState(null);


  useEffect(() => {

    const storedUser =
      localStorage.getItem(
        "nc_user"
      );

    if (storedUser) {

      try {

        setDoctor(
          JSON.parse(
            storedUser
          )
        );

      } catch (error) {

        console.error(
          "Unable to read doctor information:",
          error
        );

      }

    }

  }, []);


  const doctorName =
    doctor?.fullName ||
    "Dr. Priya Rao";


  const profileImage =
    doctor?.profilePicture?.url ||
    "";


  /* ============================================================
     NOTIFICATIONS
  ============================================================ */

  const handleNotifications =
    () => {

      navigate(
        "/doctor/notifications"
      );

    };


  /* ============================================================
     PROFILE
  ============================================================ */

  const handleProfile =
    () => {

      navigate(
        "/doctor/profile"
      );

    };


  return (
    <header className="doctor-header">


      {/* ======================================================
          WELCOME
      ====================================================== */}

      <div className="doctor-header__welcome">

        <p>
          Good morning,
        </p>

        <h1>
          Welcome back, {doctorName}
        </h1>

        <span>
          Here's what's happening with your
          patients today.
        </span>

      </div>


      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <div className="doctor-header__actions">


        {/* NOTIFICATION */}

        <button
          type="button"
          className="doctor-header__notification"
          onClick={
            handleNotifications
          }
          aria-label="Open notifications"
        >

          <FaBell />

          <span className="doctor-header__notification-dot" />

        </button>


        {/* PROFILE */}

        <button
          type="button"
          className="doctor-header__profile"
          onClick={
            handleProfile
          }
        >

          {profileImage ? (

            <img
              src={profileImage}
              alt={doctorName}
            />

          ) : (

            <div className="doctor-header__avatar">

              {doctorName
                .replace(
                  "Dr. ",
                  ""
                )
                .charAt(0)}

            </div>

          )}


          <div className="doctor-header__profile-info">

            <strong>
              {doctorName}
            </strong>

            <span>
              {doctor?.doctorDetails
                ?.specialization ||
                "Neurologist"}
            </span>

          </div>


          <FaChevronDown
            className="doctor-header__chevron"
          />

        </button>

      </div>

    </header>
  );
};


export default DoctorHeader;