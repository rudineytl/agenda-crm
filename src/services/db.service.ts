
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
  email: string;
  status: 'active' | 'inactive';
  business_id: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  duration: number;
  price: number;
  status: 'active' | 'inactive';
  business_id: string;
}

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  birth_date?: string;
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
  reminder?: 'none' | '1h' | '2h' | '24h';
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

  weeklyBirthdays = computed(() => {
    const clients = this._clients();
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return clients.filter(client => {
      if (!client.birth_date) return false;

      const [year, month, day] = client.birth_date.split('-').map(Number);
      const birthDate = new Date(today.getFullYear(), month - 1, day);

      // Check if birthday falls within this week (of any year)
      return birthDate >= startOfWeek && birthDate <= endOfWeek;
    }).sort((a, b) => {
      const [ya, ma, da] = a.birth_date!.split('-').map(Number);
      const [yb, mb, db] = b.birth_date!.split('-').map(Number);
      return ma !== mb ? ma - mb : da - db;
    });
  });

  public _appointments = signal<Appointment[]>([]);
  public _loading = signal(false);
  public lastSync = signal<Date | null>(null);

  business = computed(() => this._business());
  professionals = computed(() => this._professionals());
  services = computed(() => this._services());
  clients = computed(() => this._clients());
  appointments = computed(() => {
    const user = this.auth.currentUser();
    const allApps = this._appointments();
    if (user?.role === 'staff' && user.professionalId) {
      return allApps.filter(a => a.professional_id === user.professionalId);
    }
    return allApps;
  });

  activeServices = computed(() => this._services().filter(s => s.status === 'active' || !s.status));
  activeProfessionals = computed(() => this._professionals().filter(p => p.status === 'active'));

  brandColor = computed(() => this._business()?.branding_color || '#4f46e5');

  brandContrastColor = computed(() => {
    const color = this.brandColor();
    const hex = color.startsWith('#') ? color.replace('#', '') : '4f46e5';
    if (hex.length !== 6) return '#ffffff';
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
    this.lastSync.set(null);
  }

  private getActiveBusinessId(): string {
    const id = this.auth.currentUser()?.businessId;
    if (!id) throw new Error('Usuário sem empresa vinculada');
    return id;
  }

  isConfigured(): boolean {
    return this.supabase.isReady;
  }

  private timeToMinutes(time: string): number {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return (h * 60) + m;
  }

  checkConflict(profId: string, date: string, time: string, duration: number, excludeAppId?: string): boolean {
    if (!profId || !date || !time || !duration) return false;
    const newStart = this.timeToMinutes(time);
    const newEnd = newStart + duration;
    return this._appointments().some(a => {
      if (a.professional_id !== profId || a.date !== date || a.id === excludeAppId || a.status === 'cancelled') return false;
      const existingService = this._services().find(s => s.id === a.service_id);
      const existingDuration = existingService?.duration || 60;
      const existingStart = this.timeToMinutes(a.time);
      const existingEnd = existingStart + existingDuration;
      return (newStart < existingEnd && newEnd > existingStart);
    });
  }

  async loadAllData(businessId: string) {
    if (!this.isConfigured()) {
      if (!this._business()) {
        this._business.set({ id: businessId, name: 'Agenda CRM Demo', hours: '08:00 - 18:00', branding_color: '#4f46e5' });
      }
      this.lastSync.set(new Date());
      return;
    }

    this._loading.set(true);
    try {
      const [bus, profs, servs, clis, apps] = await Promise.all([
        this.supabase.client.from('businesses').select('*').eq('id', businessId).maybeSingle(),
        this.supabase.client.from('professionals').select('*').eq('business_id', businessId),
        this.supabase.client.from('services').select('*').eq('business_id', businessId),
        this.supabase.client.from('clients').select('*').eq('business_id', businessId),
        this.supabase.client.from('appointments').select('*').eq('business_id', businessId)
      ]);

      if (bus.data) this._business.set(bus.data);
      this._professionals.set(profs.data || []);
      this._services.set(servs.data || []);
      this._clients.set(clis.data || []);
      this._appointments.set(apps.data || []);
      this.lastSync.set(new Date());
    } catch (error) {
      console.error('DbService Sync Error:', error);
    } finally {
      this._loading.set(false);
    }
  }

  async saveBusiness(data: Partial<Business>) {
    const bid = this.getActiveBusinessId();
    if (!this.isConfigured()) {
      this._business.update(curr => curr ? { ...curr, ...data } : { id: bid, ...data } as Business);
      return { saved: this._business(), error: null };
    }
    const { data: saved, error } = await this.supabase.client.from('businesses').update(data).eq('id', bid).select().single();
    if (saved) this._business.set(saved);
    return { saved, error };
  }

  getClientName(id: string) { return this._clients().find(c => c.id === id)?.name || 'Cliente'; }
  getServiceName(id: string) { return this._services().find(s => s.id === id)?.name || 'Serviço'; }
  getProfessionalName(id: string) { return this._professionals().find(p => p.id === id)?.name || 'Profissional'; }

  async addClient(client: Omit<Client, 'id' | 'business_id'>) {
    const bid = this.getActiveBusinessId();
    const { data, error } = await this.supabase.client.from('clients').insert({ ...client, business_id: bid }).select().single();
    if (data) this._clients.update(prev => [...prev, data]);
    return { data, error };
  }

  async updateClient(client: Client) {
    this._clients.update(prev => prev.map(c => c.id === client.id ? client : c));
    if (this.isConfigured()) await this.supabase.client.from('clients').update(client).eq('id', client.id);
  }

  async deleteClient(id: string) {
    this._clients.update(prev => prev.filter(c => c.id !== id));
    if (this.isConfigured()) await this.supabase.client.from('clients').delete().eq('id', id);
  }

  async addAppointment(app: Omit<Appointment, 'id' | 'business_id'>) {
    const bid = this.getActiveBusinessId();
    const { data, error } = await this.supabase.client.from('appointments').insert({ ...app, business_id: bid }).select().single();
    if (data) this._appointments.update(prev => [...prev, data]);
    return { data, error };
  }

  async updateAppointmentStatus(id: string, status: string) {
    this._appointments.update(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a));
    if (this.isConfigured()) await this.supabase.client.from('appointments').update({ status }).eq('id', id);
  }

  async updateAppointment(app: Appointment) {
    this._appointments.update(prev => prev.map(a => a.id === app.id ? app : a));
    if (this.isConfigured()) await this.supabase.client.from('appointments').update(app).eq('id', app.id);
  }

  async deleteAppointment(id: string) {
    this._appointments.update(prev => prev.filter(a => a.id !== id));
    if (this.isConfigured()) await this.supabase.client.from('appointments').delete().eq('id', id);
  }

  async addService(service: Omit<ServiceItem, 'id' | 'business_id'>) {
    const bid = this.getActiveBusinessId();
    const { data, error } = await this.supabase.client.from('services').insert({ ...service, business_id: bid, status: 'active' }).select().single();
    if (data) this._services.update(prev => [...prev, data]);
    return { data, error };
  }

  async updateService(service: ServiceItem) {
    this._services.update(prev => prev.map(s => s.id === service.id ? service : s));
    if (this.isConfigured()) await this.supabase.client.from('services').update(service).eq('id', service.id);
  }

  async deleteService(id: string) {
    this._services.update(prev => prev.filter(s => s.id !== id));
    if (this.isConfigured()) await this.supabase.client.from('services').delete().eq('id', id);
  }

  async addProfessional(prof: Omit<Professional, 'id' | 'business_id'>) {
    const bid = this.getActiveBusinessId();
    const { data, error } = await this.supabase.client.from('professionals').insert({ ...prof, business_id: bid }).select().single();
    if (data) this._professionals.update(prev => [...prev, data]);
    return { data, error };
  }

  async updateProfessional(prof: Professional) {
    this._professionals.update(prev => prev.map(p => p.id === prof.id ? prof : p));
    if (this.isConfigured()) await this.supabase.client.from('professionals').update(prof).eq('id', prof.id);
  }

  async deleteProfessional(id: string) {
    this._professionals.update(prev => prev.filter(p => p.id !== id));
    if (this.isConfigured()) await this.supabase.client.from('professionals').delete().eq('id', id);
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
      return { count: apps.length, pending: apps.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length, faturamento };
    });
  }

  async createInitialSetup(businessName: string, profName: string, services: any[]) {
    const { data: bus, error: bErr } = await this.supabase.client.from('businesses').insert({ name: businessName, hours: '08:00 - 18:00', branding_color: '#4f46e5' }).select().single();
    if (bErr || !bus) throw new Error("Erro ao criar empresa.");

    const userEmail = this.auth.currentUser()?.email || 'admin@admin.com';
    await this.supabase.client.from('professionals').insert({ name: profName, email: userEmail, status: 'active', business_id: bus.id });

    if (services.length) {
      const servicesToInsert = services.map(s => ({ ...s, status: 'active', business_id: bus.id }));
      await this.supabase.client.from('services').insert(servicesToInsert);
    }
    this.lastSync.set(new Date());
    return bus.id;
  }
}
