
import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Appointment } from '../services/db.service';
import { AppointmentModalComponent, AppointmentCardComponent } from './shared/modals.component';

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
          <p class="text-slate-500 font-medium">Resumo de hoje: {{ todayFormatted }}</p>
        </div>
        <button (click)="openCreateModal()" 
                [style.backgroundColor]="db.brandColor()"
                [style.color]="db.brandContrastColor()"
                class="hidden md:flex px-6 py-3 rounded-2xl font-bold shadow-lg items-center gap-2 hover:brightness-110 transition-all active:scale-95">
          <i data-lucide="plus-circle" class="w-5 h-5"></i>
          Novo Agendamento
        </button>
      </header>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="p-6 rounded-3xl text-white shadow-xl" [style.backgroundColor]="db.brandColor()">
          <p class="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-2">Faturamento Hoje</p>
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

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-slate-800">Próximos Atendimentos</h2>
        <button (click)="openCreateModal()" [style.color]="db.brandColor()" class="md:hidden font-bold text-sm">+ Agendar</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (app of todayAppointments(); track app.id) {
          <app-appointment-card 
            [app]="app" 
            (select)="selectApp($event)" 
            (complete)="complete($event)">
          </app-appointment-card>
        } @empty {
          <div class="py-16 text-center md:col-span-2 border-2 border-dashed border-slate-100 rounded-3xl">
             <i data-lucide="calendar-days" class="w-12 h-12 text-slate-200 mx-auto mb-3"></i>
             <p class="text-slate-400 font-medium italic">Sua agenda está livre por enquanto.</p>
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
  stats = this.db.getTodayStats();
  todayFormatted = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  todayAppointments = computed(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.db.appointments().filter(a => a.date === todayStr).sort((a, b) => a.time.localeCompare(b.time));
  });

  openCreateModal() { this.selectedApp.set(null); this.showModal.set(true); }
  selectApp(app: Appointment) { this.selectedApp.set(app); this.showModal.set(true); }
  complete(id: string) { this.db.updateAppointmentStatus(id, 'completed'); }
}
