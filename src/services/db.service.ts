
import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface Business {
  id: string;
  name: string;
  hours: string;
}

export interface Professional {
  id: string;
  name: string;
  businessId: string;
  userId?: string; // Vinculo opcional com conta de login
}

export interface ServiceItem {
  id: string;
  name: string;
  duration: number;
  price: number;
  businessId: string;
}

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  notes?: string;
  businessId: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  businessId: string;
}

@Injectable({ providedIn: 'root' })
export class DbService {
  private auth = inject(AuthService);

  // Raw data from storage
  private _businesses = signal<Business[]>([]);
  private _professionals = signal<Professional[]>([]);
  private _services = signal<ServiceItem[]>([]);
  private _clients = signal<Client[]>([]);
  private _appointments = signal<Appointment[]>([]);

  // Computed signals that act like RLS (Row Level Security)
  business = computed(() => {
    const bid = this.auth.currentUser()?.businessId;
    return this._businesses().find(b => b.id === bid) || null;
  });

  professionals = computed(() => {
    const bid = this.auth.currentUser()?.businessId;
    return this._professionals().filter(p => p.businessId === bid);
  });

  services = computed(() => {
    const bid = this.auth.currentUser()?.businessId;
    return this._services().filter(s => s.businessId === bid);
  });

  clients = computed(() => {
    const bid = this.auth.currentUser()?.businessId;
    return this._clients().filter(c => c.businessId === bid);
  });

  appointments = computed(() => {
    const user = this.auth.currentUser();
    if (!user || !user.businessId) return [];

    const apps = this._appointments().filter(a => a.businessId === user.businessId);

    // Regra: Staff só vê os seus. Admin vê todos do estabelecimento.
    if (user.role === 'staff') {
      // Em um sistema real, mapearíamos o userId do Auth para o professionalId do DB
      // Para o MVP, assumimos que o profissional id é igual ao userId se vinculado
      return apps.filter(a => a.professionalId === user.id);
    }

    return apps;
  });

  constructor() {
    this.load();
  }

  private load() {
    const b = localStorage.getItem('bs_all_businesses');
    const p = localStorage.getItem('bs_all_pros');
    const s = localStorage.getItem('bs_all_services');
    const c = localStorage.getItem('bs_all_clients');
    const a = localStorage.getItem('bs_all_appointments');

    if (b) this._businesses.set(JSON.parse(b));
    if (p) this._professionals.set(JSON.parse(p));
    if (s) this._services.set(JSON.parse(s));
    if (c) this._clients.set(JSON.parse(c));
    if (a) this._appointments.set(JSON.parse(a));
  }

  private sync(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  saveBusiness(data: Business) {
    this._businesses.update(prev => {
      const idx = prev.findIndex(b => b.id === data.id);
      const next = idx >= 0 ? prev.map(b => b.id === data.id ? data : b) : [...prev, data];
      this.sync('bs_all_businesses', next);
      return next;
    });
  }

  addProfessional(prof: Professional) {
    const bid = this.auth.currentUser()?.businessId;
    if (!bid) return;
    this._professionals.update(prev => {
      const next = [...prev, { ...prof, businessId: bid }];
      this.sync('bs_all_pros', next);
      return next;
    });
  }

  // Implementation of missing Professional update/delete methods
  updateProfessional(prof: Professional) {
    this._professionals.update(prev => {
      const next = prev.map(p => p.id === prof.id ? prof : p);
      this.sync('bs_all_pros', next);
      return next;
    });
  }

  deleteProfessional(id: string) {
    this._professionals.update(prev => {
      const next = prev.filter(p => p.id !== id);
      this.sync('bs_all_pros', next);
      return next;
    });
  }

  addService(service: ServiceItem) {
    const bid = this.auth.currentUser()?.businessId;
    if (!bid) return;
    this._services.update(prev => {
      const next = [...prev, { ...service, businessId: bid }];
      this.sync('bs_all_services', next);
      return next;
    });
  }

  // Implementation of missing Service update/delete methods
  updateService(service: ServiceItem) {
    this._services.update(prev => {
      const next = prev.map(s => s.id === service.id ? service : s);
      this.sync('bs_all_services', next);
      return next;
    });
  }

  deleteService(id: string) {
    this._services.update(prev => {
      const next = prev.filter(s => s.id !== id);
      this.sync('bs_all_services', next);
      return next;
    });
  }

  addClient(client: Client) {
    const bid = this.auth.currentUser()?.businessId;
    if (!bid) return;
    this._clients.update(prev => {
      const next = [...prev, { ...client, businessId: bid }];
      this.sync('bs_all_clients', next);
      return next;
    });
  }

  addAppointment(app: Appointment) {
    const bid = this.auth.currentUser()?.businessId;
    if (!bid) return;
    this._appointments.update(prev => {
      const next = [...prev, { ...app, businessId: bid }];
      this.sync('bs_all_appointments', next);
      return next;
    });
  }

  updateAppointment(updated: Appointment) {
    this._appointments.update(prev => {
      const next = prev.map(a => a.id === updated.id ? updated : a);
      this.sync('bs_all_appointments', next);
      return next;
    });
  }

  updateAppointmentStatus(id: string, status: 'pending' | 'completed' | 'cancelled') {
    this._appointments.update(prev => {
      const next = prev.map(a => a.id === id ? { ...a, status } : a);
      this.sync('bs_all_appointments', next);
      return next;
    });
  }

  deleteAppointment(id: string) {
    this._appointments.update(prev => {
      const next = prev.filter(a => a.id !== id);
      this.sync('bs_all_appointments', next);
      return next;
    });
  }

  getClientName(id: string) {
    return this._clients().find(c => c.id === id)?.name || 'Cliente';
  }

  getServiceName(id: string) {
    return this._services().find(s => s.id === id)?.name || 'Serviço';
  }

  getProfessionalName(id: string) {
    return this._professionals().find(p => p.id === id)?.name || 'Profissional';
  }

  getTodayStats() {
    return computed(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      const apps = this.appointments().filter(a => a.date === todayStr);
      const finished = apps.filter(a => a.status === 'completed');
      
      const faturamento = finished.reduce((sum, app) => {
        const srv = this._services().find(s => s.id === app.serviceId);
        return sum + (srv?.price || 0);
      }, 0);

      return {
        count: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        faturamento
      };
    });
  }

  isAvailable(profId: string, date: string, time: string, serviceId: string, excludeAppId?: string): { available: boolean, conflict?: string } {
    const service = this._services().find(s => s.id === serviceId);
    if (!service) return { available: true };

    const duration = service.duration;
    const [h, m] = time.split(':').map(Number);
    const startInMinutes = h * 60 + m;
    const endInMinutes = startInMinutes + duration;

    // Verifica apenas os agendamentos da mesma empresa e profissional
    const dayApps = this._appointments().filter(a => 
      a.businessId === this.auth.currentUser()?.businessId &&
      a.date === date && 
      a.professionalId === profId && 
      a.status !== 'cancelled' &&
      a.id !== excludeAppId
    );

    for (const app of dayApps) {
      const appService = this._services().find(s => s.id === app.serviceId);
      if (!appService) continue;

      const [ah, am] = app.time.split(':').map(Number);
      const aStart = ah * 60 + am;
      const aEnd = aStart + appService.duration;

      if (startInMinutes < aEnd && endInMinutes > aStart) {
        const client = this._clients().find(c => c.id === app.clientId);
        return { 
          available: false, 
          conflict: `${client?.name || 'Cliente'} já tem agendamento às ${app.time}` 
        };
      }
    }
    return { available: true };
  }
}
