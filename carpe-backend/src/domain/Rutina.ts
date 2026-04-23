export interface EjercicioSugerido {
  id_ejercicio?: number;
  nombre_ejercicio: string;
  series_sugeridas: number;
  repes_sugeridas: string; // Ej: "10-12"
  peso_sugerido_kg?: number;
  url_video?: string;
  notas_profe?: string;
  video_url?: string;
}

export interface Rutina {
  id_rutina?: number;
  id_profe_creador: number;
  id_alumno: number;
  titulo: string;
  fecha_creacion: Date;
  observaciones_generales?: string;
  debe_cambiar_password?: boolean

  // Una rutina contiene una lista (array) de ejercicios sugeridos
  ejercicios: EjercicioSugerido[];
  
}