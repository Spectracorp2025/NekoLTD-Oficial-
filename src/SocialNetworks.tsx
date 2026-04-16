import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Share2, ExternalLink, MessageCircle, Globe, Instagram, Facebook, Twitter } from 'lucide-react';
import { useAuth } from './AuthContext';

interface SocialNetwork {
  id: number;
  title: string;
  description: string;
  url: string;
  image_url: string;
}

export default function SocialNetworks() {
  const { token } = useAuth();
  const [networks, setNetworks] = useState<SocialNetwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    try {
      const res = await fetch('/api/social-networks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNetworks(data);
      }
    } catch (error) {
      console.error('Error fetching social networks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (url: string) => {
    const u = url.toLowerCase();
    if (u.includes('whatsapp')) return <MessageCircle size={24} />;
    if (u.includes('instagram')) return <Instagram size={24} />;
    if (u.includes('facebook')) return <Facebook size={24} />;
    if (u.includes('twitter') || u.includes('x.com')) return <Twitter size={24} />;
    if (u.includes('discord')) return <Share2 size={24} />;
    return <Globe size={24} />;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-black bg-gradient-to-r from-spectra-pink to-spectra-purple bg-clip-text text-transparent">
          REDES SOCIALES
        </h2>
        <p className="text-slate-400">Conéctate con nuestra comunidad en diferentes plataformas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {networks.map((net) => (
          <motion.a
            key={net.id}
            href={net.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="spectra-card group p-6 flex flex-col gap-4 hover:border-spectra-pink/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-spectra-pink/10 text-spectra-pink rounded-2xl group-hover:bg-spectra-pink group-hover:text-white transition-all">
                {getIcon(net.url)}
              </div>
              <ExternalLink size={18} className="text-slate-500 group-hover:text-spectra-pink transition-colors" />
            </div>

            {net.image_url && (
              <img 
                src={net.image_url} 
                alt={net.title} 
                className="w-full h-32 object-cover rounded-xl border border-white/5"
                referrerPolicy="no-referrer"
              />
            )}

            <div>
              <h3 className="text-xl font-bold mb-1">{net.title}</h3>
              <p className="text-slate-400 text-sm line-clamp-2">{net.description}</p>
            </div>

            <div className="mt-auto pt-4 flex items-center gap-2 text-spectra-pink font-bold text-sm">
              <span>UNIRSE AHORA</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ExternalLink size={14} />
              </motion.div>
            </div>
          </motion.a>
        ))}
      </div>

      {!loading && networks.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <Share2 size={48} className="mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-bold text-slate-400">No hay redes configuradas</h3>
          <p className="text-slate-500">Vuelve pronto para ver nuestras redes oficiales.</p>
        </div>
      )}
    </div>
  );
}
