
import { Component, signal, inject } from '@angular/core';
import { DbService } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-onboarding',
  imports: [FormsModule],
  template: `
    <div class="p-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center">
      <div class="flex items-center gap-2 mb-12 justify-center">
        <div class="h-1.5 w-16 rounded-full bg-indigo-600"></div>
        <div class="h-1.5 w-16 rounded-full bg-slate-200"></div>
      </div>

      <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
        <h2 class="text-4xl font-black text-slate-900 mb-3 tracking-tighter italic">Seja bem-vindo!</h2>
        <p class="text-slate-500 mb-10 font-medium">Vamos configurar seu espaço de trabalho em segundos.</p>
        
        <div class="space-y-6 text-left">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome da sua Empresa / Salão</label>
            <input type="text" [(ngModel)]="bName" placeholder="Ex: Studio VIP" class="w-full px-5 py-5 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-bold text-lg">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Seu Nome Profissional</label>
            <input type="text" [(ngModel)]="pName" placeholder="Como quer ser chamado?" class="w-full px-5 py-5 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-bold text-lg">
          </div>
          
          <button (click)="finish()" [disabled]="loading() || !bName || !pName" class="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold mt-8 shadow-2xl shadow-slate-200 disabled:opacity-30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            @if (loading()) {
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Configurando...
            } @else {
              Começar Agora
              <i data-lucide="arrow-right" class="w-5 h-5"></i>
            }
          </button>
        </div>
      </div>
      
      <p class="text-center text-[10px] text-slate-300 mt-12 font-bold tracking-widest uppercase">O agendamento nunca foi tão simples.</p>
    </div>
  `
})
export class OnboardingComponent {
  db = inject(DbService);
  auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  bName = '';
  pName = '';

  async finish() {
    if (!this.bName || !this.pName) return;
    this.loading.set(true);

    try {
      // 1. Create business and professional
      const businessId = await this.db.createInitialSetup(this.bName, this.pName, []);

      // 2. Link profile to business (sets as admin)
      await this.auth.updateBusiness(businessId);

      // 3. Load data to get the professional ID that was created
      await this.db.loadAllData(businessId);
      const professional = this.db.professionals().find(p => p.name === this.pName);

      if (professional) {
        // 4. Link profile to professional
        await this.auth.updateProfessional(professional.id);
      }

      this.router.navigate(['/dashboard']);
    } catch (e) {
      console.error(e);
      alert("Erro ao configurar sistema.");
    } finally {
      this.loading.set(false);
    }
  }
}
