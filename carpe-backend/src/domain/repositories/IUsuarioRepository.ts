import { Usuario } from '../Usuario.js';

export interface IUsuarioRepository {
  crear(usuario: Usuario): Promise<Usuario>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  
  // Agregamos las firmas de las 3 funciones nuevas:
  buscarPorId(id_usuario: number): Promise<Usuario | null>;
  guardarCodigoVerificacion(id_usuario: number, codigo: string, vencimiento: Date): Promise<void>;
  actualizarPasswordSegura(id_usuario: number, passwordHash: string): Promise<void>;
}