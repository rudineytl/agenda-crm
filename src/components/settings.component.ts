
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
        
        <!-- 1. Seção de Gestão (Serviços & Equipe) -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button (click)="router.navigate(['/servicos'])" class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 hover:border-slate-200 transition-all group text-left active:scale-[0.98]">
            <div class="flex justify-between items-start">
              <div [style.backgroundColor]="db.brandColor() + '10'" [style.color]="db.brandColor()" class="w-12 h-12 rounded-2xl flex items-center justify-center">
                <i data-lucide="scissors" class="w-6 h-6"></i>
              </div>
              <span class="bg-slate-50 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">{{ activeServicesCount() }} Ativos</span>
            </div>
            <div>
              <p class="font-bold text-slate-800">Serviços</p>
              <p class="text-xs text-slate-400 font-medium">Gerencie preços e durações</p>
            </div>
          </button>
          
          <button (click)="router.navigate(['/profissionais'])" class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 hover:border-slate-200 transition-all group text-left active:scale-[0.98]">
            <div class="flex justify-between items-start">
              <div [style.backgroundColor]="db.brandColor() + '10'" [style.color]="db.brandColor()" class="w-12 h-12 rounded-2xl flex items-center justify-center">
                <i data-lucide="users" class="w-6 h-6"></i>
              </div>
              <span class="bg-slate-50 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">{{ activeProfsCount() }} Ativos</span>
            </div>
            <div>
              <p class="font-bold text-slate-800">Equipe</p>
              <p class="text-xs text-slate-400 font-medium">Membros e horários</p>
            </div>
          </button>
        </section>

        <!-- 2. Atalho Branding (Identidade Visual) -->
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
            <i data-lucide="chevron-right" class="w-6 h-6 text-slate-300 group-hover:translate-x-1 transition-transform"></i>
          </button>
        </section>

        <!-- 3. Ambiente de Dados (Agora posicionado abaixo) -->
        <section class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:border-slate-200">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <div class="relative">
                <div [class]="db.isConfigured() ? 'bg-emerald-500' : 'bg-amber-500'" class="w-4 h-4 rounded-full shadow-sm"></div>
                <div [class]="db.isConfigured() ? 'bg-emerald-400' : 'bg-amber-400'" class="absolute inset-0 rounded-full animate-ping opacity-75"></div>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ambiente de Dados</p>
                <p class="font-bold text-slate-700 leading-tight">
                  {{ db.isConfigured() ? 'Cloud Sync (Supabase)' : 'Local Database (Demo)' }}
                </p>
              </div>
            </div>
            
            <button (click)="syncData()" 
                    [disabled]="db._loading()"
                    class="group relative w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-90 disabled:opacity-30">
              <i data-lucide="refresh-cw" [class.animate-spin]="db._loading()" class="w-5 h-5"></i>
              @if (showSyncSuccess()) {
                <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                  Sincronizado!
                </div>
              }
            </button>
          </div>

          <div class="pt-4 border-t border-slate-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
               <i data-lucide="clock-3" class="w-3.5 h-3.5 text-slate-300"></i>
               <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Última sincronização: {{ formattedLastSync() }}
               </span>
            </div>
            @if (db.isConfigured()) {
              <span class="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Online</span>
            } @else {
              <span class="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Offline</span>
            }
          </div>
        </section>

        <!-- 4. Sair do Sistema -->
        <section class="pt-6">
          <button (click)="auth.logout()" class="w-full text-rose-500 font-bold p-6 bg-rose-50/50 border border-rose-100 rounded-[2rem] hover:bg-rose-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
            <i data-lucide="log-out" class="w-5 h-5"></i>
            Sair do Sistema
          </button>
        </section>
      </div>
      
      <p class="text-center text-[10px] text-slate-300 mt-12 font-bold tracking-widest uppercase">Agenda CRM Pro • v2.6.0</p>

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
  showSyncSuccess = signal(false);

  activeServicesCount = computed(() => this.db.activeServices().length);
  activeProfsCount = computed(() => this.db.activeProfessionals().length);

  formattedLastSync = computed(() => {
    const date = this.db.lastSync();
    if (!date) return 'Nunca';
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  async syncData() {
    const businessId = this.auth.currentUser()?.businessId;
    if (businessId) {
      await this.db.loadAllData(businessId);
      this.showSyncSuccess.set(true);
      setTimeout(() => this.showSyncSuccess.set(false), 3000);
    }
  }
}
