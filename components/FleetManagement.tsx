
import React, { useState } from 'react';
import { AppScreen, Vehicle } from '../types';
import { CostCenter } from '../App';

interface FleetManagementProps {
  onBack: () => void;
  onAction?: (screen: AppScreen) => void;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  costCenters: CostCenter[];
}

const FleetManagement: React.FC<FleetManagementProps> = ({ onBack, onAction, vehicles, setVehicles, costCenters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isCustomType, setIsCustomType] = useState(false);

  const vehicleTypes = ['Carro Leve', 'Moto', 'Ambulância'];

  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    type: 'Carro Leve',
    km: '',
    lastPreventiveKm: '',
    year: '',
    status: 'ACTIVE' as 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE',
    costCenter: costCenters.length > 0 ? `${costCenters[0].id} - ${costCenters[0].name}` : '',
    responsibleEmail: ''
  });

  const filteredVehicles = vehicles.filter(v =>
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setFormData({
      plate: '',
      model: '',
      type: 'Carro Leve',
      km: '',
      lastPreventiveKm: '',
      year: '',
      status: 'ACTIVE',
      costCenter: costCenters.length > 0 ? `${costCenters[0].id} - ${costCenters[0].name}` : '',
      responsibleEmail: ''
    });
    setIsCustomType(false);
    setIsAdding(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate: vehicle.plate,
      model: vehicle.model,
      type: vehicle.type,
      km: vehicle.km.toString(),
      lastPreventiveKm: vehicle.lastPreventiveKm?.toString() || '',
      year: vehicle.year || '',
      status: vehicle.status,
      costCenter: vehicle.costCenter || (costCenters.length > 0 ? `${costCenters[0].id} - ${costCenters[0].name}` : ''),
      responsibleEmail: vehicle.responsibleEmail || ''
    });
    setIsCustomType(!vehicleTypes.includes(vehicle.type));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      const newVehicle: Vehicle = {
        id: Math.random().toString(36).substr(2, 9),
        plate: formData.plate.toUpperCase(),
        model: formData.model,
        type: formData.type,
        status: formData.status,
        km: parseInt(formData.km) || 0,
        lastPreventiveKm: parseInt(formData.lastPreventiveKm) || undefined,
        year: formData.year,
        costCenter: formData.costCenter,
        responsibleEmail: formData.responsibleEmail
      };
      setVehicles([newVehicle, ...vehicles]);
      setIsAdding(false);
    } else if (editingVehicle) {
      setVehicles(vehicles.map(v =>
        v.id === editingVehicle.id
          ? { ...v, ...formData, plate: formData.plate.toUpperCase(), km: parseInt(formData.km) || 0, lastPreventiveKm: parseInt(formData.lastPreventiveKm) || undefined }
          : v
      ));
      setEditingVehicle(null);
    }
  };

  const handleDelete = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    setShowDeleteConfirm(null);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-accent-success/10 text-accent-success';
      case 'MAINTENANCE': return 'bg-accent-warning/10 text-accent-warning';
      case 'INACTIVE': return 'bg-accent-error/10 text-accent-error';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Operacional';
      case 'MAINTENANCE': return 'Manutenção';
      case 'INACTIVE': return 'Inativo';
      default: return status;
    }
  };

  return (
    <div className="space-y-4 min-h-screen pb-40 relative">
      <div className="p-4 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold mb-4 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span> Voltar
        </button>

        <div className="flex gap-2 text-slate-900 dark:text-white">
          <div className="relative flex-1 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input
              type="text"
              placeholder="Buscar placa ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <button
            onClick={openAddModal}
            className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Resultados ({filteredVehicles.length})</h3>
        </div>

        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl">local_shipping</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight leading-none mb-1 text-slate-900 dark:text-white">{vehicle.plate}</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{vehicle.model} • {vehicle.year}</p>
                    {vehicle.responsibleEmail && (
                      <div className="flex items-center gap-1 mt-1 opacity-70">
                        <span className="material-symbols-outlined text-[10px] text-primary">mail</span>
                        <span className="text-[9px] font-bold truncate max-w-[150px]">{vehicle.responsibleEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditModal(vehicle)} className="size-9 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button onClick={() => setShowDeleteConfirm(vehicle.id)} className="size-9 rounded-lg flex items-center justify-center bg-accent-error/10 text-accent-error active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/30">
                  <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Status Atual</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${getStatusStyle(vehicle.status)}`}>
                    {getStatusLabel(vehicle.status)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/30">
                  <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Quilometragem</p>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                      <span className="material-symbols-outlined text-xs text-primary">speed</span>
                      <span className="text-xs font-black italic">{vehicle.km.toLocaleString()} KM</span>
                    </div>
                    {vehicle.lastPreventiveKm && (
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                        Últ. Preventiva: {vehicle.lastPreventiveKm.toLocaleString()} KM
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(isAdding || editingVehicle) && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-t-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-500 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                {isAdding ? 'Cadastrar Veículo' : 'Editar Veículo'}
              </h3>
              <button onClick={() => { setIsAdding(false); setEditingVehicle(null); }} className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-slate-900 dark:text-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Placa</label>
                  <input required type="text" placeholder="ABC-1234" value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Ano</label>
                  <input type="text" placeholder="2024" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Modelo / Marca</label>
                <input required type="text" placeholder="Ex: Scania R450" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">E-mail do Responsável</label>
                <input
                  type="email"
                  placeholder="responsavel@empresa.com.br"
                  value={formData.responsibleEmail}
                  onChange={(e) => setFormData({ ...formData, responsibleEmail: e.target.value })}
                  className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Centro de Custo Responsável</label>
                <div className="relative">
                  <select value={formData.costCenter} onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary appearance-none">
                    {costCenters.length > 0 ? costCenters.map(cc => (
                      <option key={cc.id} value={`${cc.id} - ${cc.name}`}>{cc.id} - {cc.name}</option>
                    )) : (
                      <option value="">Nenhum centro cadastrado</option>
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">expand_more</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Tipo de Veículo</label>
                  {!isCustomType ? (
                    <div className="relative">
                      <select
                        value={formData.type}
                        onChange={(e) => {
                          if (e.target.value === 'OUTRO') {
                            setIsCustomType(true);
                            setFormData({ ...formData, type: '' });
                          } else {
                            setFormData({ ...formData, type: e.target.value });
                          }
                        }}
                        className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary appearance-none"
                      >
                        {vehicleTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                        <option value="OUTRO">Outro...</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">expand_more</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Digite o tipo..."
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 pr-12 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomType(false);
                          setFormData({ ...formData, type: vehicleTypes[0] });
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center text-slate-400 hover:text-primary active:scale-90 transition-all"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">KM Atual</label>
                  <input required type="number" placeholder="0" value={formData.km} onChange={(e) => setFormData({ ...formData, km: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-mono outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => { setIsAdding(false); setEditingVehicle(null); }} className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-2xl uppercase tracking-widest text-[11px]">CANCELAR</button>
                <button type="submit" className="flex-1 h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 uppercase tracking-widest text-[11px]">{isAdding ? 'CADASTRAR' : 'SALVAR'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark rounded-3xl p-8 w-full max-w-xs text-center space-y-6 shadow-2xl">
            <div className="size-20 bg-accent-error/10 text-accent-error rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <div>
              <h3 className="text-lg font-black uppercase italic mb-2">Excluir Veículo?</h3>
              <p className="text-xs text-slate-500 font-medium">Esta ação removerá permanentemente o veículo da frota.</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleDelete(showDeleteConfirm)} className="w-full h-14 bg-accent-error text-white font-black rounded-2xl uppercase tracking-widest">Sim, Remover</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="w-full h-12 text-slate-400 font-bold uppercase text-[10px]">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetManagement;
