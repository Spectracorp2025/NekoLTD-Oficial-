import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Tag, Package, ExternalLink } from 'lucide-react';
import { useAuth } from './AuthContext';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
}

export default function Store() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setProducts(data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching products:", err);
      setLoading(false);
    });
  }, [token]);

  const handleBuy = (product: Product) => {
    const message = `Hola, me interesa comprar el producto: ${product.title} por un precio de $${product.price}.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/573009555880?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            TIENDA NEKO
          </h2>
          <p className="text-slate-400">Productos exclusivos y servicios premium.</p>
        </div>
        <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
          <ShoppingCart className="text-emerald-400" size={24} />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/10 p-12 rounded-3xl text-center">
          <Package size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No hay productos disponibles</h3>
          <p className="text-slate-500">Vuelve más tarde para ver nuevas ofertas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden group"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={product.image_url || "https://picsum.photos/seed/product/800/600"} 
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-1 rounded-full font-black shadow-lg">
                  ${product.price}
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mt-2">
                    {product.description}
                  </p>
                </div>

                <button
                  onClick={() => handleBuy(product)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20"
                >
                  <ExternalLink size={20} />
                  COMPRAR AHORA
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
