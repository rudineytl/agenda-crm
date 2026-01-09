
import { Component, signal, inject, computed } from '@angular/core';
import { DbService, Appointment, Client } from '../services/db.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 md:py-10">
      <header class="flex justify-between items-center mb-10">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Agenda</h1>
          <p class="text-slate-500 font-medium">{{ selectedDateFormatted }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
            <button (click)="changeDate(-1)" class="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors">
              <i data-lucide="chevron-left" class="w-5 h-5"></i>
            </button>
            <button (click)="selectedDate.set(newDate())" class="px-4 text-xs font-bold text-indigo-600 uppercase tracking-widest">Hoje</button>
            <button (click)="changeDate(1)" class="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors">
              <i data-lucide="chevron-right" class="w-5 h-5"></i>
            </button>
          </div>
        </div>
      </header>

      <div class="relative pl-16 border-l-2 border-slate-100 mt-4 space-y-10 py-6">
        @for (hour of hours; track hour) {
          <div class="relative group">
            <!-- Hora -->
            <div class="absolute -left-[4.5rem] top-0 text-[11px] font-bold text-slate-400 uppercase tracking-tighter w-12 text-right">
              {{ hour }}
            </div>
            
            <div class="min-h-[70px] relative">
              <!-- Slot de clique para nova reserva -->
              <button (click)="openQuickModal(hour)" class="absolute inset-0 w-full hover:bg-slate-100/50 rounded-2xl transition-all border-2 border-transparent hover:border-slate-100 z-0"></button>
              
              <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (app of getAppsForHour(hour); track app.id) {
                  <div (click)="selectApp(app)" class="bg-white border-l-4 border-indigo-500 p-4 rounded-r-2xl cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98] border border-slate-100">
                    <div class="flex justify-between items-start mb-2">
                      <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">{{ app.time }}</span>
                      @if(app.status === 'completed') {
                        <div class="bg-emerald-50 text-emerald-600 p-1 rounded-full">
                          <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                        </div>
                      }
                    </div>
                    <p class="font-bold text-slate-800 text-base leading-tight">{{ db.getClientName(app.clientId) }}</p>
                    <div class="flex items-center gap-2 mt-1.5">
                      <p class="text-[11px] font-medium text-slate-500">{{ db.getServiceName(app.serviceId) }}</p>
                      <span class="text-[10px] text-slate-300">•</span>
                      <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ db.getProfessionalName(app.professionalId) }}</p>
                    </div>
                  </div>
                }
              </div>

              @if (getAppsForHour(hour).length === 0) {
                 <div class="h-[1px] w-full bg-slate-50 absolute top-3"></div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Scheduling Modal -->
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
                  <button (click)="openNewClientModal()" class="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100">+ NOVO</button>
                </div>
                <select [(ngModel)]="newApp.clientId" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100 font-medium text-slate-800">
                  <option value="" disabled>Selecione...</option>
                  @for (c of db.clients(); track c.id) {
                    <option [value]="c.id">{{ c.name }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Serviço</label>
                <select [(ngModel)]="newApp.serviceId" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100 font-medium">
                  <option value="" disabled>Qual serviço?</option>
                  @for (s of db.services(); track s.id) {
                    <option [value]="s.id">{{ s.name }} ({{ s.duration }} min)</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Horário</label>
                  <input type="time" [(ngModel)]="newApp.time" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-bold">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Profissional</label>
                  <select [(ngModel)]="newApp.professionalId" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none appearance-none">
                    @for (p of db.professionals(); track p.id) {
                      <option [value]="p.id">{{ p.name }}</option>
                    }
                  </select>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              @if (editingAppointmentId()) {
                <button (click)="sendReminderLink()" class="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-50">
                  <i data-lucide="message-circle" class="w-6 h-6"></i>
                  Lembrete WhatsApp
                </button>
              }

              <button (click)="saveAppointment()" [disabled]="!newApp.clientId || !newApp.serviceId" class="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-100 disabled:opacity-50">
                {{ editingAppointmentId() ? 'Salvar Alterações' : 'Agendar' }}
              </button>
              
              @if (editingAppointmentId()) {
                <button (click)="deleteAppointment()" class="w-full text-rose-500 py-3 font-bold text-sm">
                  Remover Agendamento
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- Modal Cadastro de Cliente -->
      @if (showNewClientModal()) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div class="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 class="text-xl font-bold text-slate-800 mb-6">Novo Cliente</h4>
            <div class="space-y-4 mb-8">
              <input type="text" [(ngModel)]="clientForm.name" placeholder="Nome Completo" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-medium">
              <input type="tel" [(ngModel)]="clientForm.whatsapp" placeholder="(11) 99999-9999" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-medium">
            </div>
            <div class="flex gap-2">
              <button (click)="showNewClientModal.set(false)" class="flex-1 py-4 text-slate-400 font-bold text-sm">Voltar</button>
              <button (click)="saveNewClient()" [disabled]="!clientForm.name" class="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-50">Salvar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CalendarComponent {
  db = inject(DbService);
  selectedDate = signal(new Date());
  showModal = signal(false);
  showNewClientModal = signal(false);
  editingAppointmentId = signal<string | null>(null);
  conflictError = signal('');

  hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  newApp = {
    clientId: '',
    serviceId: '',
    professionalId: '',
    time: '09:00'
  };

  clientForm = { name: '', whatsapp: '' };

  newDate() { return new Date(); }

  selectedDateFormatted = computed(() => {
    return this.selectedDate().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  });

  changeDate(days: number) {
    const d = new Date(this.selectedDate());
    d.setDate(d.getDate() + days);
    this.selectedDate.set(d);
  }

  getAppsForHour(hour: string) {
    const dateStr = this.selectedDate().toISOString().split('T')[0];
    const hourPrefix = hour.split(':')[0];
    return this.db.appointments().filter(a => a.date === dateStr && a.time.startsWith(hourPrefix) && a.status !== 'cancelled');
  }

  openQuickModal(hour: string) {
    this.editingAppointmentId.set(null);
    this.conflictError.set('');
    this.newApp = {
      clientId: '',
      serviceId: '',
      professionalId: this.db.professionals()[0]?.id || '',
      time: hour
    };
    this.showModal.set(true);
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

  selectApp(app: Appointment) {
    this.newApp = {
      clientId: app.clientId,
      serviceId: app.serviceId,
      professionalId: app.professionalId,
      time: app.time
    };
    this.editingAppointmentId.set(app.id);
    this.conflictError.set('');
    this.showModal.set(true);
  }

  saveAppointment() {
    if (!this.newApp.clientId || !this.newApp.serviceId) return;
    const dateStr = this.selectedDate().toISOString().split('T')[0];
    const bid = this.db.business()?.id || '';

    const check = this.db.isAvailable(this.newApp.professionalId, dateStr, this.newApp.time, this.newApp.serviceId, this.editingAppointmentId() || undefined);
    
    if (!check.available) {
      this.conflictError.set(check.conflict || 'Horário ocupado');
      return;
    }

    let appointment: Appointment;

    if (this.editingAppointmentId()) {
      const existing = this.db.appointments().find(a => a.id === this.editingAppointmentId());
      if (existing) {
        appointment = { ...existing, ...this.newApp, date: dateStr };
        this.db.updateAppointment(appointment);
      }
    } else {
      // Fix: provide businessId to match Appointment interface
      appointment = {
        id: 'a-' + Math.random().toString(36).substr(2, 5),
        ...this.newApp,
        date: dateStr,
        status: 'pending',
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

    const message = `Olá *${client.name}*! Passando para confirmar seu agendamento:
    
📍 *${business?.name || 'Nosso Studio'}*
✂️ *${service?.name || 'Serviço'}*
📅 *${formattedDate}* às *${app.time}*
👤 Profissional: *${professional}*

Aguardamos você!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${client.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  }

  deleteAppointment() {
    if (this.editingAppointmentId() && confirm('Remover agendamento?')) {
      this.db.deleteAppointment(this.editingAppointmentId()!);
      this.showModal.set(false);
    }
  }
}
