import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Music, Trash2, Edit3, BarChart3, Database, Settings, 
  RefreshCcw, Loader2, Search, X, Check, Filter, ExternalLink,
  Eye, EyeOff, Save
} from 'lucide-react';
import { Button } from '../components/Button';
import { SEED_SONGS, QUADRANTS_DATA, Song, QuadrantType } from '../data/songs';
import { useTest } from '../context/TestContext';
import { db } from '../lib/firebase';
import { 
  collection, getDocs, setDoc, doc, deleteDoc, 
  serverTimestamp, query, orderBy, updateDoc 
} from 'firebase/firestore';
import { geminiService } from '../services/geminiService';

export const Admin: React.FC = () => {
  const { isAdmin } = useTest();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [editingSong, setEditingSong] = useState<Partial<Song> | null>(null);
  const [filterQuadrant, setFilterQuadrant] = useState<QuadrantType | 'all'>('all');

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'songs'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedSongs = querySnapshot.docs.map(doc => doc.data() as Song);
      setSongs(fetchedSongs);
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSongs();
    }
  }, [isAdmin]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await geminiService.searchMusic(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFromSearch = (result: any) => {
    setEditingSong({
      id: `yt-${result.video_id}`,
      title: result.title,
      artist: result.artist,
      youtube_url: result.url,
      youtube_video_id: result.video_id,
      youtube_thumbnail_url: result.thumbnail_url,
      cuadrante_principal: 'revela' as QuadrantType,
      descripcion_breve: '',
      estado: 'active'
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSaveSong = async () => {
    if (!editingSong || !editingSong.id) return;
    try {
      const songData = {
        ...editingSong,
        updated_at: serverTimestamp(),
        created_at: editingSong.created_at || serverTimestamp()
      };
      await setDoc(doc(db, 'songs', editingSong.id), songData);
      setEditingSong(null);
      await fetchSongs();
    } catch (error) {
      console.error("Save error:", error);
      alert("Error al guardar la pieza.");
    }
  };

  const handleToggleEstado = async (song: Song) => {
    const nuevoEstado = song.estado === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, 'songs', song.id), {
        estado: nuevoEstado,
        updated_at: serverTimestamp()
      });
      setSongs(songs.map(s => s.id === song.id ? { ...s, estado: nuevoEstado as any } : s));
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta pieza de la biblioteca?")) return;
    try {
      await deleteDoc(doc(db, 'songs', id));
      setSongs(songs.filter(s => s.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleSyncInitial = async () => {
    if (!confirm("¿Sincronizar biblioteca semilla?")) return;
    setSyncing(true);
    try {
      for (const song of SEED_SONGS) {
        await setDoc(doc(db, 'songs', song.id), {
          ...song,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }
      await fetchSongs();
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setSyncing(false);
    }
  };

  const filteredSongs = songs.filter(s => filterQuadrant === 'all' || s.cuadrante_principal === filterQuadrant);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Settings size={48} className="mx-auto text-white/10 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 md:p-12 relative bg-[#050505] overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Header Pro */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-10">
           <div className="space-y-2">
              <div className="label-sommelier">Centro de Curaduría Pro</div>
              <h1 className="text-5xl font-serif italic text-white tracking-tight">Biblioteca Sommelier</h1>
           </div>
           
           <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <form onSubmit={handleSearch} className="relative flex-grow lg:flex-grow-0 lg:w-96">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  type="text" 
                  placeholder="Buscar pieza en YouTube (Nombre o Artista)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-full py-4 pl-16 pr-8 text-white/80 placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all font-serif italic"
                />
                {isSearching && (
                  <Loader2 size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 animate-spin" />
                )}
              </form>
              <Button 
                variant="outline" 
                onClick={handleSyncInitial}
                disabled={syncing}
                className="flex items-center gap-3 px-8"
              >
                 {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />} 
                 Reiniciar Semilla
              </Button>
           </div>
        </header>

        {/* Search Results Overlay */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass p-8 space-y-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <h3 className="label-sommelier m-0">Resultados de Hallazgo Asistido</h3>
                <button onClick={() => setSearchResults([])} className="text-white/20 hover:text-white"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {searchResults.map((result, i) => (
                  <div key={i} className="group glass p-4 flex gap-4 hover:bg-white/[0.02] cursor-pointer" onClick={() => handleSelectFromSearch(result)}>
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <img src={result.thumbnail_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div className="min-w-0 py-1">
                      <div className="text-sm text-white/80 font-serif italic truncate">{result.title}</div>
                      <div className="label-sommelier m-0 opacity-20 text-[8px] truncate">{result.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Form Modal/Drawer */}
        <AnimatePresence>
          {editingSong && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
                onClick={() => setEditingSong(null)}
              />
              <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="glass w-full max-w-2xl p-12 space-y-12 relative overflow-hidden"
              >
                <div className="glossy-overlay" />
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-serif italic text-white/80">Editar Manuscrito</h3>
                  <button onClick={() => setEditingSong(null)} className="text-white/20 hover:text-white"><X size={24} /></button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="label-sommelier">Título de la Pieza</label>
                    <input 
                      type="text" 
                      value={editingSong.title} 
                      onChange={(e) => setEditingSong({...editingSong, title: e.target.value})}
                      className="admin-input"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="label-sommelier">Artista / Intérprete</label>
                    <input 
                      type="text" 
                      value={editingSong.artist} 
                      onChange={(e) => setEditingSong({...editingSong, artist: e.target.value})}
                      className="admin-input"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="label-sommelier">Cuadrante Principal</label>
                    <select 
                      value={editingSong.cuadrante_principal}
                      onChange={(e) => setEditingSong({...editingSong, cuadrante_principal: e.target.value as QuadrantType})}
                      className="admin-input bg-[#111]"
                    >
                      {Object.entries(QUADRANTS_DATA).map(([id, q]) => (
                        <option key={id} value={id}>{q.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="label-sommelier">Estado de Curaduría</label>
                    <select 
                      value={editingSong.estado}
                      onChange={(e) => setEditingSong({...editingSong, estado: e.target.value as any})}
                      className="admin-input bg-[#111]"
                    >
                      <option value="active">Activo (En Cata)</option>
                      <option value="inactive">Inactivo (Bodega)</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-4">
                    <label className="label-sommelier">Descripción Breve (Inspiración)</label>
                    <textarea 
                      value={editingSong.descripcion_breve} 
                      onChange={(e) => setEditingSong({...editingSong, descripcion_breve: e.target.value})}
                      className="admin-input min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-6 border-t border-white/5 pt-10">
                  <button onClick={() => setEditingSong(null)} className="label-sommelier">Cancelar</button>
                  <Button variant="primary" onClick={handleSaveSong} className="px-12 flex items-center gap-3">
                    <Save size={16} /> Guardar Cambios
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content: Stats & Table */}
        <div className="grid grid-cols-12 gap-12">
           <div className="col-span-12 flex flex-wrap gap-8">
              {[
                { label: 'Piezas Totales', value: songs.length, icon: Music },
                { label: 'Activas Hoy', value: songs.filter(s => s.estado === 'active').length, icon: Eye },
              ].map((stat, i) => (
                <div key={i} className="glass px-10 py-6 min-w-[240px] flex items-center gap-6">
                  <div className="p-4 bg-white/[0.03] rounded-2xl"><stat.icon size={18} className="text-white/20" /></div>
                  <div>
                    <div className="label-sommelier m-0 text-[9px] opacity-20">{stat.label}</div>
                    <div className="text-2xl font-serif italic text-white/80">{stat.value}</div>
                  </div>
                </div>
              ))}
              
              {/* Filters */}
              <div className="ml-auto flex items-center gap-6 bg-white/[0.02] border border-white/5 rounded-2xl px-8 h-full">
                <Filter size={14} className="text-white/20" />
                <div className="flex gap-4">
                  <button 
                    onClick={() => setFilterQuadrant('all')}
                    className={`label-sommelier m-0 text-[10px] pb-1 border-b-2 transition-all ${filterQuadrant === 'all' ? 'border-white text-white' : 'border-transparent text-white/20 hover:text-white/40'}`}
                  >
                    Todos
                  </button>
                  {Object.entries(QUADRANTS_DATA).map(([id, q]) => (
                    <button 
                      key={id}
                      onClick={() => setFilterQuadrant(id as QuadrantType)}
                      className={`label-sommelier m-0 text-[10px] pb-1 border-b-2 transition-all ${filterQuadrant === id ? 'border-white text-white' : 'border-transparent text-white/20 hover:text-white/40'}`}
                    >
                      {q.name}
                    </button>
                  ))}
                </div>
              </div>
           </div>

           <div className="col-span-12 glass overflow-hidden">
             {loading ? (
               <div className="flex items-center justify-center p-32"><Loader2 className="animate-spin text-white/20" /></div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-[#0a0a0a] text-[10px] tracking-[0.3em] uppercase text-white/20">
                     <tr>
                       <th className="p-8 font-normal">Obra Musical</th>
                       <th className="p-8 font-normal">Región</th>
                       <th className="p-8 font-normal">Identidad YT</th>
                       <th className="p-8 font-normal text-center">Curaduría</th>
                       <th className="p-8 font-normal text-right">Acciones</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 font-serif italic">
                     {filteredSongs.map((song) => (
                       <tr key={song.id} className="group hover:bg-white/[0.01]">
                         <td className="p-8">
                           <div className="flex items-center gap-6">
                             <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-1000">
                               <img src={song.youtube_thumbnail_url} alt="" className="w-full h-full object-cover" />
                             </div>
                             <div>
                               <div className="text-xl text-white/80 leading-none mb-1">{song.title}</div>
                               <div className="label-sommelier m-0 opacity-20 text-[9px] tracking-[0.2em]">{song.artist}</div>
                             </div>
                           </div>
                         </td>
                         <td className="p-8">
                           <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-full">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: QUADRANTS_DATA[song.cuadrante_principal]?.color || '#333' }} />
                             <span className="text-xs text-white/40">{QUADRANTS_DATA[song.cuadrante_principal]?.name}</span>
                           </div>
                         </td>
                         <td className="p-8">
                           <a href={song.youtube_url} target="_blank" rel="noreferrer" className="text-white/20 hover:text-white/60 transition-colors flex items-center gap-2">
                             <code className="text-xs">{song.youtube_video_id}</code>
                             <ExternalLink size={10} />
                           </a>
                         </td>
                         <td className="p-8 text-center">
                           <button 
                             onClick={() => handleToggleEstado(song)}
                             className={`px-6 py-2 rounded-full text-[9px] font-bold tracking-[0.1em] border transition-all ${song.estado === 'active' ? 'bg-green-500/5 text-green-500 border-green-500/20 hover:bg-green-500/10' : 'bg-zinc-500/5 text-zinc-500 border-zinc-500/20 hover:bg-zinc-500/10'}`}
                           >
                             {song.estado.toUpperCase()}
                           </button>
                         </td>
                         <td className="p-8 text-right">
                           <div className="flex justify-end gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                             <button className="p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.06] text-white/40 hover:text-white transition-all" onClick={() => setEditingSong(song)}><Edit3 size={16} /></button>
                             <button className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/10 text-red-500/40 hover:text-red-500 transition-all" onClick={() => handleDelete(song.id)}><Trash2 size={16} /></button>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
