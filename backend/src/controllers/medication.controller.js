import mongoose from "mongoose";

import Medication from "../models/Medication.js";
import MedicationLog from "../models/MedicationLog.js";
import { verifyCaregiverOwnsPatient } from "./caregiver.controller.js";

/* ============================================================
   HELPERS
============================================================ */

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const todayKey = () => new Date().toISOString().slice(0, 10);

/* ============================================================
   GET MEDICATIONS FOR A PATIENT

   GET /medications/patient/:patientId
============================================================ */

export const getMedicationsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const assignment = await verifyCaregiverOwnsPatient(
      req.user._id,
      patientId
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to your care.",
      });
    }

    const medications = await Medication.find({ patientId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      medications,
    });
  } catch (error) {
    console.error("Get medications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load medications.",
    });
  }
};

/* ============================================================
   CREATE MEDICATION

   POST /medications
============================================================ */

export const createMedication = async (req, res) => {
  try {
    const {
      patientId,
      name,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      instructions,
    } = req.body;

    if (!patientId || !name || !dosage || !frequency || !times) {
      return res.status(400).json({
        success: false,
        message:
          "Patient, medication name, dosage, frequency, and time(s) are required.",
      });
    }

    const assignment = await verifyCaregiverOwnsPatient(
      req.user._id,
      patientId
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to your care.",
      });
    }

    const normalizedTimes = (
      Array.isArray(times) ? times : [times]
    ).map((time) => String(time).trim());

    if (
      normalizedTimes.length === 0 ||
      !normalizedTimes.every((time) => TIME_REGEX.test(time))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide at least one valid time in HH:mm 24-hour format.",
      });
    }

    const medication = await Medication.create({
      patientId,
      caregiverId: req.user._id,
      createdBy: req.user._id,
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      times: normalizedTimes,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      instructions: instructions?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Medication added successfully.",
      medication,
    });
  } catch (error) {
    console.error("Create medication error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add medication.",
    });
  }
};

/* ============================================================
   UPDATE MEDICATION

   PUT /medications/:medicationId
============================================================ */

export const updateMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;

    if (!mongoose.isValidObjectId(medicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medication ID.",
      });
    }

    const medication = await Medication.findOne({
      _id: medicationId,
      caregiverId: req.user._id,
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found.",
      });
    }

    const {
      name,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      instructions,
      isActive,
    } = req.body;

    if (name) medication.name = name.trim();
    if (dosage) medication.dosage = dosage.trim();
    if (frequency) medication.frequency = frequency.trim();

    if (times) {
      const normalizedTimes = (
        Array.isArray(times) ? times : [times]
      ).map((time) => String(time).trim());

      if (!normalizedTimes.every((time) => TIME_REGEX.test(time))) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid times in HH:mm 24-hour format.",
        });
      }

      medication.times = normalizedTimes;
    }

    if (startDate) medication.startDate = new Date(startDate);
    if (endDate !== undefined) {
      medication.endDate = endDate ? new Date(endDate) : null;
    }
    if (instructions !== undefined) {
      medication.instructions = instructions.trim();
    }
    if (typeof isActive === "boolean") {
      medication.isActive = isActive;
    }

    await medication.save();

    return res.status(200).json({
      success: true,
      message: "Medication updated successfully.",
      medication,
    });
  } catch (error) {
    console.error("Update medication error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update medication.",
    });
  }
};

/* ============================================================
   DELETE MEDICATION

   DELETE /medications/:medicationId
============================================================ */

export const deleteMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;

    if (!mongoose.isValidObjectId(medicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medication ID.",
      });
    }

    const medication = await Medication.findOneAndDelete({
      _id: medicationId,
      caregiverId: req.user._id,
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found.",
      });
    }

    await MedicationLog.deleteMany({ medicationId: medication._id });

    return res.status(200).json({
      success: true,
      message: "Medication removed successfully.",
    });
  } catch (error) {
    console.error("Delete medication error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove medication.",
    });
  }
};

/* ============================================================
   GET TODAY'S MEDICATION SCHEDULE FOR A PATIENT

   GET /medications/patient/:patientId/today

   Computes Pending / Taken / Missed for every dose scheduled
   today, using MedicationLog entries where they exist.
============================================================ */

/* ============================================================
   SHARED: COMPUTE TODAY'S MEDICATION SCHEDULE FOR A PATIENT

   Pure data function — no ownership check here. Callers
   (caregiver controller below, and the patient-device
   controller) are each responsible for verifying the requester
   is allowed to see this patientId before calling this.
============================================================ */

export const computeTodaysScheduleForPatient = async (patientId) => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const medications = await Medication.find({
    patientId,
    isActive: true,
    startDate: { $lte: endOfDay },
    $or: [{ endDate: null }, { endDate: { $gte: startOfDay } }],
  }).lean();

  const medicationIds = medications.map((med) => med._id);

  const logs = medicationIds.length
    ? await MedicationLog.find({
        medicationId: { $in: medicationIds },
        date: todayKey(),
      }).lean()
    : [];

  const logMap = new Map(
    logs.map((log) => [`${log.medicationId}_${log.time}`, log])
  );

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const schedule = [];

  medications.forEach((medication) => {
    medication.times.forEach((time) => {
      const log = logMap.get(`${medication._id}_${time}`);
      const [hours, minutes] = time.split(":").map(Number);
      const scheduledMinutes = hours * 60 + minutes;

      let status = "pending";

      if (log) {
        status = log.status;
      } else if (scheduledMinutes < nowMinutes) {
        status = "missed";
      }

      schedule.push({
        medicationId: medication._id,
        name: medication.name,
        dosage: medication.dosage,
        instructions: medication.instructions,
        time,
        status,
      });
    });
  });

  schedule.sort((a, b) => a.time.localeCompare(b.time));

  return schedule;
};

export const getTodaysMedicationSchedule = async (req, res) => {
  try {
    const { patientId } = req.params;

    const assignment = await verifyCaregiverOwnsPatient(
      req.user._id,
      patientId
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to your care.",
      });
    }

    const schedule = await computeTodaysScheduleForPatient(patientId);

    return res.status(200).json({
      success: true,
      date: todayKey(),
      schedule,
    });
  } catch (error) {
    console.error("Get today's medication schedule error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load today's medication schedule.",
    });
  }
};

/* ============================================================
   MARK MEDICATION DOSE AS TAKEN

   PATCH /medications/:medicationId/take
   body: { time: "08:00", date?: "2026-08-18" }

   Persists the change to MongoDB via MedicationLog — never
   just to frontend state.
============================================================ */

export const markMedicationTaken = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const { time, date } = req.body;

    if (!mongoose.isValidObjectId(medicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medication ID.",
      });
    }

    if (!time || !TIME_REGEX.test(time)) {
      return res.status(400).json({
        success: false,
        message: "A valid time (HH:mm) is required.",
      });
    }

    const medication = await Medication.findOne({
      _id: medicationId,
      caregiverId: req.user._id,
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found.",
      });
    }

    if (!medication.times.includes(time)) {
      return res.status(400).json({
        success: false,
        message: "This time is not part of the medication schedule.",
      });
    }

    const logDate = date || todayKey();

    const log = await MedicationLog.findOneAndUpdate(
      {
        medicationId: medication._id,
        date: logDate,
        time,
      },
      {
        $set: {
          patientId: medication.patientId,
          status: "taken",
          takenAt: new Date(),
          takenBy: req.user._id,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Medication marked as taken.",
      log,
    });
  } catch (error) {
    console.error("Mark medication taken error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update medication status.",
    });
  }
};

/* ============================================================
   GET MEDICATION HISTORY FOR A PATIENT

   GET /medications/patient/:patientId/history
============================================================ */

export const getMedicationHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const assignment = await verifyCaregiverOwnsPatient(
      req.user._id,
      patientId
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to your care.",
      });
    }

    const medications = await Medication.find({ patientId })
      .select("_id name dosage")
      .lean();

    const medicationIds = medications.map((med) => med._id);

    const logs = medicationIds.length
      ? await MedicationLog.find({
          medicationId: { $in: medicationIds },
        })
          .sort({ date: -1, time: -1 })
          .limit(100)
          .lean()
      : [];

    const medicationMap = new Map(
      medications.map((med) => [String(med._id), med])
    );

    const history = logs.map((log) => ({
      ...log,
      medication: medicationMap.get(String(log.medicationId)) || null,
    }));

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Get medication history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load medication history.",
    });
  }
};
