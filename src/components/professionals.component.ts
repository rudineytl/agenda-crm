
import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { DbService, Professional } from '../services/db.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-professionals',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 md:py-10">
      <header class="flex items-center gap-4 mb-8">
        <button (click)="router.navigate(['/configuracoes'])" class="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
           <i data-lucide="arrow-left" class="w-6 h-6"></i>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Minha Equipe</h1>
          <p class="text-slate-500 font-medium">Gerencie quem atende no seu estabelecimento.</p>
        </div>
      </header>

      <button (click)="openModal()" class="w-full bg-indigo-50 text-indigo-600 py-5 rounded-2xl font-bold mb-8 flex items-center justify-center gap-2 border border-indigo-100 shadow-sm hover:bg-indigo-100 transition-all active:scale-[0.99]">
        <i data-lucide="user-plus" class="w-5 h-5"></i>
        Cadastrar Novo Profissional
      </button>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (p of db.professionals(); track p.id) {
          <div class="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center gap-4 flex-1">
              <div class="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all text-xl">
                {{ p.name.charAt(0) }}
              </div>
              <div>
                <p class="font-bold text-slate-800 text-lg leading-tight">{{ p.name }}</p>
                <p class="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-wider">Profissional</p>
              </div>
            </div>
            <div class="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="openModal(p)" class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              @if (db.professionals().length > 1) {
                <button (click)="delete(p)" class="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-all">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              }
            </div>
          </div>
        }
      </div>

      <!-- Edit/Add Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div class="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div class="flex justify-between items-center mb-8">
              <h3 class="text-xl font-bold text-slate-800">{{ editingId() ? 'Editar' : 'Novo' }} Profissional</h3>
              <button (click)="showModal.set(false)" class="text-slate-300 hover:text-slate-500 transition-colors">
                <i data-lucide="x" class="w-6 h-6"></i>
              </button>
            </div>
            
            <div class="space-y-6 mb-10">
              <div class="flex justify-center mb-4">
                <div class="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-3xl font-bold text-indigo-400">
                  {{ form.name ? form.name.charAt(0) : '?' }}
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                <input type="text" [(ngModel)]="form.name" placeholder="Ex: Rodrigo Oliveira" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-slate-700">
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
export class ProfessionalsComponent {
  db = inject(DbService);
  router = inject(Router);
  showModal = signal(false);
  editingId = signal<string | null>(null);

  form = { name: '' };

  openModal(prof?: Professional) {
    if (prof) {
      this.editingId.set(prof.id);
      this.form = { name: prof.name };
    } else {
      this.editingId.set(null);
      this.form = { name: '' };
    }
    this.showModal.set(true);
  }

  async save() {
    if (!this.form.name) return;

    if (this.editingId()) {
      const existing = this.db.professionals().find(p => p.id === this.editingId());
      if (existing) {
        await this.db.updateProfessional({ ...existing, ...this.form });
      }
    } else {
      await this.db.addProfessional({
        name: this.form.name
      });
    }
    this.showModal.set(false);
  }

  async delete(p: Professional) {
    if (confirm(`Remover o profissional "${p.name}"? Agendamentos futuros vinculados a ele podem ser impactados.`)) {
      await this.db.deleteProfessional(p.id);
    }
  }
}
