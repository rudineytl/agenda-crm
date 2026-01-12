
import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Appointment } from '../services/db.service';
import { AppointmentModalComponent, AppointmentCardComponent } from './shared/modals.component';

type DateFilter = 'today' | 'tomorrow' | 'week' | 'custom';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentModalComponent, AppointmentCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 md:py-10">
      <header class="mb-8">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Agenda</h1>
            <p class="text-slate-500 font-medium">{{ dateRangeLabel() }}</p>
          </div>
          <div class="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
            <button (click)="changeDate(-1)" class="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400">
              <i data-lucide="chevron-left" class="w-5 h-5"></i>
            </button>
            <button (click)="setToday()" class="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">Hoje</button>
            <button (click)="changeDate(1)" class="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400">
              <i data-lucide="chevron-right" class="w-5 h-5"></i>
            </button>
          </div>
        </div>

        <!-- Date Filter Tabs -->
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
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
      </header>

      <!-- Multi-day view for week filter -->
      @if (dateFilter() === 'week') {
        <div class="space-y-8">
          @for (dayGroup of weekDays(); track dayGroup.date) {
            <div>
              <div class="flex items-center gap-3 mb-4">
                <div class="flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm border border-slate-100 bg-white">
                  <span class="text-xs text-slate-400 uppercase">{{ dayGroup.weekday }}</span>
                  <span class="text-2xl text-slate-800">{{ dayGroup.day }}</span>
                </div>
                <div class="flex-1 h-px bg-slate-100"></div>
              </div>
              
              <div class="relative pl-14 border-l-2 border-slate-50 space-y-6 py-2">
                @for (hour of hours; track hour) {
                  @if (getAppsForDateAndHour(dayGroup.dateStr, hour).length > 0) {
                    <div class="relative group">
                      <div class="absolute -left-[4rem] top-0 text-[10px] font-bold text-slate-300 uppercase tracking-tighter w-12 text-right">{{ hour }}</div>
                      <div class="relative z-10 flex flex-col gap-3">
                        @for (app of getAppsForDateAndHour(dayGroup.dateStr, hour); track app.id) {
                          <app-appointment-card 
                            [app]="app" 
                            (select)="selectApp($event)" 
                            (complete)="complete($event)">
                          </app-appointment-card>
                        }
                      </div>
                    </div>
                  }
                }
                @if (getDayAppointments(dayGroup.dateStr).length === 0) {
                  <div class="py-8 text-center">
                    <p class="text-slate-300 text-sm italic">Nenhum agendamento</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Single day view -->
        <div class="relative pl-14 border-l-2 border-slate-50 space-y-8 py-4">
          @for (hour of hours; track hour) {
            <div class="relative group">
              <div class="absolute -left-[4rem] top-0 text-[10px] font-bold text-slate-300 uppercase tracking-tighter w-12 text-right">{{ hour }}</div>
              <div class="min-h-[60px] relative">
                <button (click)="openCreateAt(hour)" class="absolute inset-0 w-full hover:bg-slate-50/50 rounded-2xl transition-all border-2 border-transparent hover:border-slate-100/50 z-0"></button>
                <div class="relative z-10 flex flex-col gap-3">
                  @for (app of getAppsForHour(hour); track app.id) {
                    <app-appointment-card 
                      [app]="app" 
                      (select)="selectApp($event)" 
                      (complete)="complete($event)">
                    </app-appointment-card>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (showModal()) {
        <app-appointment-modal 
          [editingApp]="selectedApp()" 
          [initialDate]="selectedDateStr()"
          [initialTime]="selectedTime()"
          (close)="showModal.set(false)">
        </app-appointment-modal>
      }
    </div>
  `
})
export class CalendarComponent {
  db = inject(DbService);
  selectedDate = signal(new Date());
  showModal = signal(false);
  selectedApp = signal<Appointment | null>(null);
  selectedTime = signal('09:00');
  dateFilter = signal<DateFilter>('today');
  customDate = new Date().toISOString().split('T')[0];

  hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  dateRangeLabel = computed(() => {
    const filter = this.dateFilter();
    const today = new Date();

    switch (filter) {
      case 'today':
        return 'Hoje: ' + today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return 'Amanhã: ' + tomorrow.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
      case 'week':
        return 'Próximos 7 dias';
      case 'custom':
        const [year, month, day] = this.customDate.split('-').map(Number);
        const custom = new Date(year, month - 1, day);
        return custom.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      default:
        return '';
    }
  });

  selectedDateStr = computed(() => {
    const filter = this.dateFilter();
    const today = new Date();

    switch (filter) {
      case 'today':
        return today.toISOString().split('T')[0];
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      case 'custom':
        return this.customDate;
      default:
        return this.selectedDate().toISOString().split('T')[0];
    }
  });

  weekDays = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date,
        dateStr,
        day: date.getDate().toString().padStart(2, '0'),
        weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase()
      });
    }

    return days;
  });

  setDateFilter(filter: DateFilter) {
    this.dateFilter.set(filter);
    if (filter === 'today') {
      this.selectedDate.set(new Date());
    } else if (filter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.selectedDate.set(tomorrow);
    } else if (filter === 'custom') {
      const [year, month, day] = this.customDate.split('-').map(Number);
      this.selectedDate.set(new Date(year, month - 1, day));
    }
  }

  setToday() {
    this.dateFilter.set('today');
    this.selectedDate.set(new Date());
  }

  changeDate(days: number) {
    const d = new Date(this.selectedDate());
    d.setDate(d.getDate() + days);
    this.selectedDate.set(d);
    this.dateFilter.set('custom');
    this.customDate = d.toISOString().split('T')[0];
  }

  getAppsForHour(hour: string) {
    return this.db.appointments().filter(a =>
      a.date === this.selectedDateStr() &&
      a.time.startsWith(hour.split(':')[0]) &&
      a.status !== 'cancelled'
    );
  }

  getAppsForDateAndHour(date: string, hour: string) {
    return this.db.appointments().filter(a =>
      a.date === date &&
      a.time.startsWith(hour.split(':')[0]) &&
      a.status !== 'cancelled'
    );
  }

  getDayAppointments(date: string) {
    return this.db.appointments().filter(a => a.date === date && a.status !== 'cancelled');
  }

  openCreateAt(hour: string) {
    this.selectedApp.set(null);
    this.selectedTime.set(hour);
    this.showModal.set(true);
  }

  selectApp(app: Appointment) {
    this.selectedApp.set(app);
    this.showModal.set(true);
  }

  complete(id: string) {
    this.db.updateAppointmentStatus(id, 'completed');
  }
}
