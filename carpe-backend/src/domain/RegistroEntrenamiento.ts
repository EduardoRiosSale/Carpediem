export interface RegistroEjercicioReal {
  id_registro?: number;
  id_ejercicio_rutina: number; // A qué ejercicio sugerido corresponde
  series_reales: number;
  repes_reales: string; // Ej: "10, 10, 8, 8" o "10"
  peso_real_kg: number;
  sensaciones?: string; // Ej: "Muy pesado", "Dolor de hombro"
}



export interface SesionEntrenamiento {
  id_sesion?: number;
  id_alumno: number;
  id_rutina: number; // Qué rutina estaba haciendo este día
  fecha_inicio: Date;
  fecha_fin?: Date;
  // Los registros de todos los ejercicios que hizo en esta sesión
  ejercicios_realizados: RegistroEjercicioReal[];

}