
import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Appointment } from '../services/db.service';
import { AppointmentModalComponent, AppointmentCardComponent } from './shared/modals.component';

type DateFilter = 'today' | 'tomorrow' | 'week' | 'custom';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentModalComponent, AppointmentCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 md:py-10">
      <header class="mb-8 flex justify-between items-start">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-800 tracking-tighter">
            {{ db.business()?.name || 'Bem-vindo' }}
          </h1>
          <p class="text-slate-500 font-medium">{{ dateRangeLabel() }}</p>
        </div>
        <button (click)="openCreateModal()" 
                [style.backgroundColor]="db.brandColor()"
                [style.color]="db.brandContrastColor()"
                class="hidden md:flex px-6 py-3 rounded-2xl font-bold shadow-lg items-center gap-2 hover:brightness-110 transition-all active:scale-95">
          <i data-lucide="plus-circle" class="w-5 h-5"></i>
          Novo Agendamento
        </button>
      </header>

      <!-- Date Filter Tabs -->
      <div class="mb-6 flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button (click)="setDateFilter('today')" 
                [class.active]="dateFilter() === 'today'"
                class="px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all"
                [style.backgroundColor]="dateFilter() === 'today' ? db.brandColor() : '#f1f5f9'"
                [style.color]="dateFilter() === 'today' ? db.brandContrastColor() : '#64748b'">
          <i data-lucide="calendar-check" class="w-4 h-4 inline mr-1"></i>
          Hoje
        </button>
        <button (click)="setDateFilter('tomorrow')" 
                [class.active]="dateFilter() === 'tomorrow'"
                class="px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all"
                [style.backgroundColor]="dateFilter() === 'tomorrow' ? db.brandColor() : '#f1f5f9'"
                [style.color]="dateFilter() === 'tomorrow' ? db.brandContrastColor() : '#64748b'">
          <i data-lucide="calendar-plus" class="w-4 h-4 inline mr-1"></i>
          Amanhã
        </button>
        <button (click)="setDateFilter('week')" 
                [class.active]="dateFilter() === 'week'"
                class="px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all"
                [style.backgroundColor]="dateFilter() === 'week' ? db.brandColor() : '#f1f5f9'"
                [style.color]="dateFilter() === 'week' ? db.brandContrastColor() : '#64748b'">
          <i data-lucide="calendar-days" class="w-4 h-4 inline mr-1"></i>
          Próximos 7 dias
        </button>
        <div class="relative">
          <input type="date" 
                 [(ngModel)]="customDate" 
                 (change)="setDateFilter('custom')"
                 class="px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer"
                 [style.borderColor]="dateFilter() === 'custom' ? db.brandColor() : '#e2e8f0'"
                 [style.backgroundColor]="dateFilter() === 'custom' ? db.brandColor() + '10' : '#ffffff'"
                 [style.color]="dateFilter() === 'custom' ? db.brandColor() : '#64748b'">
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="p-6 rounded-3xl text-white shadow-xl" [style.backgroundColor]="db.brandColor()">
          <p class="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-2">Faturamento</p>
          <p class="text-3xl font-black tracking-tight">R$ {{ stats().faturamento }}</p>
        </div>
        <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Agendados</p>
          <p class="text-3xl font-black text-slate-700 tracking-tight">{{ stats().count }}</p>
        </div>
        <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Pendentes</p>
          <p class="text-3xl font-black tracking-tight" [style.color]="db.brandColor()">{{ stats().pending }}</p>
        </div>
      </div>
      
      <!-- Aniversariantes da Semana -->
      @if (db.weeklyBirthdays().length > 0) {
        <div class="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-[2.5rem] shadow-sm relative overflow-hidden">
          <div class="absolute right-0 top-0 p-4 opacity-10 pointer-events-none">
            <i data-lucide="cake" class="w-24 h-24 text-rose-500"></i>
          </div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-200">
              <i data-lucide="gift" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-rose-800 leading-tight">Aniversariantes da Semana</h3>
              <p class="text-rose-600/70 text-[10px] font-bold uppercase tracking-widest">Não esqueça de parabenizá-los!</p>
            </div>
          </div>
          <div class="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            @for (client of db.weeklyBirthdays(); track client.id) {
              <div class="flex-shrink-0 bg-white p-4 rounded-3xl border border-rose-100/50 shadow-sm flex items-center gap-3 min-w-[200px]">
                <div class="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex flex-col items-center justify-center font-black leading-none">
                  <span class="text-[8px] uppercase">{{ client.birth_date!.split('-')[1] | date:'MMM':'':'pt-BR' }}</span>
                  <span class="text-lg">{{ client.birth_date!.split('-')[2] }}</span>
                </div>
                <div>
                  <p class="font-bold text-slate-800 text-sm truncate">{{ client.name }}</p>
                  <a [href]="'https://wa.me/' + client.whatsapp" target="_blank" class="text-emerald-500 text-[10px] font-bold flex items-center gap-1 hover:brightness-110">
                    <i data-lucide="message-circle" class="w-3 h-3"></i>
                    Parabenizar
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-slate-800">Próximos Atendimentos</h2>
        <button (click)="openCreateModal()" [style.color]="db.brandColor()" class="md:hidden font-bold text-sm">+ Agendar</button>
      </div>

      <!-- Appointments List -->
      <div class="space-y-4">
        @for (dateGroup of groupedAppointments(); track dateGroup.date) {
          <div>
            @if (dateFilter() === 'week' || dateFilter() === 'custom') {
              <div class="flex items-center gap-3 mb-3">
                <div class="flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm border border-slate-100 bg-white">
                  <span class="text-xs text-slate-400 uppercase">{{ dateGroup.weekday }}</span>
                  <span class="text-2xl text-slate-800">{{ dateGroup.day }}</span>
                </div>
                <div class="flex-1 h-px bg-slate-100"></div>
              </div>
            }
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (app of dateGroup.appointments; track app.id) {
                <app-appointment-card 
                  [app]="app" 
                  (select)="selectApp($event)" 
                  (complete)="complete($event)">
                </app-appointment-card>
              }
            </div>
          </div>
        } @empty {
          <div class="py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl">
             <i data-lucide="calendar-days" class="w-12 h-12 text-slate-200 mx-auto mb-3"></i>
             <p class="text-slate-400 font-medium italic">Nenhum agendamento encontrado para este período.</p>
          </div>
        }
      </div>

      @if (showModal()) {
        <app-appointment-modal 
          [editingApp]="selectedApp()" 
          (close)="showModal.set(false)">
        </app-appointment-modal>
      }
    </div>
  `
})
export class DashboardComponent {
  db = inject(DbService);
  showModal = signal(false);
  selectedApp = signal<Appointment | null>(null);
  dateFilter = signal<DateFilter>('today');
  customDate = new Date().toISOString().split('T')[0];

  dateRangeLabel = computed(() => {
    const filter = this.dateFilter();
    const today = new Date();

    switch (filter) {
      case 'today':
        return 'Resumo de hoje: ' + today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return 'Resumo de amanhã: ' + tomorrow.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
      case 'week':
        return 'Próximos 7 dias';
      case 'custom':
        // Fix timezone offset issue by creating date from parts
        const [year, month, day] = this.customDate.split('-').map(Number);
        const custom = new Date(year, month - 1, day);
        return custom.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      default:
        return '';
    }
  });

  filteredAppointments = computed(() => {
    const filter = this.dateFilter();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.db.appointments().filter(app => {
      const appDate = new Date(app.date);
      appDate.setHours(0, 0, 0, 0);

      switch (filter) {
        case 'today':
          return app.date === today.toISOString().split('T')[0];
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return app.date === tomorrow.toISOString().split('T')[0];
        case 'week':
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          return appDate >= today && appDate < weekEnd;
        case 'custom':
          return app.date === this.customDate;
        default:
          return false;
      }
    }).sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
    });
  });

  groupedAppointments = computed(() => {
    const appointments = this.filteredAppointments();
    const groups = new Map<string, Appointment[]>();

    appointments.forEach(app => {
      if (!groups.has(app.date)) {
        groups.set(app.date, []);
      }
      groups.get(app.date)!.push(app);
    });

    return Array.from(groups.entries()).map(([date, apps]) => {
      // Fix timezone offset issue by creating date from parts
      const [year, month, day] = date.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return {
        date,
        day: d.getDate().toString().padStart(2, '0'),
        weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase(),
        appointments: apps.sort((a, b) => a.time.localeCompare(b.time))
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  });

  stats = computed(() => {
    const apps = this.filteredAppointments();
    const finished = apps.filter(a => a.status === 'completed');
    const faturamento = finished.reduce((sum, app) => {
      const srv = this.db.services().find(s => s.id === app.service_id);
      return sum + (Number(srv?.price) || 0);
    }, 0);
    return {
      count: apps.length,
      pending: apps.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length,
      faturamento
    };
  });

  setDateFilter(filter: DateFilter) {
    this.dateFilter.set(filter);
  }

  openCreateModal() { this.selectedApp.set(null); this.showModal.set(true); }
  selectApp(app: Appointment) { this.selectedApp.set(app); this.showModal.set(true); }
  complete(id: string) { this.db.updateAppointmentStatus(id, 'completed'); }
}
