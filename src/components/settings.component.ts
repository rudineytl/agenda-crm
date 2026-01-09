
import { Component, inject, signal } from '@angular/core';
import { DbService, Business } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  template: `
    <div class="p-6 md:py-10">
      <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-8">Ajustes</h1>

      <div class="max-w-2xl space-y-8">
        <!-- Profile Section -->
        <section>
          <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Minha Conta</h2>
          <button (click)="openProfileModal()" class="w-full bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center text-left hover:border-indigo-200 hover:shadow-md transition-all group">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                {{ auth.currentUser()?.name?.charAt(0) }}
              </div>
              <div>
                <p class="font-bold text-slate-800 text-lg">{{ auth.currentUser()?.name }}</p>
                <p class="text-sm text-slate-400 font-medium">{{ auth.currentUser()?.email }}</p>
              </div>
            </div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-300">
              <i data-lucide="chevron-right" class="w-5 h-5"></i>
            </div>
          </button>
        </section>

        <!-- Business Section -->
        <section>
          <div class="flex justify-between items-center mb-4 ml-1">
            <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Estabelecimento</h2>
            <button (click)="openBusinessModal()" class="text-[11px] font-bold text-indigo-600 hover:underline">EDITAR DADOS</button>
          </div>
          <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="p-6 flex justify-between items-center border-b border-slate-50">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                  <i data-lucide="store" class="w-4 h-4"></i>
                </div>
                <span class="text-sm font-semibold text-slate-600">Nome do Local</span>
              </div>
              <span class="font-bold text-slate-800">{{ db.business()?.name }}</span>
            </div>
            <div class="p-6 flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                  <i data-lucide="clock" class="w-4 h-4"></i>
                </div>
                <span class="text-sm font-semibold text-slate-600">Horário de Funcionamento</span>
              </div>
              <span class="font-bold text-slate-800">{{ db.business()?.hours }}</span>
            </div>
          </div>
        </section>

        <!-- Quick Links -->
        <section>
          <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Gerenciamento</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button (click)="router.navigate(['/servicos'])" class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all group">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <i data-lucide="scissors" class="w-6 h-6"></i>
                </div>
                <span class="font-bold text-slate-800">Serviços</span>
              </div>
              <span class="bg-slate-50 px-3 py-1 rounded-full text-xs font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">{{ db.services().length }}</span>
            </button>
            
            <button (click)="router.navigate(['/profissionais'])" class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all group">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <i data-lucide="users" class="w-6 h-6"></i>
                </div>
                <span class="font-bold text-slate-800">Equipe</span>
              </div>
              <span class="bg-slate-50 px-3 py-1 rounded-full text-xs font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">{{ db.professionals().length }}</span>
            </button>
          </div>
        </section>

        <section>
          <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Suporte</h2>
          <a href="https://wa.me/5500000000000" target="_blank" class="w-full bg-emerald-50 p-5 rounded-3xl border border-emerald-100 flex items-center gap-4 text-emerald-700 font-bold hover:bg-emerald-100 transition-all shadow-sm">
            <div class="w-12 h-12 rounded-2xl bg-white text-emerald-500 flex items-center justify-center shadow-sm">
              <i data-lucide="message-square" class="w-6 h-6"></i>
            </div>
            <div>
              <p>Falar com Suporte</p>
              <p class="text-xs font-medium opacity-60">Seg à Sex, 09h às 18h</p>
            </div>
          </a>
        </section>

        <button (click)="auth.logout()" class="w-full text-rose-500 font-bold p-6 bg-rose-50 rounded-3xl mt-12 hover:bg-rose-100 transition-all active:scale-[0.98]">
          Desconectar da Conta
        </button>
      </div>
      
      <p class="text-center text-[10px] text-slate-300 mt-12 font-bold tracking-widest uppercase">Versão 1.2.0 • Micro SaaS Pro</p>
    </div>

    <!-- Modal Editar Perfil -->
    @if (showProfileModal()) {
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-xl font-bold text-slate-800">Meu Perfil</h3>
            <button (click)="showProfileModal.set(false)" class="text-slate-300 hover:text-slate-500 transition-colors">
              <i data-lucide="x" class="w-6 h-6"></i>
            </button>
          </div>
          <div class="space-y-6 mb-10">
            <div class="flex justify-center">
              <div class="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center text-4xl font-bold text-indigo-600">
                {{ profileForm.name ? profileForm.name.charAt(0) : '?' }}
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Seu Nome</label>
              <input type="text" [(ngModel)]="profileForm.name" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-slate-700">
            </div>
          </div>
          <div class="flex gap-3">
            <button (click)="showProfileModal.set(false)" class="flex-1 py-4 text-slate-400 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
            <button (click)="saveProfile()" class="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 active:scale-95 transition-all">Salvar</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Editar Estabelecimento -->
    @if (showBusinessModal()) {
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-xl font-bold text-slate-800">Estabelecimento</h3>
            <button (click)="showBusinessModal.set(false)" class="text-slate-300 hover:text-slate-500 transition-colors">
              <i data-lucide="x" class="w-6 h-6"></i>
            </button>
          </div>
          <div class="space-y-5 mb-10">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome do Local</label>
              <input type="text" [(ngModel)]="businessForm.name" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-slate-700">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Horário (ex: 08:00 - 18:00)</label>
              <input type="text" [(ngModel)]="businessForm.hours" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-slate-700">
            </div>
          </div>
          <div class="flex gap-3">
            <button (click)="showBusinessModal.set(false)" class="flex-1 py-4 text-slate-400 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
            <button (click)="saveBusiness()" class="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 active:scale-95 transition-all">Atualizar Dados</button>
          </div>
        </div>
      </div>
    }
  `
})
export class SettingsComponent {
  db = inject(DbService);
  auth = inject(AuthService);
  router = inject(Router);

  showProfileModal = signal(false);
  showBusinessModal = signal(false);

  profileForm = { name: '' };
  businessForm = { name: '', hours: '' };

  openProfileModal() {
    this.profileForm.name = this.auth.currentUser()?.name || '';
    this.showProfileModal.set(true);
  }

  saveProfile() {
    this.auth.updateProfile(this.profileForm.name);
    this.showProfileModal.set(false);
  }

  openBusinessModal() {
    const b = this.db.business();
    if (b) {
      this.businessForm = { name: b.name, hours: b.hours };
    }
    this.showBusinessModal.set(true);
  }

  saveBusiness() {
    const b = this.db.business();
    if (b) {
      this.db.saveBusiness({ ...b, ...this.businessForm });
    }
    this.showBusinessModal.set(false);
  }
}
