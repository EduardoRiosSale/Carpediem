import type { ReactNode } from 'react';

import Sidebar from './Sidebar';



const AppLayout = ({ children }: { children: ReactNode }) => {

  return (

    <div className="flex flex-col md:flex-row h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 text-white">

     

      <Sidebar />

     

      <main className="flex-1 w-full h-full overflow-y-auto p-4 pb-28 md:p-8 relative">

        {/* Luces de fondo sutiles para el dashboard */}

        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

       

        <div className="relative z-10">

          {children}

        </div>

      </main>

    </div>

  );

};



export default AppLayout;