
import React, { useState, useEffect, useMemo } from 'react';
import { AppScreen, Vehicle, User, Shift, Supplier } from './types';
import DeviceSimulator from './components/DeviceSimulator';
import Dashboard from './components/Dashboard';
import ShiftStart from './components/ShiftStart';
import ShiftEnd from './components/ShiftEnd';
import TireBulletin from './components/TireBulletin';
import CostCenters from './components/CostCenters';
import Reports from './components/Reports';
import OSCreate from './components/OSCreate';
import OSControl from './components/OSControl';
import FuelControl from './components/FuelControl';
import FuelEntry from './components/FuelEntry';
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
import { supabase } from './services/supabase';

export interface OSDetail {
  id: string;
  plate: string;
  task: string;
  taskType: 'Preventiva' | 'Corretiva' | 'Preditiva';
  status: string;
  priority: string;
  time: string;
  mechanic: string;
  description: string;
  costCenter: string;
  openedAt: string;
  isPaid: boolean;
  costValue?: number;
  invoiceUrl?: string;
  quoteUrl?: string;
}

export interface FuelEntryData {
  id: string;
  plate: string;
  driver: string;
  date: string;
  costCenter: string;
  item: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  invoiceUrl?: string;
  supplier?: string;
}

export interface CostCenter {
  id: string;
  name: string;
  company: string;
  budget: number;
  color: string;
}

const DEFAULT_COST_CENTERS: CostCenter[] = [
  { id: '101', name: 'Colheita', company: 'AgroLog S.A.', budget: 50000, color: 'bg-primary' },
  { id: '102', name: 'Transp. Interno', company: 'AgroLog S.A.', budget: 50000, color: 'bg-accent-error' },
  { id: '201', name: 'Manutenção', company: 'Logística Centro-Oeste', budget: 10000, color: 'bg-primary' },
  { id: '304', name: 'Combustível', company: 'Expresso Rápido Ltda.', budget: 30000, color: 'bg-primary' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isAuthenticated = !!currentUser;
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.DASHBOARD);

  const [userAvatar, setUserAvatar] = useState(() => {
    return localStorage.getItem('smart_tech_avatar') || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop";
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('smart_tech_theme');
    return saved ? saved === 'dark' : false;
  });

  const [costCenters, setCostCenters] = useState<CostCenter[]>(DEFAULT_COST_CENTERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<OSDetail[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntryData[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeShifts, setActiveShifts] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Carregar dados do Supabase ao iniciar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen');
    if (screenParam === 'SUPPLIER_QUOTE') {
      setCurrentScreen(AppScreen.SUPPLIER_QUOTE);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar Veículos
        const { data: vData } = await supabase.from('vehicles').select('*');
        if (vData) {
          const mappedVehicles = vData.map((v: any) => ({
            id: v.id,
            plate: v.plate,
            model: v.model,
            type: v.type,
            status: v.status,
            km: v.km,
            lastPreventiveKm: v.last_preventive_km,
            costCenter: v.cost_center,
            year: '2023'
          }));
          setVehicles(mappedVehicles);
        }

        // Buscar OS
        const { data: oData } = await supabase.from('service_orders').select('*');
        if (oData) {
          const mappedOrders = oData.map((o: any) => ({
            id: o.id,
            plate: o.plate,
            task: o.description || 'Manutenção Diversa',
            taskType: o.type,
            status: o.status,
            priority: o.priority,
            time: new Date(o.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            mechanic: o.mechanic || 'Interno',
            description: o.description || '',
            costCenter: o.cost_center || 'Geral',
            openedAt: o.opened_at,
            isPaid: o.is_paid,
            costValue: Number(o.cost) || 0,
            invoiceUrl: o.invoice_url,
            quoteUrl: o.quote_url
          }));
          setOrders(mappedOrders);
        }

        // Buscar Combustível
        const { data: fData } = await supabase.from('fuel_entries').select('*');
        if (fData) {
          const mappedFuel = fData.map((f: any) => ({
            id: f.id,
            plate: f.plate,
            driver: f.driver || 'Motorista',
            date: f.date,
            costCenter: '304 - Combustível',
            item: f.fuel_type || 'Diesel',
            quantity: Number(f.quantity),
            unitPrice: Number(f.total_value) / Number(f.quantity),
            totalValue: Number(f.total_value),
            invoiceUrl: ''
          }));
          setFuelEntries(mappedFuel);
        }

        // Buscar Turnos (Shifts)
        const { data: sData } = await supabase.from('shifts').select('*');
        if (sData) {
          const mappedShifts = sData.map((s: any) => ({
            id: s.id,
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
        }

        // Buscar Fornecedores
        const { data: supData } = await supabase.from('suppliers').select('*');
        if (supData) {
          setSuppliers(supData as Supplier[]);
        }

      } catch (error) {
        console.error("Erro ao buscar dados do Supabase:", error);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Cálculos de Centros de Custo em tempo real
  const centersWithStats = useMemo(() => {
    return costCenters.map(center => {
      const fuelTotal = fuelEntries
        .filter(f => f.costCenter.includes(center.id))
        .reduce((sum, f) => sum + f.totalValue, 0);

      const osTotal = orders
        .filter(o => o.costCenter.includes(center.id))
        .reduce((sum, o) => sum + (o.costValue || 0), 0);

      const consumed = fuelTotal + osTotal;
      const progress = center.budget > 0 ? Math.min(100, Math.round((consumed / center.budget) * 100)) : 0;

      return {
        ...center,
        consumedValue: consumed,
        consumedStr: consumed.toLocaleString('pt-BR'),
        availableStr: (center.budget - consumed).toLocaleString('pt-BR'),
        progress,
        warning: progress >= 90
      };
    });
  }, [costCenters, fuelEntries, orders]);

  useEffect(() => { localStorage.setItem('smart_tech_cost_centers', JSON.stringify(costCenters)); }, [costCenters]);
  useEffect(() => { localStorage.setItem('smart_tech_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('smart_tech_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('smart_tech_fuel_entries', JSON.stringify(fuelEntries)); }, [fuelEntries]);
  useEffect(() => { localStorage.setItem('smart_tech_active_shifts', JSON.stringify(activeShifts)); }, [activeShifts]);

  useEffect(() => {
    if (isDarkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('smart_tech_theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('smart_tech_theme', 'light'); }
  }, [isDarkMode]);

  const updateVehicleKm = async (id: string, newKm: number) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ km: newKm })
        .eq('id', id);

      if (error) throw error;

      setVehicles(prev => prev.map(v => v.id === id ? { ...v, km: newKm } : v));
    } catch (error) {
      console.error("Erro ao atualizar KM no Supabase:", error);
    }
  };

  const handleAddFuelEntry = (entry: FuelEntryData) => {
    setFuelEntries(prev => [entry, ...prev]);
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

    if (!activeShifts.includes(shiftData.vehicle_id)) {
      setActiveShifts(prev => [...prev, shiftData.vehicle_id]);
    }
  };

  const handleFinishShift = (vehicleId: string) => {
    setShifts(prev => prev.map(s => {
      if (s.vehicle_id === vehicleId && s.status === 'OPEN') {
        return {
          ...s,
          endTime: new Date().toISOString(),
          status: 'CLOSED'
        };
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

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.DASHBOARD:
        return <Dashboard orders={orders} vehicles={vehicles} fuelEntries={fuelEntries} onAction={(screen) => setCurrentScreen(screen)} />;
      case AppScreen.SHIFT_START:
        return <ShiftStart
          vehicles={vehicles}
          onUpdateKm={updateVehicleKm}
          onBack={() => setCurrentScreen(AppScreen.DASHBOARD)}
          activeShifts={activeShifts}
          onStartShift={handleStartShift}
          onFinishShift={handleFinishShift}
        />;
      case AppScreen.SHIFT_END:
        return <ShiftEnd onBack={() => setCurrentScreen(AppScreen.DASHBOARD)} />;
      case AppScreen.OS_CONTROL:
        return <OSControl orders={orders} setOrders={setOrders} onAction={(screen) => setCurrentScreen(screen)} />;
      case AppScreen.OS_CREATE:
        return <OSCreate vehicles={vehicles} setOrders={setOrders} onBack={() => setCurrentScreen(AppScreen.OS_CONTROL)} />;
      case AppScreen.FUEL_CONTROL:
        return <FuelControl fuelEntries={fuelEntries} onAction={(screen) => setCurrentScreen(screen)} />;
      case AppScreen.FUEL_ENTRY:
        return <FuelEntry vehicles={vehicles} suppliers={suppliers} onSave={handleAddFuelEntry} onBack={() => setCurrentScreen(AppScreen.FUEL_CONTROL)} />;
      case AppScreen.COST_CENTERS:
        return <CostCenters centers={centersWithStats} setCenters={setCostCenters} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.FLEET_MANAGEMENT:
        return <FleetManagement vehicles={vehicles} setVehicles={setVehicles} costCenters={costCenters} onAction={(screen) => setCurrentScreen(screen)} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.REPORTS:
        return <Reports vehicles={vehicles} orders={orders} fuelEntries={fuelEntries} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.TIRE_BULLETIN:
        return <TireBulletin vehicles={vehicles} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.USER_MANAGEMENT:
        return <UserManagement currentUserRole={currentUser?.role || 'OPERADOR'} costCenters={costCenters} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.SUPPLIER_MANAGEMENT:
        return <SupplierManagement onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.BACKLOG:
        return <Backlog shifts={shifts} onAction={(screen) => setCurrentScreen(screen)} onBack={() => setCurrentScreen(AppScreen.DASHBOARD)} />;
      case AppScreen.SUPPLIER_QUOTE:
        return <SupplierQuote onBack={() => setCurrentScreen(AppScreen.DASHBOARD)} />;
      case AppScreen.CHECKLIST_HISTORY:
        return <ChecklistHistory
          shifts={shifts}
          vehicles={vehicles}
          onBack={() => setCurrentScreen(AppScreen.SETTINGS)}
          onEdit={handleUpdateShift}
          onDelete={handleDeleteShift}
        />;
      case AppScreen.SETTINGS:
        return <Settings
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onAction={(screen) => setCurrentScreen(screen)}
          avatarUrl={userAvatar}
          onAvatarChange={(nav) => setUserAvatar(nav)}
          onLogout={() => { setCurrentUser(null); setCurrentScreen(AppScreen.DASHBOARD); }}
          userRole={currentUser?.role || 'OPERADOR'}
        />;
      default:
        return <Dashboard orders={orders} vehicles={vehicles} fuelEntries={fuelEntries} onAction={(screen) => setCurrentScreen(screen)} />;
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
          <Login onLogin={(user) => setCurrentUser(user)} isDarkMode={isDarkMode} />
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
