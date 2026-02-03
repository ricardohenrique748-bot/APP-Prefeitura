
import React, { useState } from 'react';
import { Shift, Vehicle } from '../types';

interface ChecklistHistoryProps {
    shifts: Shift[];
    vehicles: Vehicle[];
    onBack: () => void;
    onEdit: (shift: Shift) => void;
    onDelete: (id: string) => void;
}

const ChecklistHistory: React.FC<ChecklistHistoryProps> = ({ shifts, vehicles, onBack, onEdit, onDelete }) => {
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Shift>>({});

    const handleEditClick = (shift: Shift) => {
        setEditForm(shift);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (selectedShift && editForm) {
            const updatedShift = { ...selectedShift, ...editForm } as Shift;
            onEdit(updatedShift);
            setSelectedShift(updatedShift);
            setIsEditing(false);
        }
    };

    const handleDelete = () => {
        if (selectedShift && confirm("Tem certeza que deseja excluir este registro?")) {
            onDelete(selectedShift.id);
            setSelectedShift(null);
        }
    };

    const getVehiclePlate = (id: string) => {
        return vehicles.find(v => v.id === id)?.plate || 'N/A';
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('pt-BR');
    };

    const renderDetail = () => {
        if (!selectedShift) return null;

        const checklist = selectedShift.checklistData || {};
        const damage = selectedShift.damageReport;

        return (
            <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark flex flex-col animate-in slide-in-from-right duration-300">
                <header className="bg-white dark:bg-card-dark p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0">
                    <button onClick={() => setSelectedShift(null)} className="flex items-center gap-2 text-primary font-bold">
                        <span className="material-symbols-outlined">arrow_back</span>
                        VOLTAR
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleEditClick(selectedShift)} className="size-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button onClick={handleDelete} className="size-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <section className="bg-white dark:bg-card-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Informações Gerais</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase">Motorista</span>
                                <span className="text-sm font-bold dark:text-white">{selectedShift.driverName}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase">Veículo</span>
                                <span className="text-sm font-bold dark:text-white">{getVehiclePlate(selectedShift.vehicle_id)}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase">Início</span>
                                <span className="text-sm font-bold dark:text-white">{formatDate(selectedShift.startTime)}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase">Fim</span>
                                <span className="text-sm font-bold dark:text-white">{formatDate(selectedShift.endTime || '')}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase">KM Inicial</span>
                                <span className="text-sm font-bold dark:text-white">{selectedShift.startKm}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase">KM Final</span>
                                <span className="text-sm font-bold dark:text-white">{selectedShift.endKm || '-'}</span>
                            </div>
                        </div>
                    </section>

                    {damage && (
                        <section className="bg-accent-error/10 p-4 rounded-2xl border border-accent-error/20 space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-widest text-accent-error flex items-center gap-2">
                                <span className="material-symbols-outlined">warning</span>
                                Avaria Reportada
                            </h3>
                            <div className="space-y-2">
                                <div className="bg-white dark:bg-card-dark p-3 rounded-xl border border-accent-error/20">
                                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Tipo</span>
                                    <span className="text-sm font-bold text-accent-error">{damage.type || 'Não informado'}</span>
                                </div>
                                <div className="bg-white dark:bg-card-dark p-3 rounded-xl border border-accent-error/20">
                                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Descrição</span>
                                    <p className="text-sm dark:text-white mt-1">{damage.description || 'Sem descrição'}</p>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="bg-white dark:bg-card-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Itens Verificados</h3>
                        <div className="space-y-2">
                            {Object.entries(checklist).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between p-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <span className="text-xs font-medium uppercase text-slate-600 dark:text-slate-300">{key.replace(/_/g, ' ')}</span>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${value ? 'bg-accent-success/10 text-accent-success' : 'bg-accent-error/10 text-accent-error'}`}>
                                        {value ? 'OK' : 'Irregular'}
                                    </span>
                                </div>
                            ))}
                            {Object.keys(checklist).length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">Nenhum item checado.</p>}
                        </div>
                    </section>

                    {selectedShift.signatureUrl && (
                        <section className="bg-white dark:bg-card-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Assinatura do Motorista</h3>
                            <div className="h-32 bg-slate-50 dark:bg-[#111621] rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <img src={selectedShift.signatureUrl} alt="Assinatura" className="h-full w-auto mix-blend-multiply dark:mix-blend-screen" />
                            </div>
                        </section>
                    )}

                </div>
            </div>
        );
    };

    const renderEditModal = () => {
        if (!isEditing || !selectedShift) return null;
        return (
            <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl p-6 space-y-4 animate-in zoom-in-95">
                    <h3 className="text-lg font-black uppercase italic text-slate-900 dark:text-white">Editar Turno</h3>

                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-xs font-bold text-slate-500 uppercase">Motorista</span>
                            <input
                                value={editForm.driverName || ''}
                                onChange={e => setEditForm({ ...editForm, driverName: e.target.value })}
                                className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#111621] border border-slate-200 dark:border-slate-800 rounded-xl"
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs font-bold text-slate-500 uppercase">KM Inicial</span>
                            <input
                                type="number"
                                value={editForm.startKm || ''}
                                onChange={e => setEditForm({ ...editForm, startKm: parseInt(e.target.value) })}
                                className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#111621] border border-slate-200 dark:border-slate-800 rounded-xl"
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs font-bold text-slate-500 uppercase">KM Final</span>
                            <input
                                type="number"
                                value={editForm.endKm || ''}
                                onChange={e => setEditForm({ ...editForm, endKm: parseInt(e.target.value) })}
                                className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#111621] border border-slate-200 dark:border-slate-800 rounded-xl"
                            />
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setIsEditing(false)} className="flex-1 py-3 text-slate-500 font-bold uppercase text-xs">Cancelar</button>
                        <button onClick={handleSave} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl uppercase text-xs shadow-lg shadow-primary/20">Salvar</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-6 pb-20">
            {renderEditModal()}
            {selectedShift && renderDetail()}

            <header className="flex items-center gap-3">
                <button onClick={onBack} className="flex items-center justify-center size-10 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 text-slate-500 active:scale-95 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 className="text-xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white">Histórico de Checklist</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Registros de início e fim de turno</p>
                </div>
            </header>

            <div className="space-y-3">
                {shifts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                        <span className="material-symbols-outlined text-5xl opacity-20">history_edu</span>
                        <p className="text-sm font-medium">Nenhum registro encontrado</p>
                    </div>
                ) : (
                    shifts.map((shift) => (
                        <div key={shift.id} onClick={() => setSelectedShift(shift)} className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm active:scale-[0.99] transition-all cursor-pointer">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`size-2 rounded-full ${shift.status === 'OPEN' ? 'bg-accent-success animate-pulse' : 'bg-slate-300'}`}></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{shift.status === 'OPEN' ? 'Em Andamento' : 'Finalizado'}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">#{shift.id.slice(0, 6)}</span>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="size-12 rounded-xl bg-slate-50 dark:bg-[#111621] flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-2xl">local_shipping</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black italic text-slate-900 dark:text-white">{getVehiclePlate(shift.vehicle_id)}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{shift.driverName}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                                <div className="text-center">
                                    <span className="block text-[8px] font-bold uppercase text-slate-400">Início</span>
                                    <span className="text-[10px] font-bold dark:text-slate-200">{new Date(shift.startTime).toLocaleDateString()}</span>
                                    <span className="block text-[10px] font-bold text-primary">{new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="h-8 w-px bg-slate-100 dark:bg-slate-800"></div>
                                <div className="text-center">
                                    <span className="block text-[8px] font-bold uppercase text-slate-400">Fim</span>
                                    {shift.endTime ? (
                                        <>
                                            <span className="text-[10px] font-bold dark:text-slate-200">{new Date(shift.endTime).toLocaleDateString()}</span>
                                            <span className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">{new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </>
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-300">--:--</span>
                                    )}
                                </div>
                                <div className="h-8 w-px bg-slate-100 dark:bg-slate-800"></div>
                                <div className="text-center">
                                    <span className="block text-[8px] font-bold uppercase text-slate-400">Checklist</span>
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Ver detalhes</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChecklistHistory;
