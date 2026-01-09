
import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { DbService, Client, Appointment } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

interface ClientWithStats extends Client {
  daysSinceLastVisit: number | null;
  lastVisitDate: string | null;
  status: 'active' | 'warning' | 'inactive' | 'risk' | 'new';
}

@Component({
  selector: 'app-clients',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 md:py-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Gestão de Clientes</h1>
          <p class="text-slate-500 font-medium">Acompanhe a frequência e resgate clientes ausentes.</p>
        </div>
        <div class="flex gap-3">
          <!-- Busca com Feedback Visual -->
          <div class="relative w-full md:w-80 group">
            <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600">
              <i data-lucide="search" class="w-5 h-5"></i>
            </div>
            <input 
              type="text" 
              [(ngModel)]="search" 
              placeholder="Buscar por nome ou WhatsApp..." 
              class="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium text-slate-700 placeholder:text-slate-300"
            >
            @if (search()) {
              <button (click)="search.set('')" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors">
                <i data-lucide="x-circle" class="w-5 h-5"></i>
              </button>
            }
          </div>
          
          <button (click)="openNewClientModal()" class="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shrink-0">
            <i data-lucide="plus" class="w-5 h-5"></i>
            <span class="hidden sm:inline">Novo Cliente</span>
          </button>
        </div>
      </div>
      
      <!-- Cards de Resumo -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div (click)="currentFilter.set('all')" class="cursor-pointer bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:border-indigo-200 transition-all group" [class.ring-2]="currentFilter() === 'all'" [class.ring-indigo-500]="currentFilter() === 'all'">
          <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 group-hover:text-indigo-400">Total</p>
          <p class="text-2xl font-bold text-slate-800">{{ db.clients().length }}</p>
        </div>
        <div (click)="currentFilter.set('warning')" class="cursor-pointer bg-amber-50 border border-amber-100 p-5 rounded-3xl shadow-sm hover:border-amber-300 transition-all group" [class.ring-2]="currentFilter() === 'warning'" [class.ring-amber-500]="currentFilter() === 'warning'">
          <p class="text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-1 group-hover:text-amber-700">30 Dias +</p>
          <p class="text-2xl font-bold text-amber-900">{{ countByStatus('warning') }}</p>
        </div>
        <div (click)="currentFilter.set('inactive')" class="cursor-pointer bg-orange-50 border border-orange-100 p-5 rounded-3xl shadow-sm hover:border-orange-300 transition-all group" [class.ring-2]="currentFilter() === 'inactive'" [class.ring-orange-500]="currentFilter() === 'inactive'">
          <p class="text-orange-600 text-[10px] font-bold uppercase tracking-widest mb-1 group-hover:text-orange-700">60 Dias +</p>
          <p class="text-2xl font-bold text-orange-900">{{ countByStatus('inactive') }}</p>
        </div>
        <div (click)="currentFilter.set('risk')" class="cursor-pointer bg-rose-50 border border-rose-100 p-5 rounded-3xl shadow-sm hover:border-rose-300 transition-all group" [class.ring-2]="currentFilter() === 'risk'" [class.ring-rose-500]="currentFilter() === 'risk'">
          <p class="text-rose-600 text-[10px] font-bold uppercase tracking-widest mb-1 group-hover:text-rose-700">90 Dias +</p>
          <p class="text-2xl font-bold text-rose-900">{{ countByStatus('risk') }}</p>
        </div>
      </div>

      <!-- Filtros de Abas -->
      <div class="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
        @for (f of ['all', 'active', 'warning', 'inactive', 'risk']; track f) {
          <button (click)="currentFilter.set(f)" 
                  class="px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-sm"
                  [class]="currentFilter() === f ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100' : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'">
            {{ getFilterLabel(f) }}
          </button>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        @for (c of filteredClients(); track c.id) {
          <div class="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-md transition-all group gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-4 mb-2">
                <div class="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center font-bold text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all text-xl">
                  {{ c.name.charAt(0) }}
                </div>
                <div>
                  <p class="font-bold text-slate-800 text-lg leading-tight">{{ c.name }}</p>
                  <p class="text-sm text-slate-400 font-medium mt-0.5">{{ c.whatsapp }}</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-2 mt-4">
                <span class="text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider" 
                      [class]="getStatusClass(c.status)">
                  {{ getStatusLabel(c.status) }}
                </span>

                @if (c.lastVisitDate) {
                  <span class="text-[10px] font-bold bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 border border-slate-100">
                    <i data-lucide="calendar" class="w-3 h-3"></i>
                    Visto em {{ c.lastVisitDate }}
                  </span>
                }
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              @if (c.status !== 'active' && c.status !== 'new') {
                <button (click)="rescueClient(c)" class="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <i data-lucide="heart" class="w-4 h-4"></i>
                  Resgatar
                </button>
              } @else {
                <a [href]="'https://wa.me/55' + c.whatsapp.replace(/\D/g, '')" target="_blank" class="flex-1 md:flex-none bg-slate-50 text-slate-600 px-6 py-4 rounded-2xl text-sm font-bold hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2 border border-slate-100">
                  <i data-lucide="message-circle" class="w-4 h-4"></i>
                  WhatsApp
                </a>
              }
            </div>
          </div>
        } @empty {
          <div class="text-center py-24 lg:col-span-2">
             <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i data-lucide="search-x" class="text-slate-200 w-12 h-12"></i>
             </div>
             <p class="text-slate-500 text-lg font-medium">Nenhum cliente encontrado.</p>
             <button (click)="search.set(''); currentFilter.set('all')" class="mt-4 text-indigo-600 font-bold hover:underline transition-all">Limpar todos os filtros</button>
          </div>
        }
      </div>

      <!-- Modal Novo Cliente -->
      @if (showNewClientModal()) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div class="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div class="flex justify-between items-center mb-6">
              <h4 class="text-xl font-bold text-slate-800">Novo Cliente</h4>
              <button (click)="showNewClientModal.set(false)" class="text-slate-300 hover:text-slate-500 transition-colors">
                <i data-lucide="x" class="w-6 h-6"></i>
              </button>
            </div>
            <div class="space-y-4 mb-8">
              <div>
                <label class="text-[10px] text-slate-400 font-bold uppercase ml-1 tracking-widest mb-1.5 block">Nome Completo</label>
                <input type="text" [(ngModel)]="clientForm.name" placeholder="Ex: Maria Souza" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-slate-700">
              </div>
              <div>
                <label class="text-[10px] text-slate-400 font-bold uppercase ml-1 tracking-widest mb-1.5 block">WhatsApp</label>
                <input type="tel" [(ngModel)]="clientForm.whatsapp" placeholder="(11) 99999-9999" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-slate-700">
              </div>
              <div>
                <label class="text-[10px] text-slate-400 font-bold uppercase ml-1 tracking-widest mb-1.5 block">Observações</label>
                <textarea [(ngModel)]="clientForm.notes" placeholder="Alergias, preferências, etc..." rows="2" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-slate-700 resize-none"></textarea>
              </div>
            </div>
            <div class="flex gap-3">
              <button (click)="showNewClientModal.set(false)" class="flex-1 py-4 text-slate-400 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
              <button (click)="saveNewClient()" [disabled]="!clientForm.name" class="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-95 transition-all">Salvar Cliente</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ClientsComponent {
  db = inject(DbService);
  auth = inject(AuthService);
  search = signal('');
  currentFilter = signal<any>('all');
  showNewClientModal = signal(false);
  clientForm = { name: '', whatsapp: '', notes: '' };

  clientsWithStats = computed(() => {
    const today = new Date();
    const appointments = this.db.appointments();
    
    return this.db.clients().map(client => {
      const clientApps = appointments
        .filter(a => a.client_id === client.id && a.status === 'completed')
        .sort((a, b) => b.date.localeCompare(a.date));

      let lastVisitDate: string | null = null;
      let daysSinceLastVisit: number | null = null;
      let status: any = 'new';

      if (clientApps.length > 0) {
        const lastApp = clientApps[0];
        const lastDate = new Date(lastApp.date);
        const timeDiff = today.getTime() - lastDate.getTime();
        daysSinceLastVisit = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        const [y, m, d] = lastApp.date.split('-');
        lastVisitDate = `${d}/${m}/${y}`;
        
        if (daysSinceLastVisit <= 30) status = 'active';
        else if (daysSinceLastVisit <= 60) status = 'warning';
        else if (daysSinceLastVisit <= 90) status = 'inactive';
        else status = 'risk';
      }

      return { ...client, lastVisitDate, daysSinceLastVisit, status } as ClientWithStats;
    });
  });

  filteredClients = computed(() => {
    let list = this.clientsWithStats();
    const f = this.currentFilter();
    const s = this.search().toLowerCase();

    if (f !== 'all') list = list.filter(c => c.status === f);
    if (s) {
      list = list.filter(c => 
        c.name.toLowerCase().includes(s) || 
        c.whatsapp.includes(s)
      );
    }
    return list;
  });

  countByStatus(status: string) {
    return this.clientsWithStats().filter(c => c.status === status).length;
  }

  getFilterLabel(f: string) {
    const labels: any = { all: 'Todos', active: 'Frequentes', warning: 'Ausentes 30d', inactive: 'Ausentes 60d', risk: 'Risco 90d+' };
    return labels[f];
  }

  getStatusLabel(s: string) {
    const labels: any = { active: 'Ativo', warning: 'Ausente 30d', inactive: 'Ausente 60d', risk: 'Risco 90d+', new: 'Sem histórico' };
    return labels[s];
  }

  getStatusClass(s: string) {
    const classes: any = {
      active: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-amber-100 text-amber-700',
      inactive: 'bg-orange-100 text-orange-700',
      risk: 'bg-rose-100 text-rose-700',
      new: 'bg-slate-100 text-slate-600'
    };
    return classes[s];
  }

  openNewClientModal() {
    this.clientForm = { name: '', whatsapp: '', notes: '' };
    this.showNewClientModal.set(true);
  }

  async saveNewClient() {
    if (!this.clientForm.name) return;
    await this.db.addClient({
      name: this.clientForm.name,
      whatsapp: this.clientForm.whatsapp,
      notes: this.clientForm.notes
    });
    this.showNewClientModal.set(false);
  }

  rescueClient(client: ClientWithStats) {
    const business = this.db.business();
    let msg = `Olá *${client.name}*! Tudo bem?\n\nSentimos sua falta no *${business?.name || 'nosso studio'}*. Vamos agendar sua próxima visita? ✨`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/55${client.whatsapp.replace(/\D/g, '')}?text=${encoded}`, '_blank');
  }
}
