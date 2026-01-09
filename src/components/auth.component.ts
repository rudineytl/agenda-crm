
import { Component, signal, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  imports: [FormsModule],
  template: `
    <div class="p-8 flex flex-col h-full justify-center">
      <div class="text-center mb-10">
        <div class="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg shadow-indigo-200">
          <i data-lucide="sparkles" class="text-white w-10 h-10"></i>
        </div>
        <h1 class="text-3xl font-bold text-slate-800">BelezaSimples</h1>
        <p class="text-slate-500 mt-2">Gestão fácil para quem brilha</p>
      </div>

      <div class="space-y-4">
        @if (!codeSent()) {
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">E-mail ou WhatsApp</label>
            <input type="text" [(ngModel)]="identifier" placeholder="ex: (11) 99999-9999" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
          </div>
          <button (click)="sendCode()" class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all">
            Entrar sem senha
          </button>
        } @else {
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Digite o código enviado</label>
            <div class="flex gap-2">
              <input type="text" maxlength="4" [(ngModel)]="code" placeholder="0000" class="w-full text-center text-2xl tracking-widest px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
            </div>
          </div>
          <button (click)="verifyCode()" class="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-100 active:scale-95 transition-all">
            Confirmar Código
          </button>
          <button (click)="codeSent.set(false)" class="w-full text-slate-400 text-sm font-medium py-2">
            Voltar
          </button>
        }
      </div>

      <p class="mt-12 text-center text-xs text-slate-400">
        Ao entrar, você concorda com nossos termos de uso.
      </p>
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
}
