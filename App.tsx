
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

// DADOS DE EMERGÊNCIA (Caso a conexão com o banco oficial esteja off-line)
const FALLBACK_COST_CENTERS: CostCenter[] = [
  { id: '1', name: 'ADMINISTRAÇÃO SUL', company: 'PREFEITURA SEDE', budget: 50000, color: 'bg-primary' },
  { id: '2', name: 'SAÚDE PÚBLICA', company: 'HOSPITAL MUNICIPAL', budget: 120000, color: 'bg-emerald-500' },
  { id: '3', name: 'EDUCAÇÃO E TRANSPORTE', company: 'CENTRO EDUCACIONAL', budget: 75000, color: 'bg-purple-500' }
];

const FALLBACK_VEHICLES: Vehicle[] = [
  { id: '1', plate: 'BRA2E19', model: 'Fiat Cronos', type: 'Carro Leve', status: 'ACTIVE', km: 24500, costCenter: '1 - ADMINISTRAÇÃO SUL', year: '2023', sector: 'Gabinete', responsibleName: 'Ricardo Henrique' },
  { id: '2', plate: 'ABC1234', model: 'VW Gol', type: 'Carro Leve', status: 'MAINTENANCE', km: 45000, costCenter: '2 - SAÚDE PÚBLICA', year: '2021', sector: 'Ambulância', responsibleName: 'Dr. Santos' }
];

const App: React.FC = () => {
  // Inicialização com Fallback se o console estiver zerado
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => {
    const cached = localStorage.getItem('smart_tech_cost_centers');
    const data = cached ? JSON.parse(cached) : [];
    return data.length > 0 ? data : FALLBACK_COST_CENTERS;
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const cached = localStorage.getItem('smart_tech_vehicles');
    const data = cached ? JSON.parse(cached) : [];
    return data.length > 0 ? data : FALLBACK_VEHICLES;
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
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('smart_tech_user');
    // Login automático em modo offline se já houver sessão
    if (stored) return JSON.parse(stored);
    return null;
  });

  const isAuthenticated = !!currentUser;
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.DASHBOARD);
  const [loading, setLoading] = useState(false);

  const [userAvatar, setUserAvatar] = useState(() => {
    return localStorage.getItem('smart_tech_avatar') || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop";
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('smart_tech_theme');
    return saved ? saved === 'dark' : false;
  });

  // Título e Meta SEO
  useEffect(() => {
    document.title = "SmarTECH - Gestão de Frotas Prefeitura";
  }, []);

  // Sincronização completa com Supabase (com tratamento de offline)
  const startSync = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      console.log("Tentando sincronizar com servidor...");

      // Centros de Custo
      const { data: ccData, error: ccErr } = await supabase.from('cost_centers').select('*');
      if (ccData && ccData.length > 0) {
        setCostCenters(ccData.map((c: any) => ({
          id: c.id.toString(),
          name: c.name,
          company: c.company,
          budget: Number(c.budget),
          color: c.color || 'bg-primary'
        })));
      } else if (ccErr) {
        console.warn("Servidor offline ou inadimplente. Usando dados locais.");
      }

      // Veículos
      const { data: vData } = await supabase.from('vehicles').select('*');
      if (vData && vData.length > 0) {
        setVehicles(vData.map((v: any) => ({
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
        })));
      }

      // OS
      const { data: oData } = await supabase.from('service_orders').select('*');
      if (oData && oData.length > 0) {
        setOrders(oData.map((o: any) => ({
          id: o.id.toString(),
          plate: o.plate,
          task: o.description || 'Manutenção',
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
          quoteUrl: o.quote_url
        })).sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()));
      }

    } catch (error) {
      console.error("Erro na sincronização - Rodando em modo Local.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) startSync();
  }, [isAuthenticated]);

  // Persistência local (Cache)
  useEffect(() => { localStorage.setItem('smart_tech_cost_centers', JSON.stringify(costCenters)); }, [costCenters]);
  useEffect(() => { localStorage.setItem('smart_tech_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('smart_tech_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('smart_tech_shifts', JSON.stringify(shifts)); }, [shifts]);
  useEffect(() => { localStorage.setItem('smart_tech_active_shifts', JSON.stringify(activeShifts)); }, [activeShifts]);
  useEffect(() => { 
    if (currentUser) localStorage.setItem('smart_tech_user', JSON.stringify(currentUser));
    else localStorage.removeItem('smart_tech_user');
  }, [currentUser]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('smart_tech_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('smart_tech_user');
    setCurrentScreen(AppScreen.LOGIN);
  };

  const updateVehicleKm = async (id: string, newKm: number) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, km: newKm } : v));
    try {
      await supabase.from('vehicles').update({ km: newKm }).eq('id', id);
    } catch {}
  };

  const handleStartShift = async (shiftData: any) => {
    const newShift: Shift = {
      id: Math.random().toString(36).substr(2, 9),
      vehicle_id: shiftData.vehicle_id,
      driverName: shiftData.driverName,
      startTime: shiftData.startTime,
      startKm: shiftData.startKm,
      status: 'OPEN'
    };
    setShifts(prev => [newShift, ...prev]);
    setActiveShifts(prev => [...prev, shiftData.vehicle_id]);
  };

  const handleFinishShift = (vehicleId: string) => {
    setShifts(prev => prev.map(s => (s.vehicle_id === vehicleId && s.status === 'OPEN') ? { ...s, endTime: new Date().toISOString(), status: 'CLOSED' } : s));
    setActiveShifts(prev => prev.filter(id => id !== vehicleId));
  };

  // Cálculos e Filtros (Enrichment)
  const centersWithStats = useMemo(() => {
    return costCenters.map(center => {
      const osTotal = orders
        .filter(o => o.costCenter?.split(' ')[0] === center.id)
        .reduce((sum, o) => sum + (o.costValue || 0), 0);

      const vehicleCount = vehicles.filter(v => v.costCenter?.split(' ')[0] === center.id).length;
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

  const { filteredOrders, filteredVehicles, filteredShifts, filteredCenters } = useMemo(() => {
    if (!currentUser || currentUser.role === 'ADMIN') {
      return { filteredOrders: orders, filteredVehicles: vehicles, filteredShifts: shifts, filteredCenters: centersWithStats };
    }
    const userCCId = currentUser.costCenter?.split(' ')[0] || '';
    if (!userCCId) return { filteredOrders: [], filteredVehicles: [], filteredShifts: [], filteredCenters: [] };

    return {
      filteredOrders: orders.filter(o => o.costCenter?.startsWith(userCCId)),
      filteredVehicles: vehicles.filter(v => v.costCenter?.startsWith(userCCId)),
      filteredShifts: shifts.filter(s => vehicles.find(v => v.id === s.vehicle_id)?.costCenter?.startsWith(userCCId)),
      filteredCenters: centersWithStats.filter(c => c.id === userCCId)
    };
  }, [currentUser, orders, vehicles, shifts, centersWithStats]);

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.DASHBOARD:
        return <Dashboard orders={filteredOrders} vehicles={filteredVehicles} costCenters={filteredCenters} onAction={setCurrentScreen} />;
      case AppScreen.SHIFT_START:
        return <ShiftStart vehicles={filteredVehicles} onUpdateKm={updateVehicleKm} onBack={() => setCurrentScreen(AppScreen.DASHBOARD)} activeShifts={activeShifts} onStartShift={handleStartShift} onFinishShift={handleFinishShift} />;
      case AppScreen.OS_CONTROL:
        return <OSControl orders={filteredOrders} setOrders={setOrders} setVehicles={setVehicles} onAction={setCurrentScreen} isAdmin={currentUser?.role === 'ADMIN'} />;
      case AppScreen.OS_CREATE:
        return <OSCreate vehicles={filteredVehicles} setVehicles={setVehicles} setOrders={setOrders} onBack={() => setCurrentScreen(AppScreen.OS_CONTROL)} userCostCenter={currentUser?.role !== 'ADMIN' ? currentUser?.costCenter : undefined} />;
      case AppScreen.COST_CENTERS:
        return <CostCenters centers={filteredCenters} setCenters={setCostCenters} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} isAdmin={currentUser?.role === 'ADMIN'} />;
      case AppScreen.FLEET_MANAGEMENT:
        return <FleetManagement vehicles={filteredVehicles} setVehicles={setVehicles} costCenters={costCenters} onAction={setCurrentScreen} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} isAdmin={currentUser?.role === 'ADMIN'} />;
      case AppScreen.REPORTS:
        return <Reports vehicles={filteredVehicles} orders={filteredOrders} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.TIRE_BULLETIN:
        return <TireBulletin vehicles={filteredVehicles} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} isAdmin={currentUser?.role === 'ADMIN'} />;
      case AppScreen.USER_MANAGEMENT:
        return <UserManagement currentUserRole={currentUser?.role || 'OPERADOR'} costCenters={costCenters} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} isAdmin={currentUser?.role === 'ADMIN'} />;
      case AppScreen.BACKLOG:
        return <Backlog shifts={filteredShifts} onAction={setCurrentScreen} onBack={() => setCurrentScreen(AppScreen.DASHBOARD)} isAdmin={currentUser?.role === 'ADMIN'} onResolve={() => {}} />;
      case AppScreen.SETTINGS:
        return <Settings isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} onAction={setCurrentScreen} avatarUrl={userAvatar} onAvatarChange={setUserAvatar} onLogout={handleLogout} userRole={currentUser?.role || 'OPERADOR'} userName={currentUser?.name || 'Administrador'} onSync={startSync} />;
      default:
        return <Dashboard orders={filteredOrders} vehicles={filteredVehicles} onAction={setCurrentScreen} costCenters={filteredCenters} />;
    }
  };

  const [isAuth, setIsAuth] = useState(isAuthenticated);
  useEffect(() => { setIsAuth(isAuthenticated); }, [isAuthenticated]);

  return (
    <DeviceSimulator
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      showSidebar={isAuth}
      userAvatar={userAvatar}
      userName={currentUser?.name}
      userRole={currentUser?.role}
    >
      <div className="flex flex-col h-full min-h-full bg-background-light dark:bg-background-dark w-full overflow-x-hidden relative transition-colors duration-300">
        {!isAuth ? (
          <Login onLogin={(user) => { setCurrentUser(user); setIsAuth(true); localStorage.setItem('smart_tech_user', JSON.stringify(user)); }} isDarkMode={isDarkMode} />
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
                <Navigation activeScreen={currentScreen} onNavigate={setCurrentScreen} />
              </div>
            </div>
          </>
        )}
      </div>
    </DeviceSimulator>
  );
};

export default App;
