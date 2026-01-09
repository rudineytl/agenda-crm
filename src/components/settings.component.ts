
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
      <h1 class="text-3xl font-bold text-slate-800 tracking-tight mb-8">Configurações</h1>

      <div class="max-w-2xl space-y-8">
        <!-- White Label / Branding Section -->
        <section>
          <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Identidade do Sistema (White Label)</h2>
          <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Nome do Estabelecimento</label>
                <input type="text" [(ngModel)]="brandingForm.name" class="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 font-medium">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Cor Principal da Marca</label>
                <div class="flex gap-3">
                  <input type="color" [(ngModel)]="brandingForm.branding_color" class="w-12 h-12 rounded-xl border-none p-1 bg-slate-50 cursor-pointer">
                  <input type="text" [(ngModel)]="brandingForm.branding_color" class="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 font-mono text-sm">
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-2">URL da Logomarca (PNG/SVG)</label>
              <input type="text" [(ngModel)]="brandingForm.logo_url" placeholder="https://link-da-sua-logo.com/imagem.png" class="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 font-medium">
            </div>

            <button (click)="saveBranding()" 
                    [style.backgroundColor]="db.brandColor()"
                    [style.color]="db.brandContrastColor()"
                    class="w-full py-4 rounded-2xl font-bold shadow-lg hover:brightness-110 transition-all active:scale-[0.99]">
              Atualizar Identidade Visual
            </button>
          </div>
        </section>

        <!-- Business Section -->
        <section>
          <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Funcionamento</h2>
          <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            <div class="p-6 flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
                  <i data-lucide="clock" class="w-4 h-4"></i>
                </div>
                <span class="text-sm font-semibold text-slate-600">Horário de Atendimento</span>
              </div>
              <input type="text" [(ngModel)]="businessForm.hours" class="text-right font-bold text-slate-800 bg-transparent border-none focus:ring-0">
            </div>
          </div>
        </section>

        <!-- Profile Section -->
        <section>
          <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Equipe & Serviços</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button (click)="router.navigate(['/servicos'])" class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-200 transition-all group">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <i data-lucide="scissors" class="w-6 h-6"></i>
                </div>
                <span class="font-bold text-slate-800">Serviços</span>
              </div>
              <i data-lucide="chevron-right" class="w-5 h-5 text-slate-300"></i>
            </button>
            
            <button (click)="router.navigate(['/profissionais'])" class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-200 transition-all group">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <i data-lucide="users" class="w-6 h-6"></i>
                </div>
                <span class="font-bold text-slate-800">Equipe</span>
              </div>
              <i data-lucide="chevron-right" class="w-5 h-5 text-slate-300"></i>
            </button>
          </div>
        </section>

        <button (click)="auth.logout()" class="w-full text-rose-500 font-bold p-6 bg-rose-50 rounded-3xl mt-12 hover:bg-rose-100 transition-all">
          Sair do Sistema
        </button>
      </div>
      
      <p class="text-center text-[10px] text-slate-300 mt-12 font-bold tracking-widest uppercase">Versão 2.0.0 • Micro SaaS Pro</p>
    </div>
  `
})
export class SettingsComponent {
  db = inject(DbService);
  auth = inject(AuthService);
  router = inject(Router);

  brandingForm = { 
    name: this.db.business()?.name || '', 
    branding_color: this.db.brandColor(),
    logo_url: this.db.business()?.logo_url || ''
  };

  businessForm = { 
    hours: this.db.business()?.hours || '' 
  };

  async saveBranding() {
    await this.db.saveBusiness({ 
      ...this.brandingForm, 
      ...this.businessForm 
    });
  }
}
