
import React, { useState, useRef } from 'react';
import { Vehicle } from '../types';

interface TireRegistration {
  id: string;
  position: string;
  life: number;
  obs: string;
  imageUrl: string;
  date: string;
  ref: string;
  plate: string;
  km: string;
}

interface TireBulletinProps {
  onBack: () => void;
  vehicles: Vehicle[];
}

const TireBulletin: React.FC<TireBulletinProps> = ({ onBack, vehicles }) => {
  const [selectedPlate, setSelectedPlate] = useState(vehicles[0]?.plate || '');
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [registrations, setRegistrations] = useState<TireRegistration[]>([
    {
      id: '1',
      position: 'Traseiro Dir. (TD)',
      life: 15,
      obs: 'Necessita troca urgente',
      imageUrl: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400&h=400&fit=crop',
      date: '25/10/2023',
      ref: 'MI-9022-X',
      plate: 'FLT-9021',
      km: '120.500'
    },
    {
      id: '2',
      position: 'Estepe (ES)',
      life: 100,
      obs: 'Novo, nunca usado',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop',
      date: '24/10/2023',
      ref: 'BR-1020-N',
      plate: 'BRA-2E19',
      km: '85.000'
    }
  ]);

  const [formData, setFormData] = useState({
    position: 'DE',
    life: '50',
    obs: '',
    plate: vehicles[0]?.plate || '',
    date: new Date().toISOString().split('T')[0],
    km: vehicles[0]?.km.toString() || ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const getPositionLabel = (pos: string) => {
    const labels: Record<string, string> = {
      'DE': 'Dianteiro Esq.',
      'DD': 'Dianteiro Dir.',
      'TE': 'Traseiro Esq.',
      'TD': 'Traseiro Dir.',
      'ES': 'Estepe'
    };
    return `${labels[pos] || pos} (${pos})`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewUrl) {
      alert("Por favor, anexe uma foto da evidência.");
      return;
    }

    const newReg: TireRegistration = {
      id: Math.random().toString(36).substr(2, 9),
      position: getPositionLabel(formData.position),
      life: parseInt(formData.life),
      obs: formData.obs,
      imageUrl: previewUrl,
      date: new Date(formData.date).toLocaleDateString('pt-BR'),
      ref: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
      plate: formData.plate,
      km: formData.km
    };

    setRegistrations([newReg, ...registrations]);
    setIsAdding(false);
    setPreviewUrl(null);
    setFormData({
      position: 'DE',
      life: '50',
      obs: '',
      plate: selectedPlate || vehicles[0]?.plate || '',
      date: new Date().toISOString().split('T')[0],
      km: vehicles.find(v => v.plate === (selectedPlate || vehicles[0]?.plate))?.km.toString() || ''
    });
  };

  const getLifeColor = (life: number) => {
    if (life <= 20) return 'text-accent-error';
    if (life <= 50) return 'text-accent-warning';
    return 'text-accent-success';
  };

  return (
    <div className="p-4 space-y-6 pb-24 relative">
      {/* Header Info */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h3 className="text-xl font-bold font-display">Boletim de Pneus</h3>
            <p className="text-slate-500 text-sm">Controle de Vida Útil e Evidências</p>
          </div>
        </div>
        <button
          onClick={() => {
            const v = vehicles.find(v => v.plate === selectedPlate);
            setFormData(prev => ({ ...prev, plate: selectedPlate, km: v?.km.toString() || '' }));
            setIsAdding(true);
          }}
          className="bg-primary text-white size-12 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined">add_task</span>
        </button>
      </div>

      {/* Plate Selector "ABA" */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
        {vehicles.map(v => (
          <button
            key={v.id}
            onClick={() => setSelectedPlate(v.plate)}
            className={`flex-none px-4 py-2 rounded-full text-xs font-bold transition-all border ${selectedPlate === v.plate
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                : 'bg-white dark:bg-card-dark text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
          >
            {v.plate}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'KM Atual', val: vehicles.find(v => v.plate === selectedPlate)?.km.toLocaleString('pt-BR') || '---' },
          { label: 'Média Vida', val: '55%' },
          { label: 'Alertas', val: `${registrations.filter(r => r.plate === selectedPlate && r.life <= 20).length} Crítico`, color: 'text-accent-error' }
        ].map((stat, i) => (
          <div key={i} className="p-3 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-slate-500">{stat.label}</p>
            <p className={`text-base font-bold ${stat.color || ''}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Schematic Visualization */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center px-1">Visualização do Veículo: <span className="text-primary">{selectedPlate}</span></h3>
        <div className="flex justify-center">
          <div className="relative w-60 h-80 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[2.5rem] flex flex-col justify-around p-8 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex justify-between w-full">
              <TireNode pos="DE" life={80} color="bg-accent-success" side="top" />
              <TireNode pos="DD" life={75} color="bg-accent-success" side="top" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-3/4 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50"></div>
            <div className="flex justify-between w-full">
              <TireNode pos="TE" life={30} color="bg-accent-warning" side="bottom" />
              <TireNode pos="TD" life={15} color="bg-accent-error" side="bottom" ring={true} />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-20 h-10 bg-accent-success/80 rounded-lg flex items-center justify-center border-2 border-white/20 shadow-lg">
              <span className="text-[9px] font-black text-white uppercase">ESTEPE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Status / Evidences */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Evidências e Histórico ({registrations.filter(r => r.plate === selectedPlate).length})</h3>
        <div className="grid grid-cols-2 gap-4">
          {registrations
            .filter(r => r.plate === selectedPlate)
            .map((reg) => (
              <div key={reg.id} className="bg-white dark:bg-card-dark rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div
                  className="aspect-square rounded-xl bg-cover bg-center mb-3 border border-slate-100 dark:border-slate-700/50"
                  style={{ backgroundImage: `url(${reg.imageUrl})` }}
                ></div>
                <h4 className="font-bold text-sm truncate">{reg.position}</h4>
                <p className={`text-xs font-black ${getLifeColor(reg.life)}`}>Vida: {reg.life}%</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Ref: {reg.ref}</p>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 font-bold">{reg.km} KM</p>
                    <p className="text-[9px] text-slate-500">{reg.date}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {registrations.filter(r => r.plate === selectedPlate).length === 0 && (
          <div className="text-center py-8 opacity-30">
            <span className="material-symbols-outlined text-4xl">inventory_2</span>
            <p className="text-xs font-bold uppercase tracking-widest mt-2">Nenhuma evidência registrada</p>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-t-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 shadow-2xl overflow-y-auto max-h-[95vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Registrar Pneu</h3>
              <button onClick={() => { setIsAdding(false); setPreviewUrl(null); }} className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform active:scale-90">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Veículo (Placa)</label>
                <select
                  value={formData.plate}
                  onChange={(e) => {
                    const plate = e.target.value;
                    const v = vehicles.find(v => v.plate === plate);
                    setFormData({ ...formData, plate, km: v?.km.toString() || '' });
                  }}
                  className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary appearance-none transition-all"
                >
                  <option value="">Selecione uma placa</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.plate}>{v.plate} - {v.model}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Data da Atualização</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">KM Rodado</label>
                  <input
                    type="number"
                    value={formData.km}
                    onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                    className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Ex: 120500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Posição</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary appearance-none transition-all"
                  >
                    <option value="DE">Dianteiro Esq.</option>
                    <option value="DD">Dianteiro Dir.</option>
                    <option value="TE">Traseiro Esq.</option>
                    <option value="TD">Traseiro Dir.</option>
                    <option value="ES">Estepe</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Vida Útil (%)</label>
                  <input
                    type="number"
                    required
                    value={formData.life}
                    onChange={(e) => setFormData({ ...formData, life: e.target.value })}
                    className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Observações / Motivo</label>
                <textarea
                  value={formData.obs}
                  onChange={(e) => setFormData({ ...formData, obs: e.target.value })}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 p-4 text-sm outline-none focus:ring-2 focus:ring-primary h-24 transition-all"
                  placeholder="Ex: Pneu recapeado, corte lateral..."
                ></textarea>
              </div>

              {/* Photo Upload Section */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              {!previewUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 active:bg-slate-50 dark:active:bg-slate-800/50 transition-all group"
                >
                  <span className="material-symbols-outlined text-4xl group-active:scale-110 transition-transform">add_a_photo</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Capturar Foto do Pneu</span>
                </button>
              ) : (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-primary shadow-xl group">
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-xs uppercase"
                    >
                      Trocar Foto
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); }}
                    className="absolute top-3 right-3 size-10 bg-accent-error text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-widest text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined">save</span>
                  SALVAR REGISTRO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TireNode: React.FC<{ pos: string, life: number, color: string, side: 'top' | 'bottom', ring?: boolean }> = ({ pos, life, color, side, ring }) => (
  <div className={`w-14 h-20 ${color} rounded-lg border-2 border-white/20 shadow-xl flex items-center justify-center relative ${ring ? 'ring-4 ring-accent-error/30 ring-offset-2 ring-offset-background-dark' : ''}`}>
    <span className="text-xs font-black text-white">{life}%</span>
    <div className={`absolute left-0 right-0 text-center text-slate-400 text-[10px] font-bold ${side === 'top' ? '-top-6' : '-bottom-6'}`}>
      {pos}
    </div>
  </div>
);

export default TireBulletin;
