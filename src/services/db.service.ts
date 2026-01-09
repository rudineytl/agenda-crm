
import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

export interface Business {
  id: string;
  name: string;
  hours: string;
  branding_color?: string;
  logo_url?: string;
}

export interface Professional {
  id: string;
  name: string;
  business_id: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  duration: number;
  price: number;
  business_id: string;
}

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  notes?: string;
  business_id: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  service_id: string;
  professional_id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  business_id: string;
}

@Injectable({ providedIn: 'root' })
export class DbService {
  private auth = inject(AuthService);
  private supabase = inject(SupabaseService);

  public _business = signal<Business | null>(null);
  public _professionals = signal<Professional[]>([]);
  public _services = signal<ServiceItem[]>([]);
  public _clients = signal<Client[]>([]);
  public _appointments = signal<Appointment[]>([]);

  business = computed(() => this._business());
  professionals = computed(() => this._professionals());
  services = computed(() => this._services());
  clients = computed(() => this._clients());
  appointments = computed(() => this._appointments());

  // White Label: Computed signal para cor do tema
  brandColor = computed(() => this._business()?.branding_color || '#4f46e5');
  
  // White Label: Computed signal para cor de contraste (texto sobre o tema)
  brandContrastColor = computed(() => {
    const hex = this.brandColor().replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#1e293b' : '#ffffff';
  });

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user?.businessId) {
        this.loadAllData(user.businessId);
      } else {
        this.clearData();
      }
    });
  }

  private clearData() {
    this._business.set(null);
    this._professionals.set([]);
    this._services.set([]);
    this._clients.set([]);
    this._appointments.set([]);
  }

  private getActiveBusinessId(): string {
    const id = this.auth.currentUser()?.businessId;
    if (!id) throw new Error('Acesso negado.');
    return id;
  }

  async loadAllData(businessId: string) {
    try {
      const [bus, profs, servs, clis, apps] = await Promise.all([
        this.supabase.client.from('businesses').select('*').eq('id', businessId).single(),
        this.supabase.client.from('professionals').select('*').eq('business_id', businessId),
        this.supabase.client.from('services').select('*').eq('business_id', businessId),
        this.supabase.client.from('clients').select('*').eq('business_id', businessId),
        this.supabase.client.from('appointments').select('*').eq('business_id', businessId)
      ]);

      if (bus.data) this._business.set(bus.data);
      if (profs.data) this._professionals.set(profs.data || []);
      if (servs.data) this._services.set(servs.data || []);
      if (clis.data) this._clients.set(clis.data || []);
      if (apps.data) this._appointments.set(apps.data || []);
    } catch (error) {
      console.error('Erro de sincronização:', error);
    }
  }

  async addClient(client: Omit<Client, 'id' | 'business_id'>) {
    const bid = this.getActiveBusinessId();
    const { data, error } = await this.supabase.client
      .from('clients')
      .insert({ ...client, business_id: bid })
      .select()
      .single();

    if (data) this._clients.update(prev => [...prev, data]);
    return { data, error };
  }

  async addAppointment(app: Omit<Appointment, 'id' | 'business_id'>) {
    const bid = this.getActiveBusinessId();
    const { data, error } = await this.supabase.client
      .from('appointments')
      .insert({ ...app, business_id: bid })
      .select()
      .single();

    if (data) this._appointments.update(prev => [...prev, data]);
    return { data, error };
  }

  async updateAppointment(app: Appointment) {
    const bid = this.getActiveBusinessId();
    const { error } = await this.supabase.client
      .from('appointments')
      .update(app)
      .eq('id', app.id)
      .eq('business_id', bid);

    if (!error) {
      this._appointments.update(prev => prev.map(a => a.id === app.id ? app : a));
    }
  }

  async updateAppointmentStatus(id: string, status: string) {
    const bid = this.getActiveBusinessId();
    const { error } = await this.supabase.client
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .eq('business_id', bid);

    if (!error) {
      this._appointments.update(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a));
    }
  }

  async deleteAppointment(id: string) {
    const bid = this.getActiveBusinessId();
    const { error } = await this.supabase.client
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('business_id', bid);

    if (!error) {
      this._appointments.update(prev => prev.filter(a => a.id !== id));
    }
  }

  async addService(service: Omit<ServiceItem, 'id' | 'business_id'>) {
    const bid = this.getActiveBusinessId();
    const { data, error } = await this.supabase.client
      .from('services')
      .insert({ ...service, business_id: bid })
      .select()
      .single();

    if (data) this._services.update(prev => [...prev, data]);
    return { data, error };
  }

  async updateService(service: ServiceItem) {
    const bid = this.getActiveBusinessId();
    const { error } = await this.supabase.client
      .from('services')
      .update(service)
      .eq('id', service.id)
      .eq('business_id', bid);

    if (!error) {
      this._services.update(prev => prev.map(s => s.id === service.id ? service : s));
    }
  }

  async deleteService(id: string) {
    const bid = this.getActiveBusinessId();
    const { error } = await this.supabase.client
      .from('services')
      .delete()
      .eq('id', id)
      .eq('business_id', bid);

    if (!error) {
      this._services.update(prev => prev.filter(s => s.id !== id));
    }
  }

  async addProfessional(prof: Omit<Professional, 'id' | 'business_id'>) {
    const bid = this.getActiveBusinessId();
    const { data, error } = await this.supabase.client
      .from('professionals')
      .insert({ ...prof, business_id: bid })
      .select()
      .single();

    if (data) this._professionals.update(prev => [...prev, data]);
    return { data, error };
  }

  async updateProfessional(prof: Professional) {
    const bid = this.getActiveBusinessId();
    const { error } = await this.supabase.client
      .from('professionals')
      .update(prof)
      .eq('id', prof.id)
      .eq('business_id', bid);

    if (!error) {
      this._professionals.update(prev => prev.map(p => p.id === prof.id ? prof : p));
    }
  }

  async deleteProfessional(id: string) {
    const bid = this.getActiveBusinessId();
    const { error } = await this.supabase.client
      .from('professionals')
      .delete()
      .eq('id', id)
      .eq('business_id', bid);

    if (!error) {
      this._professionals.update(prev => prev.filter(p => p.id !== id));
    }
  }

  async saveBusiness(data: Partial<Business>) {
    const bid = this.getActiveBusinessId();
    const { data: saved, error } = await this.supabase.client
      .from('businesses')
      .update(data)
      .eq('id', bid)
      .select()
      .single();
    
    if (saved) this._business.set(saved);
    return { saved, error };
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
      const apps = this._appointments().filter(a => a.date === todayStr);
      const finished = apps.filter(a => a.status === 'completed');
      
      const faturamento = finished.reduce((sum, app) => {
        const srv = this._services().find(s => s.id === app.service_id);
        return sum + (Number(srv?.price) || 0);
      }, 0);

      return {
        count: apps.length,
        pending: apps.filter(a => a.status === 'pending' || a.status === 'confirmed').length,
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

    const dayApps = this._appointments().filter(a => 
      a.date === date && 
      a.professional_id === profId && 
      a.status !== 'cancelled' &&
      a.id !== excludeAppId
    );

    for (const app of dayApps) {
      const appService = this._services().find(s => s.id === app.service_id);
      if (!appService) continue;

      const [ah, am] = app.time.split(':').map(Number);
      const aStart = ah * 60 + am;
      const aEnd = aStart + appService.duration;

      if (startInMinutes < aEnd && endInMinutes > aStart) {
        const client = this._clients().find(c => c.id === app.client_id);
        return { 
          available: false, 
          conflict: `${client?.name || 'Cliente'} já tem agendamento às ${app.time}` 
        };
      }
    }
    return { available: true };
  }

  async createInitialSetup(businessName: string, profName: string, services: any[]) {
    const { data: bus, error: bErr } = await this.supabase.client
      .from('businesses')
      .insert({ name: businessName, hours: '08:00 - 18:00', branding_color: '#4f46e5' })
      .select()
      .single();

    if (bErr || !bus) throw new Error("Erro ao criar empresa.");

    await this.supabase.client
      .from('professionals')
      .insert({ name: profName, business_id: bus.id });

    const servicesToInsert = services.map(s => ({ ...s, business_id: bus.id }));
    await this.supabase.client.from('services').insert(servicesToInsert);

    return bus.id;
  }
}
