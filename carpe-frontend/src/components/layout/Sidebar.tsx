import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../img/carpe1.jfif';
import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import Avatar from '../Avatar';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const ownerNav: NavItem[] = [
  { label: 'Dashboard', path: '/owner/dashboard', icon: '▦' },
  { label: 'Alumnos', path: '/owner/usuarios', icon: '👥' },
  { label: 'Profesores', path: '/owner/profesores', icon: '🏋️' },
  { label: 'Clases', path: '/owner/clases', icon: '📅' },
  { label: 'Productos', path: '/owner/productos', icon: '📦' },
  { label: 'Ventas', path: '/owner/punto-venta', icon: '🛒' },
  { label: 'Calificaciones', path: '/owner/calificaciones', icon: '★' },
  { label: 'Mi perfil', path: '/owner/perfil', icon: '👤' },
  { label: 'Config', path: '/owner/configuracion', icon: '⚙️' },
];

const profeNav: NavItem[] = [
  { label: 'Mis alumnos', path: '/profe/alumnos', icon: '👥' },
];

const alumnoNav: NavItem[] = [
  { label: 'Mi rutina', path: '/alumno/rutina', icon: '▦' },
  { label: 'Mi progreso', path: '/alumno/progreso', icon: '↗' },
  { label: 'Horario', path: '/alumno/horario', icon: '📅' },
  { label: 'Tienda', path: '/alumno/tienda', icon: '🛍️' },
  { label: 'Mi perfil', path: '/alumno/perfil', icon: '◯' },
];

const Sidebar = () => {
  const { usuario, logout, token } = useAuth();
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState(0);

  // --- Lógica para arrastrar con el mouse (Drag to Scroll) ---
  const navRef = useRef<HTMLElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false); // Para evitar clics accidentales al soltar el arrastre

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!navRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - navRef.current.offsetLeft;
    scrollLeft.current = navRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !navRef.current) return;
    e.preventDefault();
    const x = e.pageX - navRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Multiplicador de velocidad de arrastre
    
    // Si se movió más de 5 píxeles, lo consideramos un "arrastre" y no un clic
    if (Math.abs(walk) > 5) {
      hasDragged.current = true;
    }
    
    navRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const preventClickIfDragging = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
    }
  };
  // -------------------------------------------------------------

  useEffect(() => {
    if (!token || usuario?.rol !== 'OWNER') return;
    const fetchNotificaciones = () => {
      api.get('/clases/notificaciones')
        .then(res => setNotificaciones(res.data.total))
        .catch(() => {});
    };
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 30000);
    return () => clearInterval(interval);
  }, [usuario, token]);

  const getNav = () => {
    if (usuario?.rol === 'OWNER') return ownerNav;
    if (usuario?.rol === 'PROFE') return profeNav;
    return alumnoNav;
  };

  const getRolLabel = () => {
    if (usuario?.rol === 'OWNER') return { label: 'Administrador', color: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' };
    if (usuario?.rol === 'PROFE') return { label: 'Profesor', color: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' };
    return { label: 'Alumno', color: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' };
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const rol = getRolLabel();

  return (
    <aside className="fixed bottom-0 left-0 w-full bg-slate-950/95 backdrop-blur-xl border-t-2 border-cyan-400/30 flex flex-row items-center justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-[90] 
                      /* CLASES DESKTOP MINIMIZADO */
                      md:relative md:w-[88px] hover:md:w-[280px] md:h-screen md:bg-slate-950 md:border-t-0 md:border-r-2 md:border-cyan-400/30 md:flex-col md:py-6 md:px-3 md:justify-start shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all duration-300 ease-in-out group md:overflow-x-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-400/5 to-transparent pointer-events-none md:h-64"></div>

      {/* Logo - Desktop */}
      <div className="hidden md:flex items-center gap-4 mb-6 pl-2 relative z-10 w-full shrink-0">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl group-hover:bg-cyan-400/30 transition-all duration-500"></div>
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <img src={logo} alt="Carpe Diem" className="w-full h-full object-cover scale-110" draggable={false} />
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
          <p className="text-white text-[17px] font-black tracking-tight m-0">Carpe Diem</p>
          <p className="text-cyan-400 text-[9px] font-black tracking-[0.3em] m-0 uppercase">Salud & Estética</p>
        </div>
      </div>

      {/* Nav con Drag-to-Scroll */}
      <nav 
        ref={navRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex flex-row md:flex-col gap-1 md:gap-2 w-full overflow-x-auto md:overflow-y-auto md:overflow-x-hidden justify-start md:flex-1 relative z-10 px-2 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x select-none cursor-grab active:cursor-grabbing md:cursor-auto"
      >
        {getNav().map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={preventClickIfDragging}
            draggable={false}
            className={({ isActive }) => `
              relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-4 px-2 py-2 md:py-3.5 rounded-xl transition-all duration-300
              min-w-[76px] md:min-w-0 shrink-0 snap-center md:w-full group
              ${isActive 
                ? 'text-cyan-400 md:bg-slate-900/80 md:border md:border-cyan-400/30 md:shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }
            `}
          >
            <span className="text-[24px] md:text-[22px] transition-all duration-300 md:group-hover:scale-110 relative shrink-0 flex justify-center md:w-6"
                  style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}>
              {item.icon}
              {/* Badge notificaciones en clases */}
              {item.path === '/owner/clases' && notificaciones > 0 && (
                <span className="absolute -top-2 -right-2 md:-right-3 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white text-[8px] font-black border border-slate-950">
                  {notificaciones > 9 ? '9+' : notificaciones}
                </span>
              )}
            </span>
            <span className="text-[9px] md:text-[13px] font-bold tracking-wider uppercase md:capitalize truncate text-center md:text-left w-full md:opacity-0 md:w-0 group-hover:md:opacity-100 group-hover:md:w-auto transition-all duration-300">
              {item.label}
            </span>
          </NavLink>
        ))}

        {/* Botón cerrar sesión — visible solo en móvil */}
        <button
          onClick={(e) => {
            preventClickIfDragging(e);
            if (!hasDragged.current) handleLogout();
          }}
          className="flex flex-col md:hidden items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 min-w-[76px] shrink-0 snap-center text-slate-500 hover:text-rose-500 hover:bg-rose-500/10"
        >
          <span className="text-[24px]">⏻</span>
          <span className="text-[9px] font-bold tracking-wider uppercase truncate w-full text-center">Salir</span>
        </button>
      </nav>

    {/* Usuario info + logout - Desktop */}
<div className="hidden md:block border-t border-white/5 pt-6 mt-auto w-full relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden shrink-0">
  <div className="mb-6 px-2 bg-slate-900/40 p-4 rounded-2xl border border-white/5 shadow-inner flex items-center gap-3">
    <Avatar foto_url={usuario?.foto_url} nombre={usuario?.nombre_completo || ''} size="sm" />
    <div className="overflow-hidden">
      <p className="text-white text-[14px] font-bold tracking-wide m-0 truncate">
        {usuario?.nombre_completo || 'Usuario'}
      </p>
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${rol.color}`}>
        {rol.label}
      </p>
    </div>
  </div>
  <button
    onClick={handleLogout}
    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-slate-900/50 text-slate-500 text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-300 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 shadow-sm"
  >
    Cerrar sesión
  </button>
</div>
    </aside>
  );
};

export default Sidebar;