import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Ad } from './types';
import { motion } from 'motion/react';
import { Bell, ExternalLink } from 'lucide-react';

export default function Ads() {
  const { token } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetch('/api/ads', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Respuesta no válida del servidor");
      }
      return res.json();
    })
    .then(data => setAds(data))
    .catch(err => console.error("Error fetching ads:", err));
  }, [token]);

  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
          <Bell size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Anuncios del Reino</h2>
          <p className="text-slate-400">Mantente al día con las últimas novedades</p>
        </div>
      </div>

      <div className="grid gap-8">
        {ads.map((ad, i) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden"
          >
            {ad.media_url && (
              <div className="aspect-video w-full bg-slate-800 relative group">
                {ad.media_type === 'video' || getYoutubeEmbedUrl(ad.media_url) ? (
                  getYoutubeEmbedUrl(ad.media_url) ? (
                    <iframe 
                      src={getYoutubeEmbedUrl(ad.media_url)!}
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video src={ad.media_url} controls className="w-full h-full object-cover" />
                  )
                ) : (
                  <img src={ad.media_url} alt={ad.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
              </div>
            )}
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{ad.title}</h3>
                <span className="text-xs text-slate-500">{new Date(ad.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{ad.content}</p>
            </div>
          </motion.div>
        ))}

        {ads.length === 0 && (
          <div className="text-center p-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <p className="text-slate-500">No hay anuncios por ahora...</p>
          </div>
        )}
      </div>
    </div>
  );
}
