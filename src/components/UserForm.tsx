import { useEffect, useState } from "react";
import type { AdminUser, Company } from "../api/admin";
import { createUser, updateUser } from "../api/admin";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  companies: Company[];
  defaultCompanyId?: number;
  userToEdit?: AdminUser | null;
  onClose: () => void;
  onSaved: () => void; // refrescar lista
};

export default function UserFrom({
  open,
  mode,
  companies,
  defaultCompanyId,
  userToEdit,
  onClose,
  onSaved,
}: Props) {
  const [saving, setSaving] = useState(false);

  const [empresaId, setEmpresaId] = useState<number | "">("");
  const [username, setUsername] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [rol, setRol] = useState("ADMIN");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && userToEdit) {
      setEmpresaId(userToEdit.empresaId ?? "");
      setUsername(userToEdit.username ?? "");
      setNombreCompleto(userToEdit.nombreCompleto ?? "");
      setRol(userToEdit.rol ?? "ADMIN");
      setPassword(""); // 👈 en editar, opcional
      return;
    }

    // create
    setEmpresaId(defaultCompanyId ?? "");
    setUsername("");
    setNombreCompleto("");
    setRol("ADMIN");
    setPassword("");
  }, [open, mode, userToEdit, defaultCompanyId]);

  if (!open) return null;

  const submit = async () => {
    if (!empresaId) return alert("Selecciona empresa");
    if (!username.trim()) return alert("Username requerido");
    if (!nombreCompleto.trim()) return alert("Nombre requerido");
    if (mode === "create" && !password.trim()) return alert("Password requerido");

    setSaving(true);
    try {
      if (mode === "create") {
        await createUser({
          empresaId: Number(empresaId),
          username: username.trim(),
          nombreCompleto: nombreCompleto.trim(),
          rol,
          password: password.trim(),
        } as AdminUser);
      } else {
        if (!userToEdit?.id) return;

        const payload: Partial<AdminUser> = {
          empresaId: Number(empresaId),
          username: username.trim(),
          nombreCompleto: nombreCompleto.trim(),
          rol,
        };

        // password solo si lo escriben
        if (password.trim()) payload.password = password.trim();

        await updateUser(userToEdit.id, payload);
      }

      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Error guardando usuario. Revisa consola / backend.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">
            {mode === "create" ? "Nuevo usuario" : "Editar usuario"}
          </h3>
          <button className="text-xs text-slate-400 hover:text-slate-200" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400">Empresa</label>
            <select
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value ? Number(e.target.value) : "")}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            >
              <option value="">-- Seleccionar --</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Nombre completo</label>
            <input
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Rol</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
              <option value="SUPERADMIN">SUPERADMIN</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400">
              Password {mode === "edit" && <span className="text-slate-500">(opcional)</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <button
            disabled={saving}
            onClick={submit}
            className="w-full mt-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 px-3 py-2 text-sm font-semibold"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
