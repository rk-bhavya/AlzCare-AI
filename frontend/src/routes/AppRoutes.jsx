import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout/Layout.jsx";
import Home from "../pages/Home/Home.jsx";
import NotFound from "../pages/NotFound/NotFound.jsx";
import { ROUTES } from "../config/constants.js";
import Landing from "../pages/Landing/Landing.jsx";
import DoctorLogin from "../pages/DoctorLogin/DoctorLogin.jsx";
import CaregiverLogin from "../pages/CaregiverLogin/CaregiverLogin.jsx";
import Register from "../pages/Register/Register";
import PatientRegister from "../pages/PatientRegister/PatientRegister";
import CaregiverRegister from "../pages/CaregiverRegister/CaregiverRegister";

/**
 * Central route table.
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* ---------- PUBLIC ROUTES ---------- */}
      <Route element={<Layout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.LOGIN} element={<Landing />} />
        <Route
          path={ROUTES.DOCTOR_LOGIN}
          element={<DoctorLogin />}
        />
        <Route
          path={ROUTES.CAREGIVER_LOGIN}
          element={<CaregiverLogin />}
        />
        <Route
  path={ROUTES.REGISTER}
  element={<Register />}
/>
<Route
    path={ROUTES.PATIENT_REGISTER}
    element={<PatientRegister />}
/>
<Route
    path={ROUTES.CAREGIVER_REGISTER}
    element={<CaregiverRegister />}
/>
        <Route
          path={ROUTES.NOT_FOUND}
          element={<NotFound />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;