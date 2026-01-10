
import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Appointment } from '../services/db.service';
import { AppointmentModalComponent, AppointmentCardComponent } from './shared/modals.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentModalComponent, AppointmentCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 md:py-10">
      <header class="flex justify-between items-center mb-10">
        <div>
          <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Agenda</h1>
          <p class="text-slate-500 font-medium">{{ selectedDateFormatted() }}</p>
        </div>
        <div class="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
          <button (click)="changeDate(-1)" class="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400">
            <i data-lucide="chevron-left" class="w-5 h-5"></i>
          </button>
          <button (click)="selectedDate.set(newDate())" class="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hoje</button>
          <button (click)="changeDate(1)" class="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400">
            <i data-lucide="chevron-right" class="w-5 h-5"></i>
          </button>
        </div>
      </header>

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
  
  hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  newDate() { return new Date(); }
  selectedDateStr = computed(() => this.selectedDate().toISOString().split('T')[0]);
  selectedDateFormatted = computed(() => this.selectedDate().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' }));
  changeDate(days: number) { const d = new Date(this.selectedDate()); d.setDate(d.getDate() + days); this.selectedDate.set(d); }
  getAppsForHour(hour: string) { return this.db.appointments().filter(a => a.date === this.selectedDateStr() && a.time.startsWith(hour.split(':')[0]) && a.status !== 'cancelled'); }
  
  openCreateAt(hour: string) { this.selectedApp.set(null); this.selectedTime.set(hour); this.showModal.set(true); }
  selectApp(app: Appointment) { this.selectedApp.set(app); this.showModal.set(true); }
  complete(id: string) { this.db.updateAppointmentStatus(id, 'completed'); }
}
