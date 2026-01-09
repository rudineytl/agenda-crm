
import { Component, signal, inject, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DbService, Appointment, ServiceItem, Client } from '../services/db.service';
import { AiService } from '../services/ai.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 md:pt-10">
      <header class="mb-8 flex justify-between items-start">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-800">
            Bem-vindo ao {{ db.business()?.name || 'seu painel' }}
          </h1>
          <p class="text-slate-500">Resumo de hoje: {{ todayFormatted }}</p>
        </div>
        <button (click)="openMainModal()" 
                [style.backgroundColor]="db.brandColor()"
                [style.color]="db.brandContrastColor()"
                class="hidden md:flex px-6 py-3 rounded-2xl font-bold shadow-lg items-center gap-2 hover:brightness-110 transition-all active:scale-95">
          <i data-lucide="plus-circle" class="w-5 h-5"></i>
          Novo Agendamento
        </button>
      </header>

      <!-- AI Insight Card (Multi-color white label) -->
      @if (aiInsight()) {
        <div class="mb-8 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden"
             [style.backgroundColor]="db.brandColor()">
          <div class="relative z-10 flex items-start gap-4">
            <div class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
              <i data-lucide="sparkles" class="w-6 h-6 text-white"></i>
            </div>
            <div>
              <p class="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Dica do seu Consultor IA</p>
              <p class="text-lg font-medium leading-tight">"{{ aiInsight() }}"</p>
            </div>
          </div>
          <div class="absolute -right-10 -bottom-10 opacity-10">
            <i data-lucide="sparkles" class="w-40 h-40"></i>
          </div>
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div class="p-6 rounded-3xl text-white shadow-xl" [style.backgroundColor]="db.brandColor()">
          <p class="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Faturamento de Hoje</p>
          <p class="text-3xl font-bold">R$ {{ stats().faturamento }}</p>
        </div>
        <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Agendados</p>
          <p class="text-3xl font-bold text-slate-700">{{ stats().count }}</p>
        </div>
        <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Em Aberto</p>
          <p class="text-3xl font-bold" [style.color]="db.brandColor()">{{ stats().pending }}</p>
        </div>
      </div>

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-slate-800">Atendimentos do Dia</h2>
        <button (click)="openMainModal()" 
                [style.color]="db.brandColor()"
                class="md:hidden bg-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-100">
          + Novo
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (app of todayAppointments(); track app.id) {
          <div class="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4 group transition-all hover:border-slate-200 cursor-pointer" 
               [class.opacity-60]="app.status === 'completed'"
               (click)="selectApp(app)">
            <div class="text-center min-w-[60px]">
              <p class="text-lg font-bold" [style.color]="db.brandColor()">{{ app.time }}</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase">Hoje</p>
            </div>
            <div class="flex-1 border-l border-slate-100 pl-5">
              <p class="font-bold text-slate-800 text-lg leading-tight">{{ db.getClientName(app.client_id) }}</p>
              <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                <span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-400 font-bold uppercase tracking-wider">
                  {{ db.getProfessionalName(app.professional_id) }}
                </span>
                <span class="text-xs text-slate-600 font-medium">
                  {{ db.getServiceName(app.service_id) }}
                </span>
              </div>
            </div>
            @if (app.status === 'pending' || app.status === 'confirmed') {
              <button (click)="complete(app.id); $event.stopPropagation()" 
                      class="bg-emerald-50 text-emerald-600 p-3 rounded-2xl hover:bg-emerald-100 transition-colors">
                <i data-lucide="check" class="w-6 h-6"></i>
              </button>
            } @else if (app.status === 'completed') {
               <div class="text-emerald-500">
                 <i data-lucide="check-circle" class="w-6 h-6"></i>
               </div>
            }
          </div>
        } @empty {
          <div class="py-16 text-center md:col-span-2 border-2 border-dashed border-slate-100 rounded-3xl">
            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i data-lucide="calendar" class="text-slate-300 w-10 h-10"></i>
            </div>
            <p class="text-slate-500 font-medium">Nenhum agendamento para hoje.</p>
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

            <div class="space-y-5 mb-10">
              <div>
                <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cliente</label>
                <select [(ngModel)]="newApp.client_id" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-medium text-slate-700">
                  <option value="" disabled>Escolha o cliente...</option>
                  @for (c of db.clients(); track c.id) {
                    <option [value]="c.id">{{ c.name }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Serviço</label>
                <select [(ngModel)]="newApp.service_id" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-medium text-slate-700">
                  <option value="" disabled>Qual o serviço?</option>
                  @for (s of db.services(); track s.id) {
                    <option [value]="s.id">{{ s.name }} (R$ {{ s.price }})</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Horário</label>
                  <input type="time" [(ngModel)]="newApp.time" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Situação</label>
                  <select [(ngModel)]="newApp.status" class="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700">
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <button (click)="saveAppointment()" 
                      [disabled]="!newApp.client_id || !newApp.service_id" 
                      [style.backgroundColor]="db.brandColor()"
                      [style.color]="db.brandContrastColor()"
                      class="w-full py-5 rounded-2xl font-bold shadow-xl disabled:opacity-50 hover:brightness-110 transition-all">
                {{ editingAppointmentId() ? 'Salvar Alterações' : 'Confirmar Agendamento' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  db = inject(DbService);
  ai = inject(AiService);
  
  showModal = signal(false);
  editingAppointmentId = signal<string | null>(null);
  stats = this.db.getTodayStats();
  aiInsight = signal<string | null>(null);

  todayFormatted = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  todayAppointments = computed(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.db.appointments()
      .filter(a => a.date === todayStr && a.status !== 'cancelled')
      .sort((a, b) => a.time.localeCompare(b.time));
  });

  newApp = {
    client_id: '',
    service_id: '',
    professional_id: '',
    time: '09:00',
    status: 'pending' as 'pending' | 'confirmed' | 'completed' | 'cancelled'
  };

  async ngOnInit() {
    const stats = this.stats();
    if (stats.count > 0) {
      const insight = await this.ai.getBusinessInsight({
        appointmentsCount: stats.count,
        revenue: stats.faturamento,
        topService: this.db.services()[0]?.name || 'serviços'
      });
      this.aiInsight.set(insight);
    }
  }

  openMainModal() {
    this.editingAppointmentId.set(null);
    this.newApp = { 
      client_id: '', 
      service_id: '', 
      professional_id: this.db.professionals()[0]?.id || '', 
      time: '09:00',
      status: 'pending'
    };
    this.showModal.set(true);
  }

  saveAppointment() {
    if (!this.newApp.client_id || !this.newApp.service_id) return;
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (this.editingAppointmentId()) {
      const existing = this.db.appointments().find(a => a.id === this.editingAppointmentId());
      if (existing) this.db.updateAppointment({ ...existing, ...this.newApp, date: todayStr });
    } else {
      this.db.addAppointment({ ...this.newApp, date: todayStr });
    }

    this.showModal.set(false);
    this.editingAppointmentId.set(null);
  }

  complete(id: string) {
    this.db.updateAppointmentStatus(id, 'completed');
  }

  selectApp(app: Appointment) {
    this.newApp = {
      client_id: app.client_id,
      service_id: app.service_id,
      professional_id: app.professional_id,
      time: app.time,
      status: app.status
    };
    this.editingAppointmentId.set(app.id);
    this.showModal.set(true);
  }
}
