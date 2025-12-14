// src/pages/LoginPage.tsx
import { useState } from "react";
import api from "../api/apiClient";
import type { AuthResponse } from "../types/AuthResponse";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const resp = await api.post<AuthResponse>("/auth/login", {
        username,
        password,
      });

      const data = resp.data;

      // guardamos todo igual
      localStorage.setItem("auth", JSON.stringify(data));

      const role =
        data.rol ||
        data.role ||
        data.usuario?.rol ||
        data.user?.rol ||
        null;

      if (role === "SUPERADMIN") {
        window.location.href = "/superadmin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 sm:p-6">
      <div className="bg-white/95 shadow-xl rounded-2xl px-6 py-8 sm:px-8 sm:py-10 w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2">
          Control Yape
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 text-center mb-6">
          Inicia sesión para ver tus Yapes
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs sm:text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-purple-600 text-white py-2.5 text-sm sm:text-base font-semibold hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
