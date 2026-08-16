import { Routes, Route } from "react-router-dom";

/* ============================================================
   LAYOUT
============================================================ */

import Layout from "../components/Layout/Layout.jsx";


/* ============================================================
   PUBLIC PAGES
============================================================ */

import Home from "../pages/Home/Home.jsx";
import NotFound from "../pages/NotFound/NotFound.jsx";

import Landing from "../pages/Landing/Landing.jsx";

import DoctorLogin from "../pages/DoctorLogin/DoctorLogin.jsx";
import CaregiverLogin from "../pages/CaregiverLogin/CaregiverLogin.jsx";

import Register from "../pages/Register/Register.jsx";

import PatientRegister from "../pages/PatientRegister/PatientRegister.jsx";
import CaregiverRegister from "../pages/CaregiverRegister/CaregiverRegister.jsx";
import DoctorRegister from "../pages/DoctorRegister/DoctorRegister.jsx";
import DoctorNotifications from "../pages/DoctorNotifications/DoctorNotifications.jsx";
import DoctorMessages from "../pages/DoctorMessages/DoctorMessages.jsx";
import DoctorProfile from "../pages/DoctorProfile/DoctorProfile.jsx";
import DoctorSettings from "../pages/DoctorSettings/DoctorSettings.jsx";
import DoctorClinicalNotes from "../pages/DoctorClinicalNotes/DoctorClinicalNotes.jsx";

/* ============================================================
   DASHBOARDS
============================================================ */

import CaregiverDashboard from "../pages/CaregiverDashboard/CaregiverDashboard.jsx";
import DoctorDashboard from "../pages/DoctorDashboard/DoctorDashboard.jsx";

import DoctorPatients from "../pages/DoctorPatients/DoctorPatients.jsx";
import DoctorPatientDetails from "../pages/DoctorPatientDetails/DoctorPatientDetails.jsx";

import DoctorAIReports from "../pages/DoctorAIReports/DoctorAIReports.jsx";
import DoctorAIReportDetails from "../pages/DoctorAIReportDetails/DoctorAIReportDetails.jsx";
import DoctorAppointments from "../pages/DoctorAppointments/DoctorAppointments.jsx";
import DoctorMonitoring from "../pages/DoctorMonitoring/DoctorMonitoring.jsx";

/* ============================================================
   AUTH
============================================================ */

import ForgotPassword from "../pages/auth/ForgotPassword.jsx";


/* ============================================================
   PROTECTION
============================================================ */

import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute.jsx";


/* ============================================================
   CONSTANTS
============================================================ */

import {
  ROUTES,
  ROLES,
} from "../config/constants.js";


/**
 * Central application route table.
 */

const AppRoutes = () => {

  return (

    <Routes>


      {/* ======================================================
          PUBLIC ROUTES
      ======================================================= */}

      <Route
        element={
          <Layout />
        }
      >

        <Route
          path={ROUTES.HOME}
          element={
            <Home />
          }
        />


        <Route
          path={ROUTES.LOGIN}
          element={
            <Landing />
          }
        />


        <Route
          path={ROUTES.DOCTOR_LOGIN}
          element={
            <DoctorLogin />
          }
        />


        <Route
          path={ROUTES.CAREGIVER_LOGIN}
          element={
            <CaregiverLogin />
          }
        />


        <Route
          path={ROUTES.REGISTER}
          element={
            <Register />
          }
        />


        <Route
          path={ROUTES.PATIENT_REGISTER}
          element={
            <PatientRegister />
          }
        />


        <Route
          path={ROUTES.CAREGIVER_REGISTER}
          element={
            <CaregiverRegister />
          }
        />


        <Route
          path={ROUTES.DOCTOR_REGISTER}
          element={
            <DoctorRegister />
          }
        />


        {/* ==================================================
            PROTECTED CAREGIVER ROUTES
        =================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                ROLES.CAREGIVER,
              ]}
            />
          }
        >

          <Route
            path={
              ROUTES.CAREGIVER_DASHBOARD
            }
            element={
              <CaregiverDashboard />
            }
          />

        </Route>


        {/* ==================================================
            PROTECTED DOCTOR ROUTES
        =================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                ROLES.DOCTOR,
              ]}
            />
          }
        >


          {/* ================================================
              DOCTOR DASHBOARD
          ================================================= */}

          <Route
            path={
              ROUTES.DOCTOR_DASHBOARD
            }
            element={
              <DoctorDashboard />
            }
          />


          {/* ================================================
              MY PATIENTS
          ================================================= */}

          <Route
            path="/doctor/patients"
            element={
              <DoctorPatients />
            }
          />


          {/* ================================================
              PATIENT DETAILS

              IMPORTANT:
              This comes after /doctor/patients
              and contains the patient ID.
          ================================================= */}

          <Route
            path="/doctor/patients/:patientId"
            element={
              <DoctorPatientDetails />
            }
          />


          {/* ================================================
              AI REPORTS
          ================================================= */}

          <Route
  path="/doctor/ai-reports"
  element={<DoctorAIReports />}
/>

<Route
  path="/doctor/ai-reports/:assessmentId"
  element={<DoctorAIReportDetails />}
/>
<Route
  path="/doctor/appointments"
  element={<DoctorAppointments />}
/>
<Route
  path="/doctor/monitoring"
  element={<DoctorMonitoring />}
/>
<Route
  path="/doctor/notifications"
  element={<DoctorNotifications />}
/>
<Route
  path="/doctor/messages"
  element={<DoctorMessages />}
/>
<Route
  path="/doctor/profile"
  element={<DoctorProfile />}
/>
<Route
  path="/doctor/settings"
  element={<DoctorSettings />}
/>
<Route
  path="/doctor/clinical-notes"
  element={
    <DoctorClinicalNotes />
  }
/>
        </Route>

        {/* ==================================================
            FORGOT PASSWORD
        =================================================== */}

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />


        {/* ==================================================
            FALLBACK
        =================================================== */}

        <Route
          path={ROUTES.NOT_FOUND}
          element={
            <NotFound />
          }
        />

      </Route>

    </Routes>

  );

};


export default AppRoutes;