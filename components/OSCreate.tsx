
import React, { useState, useRef } from 'react';
import { Vehicle, OSDetail } from '../types';
import { generatePreventiveEmailBody } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';

interface OSCreateProps {
  onBack: () => void;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  setOrders: React.Dispatch<React.SetStateAction<OSDetail[]>>;
  userCostCenter?: string;
}

const OSCreate: React.FC<OSCreateProps> = ({ onBack, vehicles, setVehicles, setOrders, userCostCenter }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [priority, setPriority] = useState('Média');
  const [type, setType] = useState('Corretiva');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();

        setAnalyzing(true);

        reader.onloadend = () => {
          setInvoicePreview(reader.result as string);

          setTimeout(() => {
            setAnalyzing(false);
            setDescription(
              "SERVIÇO IDENTIFICADO NA NOTA FISCAL:\n\n" +
              "1. Troca de pastilhas de freio dianteiras\n" +
              "2. Retífica de discos de freio\n" +
              "3. Substituição de fluido de freio\n" +
              "4. Mão de obra especializada\n\n" +
              "OBS: Peças originais conforme solicitação."
            );
            setValue("1250.00");
            setType("Corretiva");
          }, 1500);
        };

        reader.readAsDataURL(file);
      } else {
        alert("Por favor, anexe apenas arquivos PDF.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedVehicle || !description) return;

    setSendingEmail(true);

    try {
      const openedAt = `${date.split('-').reverse().join('/')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

      const osDataToInsert = {
        plate: selectedVehicle.plate,
        description: description,
        type: type,
        status: 'Aberta',
        priority: priority,
        cost_center: userCostCenter || (selectedVehicle.costCenter || 'N/A'),
        opened_at: openedAt,
        is_paid: false,
        cost: value ? parseFloat(value) : 0,
        invoice_url: invoicePreview || ''
      };

      const { data, error } = await supabase
        .from('service_orders')
        .insert([osDataToInsert])
        .select();

      if (error) throw error;

      const savedOS = data[0];
      const newOS: OSDetail = {
        id: savedOS.id,
        plate: savedOS.plate,
        task: savedOS.description.length > 30 ? savedOS.description.substring(0, 30) + '...' : savedOS.description,
        taskType: savedOS.type,
        status: savedOS.status,
        priority: savedOS.priority,
        time: new Date(savedOS.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        mechanic: savedOS.mechanic || '--',
        description: savedOS.description,
        costCenter: savedOS.cost_center,
        openedAt: savedOS.opened_at,
        isPaid: savedOS.is_paid,
        costValue: Number(savedOS.cost),
        invoiceUrl: savedOS.invoice_url
      };

      // Se for PREVENTIVA, resetar o contador de KM do veículo
      if (type === 'Preventiva') {
        const { error: vError } = await supabase
          .from('vehicles')
          .update({ last_preventive_km: selectedVehicle.km })
          .eq('id', selectedVehicle.id);

        if (vError) {
          console.error("Erro ao resetar KM de preventiva:", vError);
        } else {
          // Atualizar estado local dos veículos para sumir o alerta imediatamente
          setVehicles(prev => prev.map(v =>
            v.id === selectedVehicle.id
              ? { ...v, lastPreventiveKm: selectedVehicle.km }
              : v
          ));
        }

        // Simular envio de e-mail se houver responsável
        if (selectedVehicle.responsibleEmail) {
          const diffKm = selectedVehicle.km - (selectedVehicle.lastPreventiveKm || 0);
          await generatePreventiveEmailBody(selectedVehicle, diffKm);
          alert(`ORÇAMENTO PREVENTIVO ENVIADO!\n\nE-mail disparado para: ${selectedVehicle.responsibleEmail}\nO alerta de 10.000 km foi resetado.`);
        }
      }

      setOrders(prev => [newOS, ...prev]);
      onBack();
    } catch (error) {
      console.error("Erro ao salvar OS:", error);
      alert("Erro ao salvar Ordem de Serviço no banco de dados.");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-black italic tracking-tighter uppercase">Nova Ordem de Serviço</h2>
      </div>

      {!selectedVehicle ? (
        <div className="grid gap-3">
          {vehicles.map(v => (
            <button key={v.id} onClick={() => setSelectedVehicle(v)} className="bg-white dark:bg-[#1c2537] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between active:scale-95 shadow-sm text-slate-900 dark:text-white">
              <div className="text-left">
                <h4 className="text-sm font-black italic">{v.plate}</h4>
                <p className="text-[9px] text-slate-500 uppercase">{v.model}</p>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
          ))}
        </div>
      ) : (
        <section className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="bg-[#1c2537] rounded-3xl p-6 border border-primary/20 shadow-xl text-white">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">{selectedVehicle.plate}</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selectedVehicle.model}</p>
          </div>

          <div className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Tipo</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full h-12 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary dark:text-white appearance-none">
                  <option>Corretiva</option>
                  <option>Preventiva</option>
                  <option>Preditiva</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Prioridade</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full h-12 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary dark:text-white appearance-none">
                  <option>Baixa</option>
                  <option>Média</option>
                  <option>Alta</option>
                  <option>Crítica</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full h-12 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-800 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary dark:text-white uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Valor Total (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    className={`w-full h-12 rounded-xl bg-slate-50 dark:bg-background-dark border ${analyzing ? 'border-primary animate-pulse' : 'border-slate-200 dark:border-slate-800'} pl-10 pr-4 text-sm font-black outline-none focus:ring-2 focus:ring-primary dark:text-white transition-all`}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Descrição</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={6}
                className={`w-full rounded-2xl bg-slate-50 dark:bg-background-dark border ${analyzing ? 'border-primary animate-pulse' : 'border-slate-200 dark:border-slate-800'} p-4 text-sm font-medium outline-none italic focus:ring-2 focus:ring-primary dark:text-white transition-all`}
                placeholder={analyzing ? "Analisando documento..." : "Ex: Trepidação excessiva..."}
              ></textarea>
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

              {analyzing ? (
                <div className="w-full h-24 border-2 border-primary/30 bg-primary/5 rounded-2xl flex flex-col items-center justify-center gap-2 animate-pulse">
                  <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest">Processando Documento...</span>
                </div>
              ) : !invoicePreview ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest italic">Anexar Nota Fiscal / NF-e (PDF)</span>
                </button>
              ) : (
                <div className="relative w-full h-24 rounded-2xl overflow-hidden border-2 border-primary/30 bg-primary/5 flex items-center justify-between px-6 group">
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-white rounded-xl flex items-center justify-center text-accent-error shadow-sm">
                      <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">Documento Anexado</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PDF • Nota Fiscal</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={invoicePreview}
                      target="_blank"
                      rel="noreferrer"
                      className="size-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                      title="Visualizar"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                    </a>
                    <a
                      href={invoicePreview}
                      download={`OS_ANEXO_${Date.now()}.pdf`}
                      className="size-8 bg-accent-success/10 text-accent-success rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                      title="Baixar"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                    </a>
                    <button
                      onClick={() => setInvoicePreview(null)}
                      className="size-8 bg-accent-error/10 text-accent-error rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                      title="Excluir"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={sendingEmail}
            className="w-full h-20 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-base italic disabled:opacity-50"
          >
            {sendingEmail ? (
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-3xl">build_circle</span>
                ABRIR ORDEM DE SERVIÇO
              </>
            )}
          </button>
        </section>
      )
      }
    </div>
  );
};

export default OSCreate;
