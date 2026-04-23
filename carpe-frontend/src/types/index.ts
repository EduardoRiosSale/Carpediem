export interface Usuario {
  id_usuario: number;
  rol: 'OWNER' | 'PROFE' | 'ALUMNO';
  nombre_completo: string;
  email: string;
  estado_activo: boolean;
  fecha_vencimiento_cuota?: string;
  id_profe_titular?: number;
  valor_mensual?: number;
  foto_url?: string | null;
}

export interface Ejercicio {
  id_ejercicio: number;
  id_rutina: number;
  nombre_ejercicio: string;
  series_sugeridas: number;
  repes_sugeridas: string;
  peso_sugerido_kg?: number;
  url_video?: string;
  notas_profe?: string;
}

export interface Rutina {
  id_rutina: number;
  id_profe_creador: number;
  id_alumno: number;
  titulo: string;
  fecha_creacion: string;
  observaciones_generales?: string;
  ejercicios: Ejercicio[];
}

export interface RegistroEjercicio {
  id_ejercicio_rutina: number;
  series_reales: number;
  repes_reales: string;
  peso_real_kg: number;
  sensaciones?: string;
}

export interface Calificacion {
  puntaje: number;
  comentario?: string;
  fecha: string;
  nombre_alumno: string;
  id_alumno: number;
}