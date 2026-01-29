
import React, { useState, useEffect, useMemo } from 'react';
import { AppScreen, Vehicle, User } from './types';
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

const DEFAULT_VEHICLES: Vehicle[] = [
  { id: '9021', plate: 'FLT-9021', model: 'Scania R450', type: 'Caminhão Pesado', status: 'ACTIVE', km: 142850, lastPreventiveKm: 138000, year: '2022', costCenter: '101 - Colheita', responsibleEmail: 'gerencia.transporte@empresa.com' },
  { id: '8821', plate: 'BRA-2E19', model: 'Volvo FH 540', type: 'Caminhão Pesado', status: 'ACTIVE', km: 99300, lastPreventiveKm: 85000, year: '2023', costCenter: '201 - Manutenção', responsibleEmail: 'manutencao@empresa.com' },
  { id: '1234', plate: 'ABC-1234', model: 'Mercedes-Benz Actros', type: 'Caminhão Pesado', status: 'ACTIVE', km: 210500, lastPreventiveKm: 200000, year: '2021', costCenter: '101 - Colheita', responsibleEmail: 'operacoes@empresa.com' },
  { id: '1020', plate: 'VAN-1020', model: 'Sprinter 415', type: 'Utilitário', status: 'INACTIVE', km: 45000, lastPreventiveKm: 40000, year: '2020', costCenter: '102 - Transp. Interno' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isAuthenticated = !!currentUser;
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.DASHBOARD);

  const [userAvatar, setUserAvatar] = useState(() => {
    return localStorage.getItem('fleet_master_avatar') || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop";
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('fleet_master_theme');
    return saved ? saved === 'dark' : false;
  });

  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => {
    try {
      const saved = localStorage.getItem('fleet_master_cost_centers');
      return saved ? JSON.parse(saved) : DEFAULT_COST_CENTERS;
    } catch (e) { return DEFAULT_COST_CENTERS; }
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem('fleet_master_vehicles');
      return saved ? JSON.parse(saved) : DEFAULT_VEHICLES;
    } catch (e) { return DEFAULT_VEHICLES; }
  });

  const [orders, setOrders] = useState<OSDetail[]>(() => {
    try {
      const saved = localStorage.getItem('fleet_master_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [fuelEntries, setFuelEntries] = useState<FuelEntryData[]>(() => {
    try {
      const saved = localStorage.getItem('fleet_master_fuel_entries');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [activeShifts, setActiveShifts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fleet_master_active_shifts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

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

  useEffect(() => { localStorage.setItem('fleet_master_cost_centers', JSON.stringify(costCenters)); }, [costCenters]);
  useEffect(() => { localStorage.setItem('fleet_master_vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('fleet_master_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('fleet_master_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('fleet_master_fuel_entries', JSON.stringify(fuelEntries)); }, [fuelEntries]);
  useEffect(() => { localStorage.setItem('fleet_master_active_shifts', JSON.stringify(activeShifts)); }, [activeShifts]);

  useEffect(() => {
    if (isDarkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('fleet_master_theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('fleet_master_theme', 'light'); }
  }, [isDarkMode]);

  const updateVehicleKm = (id: string, newKm: number) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, km: newKm } : v));
  };

  const handleAddFuelEntry = (entry: FuelEntryData) => {
    setFuelEntries(prev => [entry, ...prev]);
  };

  const handleStartShift = (vehicleId: string) => {
    if (!activeShifts.includes(vehicleId)) {
      setActiveShifts(prev => [...prev, vehicleId]);
    }
  };

  const handleFinishShift = (vehicleId: string) => {
    setActiveShifts(prev => prev.filter(id => id !== vehicleId));
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
        return <FuelEntry vehicles={vehicles} onSave={handleAddFuelEntry} onBack={() => setCurrentScreen(AppScreen.FUEL_CONTROL)} />;
      case AppScreen.COST_CENTERS:
        return <CostCenters centers={centersWithStats} setCenters={setCostCenters} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.FLEET_MANAGEMENT:
        return <FleetManagement vehicles={vehicles} setVehicles={setVehicles} costCenters={costCenters} onAction={(screen) => setCurrentScreen(screen)} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.REPORTS:
        return <Reports onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.TIRE_BULLETIN:
        return <TireBulletin vehicles={vehicles} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.USER_MANAGEMENT:
        return <UserManagement onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.SUPPLIER_MANAGEMENT:
        return <SupplierManagement onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
      case AppScreen.BACKLOG:
        return <Backlog onAction={(screen) => setCurrentScreen(screen)} onBack={() => setCurrentScreen(AppScreen.SETTINGS)} />;
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
    <DeviceSimulator>
      <div className="flex flex-col h-full min-h-full bg-background-light dark:bg-background-dark w-full overflow-x-hidden relative transition-colors duration-300">
        {!isAuthenticated ? (
          <Login onLogin={(user) => setCurrentUser(user)} />
        ) : (
          <>
            <Header currentScreen={currentScreen} avatarUrl={userAvatar} />
            <main className={`flex-1 overflow-y-auto`}>
              {renderScreen()}
            </main>
            <Navigation activeScreen={currentScreen} onNavigate={(screen) => setCurrentScreen(screen)} />
          </>
        )}
      </div>
    </DeviceSimulator>
  );
};

export default App;
