import { useEffect, useState } from "react";

import {
  FaUserMd,
  FaEnvelope,
  FaPhone,
  FaHospital,
  FaStethoscope,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";

import {
  getDoctorProfile,
  updateDoctorProfile,
} from "../../api/doctor.api.js";

import "./DoctorProfile.css";


const DoctorProfile = () => {

  const [doctor, setDoctor] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isEditing, setIsEditing] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  const [formData, setFormData] =
    useState({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      specialization: "",
      hospital: "",
      registrationNumber: "",
    });


  /* ============================================================
     LOAD PROFILE
  ============================================================ */

  const loadProfile = async () => {

    try {

      setIsLoading(true);
      setError("");

      const response =
        await getDoctorProfile();

      const data =
        response.doctor;

      setDoctor(data);

      setFormData({
        fullName:
          data.fullName || "",

        email:
          data.email || "",

        phone:
          data.phone || "",

        address:
          data.address || "",

        specialization:
          data.doctorDetails
            ?.specialization || "",

        hospital:
          data.doctorDetails
            ?.hospital || "",

        registrationNumber:
          data.doctorDetails
            ?.registrationNumber || "",
      });

    } catch (error) {

      console.error(
        "Unable to load doctor profile:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load doctor profile."
      );

    } finally {

      setIsLoading(false);

    }
  };


  useEffect(() => {

    loadProfile();

  }, []);


  /* ============================================================
     HANDLE INPUT
  ============================================================ */

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setSuccess("");
    setError("");

  };


  /* ============================================================
     CANCEL
  ============================================================ */

  const handleCancel = () => {

    if (!doctor) {
      return;
    }

    setFormData({
      fullName:
        doctor.fullName || "",

      email:
        doctor.email || "",

      phone:
        doctor.phone || "",

      address:
        doctor.address || "",

      specialization:
        doctor.doctorDetails
          ?.specialization || "",

      hospital:
        doctor.doctorDetails
          ?.hospital || "",

      registrationNumber:
        doctor.doctorDetails
          ?.registrationNumber || "",
    });

    setIsEditing(false);
    setError("");
    setSuccess("");

  };


  /* ============================================================
     SAVE
  ============================================================ */

  const handleSave = async () => {

    try {

      setIsSaving(true);
      setError("");
      setSuccess("");

      const response =
        await updateDoctorProfile({
          fullName:
            formData.fullName,

          phone:
            formData.phone,

          address:
            formData.address,

          specialization:
            formData.specialization,

          hospital:
            formData.hospital,
        });


      const updatedDoctor =
        response.doctor;

      setDoctor(
        updatedDoctor
      );


      setFormData({
        fullName:
          updatedDoctor.fullName || "",

        email:
          updatedDoctor.email || "",

        phone:
          updatedDoctor.phone || "",

        address:
          updatedDoctor.address || "",

        specialization:
          updatedDoctor.doctorDetails
            ?.specialization || "",

        hospital:
          updatedDoctor.doctorDetails
            ?.hospital || "",

        registrationNumber:
          updatedDoctor.doctorDetails
            ?.registrationNumber || "",
      });


      /* --------------------------------------------------------
         Keep local login information synchronized
      -------------------------------------------------------- */

      const storedUser =
        localStorage.getItem(
          "nc_user"
        );

      if (storedUser) {

        try {

          const currentUser =
            JSON.parse(
              storedUser
            );

          localStorage.setItem(
            "nc_user",
            JSON.stringify({
              ...currentUser,
              ...updatedDoctor,
            })
          );

        } catch (error) {

          console.error(
            "Unable to update stored user:",
            error
          );

        }
      }


      setIsEditing(false);

      setSuccess(
        "Profile updated successfully."
      );

    } catch (error) {

      console.error(
        "Unable to update doctor profile:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update doctor profile."
      );

    } finally {

      setIsSaving(false);

    }
  };


  /* ============================================================
     LOADING
  ============================================================ */

  if (isLoading) {

    return (
      <div className="doctor-dashboard">

        <DoctorSidebar
          activePage="Profile"
        />

        <main className="doctor-dashboard__main">

          <DoctorHeader />

          <div className="doctor-dashboard__content">

            <section className="doctor-dashboard__card">

              <div
                style={{
                  padding: "30px",
                  fontSize: "14px",
                  color: "#718295",
                }}
              >
                Loading doctor profile...
              </div>

            </section>

          </div>

        </main>

      </div>
    );
  }


  const profileImage =
    doctor?.profilePicture?.url ||
    "";


  const initials =
    formData.fullName
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "D";


  return (
    <div className="doctor-dashboard">


      <DoctorSidebar
        activePage="Profile"
      />


      <main className="doctor-dashboard__main">

        <DoctorHeader />


        <div className="doctor-dashboard__content doctor-profile">


          {/* ==================================================
              HEADER
          ================================================== */}

          <section className="doctor-profile__header">

            <div>

              <span>
                ACCOUNT
              </span>

              <h1>
                My Profile
              </h1>

              <p>
                View and manage your professional
                doctor profile.
              </p>

            </div>


            <div className="doctor-profile__header-actions">

              {!isEditing ? (

                <button
                  type="button"
                  className="doctor-profile__edit-button"
                  onClick={() =>
                    setIsEditing(true)
                  }
                >

                  <FaEdit />

                  Edit Profile

                </button>

              ) : (

                <>

                  <button
                    type="button"
                    className="doctor-profile__cancel-button"
                    onClick={
                      handleCancel
                    }
                    disabled={
                      isSaving
                    }
                  >

                    <FaTimes />

                    Cancel

                  </button>


                  <button
                    type="button"
                    className="doctor-profile__save-button"
                    onClick={
                      handleSave
                    }
                    disabled={
                      isSaving
                    }
                  >

                    <FaSave />

                    {isSaving
                      ? "Saving..."
                      : "Save Changes"}

                  </button>

                </>

              )}

            </div>

          </section>


          {/* ==================================================
              ERROR / SUCCESS
          ================================================== */}

          {error && (

            <div className="doctor-profile__message doctor-profile__message--error">

              {error}

            </div>

          )}


          {success && (

            <div className="doctor-profile__message doctor-profile__message--success">

              <FaSave />

              {success}

            </div>

          )}


          {/* ==================================================
              PROFILE HERO
          ================================================== */}

          <section className="doctor-dashboard__card doctor-profile__hero">

            <div className="doctor-profile__avatar">

              {profileImage ? (

                <img
                  src={profileImage}
                  alt={
                    formData.fullName
                  }
                />

              ) : (

                <span>
                  {initials}
                </span>

              )}

            </div>


            <div className="doctor-profile__identity">

              <h2>
                {formData.fullName}
              </h2>

              <span>
                {formData.specialization ||
                  "Doctor"}
              </span>

              <p>
                {formData.hospital ||
                  "Hospital / Clinic not provided"}
              </p>

            </div>


            <div className="doctor-profile__role">

              <span>
                ROLE
              </span>

              <strong>
                Doctor
              </strong>

            </div>

          </section>


          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <section className="doctor-dashboard__card doctor-profile__card">

            <div className="doctor-profile__card-header">

              <div className="doctor-profile__section-icon">

                <FaUserMd />

              </div>

              <div>

                <h2>
                  Personal Information
                </h2>

                <p>
                  Your basic account information.
                </p>

              </div>

            </div>


            <div className="doctor-profile__form-grid">

              <ProfileField
                label="Full Name"
                name="fullName"
                value={
                  formData.fullName
                }
                onChange={
                  handleChange
                }
                editing={
                  isEditing
                }
                icon={
                  <FaUserMd />
                }
              />


              <ProfileField
                label="Email Address"
                name="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                editing={false}
                icon={
                  <FaEnvelope />
                }
              />


              <ProfileField
                label="Phone Number"
                name="phone"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                editing={
                  isEditing
                }
                icon={
                  <FaPhone />
                }
              />


              <ProfileField
                label="Address"
                name="address"
                value={
                  formData.address
                }
                onChange={
                  handleChange
                }
                editing={
                  isEditing
                }
                icon={
                  <FaMapMarkerAlt />
                }
              />

            </div>

          </section>


          {/* ==================================================
              PROFESSIONAL INFORMATION
          ================================================== */}

          <section className="doctor-dashboard__card doctor-profile__card">

            <div className="doctor-profile__card-header">

              <div className="doctor-profile__section-icon">

                <FaStethoscope />

              </div>

              <div>

                <h2>
                  Professional Information
                </h2>

                <p>
                  Your medical and professional details.
                </p>

              </div>

            </div>


            <div className="doctor-profile__form-grid">

              <ProfileField
                label="Specialization"
                name="specialization"
                value={
                  formData.specialization
                }
                onChange={
                  handleChange
                }
                editing={
                  isEditing
                }
                icon={
                  <FaStethoscope />
                }
              />


              <ProfileField
                label="Hospital / Clinic"
                name="hospital"
                value={
                  formData.hospital
                }
                onChange={
                  handleChange
                }
                editing={
                  isEditing
                }
                icon={
                  <FaHospital />
                }
              />


              <ProfileField
                label="Registration Number"
                name="registrationNumber"
                value={
                  formData.registrationNumber
                }
                onChange={
                  handleChange
                }
                editing={false}
                icon={
                  <FaUserMd />
                }
              />

            </div>

          </section>


        </div>

      </main>

    </div>
  );
};


/* ============================================================
   PROFILE FIELD
============================================================ */

const ProfileField = ({
  label,
  name,
  value,
  onChange,
  editing,
  icon,
}) => {

  return (
    <div className="doctor-profile__field">

      <label>
        {label}
      </label>

      <div className="doctor-profile__input-wrapper">

        <span>
          {icon}
        </span>

        {editing ? (

          <input
            type="text"
            name={name}
            value={value}
            onChange={
              onChange
            }
          />

        ) : (

          <div className="doctor-profile__readonly">
            {value ||
              "Not provided"}
          </div>

        )}

      </div>

    </div>
  );
};


export default DoctorProfile;