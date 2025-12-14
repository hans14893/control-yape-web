// src/types/AuthResponse.ts
export interface AuthResponse {
  token: string;

  // algunos backends mandan el rol directo
  rol?: string | null;
  role?: string | null;

  // otros lo mandan dentro del usuario
  usuario?: {
    rol?: string | null;
  } | null;

  user?: {
    rol?: string | null;
  } | null;

  // si tu backend manda más campos, los agregas aquí:
  // usuarioId?: number;
  // username?: string;
}
