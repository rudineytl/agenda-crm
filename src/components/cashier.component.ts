
import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { DbService, Appointment } from '../services/db.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cashier',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 md:py-10">
      <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-8">Gestão Financeira</h1>

      <!-- Filtros Avançados -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-1">
          <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Início</label>
          <input type="date" [(ngModel)]="startDate" class="w-full bg-transparent border-none outline-none font-bold text-slate-700 text-xs">
        </div>
        <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-1">
          <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fim</label>
          <input type="date" [(ngModel)]="endDate" class="w-full bg-transparent border-none outline-none font-bold text-slate-700 text-xs">
        </div>
        <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-2">
          <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Profissional</label>
          <select [(ngModel)]="profFilter" class="w-full bg-transparent border-none outline-none font-bold text-slate-700 text-xs">
            <option value="all">Todos os Membros da Equipe</option>
            @for (p of db.professionals(); track p.id) { <option [value]="p.id">{{ p.name }}</option> }
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <!-- Card Principal (Dinâmico) -->
        <div class="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
          
          <div class="relative z-10 text-center md:text-left">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Recebido no Período</p>
            <p class="text-5xl font-black text-slate-800 tracking-tighter">R$ {{ totalFiltered() }}</p>
            <div class="flex items-center gap-2 mt-4 font-bold text-sm" [class]="growthTrend() >= 0 ? 'text-emerald-500' : 'text-rose-500'">
               <i [attr.data-lucide]="growthTrend() >= 0 ? 'trending-up' : 'trending-down'" class="w-4 h-4"></i>
               <span>{{ growthTrend() >= 0 ? '+' : '' }}{{ growthTrend() }}% vs período anterior</span>
            </div>
          </div>
        </div>

        <!-- Mini Stats -->
        <div class="space-y-4">
          <div class="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] flex flex-col justify-center">
            <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Atendimentos</p>
            <p class="text-3xl font-black text-indigo-900">{{ countFiltered() }}</p>
          </div>
          <div class="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex flex-col justify-center">
            <p class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Ticket Médio</p>
            <p class="text-3xl font-black text-emerald-900">R$ {{ ticketMedio() }}</p>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center mb-6 px-2">
        <h2 class="text-xl font-bold text-slate-800">Histórico de Recebimentos</h2>
      </div>

      <div class="space-y-3">
        @for (app of paymentsFiltered(); track app.id) {
          <div class="bg-white p-5 rounded-3xl border border-slate-50 shadow-sm flex items-center justify-between hover:border-indigo-100 transition-all group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                <i data-lucide="arrow-up-right" class="w-6 h-6"></i>
              </div>
              <div>
                <p class="font-bold text-slate-800">{{ db.getClientName(app.client_id) }}</p>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-slate-400 font-medium uppercase">{{ db.getProfessionalName(app.professional_id) }}</span>
                  <span class="text-slate-200 text-xs">•</span>
                  <span class="text-[10px] text-slate-400 font-medium italic">{{ app.date.split('-').reverse().join('/') }}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
               <p class="font-black text-slate-800 text-lg">R$ {{ getPrice(app.service_id) }}</p>
               <p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Concluído</p>
            </div>
          </div>
        } @empty {
          <div class="py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <i data-lucide="wallet" class="w-12 h-12 text-slate-200 mx-auto mb-3"></i>
             <p class="text-slate-400 font-medium">Sem dados financeiros para o período selecionado.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class CashierComponent {
  db = inject(DbService);
  profFilter = signal('all');
  
  startDate = signal(new Date().toISOString().split('T')[0]);
  endDate = signal(new Date().toISOString().split('T')[0]);

  getPrice(serviceId: string) {
    return this.db.services().find(s => s.id === serviceId)?.price || 0;
  }

  paymentsFiltered = computed(() => {
    let list = this.db.appointments().filter(a => a.status === 'completed');
    
    // Filtro de Data
    const start = this.startDate();
    const end = this.endDate();
    list = list.filter(a => a.date >= start && a.date <= end);

    // Filtro de Profissional
    if (this.profFilter() !== 'all') {
      list = list.filter(a => a.professional_id === this.profFilter());
    }
    
    return list.sort((a,b) => b.date.localeCompare(a.date));
  });

  totalFiltered = computed(() => {
    return this.paymentsFiltered().reduce((sum, app) => sum + this.getPrice(app.service_id), 0);
  });

  growthTrend = computed(() => {
    const currentTotal = this.totalFiltered();
    
    // Calcula o período anterior com o mesmo intervalo de dias
    const start = new Date(this.startDate());
    const end = new Date(this.endDate());
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - (diffDays - 1));

    const prevStartStr = prevStart.toISOString().split('T')[0];
    const prevEndStr = prevEnd.toISOString().split('T')[0];

    const prevApps = this.db.appointments().filter(a => 
      a.status === 'completed' && 
      a.date >= prevStartStr && 
      a.date <= prevEndStr &&
      (this.profFilter() === 'all' || a.professional_id === this.profFilter())
    );

    const prevTotal = prevApps.reduce((sum, app) => sum + this.getPrice(app.service_id), 0);

    if (prevTotal === 0) return currentTotal > 0 ? 100 : 0;
    return Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
  });

  countFiltered = computed(() => this.paymentsFiltered().length);

  ticketMedio = computed(() => {
    const total = this.totalFiltered();
    const count = this.countFiltered();
    return count > 0 ? (total / count).toFixed(2) : '0,00';
  });
}
