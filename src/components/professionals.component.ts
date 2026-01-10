
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
          <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Equipe</h1>
          <p class="text-slate-500 font-medium">Gerencie o acesso e status dos seus profissionais.</p>
        </div>
      </header>

      <button (click)="openModal()" 
              [style.backgroundColor]="db.brandColor() + '15'"
              [style.color]="db.brandColor()"
              [style.borderColor]="db.brandColor() + '30'"
              class="w-full py-5 rounded-2xl font-bold mb-8 flex items-center justify-center gap-2 border shadow-sm hover:brightness-95 transition-all active:scale-[0.99]">
        <i data-lucide="user-plus" class="w-5 h-5"></i>
        Cadastrar Novo Profissional
      </button>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (p of db.professionals(); track p.id) {
          <div class="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center gap-4 flex-1">
              <div [style.backgroundColor]="p.status === 'active' ? db.brandColor() + '10' : '#f1f5f9'"
                   [style.color]="p.status === 'active' ? db.brandColor() : '#94a3b8'"
                   class="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl">
                {{ p.name.charAt(0) }}
              </div>
              <div>
                <p class="font-bold text-slate-800 text-lg leading-tight">{{ p.name }}</p>
                <div class="flex items-center gap-2 mt-1">
                   <span class="text-[9px] font-bold uppercase tracking-widest" [style.color]="p.status === 'active' ? '#10b981' : '#ef4444'">
                     {{ p.status === 'active' ? '● Ativo' : '○ Inativo' }}
                   </span>
                   <span class="text-[9px] text-slate-400 font-medium lowercase">{{ p.email }}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="openModal(p)" 
                      [style.color]="db.brandColor()"
                      class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center hover:brightness-95 transition-all">
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
            
            <div class="space-y-4 mb-10">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                <input type="text" [(ngModel)]="form.name" placeholder="Ex: Rodrigo Oliveira" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-100 font-medium text-slate-700">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-mail de Login</label>
                <input type="email" [(ngModel)]="form.email" placeholder="rodrigo@exemplo.com" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-100 font-medium text-slate-700">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status no Estabelecimento</label>
                <select [(ngModel)]="form.status" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-100 font-bold text-slate-700">
                   <option value="active">Ativo (Pode realizar login)</option>
                   <option value="inactive">Inativo (Acesso bloqueado)</option>
                </select>
              </div>
            </div>

            <div class="flex gap-3">
              <button (click)="showModal.set(false)" class="flex-1 py-4 text-slate-400 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
              <button (click)="save()" 
                      [disabled]="!form.name || !form.email" 
                      [style.backgroundColor]="db.brandColor()"
                      [style.color]="db.brandContrastColor()"
                      class="flex-1 py-4 rounded-2xl font-bold text-sm shadow-lg disabled:opacity-50 active:scale-95 transition-all">
                Salvar
              </button>
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

  form = { name: '', email: '', status: 'active' as 'active' | 'inactive' };

  openModal(prof?: Professional) {
    if (prof) {
      this.editingId.set(prof.id);
      this.form = { name: prof.name, email: prof.email, status: prof.status };
    } else {
      this.editingId.set(null);
      this.form = { name: '', email: '', status: 'active' };
    }
    this.showModal.set(true);
  }

  async save() {
    if (!this.form.name || !this.form.email) return;

    if (this.editingId()) {
      const existing = this.db.professionals().find(p => p.id === this.editingId());
      if (existing) {
        await this.db.updateProfessional({ ...existing, ...this.form });
      }
    } else {
      await this.db.addProfessional({
        ...this.form
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
