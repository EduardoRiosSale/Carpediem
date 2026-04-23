// src/application/use-cases/CalificarProfe.ts
import { pool } from '../../infrastructure/persistence/PostgreSQLConfig.js';

export class CalificarProfeUseCase {
  async ejecutar(id_alumno: number, id_profe: number, puntaje: number, comentario?: string): Promise<void> {
    if (puntaje < 1 || puntaje > 5) {
      throw new Error('El puntaje debe ser entre 1 y 5.');
    }
    // Si ya calificó, pisamos la calificación anterior
    await pool.query(
      `INSERT INTO calificaciones_profe (id_alumno, id_profe, puntaje, comentario)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id_alumno, id_profe)
       DO UPDATE SET puntaje = $3, comentario = $4, fecha = CURRENT_TIMESTAMP`,
      [id_alumno, id_profe, puntaje, comentario || null]
    );
  }
}