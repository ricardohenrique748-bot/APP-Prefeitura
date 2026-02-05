
import React, { useState, useRef, useEffect } from 'react';
import { Vehicle } from '../types';
import { supabase } from '../services/supabase';

interface TireRegistration {
  id: string;
  position: string;
  life_percentage: number;
  observation: string;
  image_url: string;
  created_at: string;
  plate: string;
  km_at_registration: number;
}

interface TireBulletinProps {
  onBack: () => void;
  vehicles: Vehicle[];
  isAdmin?: boolean;
}

const TireBulletin: React.FC<TireBulletinProps> = ({ onBack, vehicles, isAdmin = false }) => {
  const [selectedPlate, setSelectedPlate] = useState(vehicles[0]?.plate || '');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [registrations, setRegistrations] = useState<TireRegistration[]>([]);

  const [formData, setFormData] = useState({
    position: 'DE',
    life: '50',
    obs: '',
    plate: vehicles[0]?.plate || '',
    date: new Date().toISOString().split('T')[0],
    km: vehicles[0]?.km.toString() || ''
  });

  useEffect(() => {
    fetchRegistrations();
  }, [selectedPlate]);

  const fetchRegistrations = async () => {
    if (!selectedPlate) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tire_registrations')
        .select('*')
        .eq('plate', selectedPlate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setRegistrations(data);
    } catch (error) {
      console.error("Erro ao carregar registros de pneus:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewUrl) {
      alert("Por favor, anexe uma foto da evidência.");
      return;
    }

    setLoading(true);
    try {
      // Nota: Em um app real, faríamos upload da imagem para o Supabase Storage primeiro.
      // Por agora, usaremos a URL temporária ou uma mock se necessário, mas vamos tentar simular persistência.
      const { error } = await supabase.from('tire_registrations').insert([{
        plate: formData.plate,
        position: getPositionLabel(formData.position),
        life_percentage: parseInt(formData.life),
        observation: formData.obs,
        image_url: previewUrl, // Idealmente vindo do storage
        km_at_registration: parseInt(formData.km)
      }]);

      if (error) throw error;

      setIsAdding(false);
      setPreviewUrl(null);
      fetchRegistrations();

      setFormData({
        position: 'DE',
        life: '50',
        obs: '',
        plate: selectedPlate || vehicles[0]?.plate || '',
        date: new Date().toISOString().split('T')[0],
        km: vehicles.find(v => v.plate === (selectedPlate || vehicles[0]?.plate))?.km.toString() || ''
      });
    } catch (error) {
      console.error("Erro ao salvar registro de pneu:", error);
      alert("Erro ao salvar registro.");
    } finally {
      setLoading(false);
    }
  };

  const getLifeColor = (life: number) => {
    if (life <= 20) return 'text-accent-error';
    if (life <= 50) return 'text-accent-warning';
    return 'text-accent-success';
  };

  // Helper to get latest life for a position
  const getLatestLife = (pos: string) => {
    const label = getPositionLabel(pos);
    const last = registrations.find(r => r.position === label);
    return last ? last.life_percentage : 100;
  };

  return (
    <div className="p-4 space-y-6 pb-24 relative">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h3 className="text-xl font-bold font-display">Boletim de Pneus</h3>
            <p className="text-slate-500 text-sm">Smart Tech • Gestão de Frotas</p>
          </div>
        </div>
        {isAdmin && (
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
        )}
      </div>

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

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'KM Atual', val: vehicles.find(v => v.plate === selectedPlate)?.km.toLocaleString('pt-BR') || '---' },
          { label: 'Média Vida', val: registrations.length > 0 ? (registrations.reduce((acc, r) => acc + r.life_percentage, 0) / registrations.length).toFixed(0) + '%' : '100%' },
          { label: 'Alertas', val: `${registrations.filter(r => r.life_percentage <= 20).length} Crítico`, color: 'text-accent-error' }
        ].map((stat, i) => (
          <div key={i} className="p-3 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-slate-500">{stat.label}</p>
            <p className={`text-base font-bold ${stat.color || ''}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center px-1">Visualização do Veículo: <span className="text-primary">{selectedPlate}</span></h3>
        <div className="flex justify-center">
          <div className="relative w-60 h-80 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[2.5rem] flex flex-col justify-around p-8 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex justify-between w-full">
              <TireNode pos="DE" life={getLatestLife('DE')} color={getLatestLife('DE') <= 20 ? 'bg-accent-error' : getLatestLife('DE') <= 50 ? 'bg-accent-warning' : 'bg-accent-success'} side="top" />
              <TireNode pos="DD" life={getLatestLife('DD')} color={getLatestLife('DD') <= 20 ? 'bg-accent-error' : getLatestLife('DD') <= 50 ? 'bg-accent-warning' : 'bg-accent-success'} side="top" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-3/4 bg-slate-200 dark:bg-slate-800 rounded-full opacity-50"></div>
            <div className="flex justify-between w-full">
              <TireNode pos="TE" life={getLatestLife('TE')} color={getLatestLife('TE') <= 20 ? 'bg-accent-error' : getLatestLife('TE') <= 50 ? 'bg-accent-warning' : 'bg-accent-success'} side="bottom" />
              <TireNode pos="TD" life={getLatestLife('TD')} color={getLatestLife('TD') <= 20 ? 'bg-accent-error' : getLatestLife('TD') <= 50 ? 'bg-accent-warning' : 'bg-accent-success'} side="bottom" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-20 h-10 bg-accent-primary/80 rounded-lg flex items-center justify-center border-2 border-white/20 shadow-lg bg-emerald-500">
              <span className="text-[9px] font-black text-white uppercase">{getLatestLife('ES')}% ESTEPE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Evidências e Histórico ({registrations.length})</h3>

        {loading && registrations.length === 0 ? (
          <div className="py-10 flex flex-col items-center opacity-40">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-[9px] font-black uppercase tracking-widest">Carregando Histórico...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {registrations.map((reg) => (
              <div key={reg.id} className="bg-white dark:bg-card-dark rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div
                  className="aspect-square rounded-xl bg-cover bg-center mb-3 border border-slate-100 dark:border-slate-700/50 bg-slate-100"
                  style={{ backgroundImage: reg.image_url ? `url(${reg.image_url})` : 'none' }}
                >
                  {!reg.image_url && <div className="w-full h-full flex items-center justify-center text-slate-300"><span className="material-symbols-outlined text-4xl">no_photography</span></div>}
                </div>
                <h4 className="font-bold text-sm truncate">{reg.position}</h4>
                <p className={`text-xs font-black ${getLifeColor(reg.life_percentage)}`}>Vida: {reg.life_percentage}%</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter truncate max-w-[60px]">{reg.observation || 'S/ Obs'}</p>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 font-bold">{reg.km_at_registration} KM</p>
                    <p className="text-[9px] text-slate-500">{new Date(reg.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {registrations.length === 0 && !loading && (
          <div className="text-center py-8 opacity-30">
            <span className="material-symbols-outlined text-4xl">inventory_2</span>
            <p className="text-xs font-bold uppercase tracking-widest mt-2">Nenhuma evidência registrada</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-t-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 shadow-2xl overflow-y-auto max-h-[95vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Registrar Pneu</h3>
              <button
                disabled={loading}
                onClick={() => { setIsAdding(false); setPreviewUrl(null); }}
                className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform active:scale-90"
              >
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">KM Atual</label>
                  <input
                    type="number"
                    value={formData.km}
                    onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                    className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Ex: 120500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Vida Útil (%)</label>
                  <input
                    type="number"
                    required
                    max="100"
                    min="0"
                    value={formData.life}
                    onChange={(e) => setFormData({ ...formData, life: e.target.value })}
                    className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Posição / Local</label>
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Observações</label>
                <textarea
                  value={formData.obs}
                  onChange={(e) => setFormData({ ...formData, obs: e.target.value })}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 p-4 text-sm outline-none focus:ring-2 focus:ring-primary h-20 transition-all"
                  placeholder="Ex: Troca preventiva, furo reparado..."
                ></textarea>
              </div>

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
                  className="w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 active:bg-slate-50 dark:active:bg-slate-800/50 transition-all group"
                >
                  <span className="material-symbols-outlined text-3xl group-active:scale-110 transition-transform">add_a_photo</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider">Foto da Evidência</span>
                </button>
              ) : (
                <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-primary shadow-md group">
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(null)}
                    className="absolute top-2 right-2 size-8 bg-accent-error text-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? '...PROCESSANDO' : (
                    <>
                      <span className="material-symbols-outlined text-base">save</span>
                      SALVAR REGISTRO
                    </>
                  )}
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
  <div className={`w-14 h-20 ${color} rounded-lg border-2 border-white/20 shadow-xl flex flex-col items-center justify-center relative ${ring ? 'ring-4 ring-accent-error/30 ring-offset-2 ring-offset-background-dark' : ''}`}>
    <span className="text-[10px] font-black text-white/50 mb-0.5">{pos}</span>
    <span className="text-xs font-black text-white">{life}%</span>
    <div className={`absolute left-0 right-0 text-center text-slate-400 text-[10px] font-bold ${side === 'top' ? '-top-6' : '-bottom-6'}`}>
    </div>
  </div>
);

export default TireBulletin;
