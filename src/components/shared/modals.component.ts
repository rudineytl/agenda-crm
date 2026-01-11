
import { Component, input, output, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Appointment, Client, ServiceItem, Business } from '../../services/db.service';

/**
 * COMPONENTE: Card de Agendamento Unificado
 */
@Component({
  selector: 'app-appointment-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div (click)="select.emit(app())" 
         class="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4 transition-all hover:border-slate-200 cursor-pointer shadow-sm relative overflow-hidden group">
      
      <div class="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2" [style.backgroundColor]="getStatusColor(app().status)"></div>
      
      <div class="text-center min-w-[60px]">
        <p class="text-lg font-black text-slate-800 tracking-tighter">{{ app().time }}</p>
        <div class="flex justify-center mt-1">
          <i [attr.data-lucide]="getStatusIcon(app().status)" class="w-4 h-4" [style.color]="getStatusColor(app().status)"></i>
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <p class="font-bold text-slate-800 leading-tight truncate">{{ db.getClientName(app().client_id) }}</p>
        <div class="flex items-center gap-2 mt-1.5 overflow-hidden">
          <span class="text-[10px] text-slate-500 font-bold uppercase tracking-tight flex items-center gap-1 shrink-0">
            <i data-lucide="scissors" class="w-3 h-3 text-slate-400"></i>
            {{ db.getServiceName(app().service_id) }}
          </span>
          <span class="text-slate-300 text-[10px]">•</span>
          <span class="text-[10px] text-indigo-500 font-black uppercase tracking-widest truncate">
            {{ db.getProfessionalName(app().professional_id) }}
          </span>
        </div>
      </div>

      @if (app().reminder && app().reminder !== 'none') {
        <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100" title="Lembrete Ativo">
          <i data-lucide="bell-ring" class="w-4 h-4"></i>
        </div>
      }

      @if (app().status !== 'completed' && app().status !== 'cancelled') {
        <button (click)="complete.emit(app().id); $event.stopPropagation()" 
                class="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90 border border-transparent hover:border-emerald-100 shrink-0">
          <i data-lucide="check" class="w-5 h-5"></i>
        </button>
      }
    </div>
  `
})
export class AppointmentCardComponent {
  db = inject(DbService);
  app = input.required<Appointment>();
  select = output<Appointment>();
  complete = output<string>();

  getStatusColor(s: string) { return { pending: '#f59e0b', confirmed: this.db.brandColor(), completed: '#10b981', cancelled: '#ef4444' }[s] || '#cbd5e1'; }
  getStatusIcon(s: string) { return { pending: 'clock', confirmed: 'check-check', completed: 'check-circle', cancelled: 'x-circle' }[s] || 'help-circle'; }
}

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div class="flex justify-between items-center mb-6">
          <h4 class="text-xl font-bold text-slate-800">{{ editingClient() ? 'Editar' : 'Novo' }} Cliente</h4>
          <button (click)="close.emit()" class="text-slate-300 hover:text-slate-500"><i data-lucide="x" class="w-6 h-6"></i></button>
        </div>
        <div class="space-y-4 mb-8">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
            <input type="text" [(ngModel)]="form.name" placeholder="Ex: Maria Silva" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none font-medium text-slate-700 focus:ring-2" [style.focusRingColor]="db.brandColor() + '20'">
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
            <input type="tel" [(ngModel)]="form.whatsapp" placeholder="(00) 00000-0000" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none font-medium text-slate-700 focus:ring-2" [style.focusRingColor]="db.brandColor() + '20'">
          </div>
        </div>
        <div class="flex gap-3">
          <button (click)="close.emit()" class="flex-1 py-4 text-slate-400 font-bold text-sm">Cancelar</button>
          <button (click)="save()" [disabled]="!form.name" [style.backgroundColor]="db.brandColor()" [style.color]="db.brandContrastColor()" class="flex-1 py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50">Salvar</button>
        </div>
      </div>
    </div>
  `
})
export class ClientModalComponent {
  db = inject(DbService);
  editingClient = input<Client | null>(null);
  close = output();
  saved = output<Client>();

  form = { name: '', whatsapp: '' };

  constructor() {
    effect(() => {
      const client = this.editingClient();
      if (client) {
        this.form = { name: client.name, whatsapp: client.whatsapp };
      }
    });
  }

  async save() {
    const client = this.editingClient();
    if (client) {
      await this.db.updateClient({ ...client, ...this.form });
    } else {
      const res = await this.db.addClient(this.form);
      if (res.data) this.saved.emit(res.data);
    }
    this.close.emit();
  }
}

@Component({
  selector: 'app-service-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div class="flex justify-between items-center mb-6">
          <h4 class="text-xl font-bold text-slate-800">{{ editingService() ? 'Editar' : 'Novo' }} Serviço</h4>
          <button (click)="close.emit()" class="text-slate-300 hover:text-slate-500"><i data-lucide="x" class="w-6 h-6"></i></button>
        </div>
        <div class="space-y-4 mb-8">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Serviço</label>
            <input type="text" [(ngModel)]="form.name" placeholder="Ex: Corte de Cabelo" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none font-medium text-slate-700">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preço (R$)</label>
              <input type="number" [(ngModel)]="form.price" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700">
            </div>
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Duração (Min)</label>
              <input type="number" [(ngModel)]="form.duration" step="5" min="5" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700">
            </div>
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
            <select [(ngModel)]="form.status" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700">
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>
        <div class="flex gap-3">
          <button (click)="close.emit()" class="flex-1 py-4 text-slate-400 font-bold text-sm">Cancelar</button>
          <button (click)="save()" [disabled]="!form.name" [style.backgroundColor]="db.brandColor()" [style.color]="db.brandContrastColor()" class="flex-1 py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50">Salvar</button>
        </div>
      </div>
    </div>
  `
})
export class ServiceModalComponent {
  db = inject(DbService);
  editingService = input<ServiceItem | null>(null);
  close = output();
  saved = output<ServiceItem>();

  form = { name: '', price: 50, duration: 60, status: 'active' as any };

  constructor() {
    effect(() => {
      const service = this.editingService();
      if (service) {
        this.form = { 
          name: service.name, 
          price: service.price, 
          duration: service.duration, 
          status: service.status || 'active' 
        };
      }
    });
  }

  async save() {
    const service = this.editingService();
    if (service) {
      await this.db.updateService({ ...service, ...this.form });
    } else {
      const res = await this.db.addService(this.form);
      if (res.data) this.saved.emit(res.data);
    }
    this.close.emit();
  }
}

@Component({
  selector: 'app-appointment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientModalComponent, ServiceModalComponent],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="bg-white w-full max-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-slate-800 tracking-tight">{{ editingApp() ? 'Gerenciar' : 'Novo Agendamento' }}</h3>
          <button (click)="close.emit()" class="text-slate-300 p-2 hover:bg-slate-50 rounded-full transition-colors"><i data-lucide="x" class="w-7 h-7"></i></button>
        </div>

        @if (showNotificationSim()) {
          <div class="mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-500">
            <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
              <i data-lucide="message-square" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase text-emerald-600 tracking-widest">CRM Ativo</p>
              <p class="text-xs font-bold text-emerald-800">Agendamento enviado via WhatsApp!</p>
            </div>
          </div>
        }

        <div class="space-y-5 mb-8 overflow-y-auto no-scrollbar max-h-[60vh] px-1">
          <!-- Seção de Cliente -->
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quem será atendido?</label>
              <button (click)="showQuickClient.set(true)" [style.color]="db.brandColor()" class="text-[10px] font-black uppercase flex items-center gap-1"><i data-lucide="plus" class="w-3 h-3"></i> Novo</button>
            </div>
            <select [(ngModel)]="form.client_id" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 shadow-inner">
              <option value="" disabled>Selecione o cliente...</option>
              @for (c of db.clients(); track c.id) { <option [value]="c.id">{{ c.name }}</option> }
            </select>
          </div>

          <!-- Seção de Serviço e Profissional (Agrupados) -->
          <div class="p-4 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-5">
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">O que será feito?</label>
                <button (click)="showQuickService.set(true)" [style.color]="db.brandColor()" class="text-[10px] font-black uppercase flex items-center gap-1"><i data-lucide="plus" class="w-3 h-3"></i> Novo</button>
              </div>
              <select [(ngModel)]="form.service_id" (change)="checkAvailability()" class="w-full px-4 py-4 rounded-2xl bg-white border border-slate-100 outline-none font-bold text-slate-700">
                <option value="" disabled>Selecione o serviço...</option>
                @for (s of db.activeServices(); track s.id) { <option [value]="s.id">{{ s.name }} ({{ s.duration }} min)</option> }
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Quem realizará o serviço?</label>
              <select [(ngModel)]="form.professional_id" (change)="checkAvailability()" class="w-full px-4 py-4 rounded-2xl bg-white border border-slate-100 outline-none font-bold text-slate-700">
                <option value="" disabled>Escolha o profissional...</option>
                @for (p of db.activeProfessionals(); track p.id) { <option [value]="p.id">{{ p.name }}</option> }
              </select>
            </div>
          </div>

          <!-- Quando? Data e Horário -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Data</label>
              <input type="date" [(ngModel)]="form.date" (change)="checkAvailability()" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 shadow-inner">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Horário</label>
              <input type="time" [(ngModel)]="form.time" (change)="checkAvailability()" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-black text-slate-800 text-center shadow-inner">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-1">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
              <select [(ngModel)]="form.status" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 shadow-inner">
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div class="col-span-1">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Lembrete (WhatsApp)</label>
              <select [(ngModel)]="form.reminder" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 shadow-inner">
                <option value="none">Nenhum</option>
                <option value="1h">1 hora</option>
                <option value="2h">2 horas</option>
                <option value="24h">24 horas</option>
              </select>
            </div>
          </div>

          @if (hasConflict()) {
            <div class="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
               <i data-lucide="alert-triangle" class="w-5 h-5 text-rose-500"></i>
               <p class="text-xs font-bold text-rose-600">Este profissional já tem um agendamento neste horário!</p>
            </div>
          }
        </div>

        <button (click)="save()" 
                [disabled]="!canSave() || isSaving() || hasConflict()" 
                [style.backgroundColor]="db.brandColor()" 
                [style.color]="db.brandContrastColor()" 
                class="w-full py-5 rounded-[2rem] font-black text-lg shadow-xl active:scale-[0.98] disabled:opacity-50 transition-all">
          {{ editingApp() ? 'Salvar Alterações' : 'Finalizar Agendamento' }}
        </button>
      </div>
    </div>

    @if (showQuickClient()) {
      <app-client-modal (close)="showQuickClient.set(false)" (saved)="onClientSaved($event)"></app-client-modal>
    }
    @if (showQuickService()) {
      <app-service-modal (close)="showQuickService.set(false)" (saved)="onServiceSaved($event)"></app-service-modal>
    }
  `
})
export class AppointmentModalComponent {
  db = inject(DbService);
  editingApp = input<Appointment | null>(null);
  initialDate = input<string>(new Date().toISOString().split('T')[0]);
  initialTime = input<string>('09:00');
  close = output();

  showQuickClient = signal(false);
  showQuickService = signal(false);
  hasConflict = signal(false);
  isSaving = signal(false);
  showNotificationSim = signal(false);

  form = { client_id: '', service_id: '', professional_id: '', time: '09:00', status: 'pending' as any, date: '', reminder: 'none' as any };

  constructor() {
    effect(() => {
      const app = this.editingApp();
      if (app) {
        this.form = { ...app, reminder: app.reminder || 'none' };
      } else {
        this.form.time = this.initialTime();
        this.form.date = this.initialDate();
        // Não pré-selecionamos profissional para garantir que o usuário faça a escolha
        this.form.professional_id = ''; 
        this.form.service_id = this.db.activeServices()[0]?.id || '';
        this.form.reminder = 'none';
      }
      this.checkAvailability();
    });
  }

  checkAvailability() {
    if (!this.form.professional_id || !this.form.time || !this.form.service_id || !this.form.date) {
      this.hasConflict.set(false);
      return;
    }
    
    const service = this.db.services().find(s => s.id === this.form.service_id);
    const duration = service?.duration || 60;

    const conflict = this.db.checkConflict(
      this.form.professional_id, 
      this.form.date, 
      this.form.time,
      duration,
      this.editingApp()?.id
    );
    this.hasConflict.set(conflict);
  }

  onClientSaved(client: Client) { this.form.client_id = client.id; }
  onServiceSaved(service: ServiceItem) { this.form.service_id = service.id; this.checkAvailability(); }

  canSave(): boolean {
    return !!(this.form.client_id && this.form.service_id && this.form.professional_id && this.form.date && !this.hasConflict());
  }

  async save() {
    if (!this.canSave() || this.isSaving() || this.hasConflict()) return;
    this.isSaving.set(true);

    const app = this.editingApp();
    const data = { ...this.form };

    if (app) {
      await this.db.updateAppointment({ ...app, ...data });
    } else {
      await this.db.addAppointment(data);
    }

    if (this.form.reminder !== 'none') {
      this.showNotificationSim.set(true);
      setTimeout(() => {
        this.showNotificationSim.set(false);
        this.close.emit();
      }, 1500);
    } else {
      this.close.emit();
    }
    
    this.isSaving.set(false);
  }
}

@Component({
  selector: 'app-branding-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div class="flex justify-between items-center mb-6">
          <h4 class="text-xl font-bold text-slate-800 tracking-tight">Identidade Visual</h4>
          <button (click)="close.emit()" class="text-slate-300 hover:text-slate-500 transition-colors"><i data-lucide="x" class="w-6 h-6"></i></button>
        </div>
        
        <div class="space-y-5 mb-8 overflow-y-auto no-scrollbar max-h-[70vh]">
          <div class="flex flex-col items-center gap-3 py-4 bg-slate-50 rounded-[2rem] border border-slate-100 mb-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualização da Logo</label>
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg bg-white overflow-hidden group relative">
              @if (form.logo_url) {
                <img [src]="form.logo_url" class="w-full h-full object-cover">
              } @else {
                <div [style.backgroundColor]="form.branding_color || db.brandColor()" class="w-full h-full flex items-center justify-center">
                  <i data-lucide="image" class="w-8 h-8 opacity-20" [style.color]="db.brandContrastColor()"></i>
                </div>
              }
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome do Estabelecimento</label>
            <input type="text" [(ngModel)]="form.name" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 focus:ring-2" [style.focusRingColor]="form.branding_color + '20'">
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">URL do Logotipo</label>
            <div class="relative">
              <input type="text" [(ngModel)]="form.logo_url" placeholder="https://..." class="w-full pl-5 pr-12 py-4 rounded-2xl bg-slate-50 border-none outline-none font-medium text-slate-700 text-sm">
              <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"><i data-lucide="link" class="w-4 h-4"></i></div>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Cor Principal</label>
            <div class="flex gap-3">
              <input type="color" [(ngModel)]="form.branding_color" class="w-14 h-14 rounded-2xl border-none p-1 bg-slate-50 cursor-pointer">
              <input type="text" [(ngModel)]="form.branding_color" class="flex-1 px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none font-mono text-sm uppercase font-bold text-slate-500">
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Horário</label>
            <input type="text" [(ngModel)]="form.hours" placeholder="Ex: 08:00 - 18:00" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700">
          </div>
        </div>

        <button (click)="save()" 
                [disabled]="isSaving()"
                [style.backgroundColor]="form.branding_color || db.brandColor()" 
                [style.color]="db.brandContrastColor()" 
                class="w-full py-5 rounded-[2rem] font-black text-lg shadow-xl active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          @if (isSaving()) {
            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Salvando...
          } @else {
            <i data-lucide="save" class="w-5 h-5"></i>
            Salvar Alterações
          }
        </button>
      </div>
    </div>
  `
})
export class BrandingModalComponent {
  db = inject(DbService);
  close = output();
  isSaving = signal(false);

  form = { name: '', branding_color: '', hours: '', logo_url: '' };

  constructor() {
    effect(() => {
      const biz = this.db.business();
      if (biz) {
        this.form = { 
          name: biz.name || '', 
          branding_color: biz.branding_color || '#4f46e5',
          hours: biz.hours || '',
          logo_url: biz.logo_url || ''
        };
      }
    });
  }

  async save() {
    this.isSaving.set(true);
    await this.db.saveBusiness(this.form);
    this.isSaving.set(false);
    this.close.emit();
  }
}
