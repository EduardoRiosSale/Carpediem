import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository.js';

export class CambiarPasswordUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async ejecutar(id_usuario: number, nuevaPasswordPlana: string) {
    const passwordEncriptada = await bcrypt.hash(nuevaPasswordPlana, 10);
    await this.usuarioRepository.actualizarPasswordSegura(id_usuario, passwordEncriptada);

    // Buscamos el usuario para generar el token definitivo
    const usuario = await this.usuarioRepository.buscarPorId(id_usuario);
    if (!usuario) throw new Error('Usuario no encontrado');

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        rol: usuario.rol,
        fecha_vencimiento_cuota: usuario.fecha_vencimiento_cuota,
        id_profe_titular: usuario.id_profe_titular,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    const { password_hash, codigo_verificacion, vencimiento_codigo, ...usuarioSinPassword } = usuario;

    return { token, usuario: usuarioSinPassword };
  }
}