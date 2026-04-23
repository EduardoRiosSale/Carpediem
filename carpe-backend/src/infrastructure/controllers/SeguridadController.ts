// src/infrastructure/controllers/SeguridadController.ts
import { Request, Response } from 'express';
import { VerificarCodigoUseCase } from '../../application/use-cases/VerificarCodigo.js';
import { CambiarPasswordUseCase } from '../../application/use-cases/CambiarPassword.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export class SeguridadController {
  constructor(
    private verificarCodigoUseCase: VerificarCodigoUseCase,
    private cambiarPasswordUseCase: CambiarPasswordUseCase
  ) {}

  // Recibe el código, si está OK, devuelve el Token Temporal (dura 15 min)
  verificar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_usuario, codigo } = req.body;
      const resultado = await this.verificarCodigoUseCase.ejecutar(id_usuario, codigo);
      
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // Recibe la nueva clave. ¡Pero antes debe pasar por el Patovica!
  cambiar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // El Patovica validó el token temporal y nos dejó los datos acá:
      const id_usuario = req.usuario?.id_usuario;
      const permiso = req.usuario?.permiso;
      const { nueva_password } = req.body;

      // Doble check de seguridad: nos aseguramos que el token sea el de cambio de clave
      if (permiso !== 'CAMBIO_CLAVE') {
        res.status(403).json({ error: 'Token no válido para cambiar contraseña.' });
        return;
      }

      if (!id_usuario) {
        res.status(400).json({ error: 'Usuario no identificado.' });
        return;
      }

      const resultado = await this.cambiarPasswordUseCase.ejecutar(id_usuario, nueva_password);
      
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
solicitarReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const { pool } = await import('../../infrastructure/persistence/PostgreSQLConfig.js');
    
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Por seguridad respondemos igual aunque no exista
      res.status(200).json({ mensaje: 'Si el email existe, recibirás un código.' });
      return;
    }

    const usuario = result.rows[0];
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const vencimiento = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `UPDATE usuarios SET codigo_verificacion = $1, vencimiento_codigo = $2 WHERE id_usuario = $3`,
      [codigo, vencimiento, usuario.id_usuario]
    );

    const { EmailService } = await import('../../infrastructure/services/EmailService.js');
    const emailService = new EmailService();
    await emailService.enviarCodigoVerificacion(email, codigo);

    res.status(200).json({ 
      mensaje: 'Si el email existe, recibirás un código.',
      id_usuario: usuario.id_usuario
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
}