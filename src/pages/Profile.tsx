import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Music, History, Settings, Award, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { useTest } from '../context/TestContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useTest();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'test_sessions'),
          where('uid', '==', user.id),
          orderBy('created_at', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const fetchedSessions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSessions(fetchedSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen p-8 md:p-12 relative bg-[#050505] overflow-hidden">
      <div className="w-full max-w-7xl mx-auto space-y-12 relative z-10">
        <header className="flex justify-between items-center">
           <div className="label-sommelier">Perfil • Huella Sonora</div>
           <Button variant="outline" size="sm" onClick={() => logout()}>Cerrar Sesión</Button>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* User Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass col-span-12 md:col-span-4 p-12 flex flex-col items-center text-center gap-8"
          >
            <div className="w-32 h-32 rounded-full border border-white/10 bg-zinc-900 overflow-hidden flex items-center justify-center relative group">
               <div className="absolute inset-0 rounded-full blur-2xl opacity-10 bg-white group-hover:opacity-30 transition-opacity" />
               {user.photoURL ? (
                 <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               ) : (
                 <UserIcon size={48} className="text-white/40" />
               )}
            </div>
            <div className="space-y-2">
               <h2 className="text-4xl font-serif italic text-white tracking-tight">{user.displayName}</h2>
               <p className="label-sommelier m-0 opacity-40">{user.email}</p>
            </div>
            <div className="pt-8 border-t border-white/5 w-full space-y-4">
               <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/20">Biografías</span>
                  <span className="text-xl font-serif italic text-white">{sessions.length}</span>
               </div>
               <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/20">Estado</span>
                  <span className="text-xl font-serif italic text-white/60 uppercase">{user.biography_status}</span>
               </div>
            </div>
          </motion.div>

          {/* History / Bento Grid */}
          <div className="col-span-12 md:col-span-8 grid grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-10 flex flex-col justify-between group hover:bg-white/[0.02] transition-all cursor-pointer"
            >
               <History size={24} className="text-white/20 group-hover:text-white transition-colors" />
               <div className="space-y-2">
                  <div className="label-sommelier m-0 text-white/10">Última Sesión</div>
                  <div className="text-2xl font-serif italic text-white">
                    {sessions[0]?.created_at ? sessions[0].created_at.toDate().toLocaleDateString('es-ES') : 'Sin sesiones'}
                  </div>
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-10 flex flex-col justify-between group hover:bg-white/[0.02] transition-all cursor-pointer"
            >
               <Award size={24} className="text-white/20 group-hover:text-white transition-colors" />
               <div className="space-y-2">
                  <div className="label-sommelier m-0 text-white/10">Cuadrante Recurrente</div>
                  <div className="text-2xl font-serif italic text-white uppercase">
                    {sessions[0]?.dominant_quadrant || 'Calculando...'}
                  </div>
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass col-span-2 p-12 space-y-8"
            >
               <div className="flex justify-between items-center">
                  <h3 className="label-sommelier m-0">Historial de Lecturas Reales</h3>
                  <button className="text-[10px] tracking-[0.2em] uppercase text-white/20 hover:text-white transition-colors">Total: {sessions.length}</button>
               </div>
               
               {loading ? (
                 <div className="flex items-center justify-center p-20">
                   <Loader2 className="animate-spin text-white/20" />
                 </div>
               ) : (
                 <div className="space-y-6">
                    {sessions.map((session, i) => (
                      <div key={session.id} className="flex items-center justify-between py-6 border-b border-white/5 last:border-0 hover:px-4 transition-all duration-700 cursor-pointer group">
                         <div className="flex items-center gap-8">
                            <div className="text-white/10 font-serif italic text-2xl">0{i + 1}</div>
                            <div className="space-y-1">
                               <div className="text-xl font-serif italic text-white/80 group-hover:text-white transition-colors">
                                 Cata del {session.created_at?.toDate().toLocaleDateString('es-ES')}
                               </div>
                               <div className="label-sommelier m-0 opacity-20 text-[8px] uppercase tracking-[0.3em]">
                                 Dominante: {session.dominant_quadrant}
                               </div>
                            </div>
                         </div>
                         <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Music size={14} className="text-white/40" />
                         </button>
                      </div>
                    ))}
                    {sessions.length === 0 && (
                      <div className="text-center p-12 text-white/10 font-serif italic">
                        Aún no has iniciado tu biografía sonora.
                      </div>
                    )}
                 </div>
               )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="fixed -bottom-24 -right-24 opacity-[0.02] pointer-events-none">
         <UserIcon size={600} />
      </div>
    </div>
  );
};
