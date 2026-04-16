import { Info, Server, User, Globe } from 'lucide-react';

export default function InfoSection() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-spectra-pink/20 rounded-2xl text-spectra-pink">
          <Info size={32} />
        </div>
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-spectra-pink to-spectra-purple bg-clip-text text-transparent">
            INFORMACIÓN SPECTRA
          </h2>
          <p className="text-slate-400">Estado actual de la colaboración Spectra x DDLC</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="spectra-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Server className="text-spectra-green" size={20} />
            <h3 className="font-bold text-spectra-green">Estado de Servidores</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Servidor Principal</span>
              <span className="text-spectra-green font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Base de Datos</span>
              <span className="text-spectra-green font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sincronización Spectra</span>
              <span className="text-spectra-green font-bold">ACTIVA</span>
            </div>
          </div>
        </div>

        <div className="spectra-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-spectra-purple" size={20} />
            <h3 className="font-bold text-spectra-purple">Administración</h3>
          </div>
          <div className="space-y-2">
            <p className="text-slate-400 text-sm">Fundador: <span className="text-slate-100 font-bold">Fumiko</span></p>
            <p className="text-slate-400 text-sm">Versión: <span className="text-spectra-pink font-black">3.0.0 SPECTRA</span></p>
            <p className="text-slate-400 text-sm">Ubicación: <span className="text-slate-100 font-bold">Neko World x DDLC</span></p>
          </div>
        </div>
      </div>

      <div className="bg-spectra-pink/10 border border-spectra-pink/30 p-8 rounded-3xl text-center backdrop-blur-sm">
        <Globe className="mx-auto text-spectra-pink mb-4" size={48} />
        <h3 className="text-2xl font-black text-spectra-pink mb-2">Nuestra Misión</h3>
        <p className="text-slate-300 max-w-2xl mx-auto font-medium">
          Proveer un espacio seguro y mágico inspirado en el Club de Literatura, donde cada usuario pueda escribir su propia historia y disfrutar de la mejor selección de contenido digital.
        </p>
      </div>
    </div>
  );
}
