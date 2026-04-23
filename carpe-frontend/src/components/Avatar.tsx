interface Props {
  foto_url?: string | null;
  nombre: string;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar = ({ foto_url, nombre, size = 'md' }: Props) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden shrink-0 border-2 border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]`}>
      {foto_url ? (
        <img src={foto_url} alt={nombre} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-black">
          {nombre.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default Avatar;