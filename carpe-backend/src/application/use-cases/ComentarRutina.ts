// src/application/use-cases/ComentarRutina.ts
import { pool } from '../../infrastructure/persistence/PostgreSQLConfig.js';

export class ComentarRutinaUseCase {
  async ejecutar(id_rutina: number, comentario: string, id_profe: number): Promise<void> {
    // Verificamos que la rutina pertenezca al profe que está comentando
    const check = await pool.query(
      'SELECT id_rutina FROM rutinas WHERE id_rutina = $1 AND id_profe_creador = $2',
      [id_rutina, id_profe]
    );
    if (check.rows.length === 0) {
      throw new Error('No tenés permiso para comentar esta rutina.');
    }
    await pool.query(
      'UPDATE rutinas SET observaciones_generales = $1 WHERE id_rutina = $2',
      [comentario, id_rutina]
    );
  }
}