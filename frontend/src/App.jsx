import AppRoutes from "./routes/AppRoutes.jsx";
import "./styles/global.css";

/**
 * Root application component.
 * Global providers (AuthProvider, ToastProvider) will wrap
 * <AppRoutes /> here in later features.
 */
const App = () => {
  return <AppRoutes />;
};

export default App;
