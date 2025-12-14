// src/components/RequireRole.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useMemo } from "react";

type Props = {
  requiredRole: string | string[];
};

export default function RequireRole({ requiredRole }: Props) {
  const authData = useMemo(() => {
    try {
      const raw = localStorage.getItem("auth");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const role = useMemo(() => {
    if (!authData) return null;
    return (
      authData?.rol ||
      authData?.role ||
      authData?.usuario?.rol ||
      authData?.usuario?.role ||
      authData?.user?.rol ||
      authData?.user?.role ||
      null
    );
  }, [authData]);

  // Si no hay rol, redirigir a login
  if (!role) {
    return <Navigate to="/" replace />;
  }

  // Si el rol no está autorizado, redirigir a dashboard
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!requiredRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si todo está bien, renderizar la ruta protegida
  return <Outlet />;
}
