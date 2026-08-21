import express from "express";

import {
  getFamilyMembersForPatient,
  createFamilyMember,
  deleteFamilyMember,
} from "../controllers/familyMember.controller.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import upload from "../middleware/upload.middleware.js";

const router = express.Router();

/* ============================================================
   ALL FAMILY MEMBER ROUTES REQUIRE:
   - Valid JWT
   - Caregiver role

   Ownership of the patient (and therefore the family member) is
   verified inside every controller through CareAssignment.
============================================================ */

router.use(protect, authorizeRoles("caregiver"));

/* ============================================================
   GET FAMILY MEMBERS FOR A PATIENT
============================================================ */

router.get("/patient/:patientId", getFamilyMembersForPatient);

/* ============================================================
   CREATE FAMILY MEMBER (photo optional)
============================================================ */

router.post("/", upload.single("photo"), createFamilyMember);

/* ============================================================
   DELETE FAMILY MEMBER
============================================================ */

router.delete("/:familyMemberId", deleteFamilyMember);

export default router;
