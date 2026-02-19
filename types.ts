
export enum AppScreen {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  FLEET_MANAGEMENT = 'FLEET_MANAGEMENT',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS',
  SHIFT_START = 'SHIFT_START',
  SHIFT_END = 'SHIFT_END',
  TIRE_BULLETIN = 'TIRE_BULLETIN',

  COST_CENTERS = 'COST_CENTERS',
  OS_CREATE = 'OS_CREATE',
  OS_CONTROL = 'OS_CONTROL',

  USER_MANAGEMENT = 'USER_MANAGEMENT',
  SUPPLIER_MANAGEMENT = 'SUPPLIER_MANAGEMENT',
  BACKLOG = 'BACKLOG',
  SUPPLIER_QUOTE = 'SUPPLIER_QUOTE',
  CHECKLIST_HISTORY = 'CHECKLIST_HISTORY'
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  type: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  km: number;
  lastPreventiveKm?: number;
  year?: string;
  costCenter?: string;
  responsibleEmail?: string;
}

export interface OS {
  id: string;
  plate: string;
  type: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'FINISHED' | 'PENDING_SYNC';
  date: string;
  mechanic?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isPaid: boolean;
  costCenter: string;
}

export interface TireStatus {
  position: 'DE' | 'DD' | 'TE' | 'TD';
  life: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'GESTOR' | 'OPERADOR' | 'MOTORISTA';
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
  costCenter?: string;
  password?: string;
  changePassword?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  document: string;
  category: 'PEÇAS' | 'SERVIÇOS' | 'PNEUS';
  contact: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BacklogItem {
  id: string;
  plate: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requestDate: string;
  source: string;
}
export interface Shift {
  id: string;
  vehicle_id: string;
  driverName: string;
  startTime: string;
  endTime?: string;
  startKm: number;
  endKm?: number;
  checklistData?: any;
  damageReport?: any;
  signatureUrl?: string;
  status: 'OPEN' | 'CLOSED';
}

export interface CostCenter {
  id: string;
  name: string;
  company: string;
  budget: number;
  color: string;
}

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
  createdAt?: string;
  isPaid: boolean;
  costValue?: number;
  invoiceUrl?: string;
  quoteUrl?: string;
  previousPreventiveKm?: number;
}


