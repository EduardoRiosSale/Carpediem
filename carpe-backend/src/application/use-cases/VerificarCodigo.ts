import jwt from 'jsonwebtoken';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository.js';

export class VerificarCodigoUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async ejecutar(id_usuario: number, codigoIngresado: string) {
    const usuario = await this.usuarioRepository.buscarPorId(id_usuario);
    
    if (!usuario) throw new Error('Usuario no encontrado');
    if (usuario.codigo_verificacion !== codigoIngresado) throw new Error('Código incorrecto');
    
    const ahora = new Date();
    if (usuario.vencimiento_codigo && new Date(usuario.vencimiento_codigo) < ahora) {
      throw new Error('El código ha expirado. Volvé a iniciar sesión para recibir otro.');
    }

    // Si todo está OK, le damos un "Token Temporal" que dura solo 15 minutos 
    // para que lo use exclusivamente en la pantalla de "Cambiar Contraseña"
    const tokenTemporal = jwt.sign(
      { id_usuario: usuario.id_usuario, permiso: 'CAMBIO_CLAVE' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    return { tokenTemporal };
  }
}