import User from "../models/User.js";

/* ============================================================
   GET DOCTOR PROFILE
============================================================ */

export const getDoctorProfile = async (
  req,
  res
) => {
  try {
    const doctor = await User.findOne({
      _id: req.user._id,
      role: "doctor",
    }).select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });

  } catch (error) {

    console.error(
      "Get doctor profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load doctor profile.",
    });
  }
};


/* ============================================================
   UPDATE DOCTOR PROFILE

   Editable:
   - fullName
   - phone
   - address
   - specialization
   - hospital

   Registration number and email are intentionally
   not editable from the profile page.
============================================================ */

export const updateDoctorProfile = async (
  req,
  res
) => {
  try {

    const {
      fullName,
      phone,
      address,
      specialization,
      hospital,
    } = req.body;


    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

    if (
      !fullName ||
      !phone ||
      !address ||
      !specialization ||
      !hospital
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, phone, address, specialization, and hospital are required.",
      });
    }


    /* --------------------------------------------------------
       PHONE VALIDATION
    -------------------------------------------------------- */

    const normalizedPhone =
      phone.trim();

    if (
      !/^[6-9]\d{9}$/.test(
        normalizedPhone
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10-digit phone number.",
      });
    }


    /* --------------------------------------------------------
       FIND DOCTOR
    -------------------------------------------------------- */

    const doctor =
      await User.findOne({
        _id: req.user._id,
        role: "doctor",
      });


    if (!doctor) {
      return res.status(404).json({
        success: false,
        message:
          "Doctor profile not found.",
      });
    }


    /* --------------------------------------------------------
       CHECK PHONE DUPLICATE
    -------------------------------------------------------- */

    const existingPhone =
      await User.findOne({
        phone: normalizedPhone,
        _id: {
          $ne: doctor._id,
        },
      });


    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message:
          "This phone number is already registered with another account.",
      });
    }


    /* --------------------------------------------------------
       UPDATE BASIC INFORMATION
    -------------------------------------------------------- */

    doctor.fullName =
      fullName.trim();

    doctor.phone =
      normalizedPhone;

    doctor.address =
      address.trim();


    /* --------------------------------------------------------
       UPDATE DOCTOR INFORMATION
    -------------------------------------------------------- */

    doctor.doctorDetails.specialization =
      specialization.trim();

    doctor.doctorDetails.hospital =
      hospital.trim();


    await doctor.save();


    /* --------------------------------------------------------
       RETURN UPDATED DOCTOR
    -------------------------------------------------------- */

    const updatedDoctor =
      await User.findById(
        doctor._id
      ).select("-password");


    return res.status(200).json({
      success: true,
      message:
        "Doctor profile updated successfully.",
      doctor: updatedDoctor,
    });

  } catch (error) {

    console.error(
      "Update doctor profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update doctor profile.",
    });
  }
};


/* ============================================================
   GET PATIENTS FOR DOCTOR

   Keep your existing patient-assignment logic below this
   section if this file already contains it.
============================================================ */

export const getPatientsForAssignment =
  async (req, res) => {

    try {

      const patients =
        await User.find({
          role: "patient",
        })
          .select(
            "fullName age gender email phone profilePicture"
          )
          .sort({
            fullName: 1,
          })
          .lean();


      return res.status(200).json({
        success: true,
        patients,
      });

    } catch (error) {

      console.error(
        "Get patients error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load patients.",
      });
    }
  };


/* ============================================================
   GET CAREGIVERS
============================================================ */

export const getCaregiversForAssignment =
  async (req, res) => {

    try {

      const caregivers =
        await User.find({
          role: "caregiver",
        })
          .select(
            "fullName email phone relationship profilePicture"
          )
          .sort({
            fullName: 1,
          })
          .lean();


      return res.status(200).json({
        success: true,
        caregivers,
      });

    } catch (error) {

      console.error(
        "Get caregivers error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load caregivers.",
      });
    }
  };


/* ============================================================
   ASSIGN PATIENT TO CAREGIVER

   IMPORTANT:
   Your current User schema does not contain a caregiver
   assignment field.

   Keep your existing implementation of this function
   if you already have one.
============================================================ */

export const assignPatientToCaregiver =
  async (req, res) => {

    return res.status(501).json({
      success: false,
      message:
        "Patient-caregiver assignment is not configured yet.",
    });

  };