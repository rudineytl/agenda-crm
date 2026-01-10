
import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, Client } from '../services/db.service';
import { ClientModalComponent } from './shared/modals.component';

interface ClientWithStats extends Client {
  lastVisitDate: string | null;
  status: 'active' | 'warning' | 'inactive' | 'risk' | 'new';
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 md:py-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Clientes</h1>
          <p class="text-slate-500 font-medium">Gerencie sua base e resgate quem não volta.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Campo de Busca Refinado -->
          <div class="relative group flex-1 md:w-80">
            <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
            <input 
              type="text" 
              [(ngModel)]="search" 
              placeholder="Nome ou WhatsApp..." 
              class="w-full pl-12 pr-10 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all font-medium text-slate-700 placeholder:text-slate-300"
            >
            @if (search()) {
              <button (click)="search.set('')" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors animate-in fade-in zoom-in-95">
                <i data-lucide="x-circle" class="w-5 h-5"></i>
              </button>
            }
          </div>

          <button (click)="openModal()" [style.backgroundColor]="db.brandColor()" [style.color]="db.brandContrastColor()" class="px-6 py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shrink-0">
            <i data-lucide="plus" class="w-5 h-5"></i> Novo Cliente
          </button>
        </div>
      </div>

      <!-- Filtros de Status -->
      <div class="flex gap-2 mb-8 overflow-x-auto no-scrollbar snap-x touch-pan-x pb-2">
        @for (f of ['all', 'active', 'warning', 'inactive', 'risk']; track f) {
          <button (click)="currentFilter.set(f)" class="px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border shadow-sm transition-all"
                  [style.backgroundColor]="currentFilter() === f ? db.brandColor() : 'white'"
                  [style.color]="currentFilter() === f ? db.brandContrastColor() : '#64748b'">
            {{ getFilterLabel(f) }}
          </button>
        }
      </div>

      <!-- Grid de Resultados -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        @for (c of filteredClients(); track c.id) {
          <div (click)="openModal(c)" class="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm flex items-center gap-4 group cursor-pointer hover:border-indigo-100 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-xl group-hover:bg-slate-100 transition-colors">{{ c.name.charAt(0) }}</div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-slate-800 text-lg truncate">{{ c.name }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase" [class]="getStatusClass(c.status)">{{ getStatusLabel(c.status) }}</span>
                <span class="text-[10px] text-slate-400 font-medium truncate">Visto em {{ c.lastVisitDate || 'Nenhum histórico' }}</span>
              </div>
            </div>
            <a [href]="'https://wa.me/55' + c.whatsapp.replace(/\D/g, '')" target="_blank" (click)="$event.stopPropagation()" class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-white border border-transparent hover:border-slate-100 transition-all shrink-0">
              <i data-lucide="message-circle" class="w-5 h-5" [style.color]="db.brandColor()"></i>
            </a>
          </div>
        } @empty {
          <!-- Estado Vazio / Nenhum Resultado -->
          <div class="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 animate-in fade-in zoom-in-95 duration-500">
            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i data-lucide="search-x" class="w-10 h-10 text-slate-200"></i>
            </div>
            <p class="text-slate-500 font-bold text-lg">Nenhum cliente encontrado</p>
            <p class="text-slate-400 text-sm mt-1">Tente buscar por outro nome ou limpe os filtros.</p>
            @if (search() || currentFilter() !== 'all') {
              <button (click)="resetFilters()" class="mt-6 text-sm font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors">Limpar Tudo</button>
            }
          </div>
        }
      </div>

      @if (showModal()) {
        <app-client-modal [editingClient]="selectedClient()" (close)="showModal.set(false)"></app-client-modal>
      }
    </div>
  `
})
export class ClientsComponent {
  db = inject(DbService);
  search = signal('');
  currentFilter = signal('all');
  showModal = signal(false);
  selectedClient = signal<Client | null>(null);

  clientsWithStats = computed(() => {
    const today = new Date();
    return this.db.clients().map(client => {
      const apps = this.db.appointments().filter(a => a.client_id === client.id && a.status === 'completed').sort((a,b) => b.date.localeCompare(a.date));
      let lastVisitDate: string | null = null, status: any = 'new';
      if (apps.length > 0) {
        lastVisitDate = apps[0].date.split('-').reverse().join('/');
        const diff = Math.floor((today.getTime() - new Date(apps[0].date).getTime()) / (1000 * 3600 * 24));
        if (diff <= 30) status = 'active'; else if (diff <= 60) status = 'warning'; else if (diff <= 90) status = 'inactive'; else status = 'risk';
      }
      return { ...client, lastVisitDate, status } as ClientWithStats;
    });
  });

  filteredClients = computed(() => {
    let list = this.clientsWithStats();
    if (this.currentFilter() !== 'all') list = list.filter(c => c.status === this.currentFilter());
    
    const term = this.search().toLowerCase().trim();
    if (term) {
      list = list.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.whatsapp.replace(/\D/g, '').includes(term)
      );
    }
    return list;
  });

  resetFilters() {
    this.search.set('');
    this.currentFilter.set('all');
  }

  openModal(client: Client | null = null) { this.selectedClient.set(client); this.showModal.set(true); }
  getFilterLabel(f: string) { return { all: 'Todos', active: 'Frequentes', warning: '30 Dias+', inactive: '60 Dias+', risk: '90 Dias+' }[f] || f; }
  getStatusLabel(s: string) { return { active: 'Ativo', warning: 'Ausente', inactive: 'Inativo', risk: 'Risco', new: 'Novo' }[s] || s; }
  getStatusClass(s: string) { return { active: 'bg-emerald-50 text-emerald-600', warning: 'bg-amber-50 text-amber-600', inactive: 'bg-orange-50 text-orange-600', risk: 'bg-rose-50 text-rose-600', new: 'bg-slate-50 text-slate-400' }[s]; }
}
