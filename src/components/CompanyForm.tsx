import { useState } from "react";
import axios from "axios";
import { createCompany } from "../api/admin";
import type { Company } from "../api/admin";
import { useNotification } from "../context/useNotification";

type Props = {
  onCreated?: (c: Company) => void;
};

/**
 * Tipo estándar de error que devuelve el backend
 */
type ApiErrorResponse = {
  message?: string;
  detail?: string;
};

export default function CompanyForm({ onCreated }: Props) {
  const { showNotification } = useNotification();

  const [nombre, setNombre] = useState("");
  const [ruc, setRuc] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // ✅ Validación RUC
    if (ruc && (ruc.length !== 11 || !/^\d{11}$/.test(ruc))) {
      const msg = "RUC debe contener exactamente 11 dígitos";
      setError(msg);
      showNotification("error", msg);
      setLoading(false);
      return;
    }

    try {
      const payload: Company = {
        nombre,
        ruc,
        direccion,
        emailContacto: email,
      };

      const created = await createCompany(payload);

      // reset form
      setNombre("");
      setRuc("");
      setDireccion("");
      setEmail("");

      onCreated?.(created);

      showNotification(
        "success",
        `Empresa "${created.nombre}" creada exitosamente.`
      );
    } catch (err: unknown) {
      console.error(err);

      let errorMsg = "No se pudo crear la empresa. Revisa la conexión.";

      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        errorMsg =
          err.response?.data?.message ??
          err.response?.data?.detail ??
          errorMsg;
      }

      setError(errorMsg);
      showNotification("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Nombre de la Empresa
        </label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value.toUpperCase())}
          className="w-full rounded-lg px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          placeholder="Ej: MI EMPRESA S.A.C."
          required
        />
      </div>

      {/* RUC + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            RUC (11 dígitos)
          </label>
          <input
            value={ruc}
            onChange={(e) => {
              const valor = e.target.value.replace(/\D/g, "");
              setRuc(valor.slice(0, 11));
            }}
            maxLength={11}
            type="text"
            inputMode="numeric"
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            placeholder="20123456789"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            {ruc.length}/11 dígitos
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Email Contacto
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full rounded-lg px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            placeholder="contacto@empresa.com"
          />
        </div>
      </div>

      {/* Dirección */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Dirección
        </label>
        <input
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          placeholder="Ej: Av. Siempre Viva 123, Lima"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50/10 border border-red-500/30 rounded-lg px-3 py-2">
          <p className="text-xs sm:text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Botón */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2.5 text-sm font-semibold hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-emerald-500/50"
      >
        {loading ? "Creando empresa..." : "Crear empresa"}
      </button>
    </form>
  );
}
