
import { Component, signal, inject } from '@angular/core';
import { DbService, ServiceItem } from '../services/db.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-services',
  imports: [FormsModule],
  template: `
    <div class="p-6 md:py-10">
      <header class="flex items-center gap-4 mb-8">
        <button (click)="router.navigate(['/configuracoes'])" class="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
           <i data-lucide="arrow-left" class="w-6 h-6"></i>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Serviços</h1>
          <p class="text-slate-500 font-medium">Cadastre e edite o que você oferece.</p>
        </div>
      </header>

      <button (click)="openModal()" class="w-full bg-indigo-50 text-indigo-600 py-5 rounded-2xl font-bold mb-8 flex items-center justify-center gap-2 border border-indigo-100 shadow-sm hover:bg-indigo-100 transition-all active:scale-[0.99]">
        <i data-lucide="plus" class="w-5 h-5"></i>
        Adicionar Novo Serviço
      </button>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (s of db.services(); track s.id) {
          <div class="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
            <div class="flex-1">
              <p class="font-bold text-slate-800 text-lg leading-tight">{{ s.name }}</p>
              <div class="flex items-center gap-2 mt-1.5">
                <span class="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg font-bold">R$ {{ s.price }}</span>
                <span class="text-xs text-slate-400 font-medium">• {{ s.duration }} min</span>
              </div>
            </div>
            <div class="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="openModal(s)" class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              <button (click)="delete(s)" class="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-all">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        } @empty {
          <div class="text-center py-20 md:col-span-full">
            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i data-lucide="scissors" class="text-slate-200 w-10 h-10"></i>
            </div>
            <p class="text-slate-400 font-medium">Você ainda não tem serviços cadastrados.</p>
          </div>
        }
      </div>

      <!-- Modal Edit/Add -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div class="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div class="flex justify-between items-center mb-8">
              <h3 class="text-xl font-bold text-slate-800">{{ editingId() ? 'Editar' : 'Novo' }} Serviço</h3>
              <button (click)="showModal.set(false)" class="text-slate-300 hover:text-slate-500 transition-colors">
                <i data-lucide="x" class="w-6 h-6"></i>
              </button>
            </div>
            
            <div class="space-y-5 mb-10">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome do Serviço</label>
                <input type="text" [(ngModel)]="form.name" placeholder="Ex: Corte e Barba" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-slate-700">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Preço (R$)</label>
                  <input type="number" [(ngModel)]="form.price" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-700">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Duração (min)</label>
                  <input type="number" [(ngModel)]="form.duration" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-700">
                </div>
              </div>
            </div>

            <div class="flex gap-3">
              <button (click)="showModal.set(false)" class="flex-1 py-4 text-slate-400 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
              <button (click)="save()" [disabled]="!form.name" class="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-95 transition-all">Salvar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ServicesComponent {
  db = inject(DbService);
  router = inject(Router);
  showModal = signal(false);
  editingId = signal<string | null>(null);

  form = { name: '', price: 0, duration: 30 };

  openModal(service?: ServiceItem) {
    if (service) {
      this.editingId.set(service.id);
      this.form = { ...service };
    } else {
      this.editingId.set(null);
      this.form = { name: '', price: 0, duration: 30 };
    }
    this.showModal.set(true);
  }

  save() {
    if (!this.form.name) return;

    if (this.editingId()) {
      this.db.updateService({ ...this.form, id: this.editingId()! } as ServiceItem);
    } else {
      this.db.addService({
        ...this.form,
        id: 's-' + Math.random().toString(36).substr(2, 5),
        businessId: '' // Atribuído no DbService
      } as ServiceItem);
    }
    this.showModal.set(false);
  }

  delete(s: ServiceItem) {
    if (confirm(`Remover o serviço "${s.name}"? Esta ação não pode ser desfeita.`)) {
      this.db.deleteService(s.id);
    }
  }
}
