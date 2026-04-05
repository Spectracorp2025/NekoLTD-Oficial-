import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';
import { Stream } from './types';
import { Tv, Clock, ExternalLink, Info, Calendar } from 'lucide-react';

export default function Streams() {
  const { token, optimizationMode } = useAuth();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const res = await fetch('/api/streams', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStreams(data);
    } catch (error) {
      console.error('Error fetching streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeLeft = (date: string) => {
    const difference = +new Date(date) - +new Date();
    let timeLeft: { [key: string]: number } = {};

    if (difference > 0) {
      timeLeft = {
        días: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const Countdown = ({ date }: { date: string }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(date));

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(date));
      }, 1000);
      return () => clearInterval(timer);
    }, [date]);

    const timerComponents: React.ReactNode[] = [];

    Object.keys(timeLeft).forEach((interval) => {
      if (!timeLeft[interval]) return;
      timerComponents.push(
        <span key={interval} className="flex flex-col items-center">
          <span className="text-xl font-black">{timeLeft[interval]}</span>
          <span className="text-[8px] uppercase opacity-50">{interval}</span>
        </span>
      );
    });

    return (
      <div className="flex gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/10">
        {timerComponents.length ? timerComponents : <span className="text-blue-400 font-bold animate-pulse">¡EN VIVO AHORA!</span>}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header & Rave Info */}
      <motion.div 
        initial={optimizationMode ? { opacity: 1 } : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-blue-500/10"
      >
        <div className="w-32 h-32 shrink-0 bg-white/5 rounded-2xl p-4 flex items-center justify-center border border-white/10">
          <img 
            src="/appver.png" 
            alt="Rave App" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://rave.io/favicon.ico";
            }}
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            TRANSMISIONES EN VIVO
          </h2>
          <p className="text-slate-300 mb-4">
            Para disfrutar de nuestras transmisiones de películas y anime, es necesario tener instalada la aplicación <strong>Rave</strong>.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <a 
              href="https://play.google.com/store/apps/details?id=com.wemesh.android" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              Google Play
            </a>
            <a 
              href="https://apps.apple.com/us/app/rave-watch-party/id1022963528" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              App Store
            </a>
          </div>
        </div>
      </motion.div>

      {/* Streams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {streams.map((stream) => (
            <motion.div
              key={stream.id}
              initial={optimizationMode ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={stream.image_url || "https://picsum.photos/seed/stream/800/450"} 
                  alt={stream.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <Countdown date={stream.scheduled_at} />
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">
                  <Calendar size={14} />
                  {new Date(stream.scheduled_at).toLocaleString()}
                </div>
                <h3 className="text-2xl font-black mb-3 group-hover:text-blue-400 transition-colors">
                  {stream.title}
                </h3>
                <p className="text-slate-400 text-sm mb-6 line-clamp-3">
                  {stream.description}
                </p>

                {stream.stream_url ? (
                  <a 
                    href={stream.stream_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <Tv size={20} />
                    INGRESAR A LA TRANSMISIÓN
                    <ExternalLink size={16} />
                  </a>
                ) : (
                  <div className="w-full bg-white/5 border border-white/10 text-slate-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed">
                    <Clock size={20} />
                    ENLACE PRÓXIMAMENTE
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {streams.length === 0 && !loading && (
        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
          <Tv size={64} className="mx-auto mb-4 text-slate-700" />
          <h3 className="text-2xl font-bold text-slate-500">No hay transmisiones programadas</h3>
          <p className="text-slate-600">Vuelve pronto para ver nuevas películas y anime.</p>
        </div>
      )}
    </div>
  );
}
