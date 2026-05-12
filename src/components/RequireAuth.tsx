import { Navigate, Outlet } from "react-router-dom";

function hasAuthSession(): boolean {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const token = parsed?.token;
    return typeof token === "string" && token.trim().length > 0;
  } catch {
    return false;
  }
}

export default function RequireAuth() {
  if (!hasAuthSession()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
