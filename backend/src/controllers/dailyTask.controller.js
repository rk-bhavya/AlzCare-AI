import mongoose from "mongoose";

import DailyTask from "../models/DailyTask.js";
import { verifyCaregiverOwnsPatient } from "./caregiver.controller.js";

const CATEGORIES = [
  "Medication",
  "Cognitive Activity",
  "Appointment",
  "Personal Care",
  "Other",
];

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/* ============================================================
   CREATE DAILY TASK

   POST /daily-tasks
============================================================ */

export const createDailyTask = async (req, res) => {
  try {
    const {
      patientId,
      title,
      description,
      category,
      scheduledTime,
      frequency,
    } = req.body;

    if (!patientId || !title) {
      return res.status(400).json({
        success: false,
        message: "Patient and task title are required.",
      });
    }

    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task category.",
      });
    }

    if (scheduledTime && !TIME_REGEX.test(scheduledTime)) {
      return res.status(400).json({
        success: false,
        message: "Scheduled time must be in HH:mm 24-hour format.",
      });
    }

    if (frequency && !["daily", "once"].includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: "Invalid frequency.",
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

    const task = await DailyTask.create({
      patientId,
      caregiverId: req.user._id,
      createdBy: req.user._id,
      title: title.trim(),
      description: description?.trim() || "",
      category: category || "Other",
      scheduledTime: scheduledTime || "",
      frequency: frequency || "daily",
    });

    return res.status(201).json({
      success: true,
      message: "Task added successfully.",
      task,
    });
  } catch (error) {
    console.error("Create daily task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add task.",
    });
  }
};

/* ============================================================
   GET DAILY TASKS FOR A PATIENT

   GET /daily-tasks/patient/:patientId
============================================================ */

export const getPatientDailyTasks = async (req, res) => {
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

    const tasks = await DailyTask.find({
      patientId,
      isActive: true,
    })
      .sort({ scheduledTime: 1, createdAt: -1 })
      .lean();

    const completedCount = tasks.filter((task) => task.isCompleted).length;

    return res.status(200).json({
      success: true,
      tasks,
      summary: {
        total: tasks.length,
        completed: completedCount,
        pending: tasks.length - completedCount,
      },
    });
  } catch (error) {
    console.error("Get patient daily tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load daily tasks.",
    });
  }
};

/* ============================================================
   HELPER: LOAD TASK + VERIFY OWNERSHIP
============================================================ */

const loadOwnedTask = async (caregiverId, taskId) => {
  if (!mongoose.isValidObjectId(taskId)) {
    return { error: "Invalid task ID.", status: 400 };
  }

  const task = await DailyTask.findById(taskId);

  if (!task) {
    return { error: "Task not found.", status: 404 };
  }

  const assignment = await verifyCaregiverOwnsPatient(
    caregiverId,
    task.patientId
  );

  if (!assignment) {
    return {
      error: "This patient is not assigned to your care.",
      status: 403,
    };
  }

  return { task };
};

/* ============================================================
   UPDATE DAILY TASK

   PUT /daily-tasks/:taskId
============================================================ */

export const updateDailyTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const { task, error, status } = await loadOwnedTask(
      req.user._id,
      taskId
    );

    if (error) {
      return res.status(status).json({ success: false, message: error });
    }

    const {
      title,
      description,
      category,
      scheduledTime,
      frequency,
      isActive,
    } = req.body;

    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task category.",
      });
    }

    if (scheduledTime !== undefined && scheduledTime !== "" && !TIME_REGEX.test(scheduledTime)) {
      return res.status(400).json({
        success: false,
        message: "Scheduled time must be in HH:mm 24-hour format.",
      });
    }

    if (frequency && !["daily", "once"].includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: "Invalid frequency.",
      });
    }

    if (title) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (category) task.category = category;
    if (scheduledTime !== undefined) task.scheduledTime = scheduledTime;
    if (frequency) task.frequency = frequency;
    if (typeof isActive === "boolean") task.isActive = isActive;

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      task,
    });
  } catch (error) {
    console.error("Update daily task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update task.",
    });
  }
};

/* ============================================================
   COMPLETE / UNCOMPLETE DAILY TASK

   PATCH /daily-tasks/:taskId/complete
   body: { completed?: boolean }  — defaults to true
============================================================ */

export const completeDailyTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const { task, error, status } = await loadOwnedTask(
      req.user._id,
      taskId
    );

    if (error) {
      return res.status(status).json({ success: false, message: error });
    }

    const completed =
      typeof req.body.completed === "boolean" ? req.body.completed : true;

    task.isCompleted = completed;
    task.completedAt = completed ? new Date() : null;
    task.completedBy = completed ? req.user._id : null;

    await task.save();

    return res.status(200).json({
      success: true,
      message: completed
        ? "Task marked as completed."
        : "Task marked as pending.",
      task,
    });
  } catch (error) {
    console.error("Complete daily task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update task status.",
    });
  }
};

/* ============================================================
   DELETE DAILY TASK

   DELETE /daily-tasks/:taskId
============================================================ */

export const deleteDailyTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const { task, error, status } = await loadOwnedTask(
      req.user._id,
      taskId
    );

    if (error) {
      return res.status(status).json({ success: false, message: error });
    }

    await task.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Task removed successfully.",
    });
  } catch (error) {
    console.error("Delete daily task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove task.",
    });
  }
};
