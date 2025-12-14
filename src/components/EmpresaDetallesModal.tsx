// src/components/EmpresaDetallesModal.tsx
import { useEffect, useMemo, useState } from "react";
import type { AdminUser, Company, YapeCuentaDTO } from "../api/admin";
import {
  createYapeCuenta,
  createUser,
  getUsers,
  getYapeCuentasByEmpresa,
  updateUser,
  deleteUser,
  updateYapeCuenta,
  deleteYapeCuenta,
} from "../api/admin";
import { X, UserPlus, Smartphone, Edit2, Trash2 } from "lucide-react";
import { useNotification } from "../context/useNotification";

type Props = {
  open: boolean;
  company: Company | null;
  onClose: () => void;
};

export default function EmpresaDetallesModal({ open, company, onClose }: Props) {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [cuentas, setCuentas] = useState<YapeCuentaDTO[]>([]);

  // Create user
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [u_username, setUUsername] = useState("");
  const [u_nombre, setUNombre] = useState("");
  const [u_rol, setURol] = useState("ADMIN");
  const [u_password, setUPassword] = useState("");

  // Create Yape account
  const [showCreateCuenta, setShowCreateCuenta] = useState(false);
  const [c_nombre, setCNombre] = useState("");
  const [c_numero, setCNumero] = useState("");
  const [c_telefono, setCTelefono] = useState("");

  // Edit user
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [edit_u_nombre, setEditUNombre] = useState("");
  const [edit_u_rol, setEditURol] = useState("");
  const [edit_u_password, setEditUPassword] = useState("");

  // Edit Yape account
  const [showEditCuenta, setShowEditCuenta] = useState(false);
  const [editCuenta, setEditCuenta] = useState<YapeCuentaDTO | null>(null);
  const [edit_c_nombre, setEditCNombre] = useState("");
  const [edit_c_numero, setEditCNumero] = useState("");
  const [edit_c_telefono, setEditCTelefono] = useState("");

  const empresaId = company?.id;

  const usersDeEmpresa = useMemo(() => {
    if (!empresaId) return [];
    return users.filter((u) => u.empresaId === empresaId);
  }, [users, empresaId]);

  const loadData = async () => {
    if (!empresaId) return;
    setLoading(true);
    try {
      const u = await getUsers(empresaId);
      setUsers(u || []);
      const yc = await getYapeCuentasByEmpresa(empresaId);
      setCuentas(yc || []);
    } catch (e) {
      console.error(e);
      showNotification('error', 'Error cargando detalles. Revisa consola/backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !empresaId) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, empresaId]);

  if (!open || !company) return null;

  const submitUser = async () => {
    if (!empresaId) return;
    if (!u_username.trim()) return showNotification('error', 'Username requerido');
    if (!u_nombre.trim()) return showNotification('error', 'Nombre requerido');
    if (!u_password.trim()) return showNotification('error', 'Password requerido');

    setLoading(true);
    try {
      await createUser({
        empresaId,
        username: u_username.trim(),
        nombreCompleto: u_nombre.trim(),
        rol: u_rol,
        password: u_password.trim(),
      } as AdminUser);
      setShowCreateUser(false);
      setUUsername("");
      setUNombre("");
      setURol("ADMIN");
      setUPassword("");
      await loadData();
      showNotification('success', 'Usuario creado exitosamente.');
    } catch (e) {
      console.error(e);
      showNotification('error', 'Error creando usuario.');
    } finally {
      setLoading(false);
    }
  };

  const submitCuenta = async () => {
    if (!empresaId) return;
    if (!c_nombre.trim()) return showNotification('error', 'Nombre requerido');
    if (c_numero.length !== 9) return showNotification('error', 'Debe tener 9 dígitos');

    setLoading(true);
    try {
      await createYapeCuenta(empresaId, {
        nombre: c_nombre.trim(),
        numeroYape: c_numero,
        telefono: c_telefono.trim() || undefined,
        activo: true,
      });
      setShowCreateCuenta(false);
      setCNombre("");
      setCNumero("");
      setCTelefono("");
      await loadData();
      showNotification('success', 'Cuenta Yape creada exitosamente.');
    } catch (e) {
      console.error(e);
      showNotification('error', 'Error creando cuenta Yape.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (u: AdminUser) => {
    setEditUser(u);
    setEditUNombre(u.nombreCompleto);
    setEditURol(u.rol);
    setEditUPassword("");
    setShowEditUser(true);
  };

  const submitEditUser = async () => {
    if (!editUser?.id) return;
    if (!edit_u_nombre.trim()) return showNotification('error', 'Nombre requerido');

    setLoading(true);
    try {
      const payload: Partial<AdminUser> = {
        nombreCompleto: edit_u_nombre.trim(),
        rol: edit_u_rol,
      };
      if (edit_u_password.trim()) {
        payload.password = edit_u_password.trim();
      }
      await updateUser(editUser.id, payload);
      setShowEditUser(false);
      setEditUser(null);
      await loadData();
      showNotification('success', 'Usuario actualizado exitosamente.');
    } catch (e) {
      console.error("Error completo:", e);
      const errorMsg = (e as Record<string, unknown>)?.message || "Error desconocido";
      showNotification('error', `Error actualizando usuario: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (u: AdminUser) => {
    if (!u.id) return;
    if (!confirm(`¿Eliminar usuario ${u.username}?`)) return;

    setLoading(true);
    try {
      await deleteUser(u.id);
      await loadData();
      showNotification('success', 'Usuario eliminado exitosamente.');
    } catch (e) {
      console.error(e);
      showNotification('error', 'Error eliminando usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCuenta = (c: YapeCuentaDTO) => {
    setEditCuenta(c);
    setEditCNombre(c.nombre);
    setEditCNumero(c.numeroYape);
    setEditCTelefono(c.telefono || "");
    setShowEditCuenta(true);
  };

  const submitEditCuenta = async () => {
    if (!editCuenta?.id) return;
    if (!edit_c_nombre.trim()) return showNotification('error', 'Nombre requerido');
    if (edit_c_numero.length !== 9) return showNotification('error', 'Debe tener 9 dígitos');

    setLoading(true);
    try {
      await updateYapeCuenta(editCuenta.id, {
        nombre: edit_c_nombre.trim(),
        numeroYape: edit_c_numero,
        telefono: edit_c_telefono.trim() || undefined,
      });
      setShowEditCuenta(false);
      setEditCuenta(null);
      await loadData();
      showNotification('success', 'Cuenta Yape actualizada exitosamente.');
    } catch (e) {
      console.error(e);
      showNotification('error', 'Error actualizando cuenta Yape.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCuenta = async (c: YapeCuentaDTO) => {
    if (!c.id) return;
    if (!confirm(`¿Eliminar cuenta ${c.nombre}?`)) return;

    setLoading(true);
    try {
      await deleteYapeCuenta(c.id);
      await loadData();
      showNotification('success', 'Cuenta Yape eliminada exitosamente.');
    } catch (e) {
      console.error(e);
      showNotification('error', 'Error eliminando cuenta Yape.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">Detalles · {company.nombre}</h3>
            <p className="text-[11px] text-slate-400">Usuarios (izq) · Cuentas Yape (der)</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="px-3 py-1.5 rounded-lg text-xs border border-emerald-600 text-emerald-300 hover:bg-emerald-600/10" disabled={loading}>
              {loading ? "Cargando..." : "Actualizar"}
            </button>
            <button onClick={onClose} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border border-slate-700 hover:bg-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Usuarios */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40">
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
              <div className="text-sm font-semibold">Usuarios</div>
              <button onClick={() => setShowCreateUser(true)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                <UserPlus className="w-4 h-4" />
                Agregar
              </button>
            </div>
            <div className="p-3 space-y-2">
              {usersDeEmpresa.length === 0 ? (
                <div className="text-xs text-slate-400">No hay usuarios.</div>
              ) : (
                usersDeEmpresa.map((u) => (
                  <div key={u.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
                    <div>
                      <div className="text-xs text-slate-100 font-medium">{u.nombreCompleto}</div>
                      <div className="text-[11px] text-slate-400">@{u.username} · {u.rol}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEditUser(u)} className="p-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400" title="Editar">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteUser(u)} className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400" title="Eliminar">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cuentas Yape */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40">
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
              <div className="text-sm font-semibold">Cuentas Yape</div>
              <button onClick={() => setShowCreateCuenta(true)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border border-emerald-600 text-emerald-300 hover:bg-emerald-600/10">
                <Smartphone className="w-4 h-4" />
                Agregar
              </button>
            </div>
            <div className="p-3 space-y-2">
              {cuentas.length === 0 ? (
                <div className="text-xs text-slate-400">No hay cuentas.</div>
              ) : (
                cuentas.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
                    <div>
                      <div className="text-xs text-slate-100 font-medium">{c.nombre}</div>
                      <div className="text-[11px] text-slate-400">{c.numeroYape} {c.telefono ? `· ${c.telefono}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEditCuenta(c)} className="p-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400" title="Editar">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteCuenta(c)} className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400" title="Eliminar">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Crear Usuario */}
        {showCreateUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Nuevo usuario</h4>
                <button className="text-xs text-slate-400" onClick={() => setShowCreateUser(false)}>✕</button>
              </div>
              <div className="space-y-3">
                <input value={u_username} onChange={(e) => setUUsername(e.target.value)} placeholder="Username" className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100" />
                <input value={u_nombre} onChange={(e) => setUNombre(e.target.value)} placeholder="Nombre" className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100" />
                <select value={u_rol} onChange={(e) => setURol(e.target.value)} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100">
                  <option>ADMIN</option>
                  <option>USER</option>
                  <option>SUPERADMIN</option>
                </select>
                <input type="password" value={u_password} onChange={(e) => setUPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100" />
                <button onClick={submitUser} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 px-3 py-2 text-sm font-semibold rounded-lg">
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Crear Cuenta */}
        {showCreateCuenta && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Nueva cuenta Yape</h4>
                <button className="text-xs text-slate-400" onClick={() => setShowCreateCuenta(false)}>✕</button>
              </div>
              <div className="space-y-3">
                <input value={c_nombre} onChange={(e) => setCNombre(e.target.value)} placeholder="Nombre" className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100" />
                <div>
                  <input value={c_numero} onChange={(e) => setCNumero(e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="Número (9 dígitos)" maxLength={9} inputMode="numeric" className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100" />
                  <p className="text-[10px] text-slate-500 mt-1">{c_numero.length}/9</p>
                </div>
                <input value={c_telefono} onChange={(e) => setCTelefono(e.target.value)} placeholder="Teléfono (opcional)" className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100" />
                <button onClick={submitCuenta} disabled={loading} className="w-full border border-emerald-600 text-emerald-300 hover:bg-emerald-600/10 disabled:opacity-60 px-3 py-2 text-sm font-semibold rounded-lg">
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Usuario */}
        {showEditUser && editUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Editar usuario</h4>
                <button className="text-xs text-slate-400" onClick={() => setShowEditUser(false)}>✕</button>
              </div>
              <div className="space-y-3">
                <input disabled value={editUser.username} className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-slate-500" />
                <input value={edit_u_nombre} onChange={(e) => setEditUNombre(e.target.value)} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100" />
                <select value={edit_u_rol} onChange={(e) => setEditURol(e.target.value)} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100">
                  <option>ADMIN</option>
                  <option>USER</option>
                  <option>SUPERADMIN</option>
                </select>
                <div>
                  <input type="password" value={edit_u_password} onChange={(e) => setEditUPassword(e.target.value)} placeholder="Nueva contraseña (opcional)" className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100" />
                  <p className="text-[10px] text-slate-500 mt-1">Dejar en blanco para no cambiar</p>
                </div>
                <button onClick={submitEditUser} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-3 py-2 text-sm font-semibold rounded-lg text-white">
                  {loading ? "Guardando..." : "Actualizar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Cuenta */}
        {showEditCuenta && editCuenta && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Editar cuenta Yape</h4>
                <button className="text-xs text-slate-400" onClick={() => setShowEditCuenta(false)}>✕</button>
              </div>
              <div className="space-y-3">
                <input value={edit_c_nombre} onChange={(e) => setEditCNombre(e.target.value)} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100" />
                <div>
                  <input value={edit_c_numero} onChange={(e) => setEditCNumero(e.target.value.replace(/\D/g, '').slice(0, 9))} maxLength={9} inputMode="numeric" className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100" />
                  <p className="text-[10px] text-slate-500 mt-1">{edit_c_numero.length}/9</p>
                </div>
                <input value={edit_c_telefono} onChange={(e) => setEditCTelefono(e.target.value)} className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100" />
                <button onClick={submitEditCuenta} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-3 py-2 text-sm font-semibold rounded-lg text-white">
                  {loading ? "Guardando..." : "Actualizar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
