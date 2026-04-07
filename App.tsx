
import React, { useState, useEffect, useMemo } from 'react';
import { AppScreen, Vehicle, User, Shift, Supplier, CostCenter, OSDetail } from './types';
import DeviceSimulator from './components/DeviceSimulator';
import Dashboard from './components/Dashboard';
import ShiftStart from './components/ShiftStart';
import ShiftEnd from './components/ShiftEnd';
import TireBulletin from './components/TireBulletin';
import CostCenters from './components/CostCenters';
import Reports from './components/Reports';
import OSCreate from './components/OSCreate';
import OSControl from './components/OSControl';

import Login from './components/Login';
import Navigation from './components/Navigation';
import Header from './components/Header';
import Settings from './components/Settings';
import FleetManagement from './components/FleetManagement';
import UserManagement from './components/UserManagement';
import SupplierManagement from './components/SupplierManagement';
import Backlog from './components/Backlog';
import SupplierQuote from './components/SupplierQuote';
import ChecklistHistory from './components/ChecklistHistory';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  // Inicialização de estados a partir do Cache (LocalStorage) para evitar atrasos visuais
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => {
    const cached = localStorage.getItem('smart_tech_cost_centers');
    return cached ? JSON.parse(cached) : [];
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const cached = localStorage.getItem('smart_tech_vehicles');
    return cached ? JSON.parse(cached) : [];
  });
  const [orders, setOrders] = useState<OSDetail[]>(() => {
    const cached = localStorage.getItem('smart_tech_orders');
    return cached ? JSON.parse(cached) : [];
  });
  const [shifts, setShifts] = useState<Shift[]>(() => {
    const cached = localStorage.getItem('smart_tech_shifts');
    return cached ? JSON.parse(cached) : [];
  });
  const [activeShifts, setActiveShifts] = useState<string[]>(() => {
    const cached = localStorage.getItem('smart_tech_active_shifts');
    return cached ? JSON.parse(cached) : [];
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('smart_tech_user');
    return stored ? JSON.parse(stored) : null;
  });

  const isAuthenticated = !!currentUser;
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.DASHBOARD);

  const [userAvatar, setUserAvatar] = useState(() => {
    return localStorage.getItem('smart_tech_avatar') || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop";
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('smart_tech_theme');
    return saved ? saved === 'dark' : false;
  });

  // Carregar dados de deep link se houver
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen');
    if (screenParam === 'SUPPLIER_QUOTE') {
      setCurrentScreen(AppScreen.SUPPLIER_QUOTE);
    }
  }, []);

  // Sincronização completa com Supabase
  const startSync = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      console.log("Iniciando sincronização Smart Tech...");

      // 1. Centros de Custo
      const { data: ccData, error: ccError } = await supabase.from('cost_centers').select('*');
      if (!ccError && ccData) {
        const mappedCenters = ccData.map((c: any) => ({
          id: c.id.toString(),
          name: c.name,
          company: c.company,
          budget: Number(c.budget),
          color: c.color || 'bg-primary'
        }));
        setCostCenters(mappedCenters);
      }

      // 2. Veículos
      const { data: vData, error: vError } = await supabase.from('vehicles').select('*');
      if (!vError && vData) {
        const mappedVehicles = vData.map((v: any) => ({
          id: v.id.toString(),
          plate: v.plate,
          model: v.model,
          type: v.type,
          status: v.status,
          km: Number(v.km),
          lastPreventiveKm: v.last_preventive_km,
          costCenter: v.cost_center,
          year: v.year,
          chassi: v.chassi,
          renavam: v.renavam,
          cnpj: v.cnpj,
          sector: v.sector,
          responsibleName: v.responsible_name
        }));
        setVehicles(mappedVehicles);
      }

      // 3. Ordens de Serviço
      const { data: oData, error: oError } = await supabase.from('service_orders').select('*');
      if (!oError && oData) {
        const mappedOrders = oData.map((o: any) => ({
          id: o.id.toString(),
          plate: o.plate,
          task: o.description || 'Manutenção Diversa',
          taskType: o.type as any || 'Corretiva',
          status: o.status,
          priority: o.priority,
          time: new Date(o.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          mechanic: o.mechanic || 'Interno',
          description: o.description || '',
          costCenter: o.cost_center || 'Geral',
          openedAt: o.created_at,
          isPaid: o.is_paid || false,
          costValue: Number(o.cost) || 0,
          invoiceUrl: o.invoice_url,
          quoteUrl: o.quote_url,
          previousPreventiveKm: o?.previous_preventive_km
        })).sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
        setOrders(mappedOrders);
      }

      // 4. Turnos
      const { data: sData, error: sError } = await supabase.from('shifts').select('*').order('start_time', { ascending: false });
      if (!sError && sData) {
        const mappedShifts = sData.map((s: any) => ({
          id: s.id.toString(),
          vehicle_id: s.vehicle_id,
          driverName: s.driver_name,
          startTime: s.start_time,
          endTime: s.end_time,
          startKm: s.start_km,
          endKm: s.end_km,
          checklistData: s.checklist_data,
          damageReport: s.damage_report,
          signatureUrl: s.signature_url,
          status: s.status
        }));
        setShifts(mappedShifts);
        
        // Atualizar veículos ativos
        const openVehicles = mappedShifts.filter(s => s.status === 'OPEN').map(s => s.vehicle_id);
        setActiveShifts(openVehicles);
      }

    } catch (error) {
      console.error("Falha na sincronização:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      startSync();
    }
  }, [isAuthenticated]);

  // Persistência local redundante
  useEffect(() => { localStorage.setItem('smart_tech_cost_centers', JSON.stringify(costCenters)); }, [costCenters]);
  useEffect(() => { localStorage.setItem('smart_tech_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('smart_tech_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('smart_tech_shifts', JSON.stringify(shifts)); }, [shifts]);
  useEffect(() => { localStorage.setItem('smart_tech_active_shifts', JSON.stringify(activeShifts)); }, [activeShifts]);
  
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smart_tech_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('smart_tech_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (isDarkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('smart_tech_theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('smart_tech_theme', 'light'); }
  }, [isDarkMode]);

  // Logout seguro limpando cache específico
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('smart_tech_user');
    localStorage.removeItem('smart_tech_cost_centers');
    localStorage.removeItem('smart_tech_vehicles');
    localStorage.removeItem('smart_tech_orders');
    localStorage.removeItem('smart_tech_shifts');
    localStorage.removeItem('smart_tech_active_shifts');
    setCurrentScreen(AppScreen.LOGIN);
  };

  const updateVehicleKm = async (id: string, newKm: number) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ km: newKm })
        .eq('id', id);

      if (error) throw error;
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, km: newKm } : v));
    } catch (error) {
      console.error("Erro ao atualizar KM:", error);
    }
  };

  const handleStartShift = async (shiftData: any) => {
    const newShift: Shift = {
      id: Math.random().toString(36).substr(2, 9),
      vehicle_id: shiftData.vehicle_id,
      driverName: shiftData.driverName,
      startTime: shiftData.startTime,
      startKm: shiftData.startKm,
      checklistData: shiftData.checklistData,
      damageReport: shiftData.damageReport,
      signatureUrl: shiftData.signatureUrl,
      status: 'OPEN'
    };
    setShifts(prev => [newShift, ...prev]);
    setActiveShifts(prev => [...prev, shiftData.vehicle_id]);
  };

  const handleFinishShift = (vehicleId: string) => {
    setShifts(prev => prev.map(s => {
      if (s.vehicle_id === vehicleId && s.status === 'OPEN') {
        return { ...s, endTime: new Date().toISOString(), status: 'CLOSED' };
      }
      return s;
    }));
    setActiveShifts(prev => prev.filter(id => id !== vehicleId));
  };

  const handleUpdateShift = (updatedShift: Shift) => {
    setShifts(prev => prev.map(s => s.id === updatedShift.id ? updatedShift : s));
  };

  const handleDeleteShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
  };

  // Cálculos de Centros de Custo (Enrichment)
  const centersWithStats = useMemo(() => {
    return costCenters.map(center => {
      const osTotal = orders
        .filter(o => {
          if (!o.costCenter) return false;
          const osCCId = o.costCenter.split(' ')[0];
          return osCCId === center.id;
        })
        .reduce((sum, o) => sum + (o.costValue || 0), 0);

      const vehicleCount = vehicles.filter(v => v.costCenter && v.costCenter.split(' ')[0] === center.id).length;
      const progress = center.budget > 0 ? Math.min(100, Math.round((osTotal / center.budget) * 100)) : 0;

      return {
        ...center,
        consumedValue: osTotal,
        consumedStr: osTotal.toLocaleString('pt-BR'),
        availableStr: (center.budget - osTotal).toLocaleString('pt-BR'),
        progress,
        warning: progress >= 90,
        vehicles: vehicleCount
      };
    }).sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
  }, [costCenters, orders, vehicles]);

  // Filtros Globais por Permissão
  const { filteredOrders, filteredVehicles, filteredShifts, filteredCenters } = useMemo(() => {
    if (!currentUser || currentUser.role === 'ADMIN') {
      return {
        filteredOrders: orders,
        filteredVehicles: vehicles,
        filteredShifts: shifts,
        filteredCenters: centersWithStats
      };
    }

    const userCCId = currentUser.costCenter ? currentUser.costCenter.split(' ')[0] : '';
    if (!userCCId) {
      return { filteredOrders: [], filteredVehicles: [], filteredShifts: [], filteredCenters: [] };
    }

    const matchCC = (ccString?: string) => {
      if (!ccString) return false;
      return ccString.split(' ')[0] === userCCId;
    };

    return {
      filteredOrders: orders.filter(o => matchCC(o.costCenter)),
      filteredVehicles: vehicles.filter(v => matchCC(v.costCenter)),
      filteredShifts: shifts.filter(s => {
        const vehicle = vehicles.find(v => v.id === s.vehicle_id);
        return matchCC(vehicle?.costCenter);
      }),
      filteredCenters: centersWithStats.filter(c => c.id === userCCId)
    };
  }, [currentUser, orders, vehicles, shifts, centersWithStats]);

  const handleResolveBacklog = async (id: string) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, damageReport: undefined } : s));
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.DASHBOARD:
        return <Dashboard orders={filteredOrders} vehicles={filteredVehicles} costCenters={filteredCenters} onAction={(screen) => setCurrentScreen(screen)} />;
      case AppScreen.SHIFT_START:
        return <ShiftStart vehicles={filteredVehicles} onUpdateKm={updateVehicleKm} onBack={() => setCurrentScreen(AppScreen.DASHBOARD)} activeShifts={activeShifts} onStartShift={handleStartShift} onFinishShift={handleFinishShift} />;
      case AppScreen.OS_CONTROL:
        return <OSControl orders={filteredOrders} setOrders={setOrders} setVehicles={setVehicles} onAction={(screen) => setCurrentScreen(screen)} isAdmin={currentUser?.role === 'ADMIN'} />;
      case AppScreen.OS_CREATE:
        return <OSCreate vehicles={filteredVehicles} setVehicles={setVehicles} setOrders={setOrders} onBack={() => setCurrentScreen(AppScreen.OS_CONTROL)} userCostCenter={currentUser?.role !== 'ADMIN' ? currentUser?.costCenter : undefined} />;
      case AppScreen.COST_CENTERS:
        return <CostCenters centers={filteredCenters} setCenters={setCostCenters} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} isAdmin={currentUser?.role === 'ADMIN'} />;
      case AppScreen.FLEET_MANAGEMENT:
        return <FleetManagement vehicles={filteredVehicles} setVehicles={setVehicles} costCenters={costCenters} onAction={(screen) => setCurrentScreen(screen)} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} isAdmin={currentUser?.role === 'ADMIN'} />;
      case AppScreen.REPORTS:
        return <Reports vehicles={filteredVehicles} orders={filteredOrders} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.TIRE_BULLETIN:
        return <TireBulletin vehicles={filteredVehicles} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} isAdmin={currentUser?.role === 'ADMIN'} />;
      case AppScreen.USER_MANAGEMENT:
        return <UserManagement currentUserRole={currentUser?.role || 'OPERADOR'} costCenters={costCenters} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} isAdmin={currentUser?.role === 'ADMIN'} />;
      case AppScreen.SUPPLIER_MANAGEMENT:
        return <SupplierManagement onBack={() => setCurrentScreen(AppScreen.SETTINGS)} isAdmin={currentUser?.role === 'ADMIN'} />;
      case AppScreen.BACKLOG:
        return <Backlog shifts={filteredShifts} onAction={(screen) => setCurrentScreen(screen)} onBack={() => setCurrentScreen(AppScreen.DASHBOARD)} isAdmin={currentUser?.role === 'ADMIN'} onResolve={handleResolveBacklog} />;
      case AppScreen.SUPPLIER_QUOTE:
        return <SupplierQuote onBack={() => setCurrentScreen(AppScreen.DASHBOARD)} />;
      case AppScreen.CHECKLIST_HISTORY:
        return <ChecklistHistory shifts={filteredShifts} vehicles={filteredVehicles} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} onEdit={handleUpdateShift} onDelete={handleDeleteShift} isAdmin={currentUser?.role === 'ADMIN'} />;
      case AppScreen.SETTINGS:
        return <Settings isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} onAction={(screen) => setCurrentScreen(screen)} avatarUrl={userAvatar} onAvatarChange={(nav) => setUserAvatar(nav)} onLogout={handleLogout} userRole={currentUser?.role || 'OPERADOR'} userName={currentUser?.name || 'Administrador'} onSync={startSync} />;
      default:
        return <Dashboard orders={filteredOrders} vehicles={filteredVehicles} onAction={(screen) => setCurrentScreen(screen)} costCenters={filteredCenters} />;
    }
  };

  return (
    <DeviceSimulator
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      showSidebar={isAuthenticated}
      userAvatar={userAvatar}
      userName={currentUser?.name}
      userRole={currentUser?.role}
    >
      <div className="flex flex-col h-full min-h-full bg-background-light dark:bg-background-dark w-full overflow-x-hidden relative transition-colors duration-300">
        {!isAuthenticated && currentScreen !== AppScreen.SUPPLIER_QUOTE ? (
          <Login onLogin={(user) => { setCurrentUser(user); localStorage.setItem('smart_tech_user', JSON.stringify(user)); }} isDarkMode={isDarkMode} />
        ) : (
          <>
            <div className="md:hidden shrink-0">
              <Header currentScreen={currentScreen} avatarUrl={userAvatar} userName={currentUser?.name} />
            </div>
            <main className="flex-1 overflow-y-auto w-full pb-20">
              {renderScreen()}
            </main>
            <div className="md:hidden fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
              <div className="w-full max-w-md pointer-events-auto">
                <Navigation activeScreen={currentScreen} onNavigate={(screen) => setCurrentScreen(screen)} />
              </div>
            </div>
          </>
        )}
      </div>
    </DeviceSimulator>
  );
};

export default App;
