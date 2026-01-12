
import { Component, signal, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      <!-- Lado Esquerdo: Branding & Marketing -->
      <div class="hidden md:flex md:w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <!-- Decorativos de Fundo -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-12">
            <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3">
              <i data-lucide="calendar-check" class="text-white w-7 h-7"></i>
            </div>
            <span class="text-2xl font-black text-white tracking-tighter italic">Agenda - CRM</span>
          </div>

          <h1 class="text-5xl font-black text-white leading-[1.1] mb-6">
            A gestão que seu <span class="text-indigo-400">talento</span> merece.
          </h1>
          <p class="text-slate-400 text-lg max-w-md leading-relaxed">
            Organize sua agenda, controle seu caixa e fidelize seus clientes com a plataforma de CRM mais rápida do mercado.
          </p>
        </div>

        <div class="relative z-10 grid grid-cols-2 gap-8">
          <div class="space-y-2">
            <p class="text-white font-bold text-2xl">+1.2k</p>
            <p class="text-slate-500 text-sm font-medium uppercase tracking-widest">Empresas</p>
          </div>
          <div class="space-y-2">
            <p class="text-white font-bold text-2xl">99.9%</p>
            <p class="text-slate-500 text-sm font-medium uppercase tracking-widest">Uptime</p>
          </div>
        </div>
      </div>

      <!-- Lado Direito: Formulário de Login -->
      <div class="flex-1 flex flex-col items-center justify-center p-8 md:p-16 bg-slate-50/50">
        <div class="w-full max-w-md">
          <!-- Logo Mobile -->
          <div class="md:hidden flex items-center gap-2 mb-10 justify-center">
            <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <i data-lucide="calendar-check" class="text-white w-6 h-6"></i>
            </div>
            <span class="text-xl font-black text-slate-800 tracking-tighter italic">Agenda - CRM</span>
          </div>

          <div class="text-center md:text-left mb-10">
            <h2 class="text-3xl font-black text-slate-900 mb-2">Bem-vindo de volta!</h2>
            <p class="text-slate-500 font-medium">Escolha como deseja acessar sua conta.</p>
          </div>

          <div class="space-y-5">
            @if (!codeSent()) {
              <!-- Login Inicial -->
              <div class="space-y-4">
                <div class="relative group">
                  <label class="absolute left-4 top-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-all group-focus-within:text-indigo-600">E-mail ou Usuário</label>
                  <input 
                    type="text" 
                    [(ngModel)]="identifier" 
                    placeholder="exemplo@agenda.com" 
                    class="w-full pl-4 pr-4 pt-6 pb-3 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-semibold text-slate-700"
                  >
                </div>

                <button (click)="sendCode()" 
                        [disabled]="!identifier"
                        class="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  Entrar no CRM
                  <i data-lucide="arrow-right" class="w-5 h-5"></i>
                </button>

                <div class="relative py-4">
                  <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
                  <div class="relative flex justify-center text-xs uppercase"><span class="bg-slate-50 px-3 text-slate-400 font-bold tracking-widest">ACESSO RÁPIDO</span></div>
                </div>

                <button (click)="quickAccess()" 
                        class="w-full bg-white text-indigo-600 border-2 border-indigo-100 py-5 rounded-2xl font-bold hover:bg-indigo-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  <i data-lucide="play-circle" class="w-6 h-6"></i>
                  Ver Demonstração
                </button>
              </div>
            } @else {
              <!-- Verificação de Código -->
              <div class="space-y-6 animate-in slide-in-from-right duration-300">
                <div class="text-center p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <p class="text-sm text-indigo-600 font-medium">Enviamos um código para</p>
                  <p class="font-bold text-indigo-900">{{ identifier }}</p>
                </div>

                <div class="flex gap-2 justify-center">
                  <input 
                    type="text" 
                    maxlength="4" 
                    [(ngModel)]="code" 
                    placeholder="0000" 
                    class="w-32 text-center text-3xl font-black tracking-[0.5em] py-5 rounded-2xl bg-white border-2 border-slate-200 focus:border-indigo-500 outline-none transition-all text-slate-800 shadow-inner"
                  >
                </div>

                <button (click)="verifyCode()" 
                        [disabled]="code.length < 4"
                        class="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50">
                  Confirmar e Entrar
                </button>

                <button (click)="codeSent.set(false)" class="w-full text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors uppercase tracking-widest">
                  Voltar
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  auth = inject(AuthService);
  identifier = '';
  code = '';
  codeSent = signal(false);

  sendCode() {
    if (!this.identifier) return;
    this.codeSent.set(true);
  }

  verifyCode() {
    if (this.code.length === 4) {
      this.auth.login(this.identifier);
    }
  }

  quickAccess() {
    this.auth.login('demo@agendacrm.com');
  }
}
