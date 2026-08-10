import { Navigate, Outlet } from "react-router-dom";

import {
  ROUTES,
  STORAGE_KEYS,
} from "../../config/constants.js";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const token = localStorage.getItem(
    STORAGE_KEYS.TOKEN
  );

  const storedUser = localStorage.getItem(
    STORAGE_KEYS.USER
  );

  if (!token || !storedUser) {
    return (
      <Navigate
        to={ROUTES.CAREGIVER_LOGIN}
        replace
      />
    );
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);

    return (
      <Navigate
        to={ROUTES.CAREGIVER_LOGIN}
        replace
      />
    );
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to={ROUTES.CAREGIVER_LOGIN}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;