import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import VerificarCodigo from './pages/auth/VerificarCodigo';
import CambiarPassword from './pages/auth/CambiarPassword';
import Dashboard from './pages/owner/Dashboard';
import Usuarios from './pages/owner/Usuarios';
import Calificaciones from './pages/owner/Calificaciones';
import Alumnos from './pages/profe/Alumnos';
import PerfilAlumno from './pages/profe/PerfilAlumno';
import RutinaPage from './pages/alumno/RutinaPage'
import RegistrarEntrenamiento from './pages/alumno/RegistrarEntrenamiento';
import Progreso from './pages/alumno/Progreso';
import Perfil from './pages/alumno/Perfil';
import Profesores from './pages/owner/Profesores';
import AlumnosDeProfe from './pages/owner/AlumnosDeProfe';
import Chat from './pages/Chat';
import CuotaVencida from './pages/CuotaVencida';
import Productos from './pages/owner/Productos';
import PuntoVenta from './pages/owner/PuntoVenta';
import Tienda from './pages/alumno/Tienda';
import Configuracion from './pages/owner/Configuracion';
import Clases from './pages/owner/Clases';
import Horario from './pages/alumno/Horario';
import PerfilOwner from './pages/owner/Perfil';

const App = () => {
  const { usuario } = useAuth();

  const getRoleHome = () => {
    if (!usuario) return '/login';
    if (usuario.rol === 'OWNER') return '/owner/dashboard';
    if (usuario.rol === 'PROFE') return '/profe/alumnos';
    return '/alumno/rutina';
  };

  return (
    <Routes>
      <Route path="/login" element={!usuario ? <Login /> : <Navigate to={getRoleHome()} />} />
      <Route path="/auth/verificar-codigo" element={<VerificarCodigo />} />
      <Route path="/auth/cambiar-password" element={<CambiarPassword />} />
      <Route path="/owner/dashboard" element={usuario?.rol === 'OWNER' ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to={getRoleHome()} />} />
      <Route path="*" element={<Navigate to={getRoleHome()} />} />
      <Route path="/owner/usuarios" element={usuario?.rol === 'OWNER' ? <Usuarios /> : <Navigate to="/login" />} />
      <Route path="/owner/calificaciones" element={usuario?.rol === 'OWNER' ? <Calificaciones /> : <Navigate to="/login" />} />
      <Route path="/profe/alumnos" element={usuario?.rol === 'PROFE' ? <Alumnos /> : <Navigate to="/login" />} />
      <Route path="/profe/alumno/:id" element={usuario?.rol === 'PROFE' ? <PerfilAlumno /> : <Navigate to="/login" />} />
      <Route path="/alumno/rutina" element={usuario?.rol === 'ALUMNO' ? <RutinaPage /> : <Navigate to="/login" />} />
      <Route path="/alumno/registrar" element={usuario?.rol === 'ALUMNO' ? <RegistrarEntrenamiento /> : <Navigate to="/login" />} />
      <Route path="/alumno/progreso" element={usuario?.rol === 'ALUMNO' ? <Progreso /> : <Navigate to="/login" />} />
      <Route path="/alumno/perfil" element={usuario?.rol === 'ALUMNO' ? <Perfil /> : <Navigate to="/login" />} />
      <Route path="/owner/profesores" element={usuario?.rol === 'OWNER' ? <Profesores /> : <Navigate to="/login" />} />
      <Route path="/owner/profe/:id/alumnos" element={usuario?.rol === 'OWNER' ? <AlumnosDeProfe /> : <Navigate to="/login" />} />
      <Route path="/chat/:id" element={usuario?.rol === 'PROFE' || usuario?.rol === 'ALUMNO' || usuario?.rol === 'OWNER' ? <Chat /> : <Navigate to="/login" />} />
      <Route path="/cuota-vencida" element={<CuotaVencida />} />
      <Route path="/owner/productos" element={usuario?.rol === 'OWNER' ? <Productos /> : <Navigate to="/login" />} />
      <Route path="/owner/punto-venta" element={usuario?.rol === 'OWNER' ? <PuntoVenta /> : <Navigate to="/login" />} />
      <Route path="/alumno/tienda" element={usuario?.rol === 'ALUMNO' ? <Tienda /> : <Navigate to="/login" />} />
      <Route path="/owner/configuracion" element={usuario?.rol === 'OWNER' ? <Configuracion /> : <Navigate to="/login" />} />
      <Route path="/owner/clases" element={usuario?.rol === 'OWNER' ? <Clases /> : <Navigate to="/login" />} />
      <Route path="/alumno/horario" element={usuario?.rol === 'ALUMNO' ? <Horario /> : <Navigate to="/login" />} />
      <Route path="/owner/perfil" element={usuario?.rol === 'OWNER' ? <PerfilOwner /> : <Navigate to="/login" />} />
      
      
    </Routes>
  );
};

export default App;