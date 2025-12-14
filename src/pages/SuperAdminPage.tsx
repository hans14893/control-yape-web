// src/pages/SuperAdminPage.tsx
import { useEffect, useState } from "react";
import { getCompanies, updateCompany, deleteCompany } from "../api/admin";
import type { Company } from "../api/admin";
import { Edit2, Info, Trash2, Plus, X, LogOut } from "lucide-react";
import { useNotification } from "../context/useNotification";

import EmpresaDetallesModal from "../components/EmpresaDetallesModal";
import CompanyForm from "../components/CompanyForm";

export default function SuperAdminPage() {
  const { showNotification } = useNotification();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDetalles, setOpenDetalles] = useState(false);
  const [companyDetalles, setCompanyDetalles] = useState<Company | null>(null);
  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [companyEditar, setCompanyEditar] = useState<Company | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);


  const loadCompanies = async () => {
    setLoading(true);
    try {
      const c = await getCompanies();
      setCompanies(c || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar empresas. Revisa la API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const logout = () => {
    localStorage.removeItem("auth");
    window.location.href = "/";
  };

  // 🔧 Handlers
  const handleEditCompany = (c: Company) => {
    setCompanyEditar(c);
    setOpenEditar(true);
  };

  const handleDeleteCompany = (c: Company) => {
    if (!c.id) return;
    setCompanyToDelete(c);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!companyToDelete?.id) return;
    
    setDeleting(true);
    try {
      console.log(`🗑️ Eliminando empresa ID ${companyToDelete.id}: ${companyToDelete.nombre}`);
      await deleteCompany(companyToDelete.id);
      console.log(`✅ Empresa eliminada exitosamente`);
      showNotification('success', `Empresa "${companyToDelete.nombre}" eliminada.`);
      setShowDeleteConfirm(false);
      setCompanyToDelete(null);
      await loadCompanies();
    } catch (e) {
      console.error("❌ Error eliminando empresa:", e);
      const errorMsg = (e as Record<string, unknown>)?.message || "Error desconocido";
      showNotification('error', `Error eliminando empresa: ${errorMsg}`);
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCompanyToDelete(null);
  };

  const handleCompanyCreated = (newCompany: Company) => {
    setCompanies([...companies, newCompany]);
    setOpenCrear(false);
    showNotification('success', `Empresa "${newCompany.nombre}" creada exitosamente.`);
    loadCompanies();
  };

  const handleCompanyUpdated = (updatedCompany: Company) => {
    setCompanies(companies.map((c) => (c.id === updatedCompany.id ? updatedCompany : c)));
    setOpenEditar(false);
    setCompanyEditar(null);
    showNotification('success', `Empresa "${updatedCompany.nombre}" actualizada.`);
    loadCompanies();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60 gap-4 sm:gap-0">
        <h1 className="text-lg sm:text-xl font-semibold">SuperAdmin · Control Yape</h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs sm:text-sm font-medium w-full sm:w-auto justify-center sm:justify-start"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 space-y-6 flex-1 overflow-y-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm sm:text-base font-semibold">Empresas</h2>
            <p className="text-xs text-slate-400">
              Listado de empresas + acciones (editar/eliminar/usuarios).
            </p>
          </div>
          
          <button
            onClick={() => setOpenCrear(true)}
            className="flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs sm:text-sm font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/50 w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus className="w-4 h-4" />
            Crear Empresa
          </button>
        </div>

        <section className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
          {loading ? (
            <div className="p-4 text-xs sm:text-sm">Cargando...</div>
          ) : companies.length === 0 ? (
            <div className="p-4 text-xs sm:text-sm text-slate-400">
              No hay empresas registradas.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 hidden md:table-header-group">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-300">
                    Empresa
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-300 hidden lg:table-cell">
                    RUC
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-300 hidden lg:table-cell">
                    Contacto
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-slate-300">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {companies.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-slate-800 hover:bg-slate-900/60 block md:table-row mb-4 md:mb-0 rounded-lg md:rounded-none overflow-hidden md:overflow-visible bg-slate-950/60 md:bg-transparent"
                  >
                    <td className="px-3 py-2 align-top block md:table-cell">
                      <div className="font-medium text-sm">{c.nombre}</div>
                      {c.direccion && (
                        <div className="text-xs text-slate-400">{c.direccion}</div>
                      )}
                      <div className="text-xs text-slate-200 md:hidden mt-1">RUC: {c.ruc || "-"}</div>
                      <div className="text-xs text-slate-200 md:hidden">
                        {c.emailContacto || "-"}
                      </div>
                    </td>

                    <td className="px-3 py-2 align-top hidden lg:table-cell">
                      <div className="text-xs text-slate-200">{c.ruc || "-"}</div>
                    </td>

                    <td className="px-3 py-2 align-top hidden lg:table-cell">
                      <div className="text-xs text-slate-200">
                        {c.emailContacto || "-"}
                      </div>
                    </td>

                    <td className="px-3 py-2 align-top block md:table-cell">
                      <div className="flex justify-end gap-2 flex-wrap">
                        {/* detalles*/}
                        <button
                          className="inline-flex items-center justify-center rounded-md border border-emerald-600 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-600/10 transition"
                          title="Detalles"
                          onClick={() => {
                            setCompanyDetalles(c);
                            setOpenDetalles(true);
                          }}
                        >
                          <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>

                        {/* Editar empresa */}
                        <button
                          className="inline-flex items-center justify-center rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 transition"
                          title="Editar empresa"
                          onClick={() => handleEditCompany(c)}
                        >
                          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>

                        {/* Eliminar empresa */}
                        <button
                          className="inline-flex items-center justify-center rounded-md border border-red-700/60 px-2 py-1 text-xs text-red-300 hover:bg-red-600/10 hover:text-red-200 transition"
                          title="Eliminar empresa"
                          onClick={() => handleDeleteCompany(c)}
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </section>

        {error && <p className="text-xs sm:text-sm text-red-400">{error}</p>}
      </main>

      {/* ✅ Modal (usa tu UserForm real) */}
      <EmpresaDetallesModal
        open={openDetalles}
        company={companyDetalles}
        onClose={() => {
          setOpenDetalles(false);
          setCompanyDetalles(null);
        }}
      />

      {/* ✅ Modal Crear Empresa */}
      {openCrear && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">Crear Nueva Empresa</h2>
              <button
                onClick={() => setOpenCrear(false)}
                className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <CompanyForm onCreated={handleCompanyCreated} />
          </div>
        </div>
      )}

      {/* ✅ Modal Editar Empresa */}
      {openEditar && companyEditar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">Editar Empresa</h2>
              <button
                onClick={() => {
                  setOpenEditar(false);
                  setCompanyEditar(null);
                }}
                className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!companyEditar) return;
              
              // Validar RUC
              if (companyEditar.ruc && (companyEditar.ruc.length !== 11 || !/^\d{11}$/.test(companyEditar.ruc))) {
                alert("RUC debe contener exactamente 11 dígitos");
                return;
              }
              
              setLoading(true);
              updateCompany(companyEditar.id || 0, companyEditar)
                .then(() => {
                  handleCompanyUpdated(companyEditar);
                })
                .catch((err) => {
                  console.error(err);
                  alert("Error actualizando empresa. Revisa la conexión.");
                })
                .finally(() => setLoading(false));
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre de la Empresa</label>
                <input
                  value={companyEditar.nombre}
                  onChange={(e) => setCompanyEditar({ ...companyEditar, nombre: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">RUC (11 dígitos)</label>
                  <input
                    value={companyEditar.ruc || ''}
                    onChange={(e) => {
                      // Solo permite números
                      const valor = e.target.value.replace(/\D/g, '');
                      // Limita a 11 dígitos
                      setCompanyEditar({ ...companyEditar, ruc: valor.slice(0, 11) });
                    }}
                    maxLength={11}
                    type="text"
                    inputMode="numeric"
                    className="w-full rounded-lg px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="20123456789"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {(companyEditar.ruc || '').length}/11 dígitos
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Contacto</label>
                  <input
                    value={companyEditar.emailContacto || ''}
                    onChange={(e) => setCompanyEditar({ ...companyEditar, emailContacto: e.target.value })}
                    type="email"
                    className="w-full rounded-lg px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="contacto@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Dirección</label>
                <input
                  value={companyEditar.direccion || ''}
                  onChange={(e) => setCompanyEditar({ ...companyEditar, direccion: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2.5 text-sm font-semibold hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-emerald-500/50"
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🗑️ Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && companyToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-2">Eliminar Empresa</h3>
            <p className="text-sm text-slate-400 mb-6">
              ¿Estás seguro de que deseas eliminar la empresa <span className="font-semibold text-slate-200">"{companyToDelete.nombre}"</span>? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && companyToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-2">Eliminar Empresa</h3>
            <p className="text-sm text-slate-400 mb-6">
              ¿Estás seguro de que deseas eliminar la empresa <span className="font-semibold text-slate-200">"{companyToDelete.nombre}"</span>? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
