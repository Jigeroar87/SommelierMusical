import React, { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer as YTPlayer } from 'react-youtube';
import { ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface YouTubePlayerProps {
  videoId: string;
  isPlaying: boolean;
  onStateChange?: (isPlaying: boolean) => void;
  onError?: (errorCode: number) => void;
  thumbnailUrl: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  videoId, 
  isPlaying, 
  onStateChange,
  onError,
  thumbnailUrl 
}) => {
  const playerRef = useRef<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(false);

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    host: 'https://www.youtube-nocookie.com',
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      fs: 1,
      disablekb: 0,
      enablejsapi: 1,
      widget_referrer: window.location.href,
      origin: window.location.origin,
    },
  };

  useEffect(() => {
    setIsReady(false);
    setError(false);
  }, [videoId]);

  useEffect(() => {
    if (playerRef.current && isReady) {
      try {
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (e) {
        console.warn("YouTube play/pause failed", e);
      }
    }
  }, [isPlaying, videoId, isReady]);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    setIsReady(true);
    setError(false);
    
    if (isPlaying) {
      try {
        event.target.playVideo();
      } catch (e) {
        console.warn("Initial play failed", e);
      }
    }
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    const state = event.data;
    if (onStateChange) {
      if (state === 1) onStateChange(true);
      if (state === 2) onStateChange(false);
    }
  };

  const onPlayerError = (event: any) => {
    const errorCode = event.data;
    console.error("YouTube Error Details:", errorCode);
    // 101/150 usually means restricted embed
    setError(true);
    setIsReady(true);
    if (onStateChange) onStateChange(false);
    if (onError) onError(errorCode);
  };

  return (
    <div className="relative w-full h-full bg-black">
      <AnimatePresence>
        {!isReady && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-900/40 backdrop-blur-md"
          >
            <Loader2 className="animate-spin text-white/20" size={32} />
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 text-center bg-[#080808]">
          <img 
            src={thumbnailUrl} 
            alt="Fallback" 
            className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" 
            referrerPolicy="no-referrer"
          />
          <div className="relative z-10 space-y-6">
            <AlertCircle className="mx-auto text-white/40" size={48} />
            <div className="space-y-2">
              <h4 className="label-sommelier m-0 text-white/60">Frecuencia Restringida</h4>
              <p className="text-xs text-white/20 italic font-serif leading-relaxed">
                Esta pieza requiere un entorno directo para proteger su integridad.
              </p>
            </div>
            <a 
              href={`https://www.youtube.com/watch?v=${videoId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 border border-white/10 rounded-full text-[10px] tracking-widest uppercase text-white/40 hover:text-white hover:bg-white/5 transition-all duration-700"
            >
              Escuchar en YouTube <ExternalLink size={12} />
            </a>
          </div>
        </div>
      ) : (
        <YouTube 
          videoId={videoId} 
          opts={opts} 
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          onError={onPlayerError}
          className="absolute inset-0 w-full h-full"
          iframeClassName="w-full h-full pointer-events-auto" // Escalado removido para debug
        />
      )}

      {/* Sutil overlay para integrar el video con la estética de la app */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/20" />
      <div className="absolute inset-0 z-10 pointer-events-none ring-inset ring-1 ring-white/10 rounded-[32px]" />
    </div>
  );
};
