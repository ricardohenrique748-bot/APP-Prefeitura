
import React, { useState } from 'react';
import { Vehicle, CostCenter, AppScreen } from '../types';
import { supabase } from '../services/supabaseClient';

interface FleetManagementProps {
  onBack: () => void;
  onAction?: (screen: AppScreen) => void;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  costCenters: CostCenter[];
  isAdmin?: boolean;
}

const FleetManagement: React.FC<FleetManagementProps> = ({ onBack, onAction, vehicles, setVehicles, costCenters, isAdmin = false }) => {
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
    responsibleEmail: '',
    chassi: '',
    renavam: '',
    cnpj: '',
    sector: '',
    responsibleName: ''
  });

  // Helper para determinar o intervalo de preventiva por tipo
  const getPreventiveInterval = (type: string) => {
    switch (type) {
      case 'Moto': return 1000;
      case 'Carro Leve':
      case 'Ambulância':
        return 10000;
      default: return 10000; // Padrão para Caminhões e outros
    }
  };

  // Cálculo de Alertas de Preventiva
  const maintenanceAlerts = vehicles.map(v => {
    const interval = getPreventiveInterval(v.type);
    const lastKm = v.lastPreventiveKm || 0;
    const kmSinceLast = v.km - lastKm;
    const remaining = interval - kmSinceLast;
    const warningThreshold = v.type === 'Moto' ? 200 : 1000;

    if (remaining <= warningThreshold) {
      return {
        ...v,
        maintenanceStatus: remaining <= 0 ? 'OVERDUE' : 'WARNING',
        remainingKm: remaining,
        kmSinceLast,
        interval
      };
    }
    return null;
  }).filter((v): v is NonNullable<typeof v> & { maintenanceStatus: string, remainingKm: number, kmSinceLast: number, interval: number } => v !== null);

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
      responsibleEmail: '',
      chassi: '',
      renavam: '',
      cnpj: '',
      sector: '',
      responsibleName: ''
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
      responsibleEmail: vehicle.responsibleEmail || '',
      chassi: vehicle.chassi || '',
      renavam: vehicle.renavam || '',
      cnpj: vehicle.cnpj || '',
      sector: vehicle.sector || '',
      responsibleName: vehicle.responsibleName || ''
    });
    setIsCustomType(!vehicleTypes.includes(vehicle.type));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const vehicleData = {
      plate: formData.plate.toUpperCase(),
      model: formData.model,
      type: formData.type,
      status: formData.status,
      km: parseInt(formData.km) || 0,
      last_preventive_km: parseInt(formData.lastPreventiveKm) || 0,
      cost_center: formData.costCenter,
      year: formData.year,
      chassi: formData.chassi,
      renavam: formData.renavam,
      cnpj: formData.cnpj,
      sector: formData.sector,
      responsible_name: formData.responsibleName
    };

    if (isAdding) {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select();

      if (error) {
        console.error("Erro ao cadastrar veículo:", error);
        alert("Erro ao cadastrar no banco de dados.");
        return;
      }

      if (data && data[0]) {
        const newVehicle: Vehicle = {
          id: data[0].id,
          plate: data[0].plate,
          model: data[0].model,
          type: data[0].type,
          status: data[0].status,
          km: data[0].km,
          lastPreventiveKm: data[0].last_preventive_km,
          costCenter: data[0].cost_center,
          year: data[0].year,
          responsibleEmail: formData.responsibleEmail,
          chassi: data[0].chassi,
          renavam: data[0].renavam,
          cnpj: data[0].cnpj,
          sector: data[0].sector,
          responsibleName: data[0].responsible_name
        };
        setVehicles([newVehicle, ...vehicles]);
      }
      setIsAdding(false);
    } else if (editingVehicle) {
      const { error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', editingVehicle.id);

      if (error) {
        console.error("Erro ao atualizar veículo:", error);
        alert("Erro ao atualizar no banco de dados.");
        return;
      }

      setVehicles(vehicles.map(v =>
        v.id === editingVehicle.id
          ? {
            ...v,
            ...formData,
            plate: formData.plate.toUpperCase(),
            km: parseInt(formData.km) || 0,
            lastPreventiveKm: parseInt(formData.lastPreventiveKm) || undefined,
            responsibleName: formData.responsibleName,
            chassi: formData.chassi,
            renavam: formData.renavam,
            cnpj: formData.cnpj,
            sector: formData.sector
          }
          : v
      ));
      setEditingVehicle(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Erro ao deletar veículo:", error);
        alert(`Erro ao excluir: ${error.message}`);
        return;
      }

      setVehicles(prev => prev.filter(v => v.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
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
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Alertas de Preventiva */}
        {maintenanceAlerts.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-amber-500 animate-pulse text-lg">warning</span>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-[#5c6d8c]">Alertas de Preventiva</h2>
            </div>
            <div className="grid gap-3">
              {maintenanceAlerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-xl border-l-[6px] shadow-sm bg-white dark:bg-card-dark border dark:border-slate-800 ${alert.maintenanceStatus === 'OVERDUE' ? 'border-l-accent-error' : 'border-l-amber-400'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-black italic text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">{alert.plate}</h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{alert.model}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white ${alert.maintenanceStatus === 'OVERDUE' ? 'bg-accent-error' : 'bg-amber-400'}`}>
                      {alert.maintenanceStatus === 'OVERDUE' ? 'VENCIDA' : 'PRÓXIMA'}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {alert.maintenanceStatus === 'OVERDUE'
                        ? <span>Passou <span className="text-accent-error font-black">{Math.abs(alert.remainingKm).toLocaleString()} km</span></span>
                        : <span>Faltam <span className="text-amber-500 font-black">{alert.remainingKm.toLocaleString()} km</span></span>
                      }
                    </p>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Ref: {alert.lastPreventiveKm?.toLocaleString()}km</p>
                  </div>
                  <div className="mt-2 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${alert.maintenanceStatus === 'OVERDUE' ? 'bg-accent-error' : 'bg-amber-400'}`}
                      style={{ width: `${Math.min(100, (alert.kmSinceLast / alert.interval) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                    {(vehicle.responsibleEmail || vehicle.responsibleName) && (
                      <div className="flex flex-col gap-0.5 mt-1 opacity-70">
                        {vehicle.responsibleName && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px] text-primary">person</span>
                            <span className="text-[9px] font-bold truncate max-w-[150px]">{vehicle.responsibleName}</span>
                          </div>
                        )}
                        {vehicle.responsibleEmail && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px] text-primary">mail</span>
                            <span className="text-[9px] font-bold truncate max-w-[150px]">{vehicle.responsibleEmail}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(vehicle)} className="size-9 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary active:scale-90 transition-all">
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button onClick={() => setShowDeleteConfirm(vehicle.id)} className="size-9 rounded-lg flex items-center justify-center bg-accent-error/10 text-accent-error active:scale-90 transition-all">
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div
                  onClick={() => openEditModal(vehicle)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/30 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group/status"
                >
                  <p className="text-[9px] uppercase font-bold text-slate-400 mb-1 group-hover/status:text-primary transition-colors">Status Atual</p>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Chassi</label>
                  <input type="text" placeholder="Chassi..." value={formData.chassi} onChange={(e) => setFormData({ ...formData, chassi: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Renavam</label>
                  <input type="text" placeholder="Renavam..." value={formData.renavam} onChange={(e) => setFormData({ ...formData, renavam: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">CNPJ do Veículo</label>
                  <input type="text" placeholder="CNPJ..." value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Setor</label>
                  <input type="text" placeholder="Ex: BOLSA" value={formData.sector} onChange={(e) => setFormData({ ...formData, sector: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Nome do Responsável</label>
                <input type="text" placeholder="Nome do motorista/responsável" value={formData.responsibleName} onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary" />
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
                    {costCenters.map(cc => (
                      <option key={cc.id} value={`${cc.id} - ${cc.name}`}>{cc.id} - {cc.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">expand_more</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Situação / Status</label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary appearance-none"
                    >
                      <option value="ACTIVE">Operacional</option>
                      <option value="MAINTENANCE">Manutenção</option>
                      <option value="INACTIVE">Inativo</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">expand_more</span>
                  </div>
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">KM Atual</label>
                  <input required type="number" placeholder="0" value={formData.km} onChange={(e) => setFormData({ ...formData, km: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-mono outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Últ. Preventiva (KM)</label>
                  <input type="number" placeholder="0" value={formData.lastPreventiveKm} onChange={(e) => setFormData({ ...formData, lastPreventiveKm: e.target.value })} className="w-full h-14 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-2xl px-4 text-sm font-mono outline-none focus:ring-2 focus:ring-primary" />
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
