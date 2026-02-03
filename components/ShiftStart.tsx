
import React, { useState, useRef, useEffect } from 'react';
import { Vehicle } from '../types';

interface ShiftStartProps {
  onBack: () => void;
  vehicles: Vehicle[];
  onUpdateKm: (id: string, km: number) => void;
  activeShifts: string[];
  onStartShift: (data: any) => void;
  onFinishShift: (id: string) => void;
}

const ShiftStart: React.FC<ShiftStartProps> = ({ onBack, vehicles, onUpdateKm, activeShifts, onStartShift, onFinishShift }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [km, setKm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>('identificacao');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    driver: 'RICARDO LUZ',
    company: 'PREFEITURA',
    costCenter: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });

  const [checks, setChecks] = useState<Record<string, boolean>>({
    'oleo_motor': true, 'agua_radiador': true, 'vazamentos': true, 'correias': true, 'ruidos': true,
    'farol_baixo': true, 'farol_alto': true, 'luz_freio': true, 'setas': true, 'luz_re': true, 'luz_alerta': true,
    'calibragem': true, 'desgaste': true, 'estepe': true, 'ferramentas': true,
    'freio_servico': true, 'freio_estac': true, 'direcao': true, 'pedais': true,
    'parabrisa': true, 'limpador': true, 'agua_limpador': true, 'retrovisores': true,
    'cinto': true, 'triangulo': true, 'extintor': true, 'buzina': true
  });

  const [hasDamage, setHasDamage] = useState(false);
  const [damageLevel, setDamageLevel] = useState<'LEVE' | 'MÉDIA' | 'GRAVE'>('LEVE');
  const [damageType, setDamageType] = useState('Estética / Lataria');
  const [damageDesc, setDamageDesc] = useState('');
  const [damagePhotos, setDamagePhotos] = useState<string[]>([]);

  useEffect(() => {
    if (canvasRef.current && selectedVehicle) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const resizeCanvas = () => {
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (rect && ctx) {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;

          ctx.scale(dpr, dpr);
          ctx.strokeStyle = '#1754cf';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [selectedVehicle]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Stop scrolling/refresh gestures
    e.currentTarget.setPointerCapture(e.pointerId);

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
      setHasSigned(true);
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isDrawing) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDrawing(false);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.closePath();
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasSigned(false);
    }
  };

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // nativeEvent.offsetX provides coordinates relative to the target node (canvas)
    // allowing for correct positioning even with CSS scaling or offsets.
    return {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    };
  };

  const handleSelectVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    setKm(v.km.toString());
    setFormData(prev => ({ ...prev, costCenter: v.costCenter || 'NÃO DEFINIDO' }));
    setActiveCategory('identificacao');
  };

  const toggleCheck = (id: string) => setChecks(prev => ({ ...prev, [id]: !prev[id] }));

  const handleFinalize = () => {
    if (selectedVehicle && km) {
      onUpdateKm(selectedVehicle.id, parseInt(km));

      const signatureData = canvasRef.current?.toDataURL() || undefined;

      const shiftData = {
        vehicle_id: selectedVehicle.id,
        driverName: formData.driver,
        startTime: new Date().toISOString(),
        startKm: parseInt(km),
        checklistData: checks,
        damageReport: hasDamage ? {
          type: damageType,
          level: damageLevel,
          description: damageDesc,
          photos: damagePhotos
        } : null,
        signatureUrl: signatureData
      };

      onStartShift(shiftData);
      onBack();
    }
  };

  const getChecklistCategories = () => {
    if (selectedVehicle?.type === 'Ambulância') {
      return [
        {
          id: 'nivel', label: 'NÍVEL (MECÂNICA)', icon: 'engineering', items: [
            { id: 'oleo_motor', label: 'Óleo do motor' },
            { id: 'oleo_hidraulico', label: 'Óleo Hidráulico' },
            { id: 'fluido_freio', label: 'Fluido de Freio' },
            { id: 'ad_radiador', label: 'Ad. do Radiador' },
            { id: 'agua_parabrisa', label: 'Água do Para-brisa' },
          ]
        },
        {
          id: 'pneus', label: 'PNEUS', icon: 'tire_repair', items: [
            { id: 'pneu_dd', label: 'Dianteiro Direito' },
            { id: 'pneu_de', label: 'Dianteiro Esquerdo' },
            { id: 'pneu_td', label: 'Traseiro Direito' },
            { id: 'pneu_te', label: 'Traseiro Esquerdo' },
            { id: 'estepe', label: 'Estepe' },
          ]
        },
        {
          id: 'itens_gerais', label: 'ITENS GERAIS', icon: 'list_alt', items: [
            { id: 'chave_viatura', label: 'Chave da Viatura' },
            { id: 'buzina', label: 'Buzina' },
            { id: 'quebra_sol', label: 'Quebra Sol' },
            { id: 'cinto', label: 'Cinto Segurança' },
            { id: 'retrovisor', label: 'Retrovisor' },
            { id: 'bancos', label: 'Bancos da VTR' },
            { id: 'luz_neblina', label: 'Luz de Neblina' },
            { id: 'luz_re', label: 'Luz de Ré' },
            { id: 'luz_interna', label: 'Luz Interna VTR' },
            { id: 'limpador', label: 'Limpador para-brisa' },
            { id: 'parabrisa', label: 'Para-brisa' },
            { id: 'porta_viatura', label: 'Porta da Viatura' },
            { id: 'placa', label: 'Placa Diant./Trazeira' },
            { id: 'protetor_carter', label: 'Protetor de Carter' },
            { id: 'luz_baixa', label: 'Luz Baixa' },
            { id: 'luz_placa', label: 'Luz de Placa' },
          ]
        },
        {
          id: 'equipamentos', label: 'EQUIPAMENTOS', icon: 'medical_services', items: [
            { id: 'chave_roda', label: 'Chave de Roda' },
            { id: 'macaco', label: 'Macaco' },
            { id: 'triangulo', label: 'Triângulo' },
            { id: 'radio_cabine', label: 'Rádio Cabine' },
            { id: 'lanterna', label: 'Lanterna Portátil' },
            { id: 'giroflex', label: 'Giroflex' },
            { id: 'carlota', label: 'Carlota Quant. 4' },
            { id: 'oxigenio_gran', label: 'Oxigênio Gran. 2' },
            { id: 'ar_comprimido', label: 'Ar Comprimido 1' },
            { id: 'bateria', label: 'Bateria' },
            { id: 'extensao_bateria', label: 'Extensão Bateria' },
            { id: 'radio_portatil', label: 'Rádio Portátil' },
            { id: 'maca', label: 'Maca' },
            { id: 'antena', label: 'Antena da VTR' },
            { id: 'luz_alta', label: 'Luz alta' },
            { id: 'luz_seta', label: 'Luz de Seta' },
            { id: 'estrobo', label: 'Estrobo Led' },
            { id: 'cones', label: 'Cones Quant. 3' },
            { id: 'oxigenio_portatil', label: 'Oxigênio Portátil 1' },
            { id: 'chave_inglesa', label: 'Chave Inglesa' },
            { id: 'ar_condicionado', label: 'Ar Condicionado' },
            { id: 'extintor', label: 'Extintor' },
            { id: 'som', label: 'Som Multimídia' },
            { id: 'prancha', label: 'Prancha Quant.' },
            { id: 'doc_vtr', label: 'Documento da VTR' },
            { id: 'luz_freio', label: 'Luz de freio' },
            { id: 'luz_embarque', label: 'Luz de Embarque' },
            { id: 'sirene', label: 'Sirene' },
          ]
        }
      ];
    }

    if (selectedVehicle?.type === 'Moto') {
      return [
        {
          id: 'eletrica', label: 'PARTE ELÉTRICA', icon: 'electric_bolt', items: [
            { id: 'partida', label: 'Partida no motor' },
            { id: 'piscas', label: 'Piscas laterais' },
            { id: 'farol', label: 'Luz do farol (Alta/Baixa)' },
            { id: 'freio_luz', label: 'Lanternas de freio' },
            { id: 'buzina', label: 'Buzina' },
          ]
        },
        {
          id: 'mecanica', label: 'MECÂNICA / FREIOS', icon: 'build', items: [
            { id: 'freios_func', label: 'Funcionamento dos Freios' },
            { id: 'oleo_freio', label: 'Nível de óleo (Freio)' },
            { id: 'vazamentos', label: 'Vazamentos' },
            { id: 'pastilhas', label: 'Desgaste das pastilhas' },
            { id: 'oleo_motor_nivel', label: 'Nível de óleo do motor' },
            { id: 'ruidos_escape', label: 'Escape / Ruídos' },
          ]
        },
        {
          id: 'mochila', label: 'MOCHILA MOTOCICLETA', icon: 'medical_services', items: [
            { id: 'bvm', label: 'BVM (Adulto/Infantil)' },
            { id: 'mascara_o2', label: 'Máscara de O2 c/ reservatório' },
            { id: 'cateteres', label: 'Cateteres de O2' },
            { id: 'oxigenio', label: 'Oxigênio portátil' },
            { id: 'glicosimetro', label: 'Glicosímetro' },
            { id: 'aparelho_pa', label: 'Aparelho de PA' },
            { id: 'canulas', label: 'Cânulas de Guedel' },
            { id: 'kit_venopuncao', label: 'Kit de Venopunção' },
          ]
        },
        {
          id: 'maleiro', label: 'MALEIRO MOTOCICLETA', icon: 'inventory_2', items: [
            { id: 'colar_cervical', label: 'Colar cervical P/M/G' },
            { id: 'dea', label: 'DEA (Desfibrilador)' },
            { id: 'curativos', label: 'Atadura, Gazes e compressas' },
            { id: 'talas', label: 'Talas de imobilização' },
          ]
        }
      ];
    }

    return [
      {
        id: 'motor', label: 'MOTOR / MECÂNICA', icon: 'engineering', items: [
          { id: 'oleo_motor', label: 'Nível de óleo do motor' },
          { id: 'agua_radiador', label: 'Nível de água do radiador' },
          { id: 'vazamentos', label: 'Vazamentos aparentes' },
          { id: 'correias', label: 'Correias em bom estado' },
          { id: 'ruidos', label: 'Ruídos anormais' },
        ]
      },
      {
        id: 'pneus', label: 'PNEUS', icon: 'tire_repair', items: [
          { id: 'calibragem', label: 'Calibragem dos pneus' },
          { id: 'desgaste', label: 'Desgaste dos pneus' },
          { id: 'estepe', label: 'Estado do estepe' },
          { id: 'ferramentas', label: 'Ferramentas (macaco/chave)' },
        ]
      },
      {
        id: 'luzes', label: 'ILUMINAÇÃO', icon: 'lightbulb', items: [
          { id: 'farol_baixo', label: 'Farol baixo' },
          { id: 'farol_alto', label: 'Farol alto' },
          { id: 'luz_freio', label: 'Luz de freio' },
          { id: 'setas', label: 'Setas / Pisca' },
          { id: 'luz_re', label: 'Luz de ré' },
          { id: 'luz_alerta', label: 'Luz de alerta (pisca-alerta)' },
        ]
      },
      {
        id: 'cabine', label: 'CABINE', icon: 'airline_seat_recline_extra', items: [
          { id: 'freio_servico', label: 'Freio de serviço' },
          { id: 'freio_estac', label: 'Freio de estacionamento' },
          { id: 'direcao', label: 'Direção / Folgas' },
          { id: 'pedais', label: 'Pedais (Freio/Emb/Acel)' },
          { id: 'parabrisa', label: 'Parabrisa (trincas)' },
          { id: 'limpador', label: 'Limpador de parabrisa' },
          { id: 'agua_limpador', label: 'Água do limpador' },
          { id: 'retrovisores', label: 'Retrovisores' },
        ]
      },
      {
        id: 'seguranca', label: 'SEGURANÇA', icon: 'verified_user', items: [
          { id: 'cinto', label: 'Cinto de segurança' },
          { id: 'triangulo', label: 'Triângulo' },
          { id: 'extintor', label: 'Extintor' },
          { id: 'buzina', label: 'Buzina' },
        ]
      }
    ];
  };

  const categories = getChecklistCategories();

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'Moto': return 'two_wheeler';
      case 'Ambulância': return 'ambulance';
      case 'Carro Leve': return 'directions_car';
      case 'Van': return 'airport_shuttle';
      default: return 'local_shipping';
    }
  };

  if (!selectedVehicle) {
    return (
      <div className="p-4 space-y-4 bg-background-light dark:bg-background-dark min-h-screen">
        <header>
          <h2 className="text-xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">Selecione o Veículo</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Escolha um caminhão para iniciar a inspeção</p>
        </header>
        <div className="grid gap-3">
          {vehicles.filter(v => v.status === 'ACTIVE').map(v => {
            const isActive = activeShifts.includes(v.id);
            return (
              <div
                key={v.id}
                onClick={() => !isActive && handleSelectVehicle(v)}
                className={`
                  border p-4 rounded-3xl flex items-center justify-between transition-all group shadow-sm relative overflow-hidden
                  ${isActive
                    ? 'bg-accent-error/5 border-accent-error/30 cursor-default'
                    : 'bg-white dark:bg-card-dark border-slate-200 dark:border-slate-800 cursor-pointer active:scale-[0.98]'
                  }
                `}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-error"></div>}

                <div className="flex items-center gap-3 text-left">
                  <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-accent-error/10 text-accent-error' : 'bg-primary/10 text-primary'}`}>
                    <span className="material-symbols-outlined text-xl">{getVehicleIcon(v.type)}</span>
                  </div>
                  <div>
                    <h3 className={`text-base font-black italic tracking-tighter ${isActive ? 'text-accent-error' : 'text-slate-900 dark:text-white'}`}>{v.plate}</h3>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-accent-error/70' : 'text-slate-500'}`}>
                      {isActive ? 'EM OPERAÇÃO' : `${v.model}`}
                    </p>
                  </div>
                </div>

                {isActive ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onFinishShift(v.id); }}
                    className="h-8 px-3 bg-accent-error text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-accent-error/20 flex items-center gap-1.5 hover:bg-accent-error/90 active:scale-95 transition-all"
                  >
                    <span>Finalizar</span>
                    <span className="material-symbols-outlined text-xs">stop_circle</span>
                  </button>
                ) : (
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-xl">chevron_right</span>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={onBack} className="w-full py-3 text-[10px] font-black uppercase text-slate-500 tracking-widest italic">Voltar ao Painel</button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-20 bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      <div className="flex items-center">
        <button
          onClick={() => setSelectedVehicle(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary active:scale-95 transition-all p-1 -ml-1"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Voltar a Seleção</span>
        </button>
      </div>

      <section className="bg-white dark:bg-card-dark rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Veículo Selecionado</h3>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">ID #{selectedVehicle.id}</span>
            <button onClick={() => setSelectedVehicle(null)} className="size-6 bg-slate-50 dark:bg-[#111621] rounded flex items-center justify-center text-slate-400 active:rotate-180 transition-transform">
              <span className="material-symbols-outlined text-[10px]">sync</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-slate-50 dark:bg-[#111621] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">{getVehicleIcon(selectedVehicle.type)}</span>
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none">{selectedVehicle.plate}</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{selectedVehicle.type} • {selectedVehicle.model}</p>
          </div>
        </div>
        <div className="mt-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KM Inicial Atualizado</span>
            <input type="number" value={km} onChange={(e) => setKm(e.target.value)} className="w-full h-12 bg-slate-50 dark:bg-[#111621] border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-xl font-mono font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all" />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest px-1">Empresa</label>
          <div className="w-full h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl flex items-center px-4 shadow-sm">
            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase italic">{formData.company}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest px-1">Centro de Custo</label>
          <div className="w-full h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl flex items-center px-4 shadow-sm">
            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{formData.costCenter}</span>
            <span className="ml-auto material-symbols-outlined text-sm opacity-50">lock</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest px-1">Motorista</label>
            <div className="w-full h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl flex items-center px-4 text-slate-900 dark:text-white">
              <span className="text-[9px] font-black uppercase italic">{formData.driver}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest px-1">Data/Hora</label>
            <div className="w-full h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2">
              <span className="text-[9px] font-bold text-slate-500 dark:text-white/80">{formData.date.split('-').reverse().join('/')}</span>
              <span className="text-[9px] font-black text-primary italic">{formData.time}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Checklist Técnico</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <button onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)} className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-lg ${activeCategory === cat.id ? 'text-primary' : 'text-slate-400'}`}>{cat.icon}</span>
                  <span className="text-[11px] font-black uppercase tracking-tight italic text-slate-900 dark:text-white">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-slate-500 bg-slate-50 dark:bg-[#111621] px-1.5 py-0.5 rounded">{cat.items.filter(i => checks[i.id]).length}/{cat.items.length}</span>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${activeCategory === cat.id ? 'rotate-180 text-primary' : 'text-slate-300'}`}>expand_more</span>
                </div>
              </button>
              {activeCategory === cat.id && (
                <div className="px-4 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-300">
                  {cat.items.map((item) => <div key={item.id} className="flex flex-col py-3 border-b border-slate-100 dark:border-slate-800 last:border-none gap-2">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase italic tracking-tighter">{item.label}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChecks({ ...checks, [item.id]: true })}
                        className={`flex-1 h-8 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${checks[item.id] ? 'bg-accent-success text-white shadow-md shadow-accent-success/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        SIM
                      </button>
                      <button
                        onClick={() => {
                          setChecks({ ...checks, [item.id]: false });
                          setHasDamage(true);
                        }}
                        className={`flex-1 h-8 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${!checks[item.id] ? 'bg-accent-error text-white shadow-md shadow-accent-error/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                        NÃO
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Reportar Avaria</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={hasDamage} onChange={(e) => setHasDamage(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-error"></div>
          </label>
        </div>

        {hasDamage && (
          <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-in slide-in-from-top-4 duration-300 shadow-sm">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Tipo de Avaria</label>
              <div className="flex flex-wrap gap-1.5">
                {['Mecânica', 'Elétrica', 'Pneus', 'Estética / Lataria'].map(type => (
                  <button
                    key={type}
                    onClick={() => setDamageType(type)}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${damageType === type ? 'bg-accent-error text-white border-accent-error' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Gravidade</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['LEVE', 'MÉDIA', 'GRAVE'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setDamageLevel(level)}
                    className={`h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${damageLevel === level ? 'bg-accent-error text-white border-accent-error' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Descrição</label>
              <textarea
                value={damageDesc}
                onChange={(e) => setDamageDesc(e.target.value)}
                className="w-full h-20 bg-slate-50 dark:bg-[#111621] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-[11px] outline-none focus:ring-2 focus:ring-accent-error/50 resize-none"
                placeholder="Descreva o problema encontrado..."
              ></textarea>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Fotos</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="size-16 flex-none rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 active:bg-slate-50 dark:active:bg-slate-800"
                >
                  <span className="material-symbols-outlined text-xl">add_a_photo</span>
                  <span className="text-[7px] font-bold uppercase">Adicionar</span>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (damagePhotos.length + files.length > 12) {
                      alert("Você só pode adicionar até 12 fotos.");
                      return;
                    }
                    const newPhotos = files.map((f: any) => URL.createObjectURL(f));
                    setDamagePhotos([...damagePhotos, ...newPhotos]);
                  }}
                />
                {damagePhotos.map((photo, i) => (
                  <div key={i} className="size-16 flex-none rounded-xl bg-cover bg-center relative group" style={{ backgroundImage: `url(${photo})` }}>
                    <button onClick={() => setDamagePhotos(damagePhotos.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 size-4 bg-accent-error text-white rounded-full flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-[10px]">close</span></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Assinatura</h3>
        <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5 shadow-sm">
          <div className="h-28 bg-slate-50 dark:bg-[#111621] rounded-xl relative flex items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden touch-none">
            {!hasSigned && <span className="text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest pointer-events-none italic">Assine aqui</span>}
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              className="absolute inset-0 cursor-crosshair w-full h-full touch-none"
              style={{ touchAction: 'none' }}
            />
            <button onClick={clearSignature} className="absolute bottom-2 right-2 size-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-lg flex items-center justify-center text-slate-400 active:text-primary transition-all shadow-md border border-slate-200 dark:border-slate-700 z-10"><span className="material-symbols-outlined text-base">refresh</span></button>
          </div>
        </div>
      </section>

      <section className="space-y-3 pt-4 pb-20">
        <button onClick={handleFinalize} className="w-full h-14 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all group">
          <span className="material-symbols-outlined text-2xl group-active:rotate-12 transition-transform">local_shipping</span>
          <span className="uppercase tracking-[0.2em] text-xs italic">Iniciar Novo Turno</span>
        </button>
        <button onClick={onBack} className="w-full h-12 bg-white dark:bg-card-dark border border-slate-200 dark:border-accent-error/30 text-accent-error font-black rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
          <span className="material-symbols-outlined text-xl">stop_circle</span>
          <span className="uppercase tracking-[0.2em] text-[10px] italic">Finalizar Turno</span>
        </button>
      </section>
    </div>
  );
};

export default ShiftStart;
