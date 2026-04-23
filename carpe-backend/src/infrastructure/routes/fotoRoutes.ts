import { Router } from 'express';
import { verificarToken, verificarRol } from '../middlewares/authMiddleware.js';
import { pool } from '../persistence/PostgreSQLConfig.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = Router();

// Guardar URL de foto (la subida la hace el frontend directo a Cloudinary)
router.put('/foto', verificarToken, verificarRol(['OWNER', 'PROFE', 'ALUMNO']), async (req: AuthRequest, res: Response) => {
  try {
    const id_usuario = req.usuario?.id_usuario;
    const { foto_url } = req.body;

    if (!foto_url) {
      res.status(400).json({ error: 'URL de foto requerida.' });
      return;
    }

    await pool.query(
      `UPDATE usuarios SET foto_url = $1 WHERE id_usuario = $2`,
      [foto_url, id_usuario]
    );

    res.status(200).json({ mensaje: 'Foto actualizada.', foto_url });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar foto
router.delete('/foto', verificarToken, verificarRol(['OWNER', 'PROFE', 'ALUMNO']), async (req: AuthRequest, res: Response) => {
  try {
    const id_usuario = req.usuario?.id_usuario;

    // Obtener foto actual para eliminarla de Cloudinary
    const result = await pool.query(
      `SELECT foto_url FROM usuarios WHERE id_usuario = $1`,
      [id_usuario]
    );

    const foto_url = result.rows[0]?.foto_url;
    if (foto_url) {
      // Extraer public_id de la URL
      const partes = foto_url.split('/');
      const archivo = partes[partes.length - 1].split('.')[0];
      const public_id = `carpediem/avatars/${archivo}`;
      await cloudinary.uploader.destroy(public_id).catch(() => {});
    }

    await pool.query(
      `UPDATE usuarios SET foto_url = NULL WHERE id_usuario = $1`,
      [id_usuario]
    );

    res.status(200).json({ mensaje: 'Foto eliminada.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;