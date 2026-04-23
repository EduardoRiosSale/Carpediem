// src/infrastructure/controllers/VideoController.ts
import { Request, Response } from 'express';
import { Pool } from 'pg';
import { ActualizarVideoEjercicio } from '../../application/use-cases/ActualizarVideoEjercicio.js';
import { ObtenerVideoEjercicio } from '../../application/use-cases/ObtenerVideoEjercicio.js';

export class VideoController {
  private actualizarVideo: ActualizarVideoEjercicio;
  private obtenerVideo: ObtenerVideoEjercicio;

  constructor(db: Pool) {
    this.actualizarVideo = new ActualizarVideoEjercicio(db);
    this.obtenerVideo = new ObtenerVideoEjercicio(db);
  }

  // PUT /videos/ejercicio/:id  — solo PROFE y OWNER
  async setVideo(req: Request, res: Response): Promise<void> {
    try {
      const ejercicioId = parseInt(req.params.id);
      const { video_url } = req.body;
      const rol = (req as any).usuario?.rol; // viene del authMiddleware

      if (!video_url) {
        res.status(400).json({ error: 'video_url es requerido' });
        return;
      }

      await this.actualizarVideo.execute(ejercicioId, video_url, rol);
      res.status(200).json({ mensaje: 'Video actualizado correctamente' });

    } catch (error: any) {
      const codigo = error.message === 'No autorizado' ? 403 : 400;
      res.status(codigo).json({ error: error.message });
    }
  }

  // GET /videos/ejercicio/:id  — cualquier usuario autenticado
  async getVideo(req: Request, res: Response): Promise<void> {
    try {
      const ejercicioId = parseInt(req.params.id);
      const videoUrl = await this.obtenerVideo.execute(ejercicioId);

      if (!videoUrl) {
        res.status(404).json({ error: 'Este ejercicio no tiene video asignado' });
        return;
      }

      res.status(200).json({ video_url: videoUrl });

    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}