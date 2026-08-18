import { useState } from "react";

import CaregiverSidebar from "./CaregiverSidebar.jsx";
import CaregiverHeader from "./CaregiverHeader.jsx";

import "../../styles/caregiver-shared.css";

/* ============================================================
   CAREGIVER PAGE LAYOUT

   Shared shell (sidebar + header + content wrapper) reused by
   every caregiver page beyond the Dashboard, so navigation and
   the top bar stay perfectly consistent across the module.
============================================================ */

const CaregiverPageLayout = ({
  activePage,
  eyebrow,
  title,
  subtitle,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="caregiver-page">
      {sidebarOpen && (
        <div
          className="caregiver-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <CaregiverSidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="caregiver-main">
        <CaregiverHeader
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="caregiver-page-content">{children}</div>
      </main>
    </div>
  );
};

export default CaregiverPageLayout;
