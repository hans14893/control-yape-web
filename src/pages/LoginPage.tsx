// src/pages/LoginPage.tsx
import { useState } from "react";
import api from "../api/apiClient";
import type { AuthResponse } from "../types/AuthResponse";
import ThemeToggle from "../components/ThemeToggle";

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
      localStorage.setItem("auth", JSON.stringify(data));

      const role = data.rol || data.role || data.usuario?.rol || data.user?.rol || null;

      window.location.href = role === "SUPERADMIN" ? "/superadmin" : "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-100 dark:bg-slate-950">
      {/* Toggle arriba a la derecha */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="shadow-xl rounded-2xl px-6 py-8 sm:px-8 sm:py-10 w-full max-w-md
                      bg-white border border-slate-200
                      dark:bg-slate-900 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-slate-900 dark:text-slate-100">
          Control Yape
        </h1>

        <p className="text-xs sm:text-sm text-center mb-6 text-slate-500 dark:text-slate-400">
          Inicia sesión para ver tus Yapes
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">
              Usuario
            </label>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2 text-sm sm:text-base transition
                         bg-white text-slate-900 border-slate-300
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                         dark:bg-slate-950 dark:text-slate-100 dark:border-slate-700"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2 text-sm sm:text-base transition
                         bg-white text-slate-900 border-slate-300
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                         dark:bg-slate-950 dark:text-slate-100 dark:border-slate-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs sm:text-sm rounded-lg px-3 py-2 border
                          text-red-600 bg-red-50 border-red-200
                          dark:text-red-300 dark:bg-red-950/40 dark:border-red-900/60">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2.5 text-sm sm:text-base font-semibold transition-colors
                       bg-purple-600 text-white hover:bg-purple-700
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
