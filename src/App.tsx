import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SuperAdminPage from "./pages/SuperAdminPage";
import RequireRole from "./components/RequireRole";
import { NotificationProvider } from "./context/NotificationContext";
import { NotificationContainer } from "./components/NotificationContainer";

function App() {
  return (
    <NotificationProvider>
      <NotificationContainer />

      {/* CONTENEDOR GLOBAL DE TEMA */}
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />

            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Ruta protegida SOLO para SUPERADMIN */}
            <Route element={<RequireRole requiredRole="SUPERADMIN" />}>
              <Route path="/superadmin" element={<SuperAdminPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </NotificationProvider>
  );
}

export default App;
