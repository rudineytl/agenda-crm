
import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { DbService } from '../services/db.service';

@Component({
  selector: 'app-cashier',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Caixa</h1>

      <div class="bg-slate-900 rounded-3xl p-6 text-white mb-8 shadow-xl">
        <p class="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Total Recebido (Mês)</p>
        <p class="text-4xl font-bold">R$ {{ monthlyTotal() }}</p>
        <div class="mt-4 flex gap-4 text-sm text-slate-400">
          <div>
            <span class="block font-bold text-emerald-400">R$ {{ todayStats().faturamento }}</span>
            <span>Hoje</span>
          </div>
          <div class="border-l border-slate-800 pl-4">
            <span class="block font-bold text-indigo-400">{{ completedCount() }}</span>
            <span>Atendimentos</span>
          </div>
        </div>
      </div>

      <h2 class="text-lg font-bold text-slate-800 mb-4">Últimos Pagamentos</h2>
      <div class="space-y-3">
        @for (app of lastPayments(); track app.id) {
          <div class="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-50 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                <i data-lucide="arrow-up-right" class="w-5 h-5"></i>
              </div>
              <div>
                <p class="text-sm font-bold text-slate-800">{{ db.getClientName(app.client_id) }}</p>
                <p class="text-[10px] text-slate-400 uppercase">{{ app.date }}</p>
              </div>
            </div>
            <p class="font-bold text-slate-800">R$ {{ getPrice(app.service_id) }}</p>
          </div>
        } @empty {
          <div class="py-10 text-center text-slate-400 text-sm">
            Nenhum pagamento registrado ainda.
          </div>
        }
      </div>
    </div>
  `
})
export class CashierComponent {
  db = inject(DbService);
  todayStats = this.db.getTodayStats();

  monthlyTotal = computed(() => {
    return this.db.appointments()
      .filter(a => a.status === 'completed')
      .reduce((sum, app) => sum + this.getPrice(app.service_id), 0);
  });

  completedCount = computed(() => {
    return this.db.appointments().filter(a => a.status === 'completed').length;
  });

  lastPayments = computed(() => {
    return [...this.db.appointments()]
      .filter(a => a.status === 'completed')
      .reverse()
      .slice(0, 10);
  });

  getPrice(serviceId: string) {
    return this.db.services().find(s => s.id === serviceId)?.price || 0;
  }
}
