// src/application/use-cases/ObtenerCalificacionesProfe.ts
import { pool } from '../../infrastructure/persistence/PostgreSQLConfig.js';

export class ObtenerCalificacionesProfeUseCase {
  async ejecutar(id_profe: number) {
    const result = await pool.query(
  `SELECT 
     c.puntaje,
     c.comentario,
     c.fecha,
     c.id_alumno,
     u.nombre_completo AS nombre_alumno
   FROM calificaciones_profe c
   JOIN usuarios u ON u.id_usuario = c.id_alumno
   WHERE c.id_profe = $1
   ORDER BY c.fecha DESC`,
  [id_profe]
);
    const promedio = result.rows.length > 0
      ? result.rows.reduce((acc, r) => acc + r.puntaje, 0) / result.rows.length
      : null;

    return {
      promedio: promedio ? Number(promedio.toFixed(2)) : null,
      total_calificaciones: result.rows.length,
      detalle: result.rows
    };
  }
}