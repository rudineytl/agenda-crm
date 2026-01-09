
import { Component, signal, inject } from '@angular/core';
import { DbService } from '../services/db.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-onboarding',
  imports: [FormsModule],
  template: `
    <div class="p-6">
      <div class="flex items-center gap-2 mb-8">
        <div class="w-2 h-2 rounded-full" [class.bg-indigo-600]="step() >= 1" [class.bg-slate-200]="step() < 1"></div>
        <div class="w-2 h-2 rounded-full" [class.bg-indigo-600]="step() >= 2" [class.bg-slate-200]="step() < 2"></div>
      </div>

      @if (step() === 1) {
        <div>
          <h2 class="text-2xl font-bold text-slate-800 mb-2">Bem-vindo(a)!</h2>
          <p class="text-slate-500 mb-8">Vamos configurar seu estabelecimento em segundos.</p>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nome do Local</label>
              <input type="text" [(ngModel)]="bName" placeholder="Ex: Studio da Ana" class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Seu Nome Profissional</label>
              <input type="text" [(ngModel)]="pName" placeholder="Seu nome" class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
            </div>
            <button (click)="nextStep()" [disabled]="!bName || !pName" class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold mt-8 disabled:opacity-50">
              Próximo
            </button>
          </div>
        </div>
      }

      @if (step() === 2) {
        <div>
          <h2 class="text-2xl font-bold text-slate-800 mb-2">Seus Serviços</h2>
          <p class="text-slate-500 mb-8">O que você oferece aos seus clientes?</p>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nome do Serviço</label>
              <input type="text" [(ngModel)]="sName" placeholder="Ex: Corte de Cabelo" class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Duração (min)</label>
                <input type="number" [(ngModel)]="sDur" class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
                <input type="number" [(ngModel)]="sPrice" class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none">
              </div>
            </div>
            <button (click)="addService()" class="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium border border-slate-200">
              + Adicionar outro
            </button>

            @if (addedServices().length > 0) {
              <div class="mt-4 p-4 bg-slate-50 rounded-xl space-y-2">
                @for (s of addedServices(); track s.id) {
                  <div class="flex justify-between items-center text-sm">
                    <span class="font-medium">{{ s.name }}</span>
                    <span class="text-slate-500">R$ {{ s.price }}</span>
                  </div>
                }
              </div>
            }

            <button (click)="finish()" [disabled]="addedServices().length === 0 && !sName" class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold mt-8">
              Concluir Configuração
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
  // Explicitly typing the router member to resolve the 'unknown' type error
  private router: Router = inject(Router);
  step = signal(1);

  bName = '';
  pName = '';
  sName = '';
  sDur = 60;
  sPrice = 50;
  addedServices = signal<any[]>([]);

  nextStep() {
    this.step.set(2);
  }

  addService() {
    if (!this.sName) return;
    this.addedServices.update(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      name: this.sName,
      duration: this.sDur,
      price: this.sPrice
    }]);
    this.sName = '';
    this.sDur = 60;
    this.sPrice = 50;
  }

  finish() {
    if (this.sName) this.addService();
    
    const businessId = 'b-' + Math.random().toString(36).substr(2, 5);
    const userId = this.auth.currentUser()?.id || 'u-1';
    
    // 1. Cria a Empresa
    this.db.saveBusiness({ id: businessId, name: this.bName, hours: '08:00 - 18:00' });
    
    // 2. Atualiza o Usuário Atual para ser Admin desta empresa
    this.auth.updateBusiness(businessId);
    this.auth.updateProfile(this.pName, 'admin');

    // 3. Cria o Profissional vinculado ao Admin
    this.db.addProfessional({ 
      id: userId, 
      name: this.pName, 
      businessId,
      userId: userId
    });

    // 4. Salva Serviços
    this.addedServices().forEach(s => {
      this.db.addService({ ...s, businessId });
    });
    
    this.router.navigate(['/dashboard']);
  }
}
