/* ============================================================
   PATIENT NAV

   Deliberately only 5 items, large tap targets, simple icons
   and words. No nested menus, no admin-style sidebar. Hidden
   during active gameplay so the game gets full screen focus
   (a visible Back button inside the game returns here).
============================================================ */

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "medicines", label: "Medicines", icon: "💊" },
  { key: "brain", label: "Brain Exercise", icon: "🧠" },
  { key: "family", label: "Family", icon: "👪" },
  { key: "help", label: "Help", icon: "🆘" },
];

const PatientNav = ({ activeView, onNavigate }) => {
  return (
    <nav className="patient-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`patient-nav__item ${
            activeView === item.key ? "patient-nav__item--active" : ""
          }`}
          onClick={() => onNavigate(item.key)}
        >
          <span className="patient-nav__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="patient-nav__label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default PatientNav;
