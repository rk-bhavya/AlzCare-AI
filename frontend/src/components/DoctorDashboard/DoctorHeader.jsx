import {
  FaBell,
  FaChevronDown,
} from "react-icons/fa";

import { useEffect, useState } from "react";

const DoctorHeader = () => {
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("nc_user");

    if (storedUser) {
      try {
        setDoctor(
          JSON.parse(storedUser)
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
    doctor?.fullName || "Dr. Priya Rao";

  const profileImage =
    doctor?.profilePicture?.url || "";

  return (
    <header className="doctor-header">

      <div className="doctor-header__welcome">

        <p>Good morning,</p>

        <h1>
          Welcome back, {doctorName}
        </h1>

        <span>
          Here's what's happening with your
          patients today.
        </span>

      </div>

      <div className="doctor-header__actions">

        <button
          type="button"
          className="doctor-header__notification"
        >
          <FaBell />

          <span className="doctor-header__notification-dot" />
        </button>

        <div className="doctor-header__profile">

          {profileImage ? (
            <img
              src={profileImage}
              alt={doctorName}
            />
          ) : (
            <div className="doctor-header__avatar">
              {doctorName
                .replace("Dr. ", "")
                .charAt(0)}
            </div>
          )}

          <div className="doctor-header__profile-info">

            <strong>{doctorName}</strong>

            <span>
              Neurologist
            </span>

          </div>

          <FaChevronDown className="doctor-header__chevron" />

        </div>

      </div>

    </header>
  );
};

export default DoctorHeader;