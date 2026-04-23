// src/domain/Usuario.ts
export enum RolUsuario {
  OWNER = 'OWNER',
  PROFE = 'PROFE',
  ALUMNO = 'ALUMNO',
}

export interface Usuario {
  id_usuario?: number; 
  rol: RolUsuario;
  nombre_completo: string;
  email: string;
  password_hash: string;
  estado_activo: boolean;
  
  // Exclusivo Alumnos
  fecha_vencimiento_cuota?: Date | null;
  id_profe_titular?: number; 

  // Exclusivo Seguridad 2FA (Nuevos)
  debe_cambiar_password?: boolean;
  codigo_verificacion?: string;
  vencimiento_codigo?: Date;
}