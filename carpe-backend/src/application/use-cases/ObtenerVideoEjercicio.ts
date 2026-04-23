// src/application/use-cases/ObtenerVideoEjercicio.ts
import { Pool } from 'pg';

export class ObtenerVideoEjercicio {
  constructor(private db: Pool) {}

  async execute(ejercicioId: number): Promise<string | null> {
    const result = await this.db.query(
      'SELECT url_video FROM ejercicios_rutina WHERE id_ejercicio = $1',
      [ejercicioId]
    );

    if (result.rows.length === 0) {
      throw new Error('Ejercicio no encontrado');
    }

    return result.rows[0].url_video ?? null;
  }
}