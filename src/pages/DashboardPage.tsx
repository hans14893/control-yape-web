// src/pages/DashboardPage.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/apiClient";
import ThemeToggle from "../components/ThemeToggle";

type Movimiento = {
  id: number;
  fechaHora: string;
  nombreCliente: string;
  celular: string | null;
  monto: number;
  mensaje: string;
  estado: string;

  yapeCuentaNombre?: string;
  numeroYape?: string;
};

// Obtener rol desde el localStorage
function getRoleFromAuth(): string | null {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    const auth = JSON.parse(raw as string);
    return (
      auth?.rol ||
      auth?.role ||
      auth?.usuario?.rol ||
      auth?.usuario?.role ||
      auth?.user?.rol ||
      auth?.user?.role ||
      null
    );
  } catch {
    return null;
  }
}

// ✅ Obtener nombre de empresa desde el auth
function getEmpresaNombreFromAuth(): string {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return "Mi Empresa";
    const auth = JSON.parse(raw as string);

    return (
      auth?.empresaNombre ||
      auth?.empresa?.nombre ||
      auth?.usuario?.empresaNombre ||
      auth?.usuario?.empresa?.nombre ||
      auth?.user?.empresaNombre ||
      auth?.user?.empresa?.nombre ||
      "Mi Empresa"
    );
  } catch {
    return "Mi Empresa";
  }
}

// ✅ Obtener empresaId desde el auth (si existe)
function getEmpresaIdFromAuth(): number | null {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    const auth = JSON.parse(raw as string);

    return (
      auth?.empresaId ||
      auth?.empresa?.id ||
      auth?.usuario?.empresaId ||
      auth?.usuario?.empresa?.id ||
      auth?.user?.empresaId ||
      auth?.user?.empresa?.id ||
      null
    );
  } catch {
    return null;
  }
}

function parseIsoSmart(iso: string): Date {
  if (!iso) return new Date(NaN);

  // si ya viene con Z o con offset +05:00 / -05:00, lo dejamos
  const hasTz = /Z$|[+-]\d{2}:\d{2}$/.test(iso);

  // si NO trae zona horaria, asumimos que el backend lo manda en UTC
  return new Date(hasTz ? iso : iso + "Z");
}


function formatFechaHora(iso: string): string {
  if (!iso) return "-";
  const d = parseIsoSmart(iso);
  if (isNaN(d.getTime())) return iso;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}


// helper para obtener YYYY-MM-DD local
function todayLocalYMD(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function ymdFromIsoLocal(iso: string): string {
  if (!iso) return "";
  const d = parseIsoSmart(iso);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}


export default function DashboardPage() {
  const [movs, setMovs] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [role] = useState<string | null>(getRoleFromAuth());
  const [empresaNombre] = useState<string>(getEmpresaNombreFromAuth());
  const [empresaId] = useState<number | null>(getEmpresaIdFromAuth());

  // ✅ filtro por día (por defecto HOY)
  const [selectedDay, setSelectedDay] = useState<string>(todayLocalYMD());

  const fetchMovs = useCallback(async () => {
    try {
      setLoading(true);
      // si tenemos empresaId, pedimos movimientos filtrados por empresa
      const url = empresaId ? `/yape-movimientos?empresaId=${empresaId}` : "/yape-movimientos";
      const resp = await api.get<Movimiento[]>(url);
      setMovs(resp.data);
    } catch (error) {
      console.error("Error cargando movimientos", error);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    fetchMovs();
  }, [fetchMovs]);

  // ✅ Movimientos filtrados por día seleccionado
  const movsFiltrados = useMemo(() => {
    if (!selectedDay) return movs;
    return movs.filter((m) => ymdFromIsoLocal(m.fechaHora) === selectedDay);
  }, [movs, selectedDay]);

  const total = movsFiltrados.reduce((sum, m) => sum + (m.monto || 0), 0);

  // Si es SUPERADMIN, redirigir a SuperAdminPage
  if (role === "SUPERADMIN") {
    return <Navigate to="/superadmin" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top bar */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 gap-4 sm:gap-3
      border-b border-slate-200 bg-white
      dark:border-slate-800 dark:bg-slate-950/60">
        <h1 className="text-lg sm:text-xl font-semibold">
          Control Yape{" "}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            · {empresaNombre}
          </span>
        </h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* ✅ Filtro por día */}
          <div
            className="
            flex items-center gap-2 px-3 py-2 rounded-xl
            bg-slate-100 border border-emerald-500/30
            shadow-[0_0_12px_rgba(16,185,129,0.18)]
            dark:bg-black/60 dark:border-emerald-500/30
            dark:shadow-[0_0_12px_rgba(16,185,129,0.35)]
            w-full sm:w-auto
          "
          >
            <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-emerald-600 dark:text-emerald-400">
              DAY
            </span>

            <input
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="
              bg-white text-emerald-700
              border border-emerald-500/40
              rounded-lg px-2 pr-8 py-1 text-xs sm:text-sm font-mono
              focus:outline-none focus:ring-2 focus:ring-emerald-400/60
              hover:border-emerald-400
              shadow-[inset_0_0_8px_rgba(16,185,129,0.15)]
              transition flex-1 sm:flex-none
              dark:bg-black dark:text-emerald-300
              dark:shadow-[inset_0_0_8px_rgba(16,185,129,0.25)]
            "
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* 🌙☀️ Tema */}
            <div className="flex-none">
              <ThemeToggle />
            </div>

            {/* ✅ Actualizar verde */}
            <button
              className="text-xs px-3 py-2 sm:py-1 rounded-lg border border-emerald-600 text-emerald-600 hover:bg-emerald-600/10 transition flex-1 sm:flex-none
              dark:text-emerald-300"
              onClick={fetchMovs}
            >
              Actualizar
            </button>

            {/* ✅ Cerrar sesión rojo */}
            <button
              className="text-xs px-3 py-2 sm:py-1 rounded-lg border border-red-600 text-red-600 hover:bg-red-600/10 transition flex-1 sm:flex-none
              dark:text-red-300"
              onClick={() => {
                localStorage.removeItem("auth");
                window.location.href = "/";
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 py-6 space-y-6 flex-1 overflow-y-auto">
        {/* Cards resumen */}
        <section className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4
          dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Total Yape (día)
            </p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              S/ {total.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4
          dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Número de Yapes (día)
            </p>
            <p className="text-xl sm:text-2xl font-bold">
              {movsFiltrados.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4
          dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Estado
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {loading ? "Cargando..." : "Actualizado"}
            </p>
          </div>
        </section>

        {/* Tabla */}
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden
        dark:border-slate-800 dark:bg-slate-950/40">
          <div className="px-3 sm:px-4 py-3 border-b border-slate-200 flex justify-between items-center
          dark:border-slate-800">
            <h2 className="text-xs sm:text-sm font-semibold">
              Movimientos Yape{" "}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ( {selectedDay || "todos"} )
              </span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-500 hidden md:table-header-group
              dark:bg-slate-900/60 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">Fecha y hora</th>
                  <th className="px-3 py-2 text-left">Cliente</th>
                  <th className="px-3 py-2 text-left">Cuenta Yape</th>
                  <th className="px-3 py-2 text-right">Monto</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                </tr>
              </thead>

              <tbody className="block md:table-row-group">
                {movsFiltrados.map((m) => (
                  <tr
                    key={m.id}
                    className="border-t border-slate-200 hover:bg-slate-50
                    dark:border-slate-800 dark:hover:bg-slate-900/50
                    block md:table-row mb-4 md:mb-0 rounded-lg md:rounded-none
                    overflow-hidden md:overflow-visible
                    bg-white md:bg-transparent
                    dark:bg-slate-950/60 md:dark:bg-transparent"
                  >
                    <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300 block md:table-cell">
                      {formatFechaHora(m.fechaHora)}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-900 dark:text-slate-100 block md:table-cell">
                      {m.nombreCliente || "-"}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300 block md:table-cell">
                      {m.yapeCuentaNombre || "Cuenta sin nombre"}{" "}
                      {m.numeroYape && (
                        <span className="text-slate-500 dark:text-slate-400">
                          ({m.numeroYape})
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-right text-emerald-600 dark:text-emerald-400 block md:table-cell">
                      S/ {m.monto?.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-xs block md:table-cell">
                      <span
                        className={
                          m.estado === "ANULADO"
                            ? "text-red-600 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }
                      >
                        {m.estado || "RECIBIDO"}
                      </span>
                    </td>
                  </tr>
                ))}

                {!loading && movsFiltrados.length === 0 && (
                  <tr className="block md:table-row">
                    <td
                      colSpan={5}
                      className="px-3 py-4 text-center text-xs text-slate-500 block md:table-cell"
                    >
                      No hay movimientos para este día.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );

}
