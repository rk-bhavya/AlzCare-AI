import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout/Layout.jsx";
import Home from "../pages/Home/Home.jsx";
import NotFound from "../pages/NotFound/NotFound.jsx";
import { ROUTES } from "../config/constants.js";

/**
 * Central route table.
 *
 * Nested inside <Layout /> => page renders with Navbar + Footer.
 * From Feature 2 onwards we add /login, /register and role-protected
 * dashboard routes here.
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* ---------- PUBLIC ROUTES (with Navbar + Footer) ---------- */}
      <Route element={<Layout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
