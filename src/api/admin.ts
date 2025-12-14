// src/api/admin.ts
import api from "./apiClient";

export type Company = {
  id?: number;
  nombre: string;
  ruc?: string;
  direccion?: string;
  emailContacto?: string;
};

export type AdminUser = {
  id?: number;
  username: string;
  nombreCompleto: string;
  rol: string;
  empresaId?: number;
  empresaNombre?: string;
  password?: string; // solo se usa al crear
};

// ================== EMPRESAS ==================

export const getCompanies = async (): Promise<Company[]> => {
  const resp = await api.get<Company[]>("/empresas");
  return resp.data;
};

export const createCompany = async (payload: Company): Promise<Company> => {
  const resp = await api.post<Company>("/empresas", payload);
  return resp.data;
};

export const updateCompany = async (id: number, payload: Partial<Company>): Promise<Company> => {
  const resp = await api.put<Company>(`/empresas/${id}`, payload);
  return resp.data;
};

export const deleteCompany = async (id: number): Promise<void> => {
  await api.delete(`/empresas/${id}`);
};

// ================== USUARIOS ==================

export const getUsers = async (empresaId?: number): Promise<AdminUser[]> => {
  // Si viene empresaId, obtén solo usuarios de esa empresa
  if (empresaId) {
    const resp = await api.get<AdminUser[]>(`/usuarios/empresa/${empresaId}`);
    return resp.data;
  }
  
  // Si no, obtén todos los usuarios
  const resp = await api.get<AdminUser[]>("/usuarios");
  return resp.data;
};

export const getUserById = async (id: number): Promise<AdminUser> => {
  const resp = await api.get<AdminUser>(`/usuarios/${id}`);
  return resp.data;
};

export const createUser = async (payload: AdminUser): Promise<AdminUser> => {
  const empresaId = payload.empresaId;
  
  // Si hay empresaId, lo enviamos en la URL y lo removemos del payload
  if (empresaId) {
    // Crear copia sin empresaId para el payload
    const userPayload = {
      username: payload.username,
      nombreCompleto: payload.nombreCompleto,
      rol: payload.rol,
      password: payload.password,
    };
    const resp = await api.post<AdminUser>(`/usuarios/empresa/${empresaId}`, userPayload);
    return resp.data;
  }
  
  // Si no hay empresaId, envía tal como viene
  const resp = await api.post<AdminUser>("/usuarios", payload);
  return resp.data;
};

export const updateUser = async (
  id: number,
  payload: Partial<AdminUser>
): Promise<AdminUser> => {
  const resp = await api.put<AdminUser>(`/usuarios/${id}`, payload);
  return resp.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/usuarios/${id}`);
};


// ================== YAPE CUENTAS ==================

export type YapeCuentaDTO = {
  id?: number;
  nombre: string;
  numeroYape: string;
  telefono?: string;
  empresaId?: number;      // opcional en front
  empresaNombre?: string;
  activo?: boolean;
};

export type CreateYapeCuentaPayload = {
  nombre: string;
  numeroYape: string;
  telefono?: string;
  activo?: boolean;
};

// LISTAR por empresa
export const getYapeCuentasByEmpresa = async (empresaId: number) => {
  const resp = await api.get(`/yape-cuentas/empresa/${empresaId}`);
  return resp.data;
};

export const createYapeCuenta = async (
  empresaId: number,
  payload: CreateYapeCuentaPayload
): Promise<YapeCuentaDTO> => {
  const resp = await api.post<YapeCuentaDTO>(
    `/yape-cuentas/empresa/${empresaId}`,
    payload
  );
  return resp.data;
};


// EDITAR cuenta
export const updateYapeCuenta = async (
  id: number,
  payload: Partial<YapeCuentaDTO>
): Promise<YapeCuentaDTO> => {
  const resp = await api.put<YapeCuentaDTO>(`/yape-cuentas/${id}`, payload);
  return resp.data;
};

// ELIMINAR/DESACTIVAR cuenta
export const deleteYapeCuenta = async (id: number): Promise<void> => {
  await api.delete(`/yape-cuentas/${id}`);
};



export default {
  getCompanies,
  createCompany,

  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,

  getYapeCuentasByEmpresa,
  createYapeCuenta,
  updateYapeCuenta,
  deleteYapeCuenta,
};


