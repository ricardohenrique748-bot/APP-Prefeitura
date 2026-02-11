import React, { useState, useRef } from 'react';
import { Vehicle, Supplier, FuelEntryData } from '../types';

interface FuelEntryProps {
  onBack: () => void;
  onSave: (entry: FuelEntryData) => void;
  vehicles: Vehicle[];
  suppliers: Supplier[];
  userCostCenter?: string;
}

const FuelEntry: React.FC<FuelEntryProps> = ({ onBack, onSave, vehicles, suppliers, userCostCenter }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null);

  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE');
  // Ensure suppliers array is valid and filter for gas stations
  const gasStations = (suppliers || []).filter(s => s && (s.category === 'COMBUSTÍVEL' || s.category === 'Posto'));

  const [formData, setFormData] = useState({
    driver: 'RICARDO LUZ',
    date: new Date().toISOString().slice(0, 16),
    plate: activeVehicles.length > 0 ? activeVehicles[0].plate : '',
    costCenter: userCostCenter || (activeVehicles.length > 0 ? (activeVehicles[0].costCenter || '101 - Colheita') : '101 - Colheita'),
    item: 'Diesel S10',
    quantity: '',
    unitPrice: '',
    km: '',
    supplier: ''
  });

  const handlePlateChange = (plate: string) => {
    const vehicle = activeVehicles.find(v => v.plate === plate);
    setFormData({
      ...formData,
      plate,
      // Se o usuário tem um CC fixo, mantém ele. Se não, pega o do veículo.
      costCenter: userCostCenter || (vehicle?.costCenter || formData.costCenter)
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoicePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateTotal = () => {
    const qty = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.unitPrice) || 0;
    return (qty * price).toFixed(2);
  };

  const handleSave = () => {
    if (!formData.plate) return alert("Selecione um veículo.");
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) return alert("Informe uma quantidade válida.");
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) return alert("Informe o valor unitário.");
    // Optional: if (!formData.supplier) return alert("Selecione o posto."); 

    setLoading(true);
    const qty = parseFloat(formData.quantity);
    const price = parseFloat(formData.unitPrice);

    const newEntry: FuelEntryData = {
      id: `FUEL-${Date.now()}`,
      plate: formData.plate,
      driver: formData.driver,
      date: formData.date.replace('T', ' '),
      costCenter: formData.costCenter,
      item: formData.item,
      quantity: qty,
      unitPrice: price,
      totalValue: qty * price,
      invoiceUrl: invoicePreview || undefined,
      supplier: formData.supplier
    };

    setTimeout(() => {
      onSave(newEntry);
      setLoading(false);
      onBack();
    }, 800);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black italic tracking-tighter uppercase">Lançar Abastecimento</h2>
      </div>

      <section className="bg-white dark:bg-card-dark rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">

        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Placa do Veículo</span>
            <div className="relative">
              <select
                value={formData.plate}
                onChange={(e) => handlePlateChange(e.target.value)}
                className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 px-4 font-black italic outline-none appearance-none focus:ring-2 focus:ring-primary"
              >
                {activeVehicles.length > 0 ? (
                  activeVehicles.map(v => (
                    <option key={v.id} value={v.plate}>{v.plate} - {v.model}</option>
                  ))
                ) : (
                  <option value="">Nenhum veículo ativo</option>
                )}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Posto / Fornecedor</span>
            <div className="relative">
              <select
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 px-4 font-bold outline-none appearance-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione o Posto...</option>
                {gasStations.map(s => (
                  <option key={s.id} value={s.id + ' - ' + s.name}>{s.name}</option>
                ))}
                <option value="OUTRO">Outro / Não Cadastrado</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
            </div>
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="block space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">KM Atual</span>
              <input
                type="number"
                value={formData.km}
                onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                placeholder="0"
                className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 px-3 outline-none font-mono font-bold text-sm focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Litros</span>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0.00"
                className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 px-3 outline-none font-mono font-black text-sm focus:ring-2 focus:ring-primary"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Valor Unit.</span>
              <input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                placeholder="0.00"
                className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 px-3 outline-none font-mono font-black text-sm text-primary focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Tipo de Combustível</span>
            <div className="relative">
              <select
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 px-4 outline-none appearance-none font-bold focus:ring-2 focus:ring-primary"
              >
                <option>Diesel S10</option>
                <option>Diesel S500</option>
                <option>Gasolina Comum</option>
                <option>Etanol (Álcool)</option>
                <option>Arla 32</option>
                <option>Lubrificante Motor</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
            </div>
          </label>

          <div className="bg-slate-50 dark:bg-background-dark rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total do Lançamento</p>
              <p className="text-xl font-black italic text-accent-success">R$ {calculateTotal()}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Centro de Custo</p>
              <p className="text-[10px] font-black uppercase text-slate-500">{formData.costCenter}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Comprovação Fiscal (Opcional)</p>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={cameraInputRef}
            onChange={handleFileChange}
          />

          {!invoicePreview ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-3xl">photo_camera</span>
                <span className="text-[10px] font-bold uppercase tracking-widest italic">Usar Câmera</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-3xl">upload_file</span>
                <span className="text-[10px] font-bold uppercase tracking-widest italic">Carregar PDF</span>
              </button>
            </div>
          ) : (
            <div className="relative w-full h-24 rounded-2xl overflow-hidden border-2 border-primary/30 bg-primary/5 flex items-center justify-between px-6 group">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-white rounded-xl flex items-center justify-center text-accent-error shadow-sm">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">Arquivo Anexado</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pronto para envio</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setInvoicePreview(null)}
                  className="size-8 bg-accent-error/10 text-accent-error rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={loading || activeVehicles.length === 0}
          className="w-full h-20 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest text-base italic"
        >
          {loading ? (
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined text-3xl">local_gas_station</span>
              SALVAR ABASTECIMENTO
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FuelEntry;
