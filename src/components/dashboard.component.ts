
import { Component, signal, inject, computed } from '@angular/core';
import { DbService, Appointment, ServiceItem, Client } from '../services/db.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
  template: `
    <div class="p-6 md:py-10">
      <header class="mb-8 flex justify-between items-start">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-800">Olá, {{ db.business()?.name }}</h1>
          <p class="text-slate-500">Hoje é {{ todayFormatted }}</p>
        </div>
        <button (click)="openMainModal()" class="hidden md:flex bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 items-center gap-2 hover:bg-indigo-700 transition-all">
          <i data-lucide="plus-circle" class="w-5 h-5"></i>
          Novo Agendamento
        </button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div class="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
          <p class="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2">Faturamento de Hoje</p>
          <p class="text-3xl font-bold">R$ {{ stats().faturamento }}</p>
        </div>
        <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Agendados</p>
          <p class="text-3xl font-bold text-slate-700">{{ stats().count }}</p>
        </div>
        <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Pendentes Agora</p>
          <p class="text-3xl font-bold text-amber-500">{{ stats().pending }}</p>
        </div>
      </div>

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-slate-800">Próximos atendimentos</h2>
        <button (click)="openMainModal()" class="md:hidden bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold">
          + Novo
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (app of todayAppointments(); track app.id) {
          <div class="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4 group transition-all hover:border-indigo-200 cursor-pointer" 
               [class.opacity-60]="app.status === 'completed'"
               (click)="selectApp(app)">
            <div class="text-center min-w-[60px]">
              <p class="text-lg font-bold text-indigo-600">{{ app.time }}</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase">Hoje</p>
            </div>
            <div class="flex-1 border-l border-slate-100 pl-5">
              <p class="font-bold text-slate-800 text-lg leading-tight">{{ db.getClientName(app.clientId) }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-medium">{{ db.getServiceName(app.serviceId) }}</span>
                <span class="text-xs text-slate-400">• Prof: {{ db.getProfessionalName(app.professionalId) }}</span>
              </div>
            </div>
            @if (app.status === 'pending') {
              <button (click)="complete(app.id); $event.stopPropagation()" class="bg-emerald-50 text-emerald-600 p-3 rounded-2xl hover:bg-emerald-100 transition-colors">
                <i data-lucide="check" class="w-6 h-6"></i>
              </button>
            } @else if (app.status === 'completed') {
               <div class="text-emerald-500">
                 <i data-lucide="check-circle" class="w-6 h-6"></i>
               </div>
            }
          </div>
        } @empty {
          <div class="py-16 text-center md:col-span-2">
            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i data-lucide="calendar" class="text-slate-300 w-10 h-10"></i>
            </div>
            <p class="text-slate-500 font-medium">Você não tem agendamentos para hoje.</p>
            <button (click)="openMainModal()" class="mt-4 text-indigo-600 font-bold text-sm">Agendar agora</button>
          </div>
        }
      </div>

      <!-- Main Scheduling Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div class="flex justify-between items-center mb-8">
              <h3 class="text-2xl font-bold text-slate-800">{{ editingAppointmentId() ? 'Detalhes' : 'Agendar' }}</h3>
              <button (click)="showModal.set(false)" class="text-slate-400 p-2 hover:bg-slate-50 rounded-full">
                <i data-lucide="x" class="w-7 h-7"></i>
              </button>
            </div>

            @if (conflictError()) {
              <div class="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                <i data-lucide="alert-circle" class="text-rose-600 w-5 h-5 shrink-0"></i>
                <p class="text-xs text-rose-600 font-medium leading-relaxed">{{ conflictError() }}</p>
              </div>
            }

            <div class="space-y-5 mb-10">
              <div>
                <div class="flex justify-between items-center mb-1.5">
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</label>
                  <button (click)="openNewClientModal()" class="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100">+ NOVO CLIENTE</button>
                </div>
                <select [(ngModel)]="newApp.clientId" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100 font-medium">
                  <option value="" disabled>Escolha o cliente...</option>
                  @for (c of db.clients(); track c.id) {
                    <option [value]="c.id">{{ c.name }}</option>
                  }
                </select>
              </div>

              <div>
                <div class="flex justify-between items-center mb-1.5">
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Serviço</label>
                  <button (click)="openQuickAddService()" class="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100">+ NOVO SERVIÇO</button>
                </div>
                <select [(ngModel)]="newApp.serviceId" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100 font-medium">
                  <option value="" disabled>Qual o serviço?</option>
                  @for (s of db.services(); track s.id) {
                    <option [value]="s.id">{{ s.name }} (R$ {{ s.price }})</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Profissional Responsável</label>
                <select [(ngModel)]="newApp.professionalId" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100 font-medium">
                  @for (p of db.professionals(); track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Horário</label>
                  <input type="time" [(ngModel)]="newApp.time" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-bold">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Situação</label>
                  <select [(ngModel)]="newApp.status" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100 font-bold">
                    <option value="pending">Agendado</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              @if (editingAppointmentId()) {
                <button (click)="sendReminderLink()" class="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-50 hover:bg-emerald-600 transition-all">
                  <i data-lucide="message-circle" class="w-6 h-6"></i>
                  Enviar Lembrete WhatsApp
                </button>
              }

              <button (click)="saveAppointment()" [disabled]="!newApp.clientId || !newApp.serviceId" class="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-100 disabled:opacity-50 hover:bg-indigo-700 transition-all">
                {{ editingAppointmentId() ? 'Salvar Alterações' : 'Confirmar Agendamento' }}
              </button>
              
              @if (editingAppointmentId()) {
                <button (click)="deleteAppointment()" class="w-full text-rose-500 py-3 font-bold text-sm hover:bg-rose-50 rounded-xl transition-colors">
                  Excluir este agendamento
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- Modal Novo Cliente -->
      @if (showNewClientModal()) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div class="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 class="text-xl font-bold text-slate-800 mb-6">Novo Cliente</h4>
            <div class="space-y-4 mb-8">
              <div>
                <label class="text-[10px] text-slate-400 font-bold uppercase ml-1 tracking-widest">Nome Completo</label>
                <input type="text" [(ngModel)]="clientForm.name" placeholder="Ex: Maria Souza" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-medium">
              </div>
              <div>
                <label class="text-[10px] text-slate-400 font-bold uppercase ml-1 tracking-widest">WhatsApp</label>
                <input type="tel" [(ngModel)]="clientForm.whatsapp" placeholder="(11) 99999-9999" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-medium">
              </div>
            </div>
            <div class="flex gap-2">
              <button (click)="showNewClientModal.set(false)" class="flex-1 py-4 text-slate-400 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors">Voltar</button>
              <button (click)="saveNewClient()" [disabled]="!clientForm.name" class="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-50 disabled:opacity-50">Cadastrar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent {
  db = inject(DbService);
  showModal = signal(false);
  showNewClientModal = signal(false);
  showQuickAddService = signal(false);
  editingAppointmentId = signal<string | null>(null);
  conflictError = signal('');
  stats = this.db.getTodayStats();

  todayFormatted = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  todayAppointments = computed(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.db.appointments()
      .filter(a => a.date === todayStr && a.status !== 'cancelled')
      .sort((a, b) => a.time.localeCompare(b.time));
  });

  newApp = {
    clientId: '',
    serviceId: '',
    professionalId: '',
    time: '09:00',
    status: 'pending' as 'pending' | 'completed' | 'cancelled'
  };

  clientForm = { name: '', whatsapp: '' };
  tempService = { name: '', price: 0, duration: 30 };

  openMainModal() {
    this.editingAppointmentId.set(null);
    this.conflictError.set('');
    this.newApp = { 
      clientId: '', 
      serviceId: '', 
      professionalId: this.db.professionals()[0]?.id || '', 
      time: this.getCurrentTime(),
      status: 'pending'
    };
    this.showModal.set(true);
  }

  getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:00`;
  }

  openNewClientModal() {
    this.clientForm = { name: '', whatsapp: '' };
    this.showNewClientModal.set(true);
  }

  saveNewClient() {
    if (!this.clientForm.name) return;
    const newId = 'c-' + Math.random().toString(36).substr(2, 5);
    const bid = this.db.business()?.id || '';
    // Fix: provide businessId to match Client interface
    this.db.addClient({ id: newId, name: this.clientForm.name, whatsapp: this.clientForm.whatsapp, businessId: bid });
    this.newApp.clientId = newId;
    this.showNewClientModal.set(false);
  }

  openQuickAddService() {
    this.tempService = { name: '', price: 0, duration: 30 };
    this.showQuickAddService.set(true);
  }

  saveQuickService() {
    if (!this.tempService.name) return;
    const newId = 's-' + Math.random().toString(36).substr(2, 5);
    const bid = this.db.business()?.id || '';
    // Fix: provide businessId to match ServiceItem interface
    this.db.addService({ ...this.tempService, id: newId, businessId: bid });
    this.newApp.serviceId = newId;
    this.showQuickAddService.set(false);
  }

  saveAppointment() {
    if (!this.newApp.clientId || !this.newApp.serviceId) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const check = this.db.isAvailable(this.newApp.professionalId, todayStr, this.newApp.time, this.newApp.serviceId, this.editingAppointmentId() || undefined);
    
    if (!check.available) {
      this.conflictError.set(check.conflict || 'Horário ocupado');
      return;
    }

    let appointment: Appointment;
    const bid = this.db.business()?.id || '';

    if (this.editingAppointmentId()) {
      const existing = this.db.appointments().find(a => a.id === this.editingAppointmentId());
      if (existing) {
        appointment = { ...existing, ...this.newApp, date: todayStr };
        this.db.updateAppointment(appointment);
      }
    } else {
      // Fix: provide businessId to match Appointment interface
      appointment = {
        id: 'a-' + Math.random().toString(36).substr(2, 5),
        ...this.newApp,
        date: todayStr,
        businessId: bid
      };
      this.db.addAppointment(appointment);
      this.editingAppointmentId.set(appointment.id);
      return; 
    }

    this.showModal.set(false);
    this.editingAppointmentId.set(null);
  }

  sendReminderLink() {
    const app = this.db.appointments().find(a => a.id === this.editingAppointmentId());
    if (!app) return;

    const client = this.db.clients().find(c => c.id === app.clientId);
    if (!client) return;

    const service = this.db.services().find(s => s.id === app.serviceId);
    const professional = this.db.getProfessionalName(app.professionalId);
    const business = this.db.business();

    const [year, month, day] = app.date.split('-');
    const formattedDate = `${day}/${month}`;

    const message = `Olá *${client.name}*! Confirmamos seu agendamento:
    
📍 *${business?.name || 'Nosso Studio'}*
✂️ *${service?.name || 'Serviço'}*
📅 *${formattedDate}* às *${app.time}*
👤 Profissional: *${professional}*

Esperamos você!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${client.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  }

  deleteAppointment() {
    if (this.editingAppointmentId() && confirm('Remover este agendamento?')) {
      this.db.deleteAppointment(this.editingAppointmentId()!);
      this.showModal.set(false);
    }
  }

  complete(id: string) {
    this.db.updateAppointmentStatus(id, 'completed');
  }

  selectApp(app: Appointment) {
    this.newApp = {
      clientId: app.clientId,
      serviceId: app.serviceId,
      professionalId: app.professionalId,
      time: app.time,
      status: app.status
    };
    this.editingAppointmentId.set(app.id);
    this.conflictError.set('');
    this.showModal.set(true);
  }
}
