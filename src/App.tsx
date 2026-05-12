import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SuperAdminPage from "./pages/SuperAdminPage";
import RequireRole from "./components/RequireRole";
import RequireAuth from "./components/RequireAuth";
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route element={<RequireAuth />}>
              {/* Ruta protegida SOLO para SUPERADMIN */}
              <Route element={<RequireRole requiredRole="SUPERADMIN" />}>
                <Route path="/superadmin" element={<SuperAdminPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </NotificationProvider>
  );
}

export default App;
