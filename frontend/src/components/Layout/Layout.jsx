import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";
import "./Layout.css";

/**
 * Public layout shell: Navbar + routed page + Footer.
 * <Outlet /> is where React Router renders the matched child route.
 * Later we will add a separate DashboardLayout with a sidebar.
 */
const Layout = () => {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
