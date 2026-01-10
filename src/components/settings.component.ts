
import { Component, inject, signal, computed } from '@angular/core';
import { DbService } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrandingModalComponent } from './shared/modals.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, BrandingModalComponent],
  template: `
    <div class="p-6 md:py-10">
      <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-8">Configurações</h1>

      <div class="max-w-2xl space-y-6">
        
        <!-- Status de Conexão (Novo) -->
        <section class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between mb-2">
          <div class="flex items-center gap-4">
            <div [class]="db.isConfigured() ? 'bg-emerald-500' : 'bg-amber-500'" class="w-3 h-3 rounded-full animate-pulse shadow-sm"></div>
            <div>
              <p class="text-xs font-black uppercase tracking-widest text-slate-400">Status do Banco de Dados</p>
              <p class="font-bold text-slate-700">{{ db.isConfigured() ? 'Conectado ao Cloud (Supabase)' : 'Modo Demonstração (Local)' }}</p>
            </div>
          </div>
          <button (click)="db.loadAllData(auth.currentUser()?.businessId || '')" 
                  [disabled]="db._loading()"
                  class="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-500 transition-all disabled:opacity-30">
            <i data-lucide="refresh-cw" [class]="db._loading() ? 'animate-spin' : ''" class="w-5 h-5"></i>
          </button>
        </section>

        <!-- Atalho Branding -->
        <section>
          <button (click)="showBrandingModal.set(true)" 
                  class="w-full bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-100 transition-all group text-left">
            <div class="flex items-center gap-5">
              <div [style.backgroundColor]="db.brandColor()" class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <i data-lucide="palette" [style.color]="db.brandContrastColor()" class="w-7 h-7"></i>
              </div>
              <div>
                <p class="font-black text-slate-800 text-lg tracking-tight">Identidade Visual</p>
                <p class="text-xs text-slate-400 font-medium">Logo, cores e horários do seu estabelecimento</p>
              </div>
            </div>
            <i data-lucide="chevron-right" class="w-6 h-6 text-slate-300"></i>
          </button>
        </section>

        <!-- Equipe & Serviços Section -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button (click)="router.navigate(['/servicos'])" class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 hover:border-slate-200 transition-all group text-left">
            <div class="flex justify-between items-start">
              <div [style.backgroundColor]="db.brandColor() + '10'" [style.color]="db.brandColor()" class="w-12 h-12 rounded-2xl flex items-center justify-center">
                <i data-lucide="scissors" class="w-6 h-6"></i>
              </div>
              <span class="bg-slate-50 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">{{ activeServicesCount() }} Ativos</span>
            </div>
            <div>
              <p class="font-bold text-slate-800">Serviços</p>
              <p class="text-xs text-slate-400">Gerencie preços e durações</p>
            </div>
          </button>
          
          <button (click)="router.navigate(['/profissionais'])" class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 hover:border-slate-200 transition-all group text-left">
            <div class="flex justify-between items-start">
              <div [style.backgroundColor]="db.brandColor() + '10'" [style.color]="db.brandColor()" class="w-12 h-12 rounded-2xl flex items-center justify-center">
                <i data-lucide="users" class="w-6 h-6"></i>
              </div>
              <span class="bg-slate-50 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">{{ activeProfsCount() }} Ativos</span>
            </div>
            <div>
              <p class="font-bold text-slate-800">Equipe</p>
              <p class="text-xs text-slate-400">Membros e horários</p>
            </div>
          </button>
        </section>

        <section class="pt-6">
          <button (click)="auth.logout()" class="w-full text-rose-500 font-bold p-6 bg-rose-50/50 border border-rose-100 rounded-[2rem] hover:bg-rose-50 transition-all active:scale-[0.98]">
            Sair do Sistema
          </button>
        </section>
      </div>
      
      <p class="text-center text-[10px] text-slate-300 mt-12 font-bold tracking-widest uppercase">Agenda CRM Pro • v2.5.0</p>

      @if (showBrandingModal()) {
        <app-branding-modal (close)="showBrandingModal.set(false)"></app-branding-modal>
      }
    </div>
  `
})
export class SettingsComponent {
  db = inject(DbService);
  auth = inject(AuthService);
  router = inject(Router);

  showBrandingModal = signal(false);

  activeServicesCount = computed(() => this.db.activeServices().length);
  activeProfsCount = computed(() => this.db.activeProfessionals().length);
}
