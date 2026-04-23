// src/application/use-cases/ActualizarVideoEjercicio.ts
import { Pool } from 'pg';

export class ActualizarVideoEjercicio {
  constructor(private db: Pool) {}

  async execute(ejercicioId: number, videoUrl: string, rol: string): Promise<void> {
    if (rol !== 'PROFE' && rol !== 'OWNER') {
      throw new Error('No autorizado');
    }

    // Validar que sea URL de YouTube o Vimeo
    const esUrlValida = this.validarUrl(videoUrl);
    if (!esUrlValida) {
      throw new Error('Solo se permiten URLs de YouTube o Vimeo');
    }

   // PUT - actualizar video
await this.db.query(
  'UPDATE ejercicios_rutina SET url_video = $1 WHERE id_ejercicio = $2',
  [videoUrl, ejercicioId]
);
  }

  private validarUrl(url: string): boolean {
  return (
    url.startsWith('https://www.youtube.com/') ||
    url.startsWith('https://youtu.be/') ||
    url.startsWith('https://youtube.com/') ||
    url.startsWith('https://vimeo.com/') ||
    url.startsWith('https://www.tiktok.com/') ||
    url.startsWith('https://vm.tiktok.com/')
  );
}
}