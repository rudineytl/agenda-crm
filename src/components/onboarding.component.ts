
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
        <div class="h-1 w-12 rounded-full transition-all duration-500" [class.bg-indigo-600]="step() >= 1" [class.bg-slate-200]="step() < 1"></div>
        <div class="h-1 w-12 rounded-full transition-all duration-500" [class.bg-indigo-600]="step() >= 2" [class.bg-slate-200]="step() < 2"></div>
      </div>

      @if (step() === 1) {
        <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 class="text-3xl font-extrabold text-slate-800 mb-2">Seja bem-vindo!</h2>
          <p class="text-slate-500 mb-10 font-medium">Vamos dar um nome ao seu sonho e configurar seu perfil profissional.</p>
          
          <div class="space-y-6">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome do Estabelecimento</label>
              <input type="text" [(ngModel)]="bName" placeholder="Ex: Salão do Matheus" class="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-semibold">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Seu Nome Profissional</label>
              <input type="text" [(ngModel)]="pName" placeholder="Como seus clientes te chamam?" class="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-semibold">
            </div>
            <button (click)="nextStep()" [disabled]="!bName || !pName" class="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold mt-8 shadow-xl shadow-indigo-100 disabled:opacity-30 active:scale-95 transition-all">
              Continuar
            </button>
          </div>
        </div>
      }

      @if (step() === 2) {
        <div class="animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 class="text-3xl font-extrabold text-slate-800 mb-2">O que você faz?</h2>
          <p class="text-slate-500 mb-10 font-medium">Cadastre seu primeiro serviço para começar a agendar.</p>
          
          <div class="space-y-5">
            <div class="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 mb-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Nome do Serviço</label>
                  <input type="text" [(ngModel)]="sName" placeholder="Ex: Corte Moderno" class="w-full px-4 py-3 rounded-xl bg-white border-none outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-slate-700">
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Preço (R$)</label>
                    <input type="number" [(ngModel)]="sPrice" class="w-full px-4 py-3 rounded-xl bg-white border-none outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-slate-700">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Duração (min)</label>
                    <input type="number" [(ngModel)]="sDur" class="w-full px-4 py-3 rounded-xl bg-white border-none outline-none focus:ring-2 focus:ring-indigo-200 font-bold text-slate-700">
                  </div>
                </div>
              </div>
            </div>

            <button (click)="finish()" [disabled]="loading() || !sName" class="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
              @if (loading()) {
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Criando seu Espaço...
              } @else {
                Concluir e Começar
              }
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class OnboardingComponent {
  db = inject(DbService);
  auth = inject(AuthService);
  private router = inject(Router);
  
  step = signal(1);
  loading = signal(false);

  bName = '';
  pName = '';
  sName = '';
  sDur = 60;
  sPrice = 50;

  nextStep() {
    this.step.set(2);
  }

  async finish() {
    if (!this.sName) return;
    this.loading.set(true);

    try {
      const services = [{ name: this.sName, duration: this.sDur, price: this.sPrice }];
      const businessId = await this.db.createInitialSetup(this.bName, this.pName, services);
      
      // Atualiza o estado global da sessão
      this.auth.updateBusiness(businessId);
      this.auth.updateProfile(this.pName, 'admin');

      // Força o carregamento dos novos dados no DbService
      await this.db.loadAllData(businessId);
      
      this.router.navigate(['/dashboard']);
    } catch (e) {
      console.error(e);
      alert("Erro ao configurar sistema. Verifique a conexão.");
    } finally {
      this.loading.set(false);
    }
  }
}
