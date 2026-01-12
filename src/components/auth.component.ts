
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
            <h2 class="text-3xl font-black text-slate-900 mb-2">Bem-vindo!</h2>
            <p class="text-slate-500 font-medium">Acesse sua conta ou crie uma nova em segundos.</p>
          </div>

          <div class="space-y-5">
            @if (!emailSent()) {
              <!-- Login Inicial -->
              <div class="space-y-4">
                <div class="relative group">
                  <label class="absolute left-4 top-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest transition-all group-focus-within:text-indigo-600">Seu E-mail</label>
                  <input 
                    type="email" 
                    [(ngModel)]="email" 
                    placeholder="voce@exemplo.com" 
                    class="w-full pl-4 pr-4 pt-6 pb-3 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-semibold text-slate-700"
                  >
                </div>

                <button (click)="sendMagicLink()" 
                        [disabled]="!email || loading()"
                        class="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {{ loading() ? 'Enviando link...' : 'Entrar com Link Mágico' }}
                  <i data-lucide="mail" class="w-5 h-5"></i>
                </button>

                <p class="text-center text-xs text-slate-400 font-medium px-8">
                  Nenhum código para decorar. Enviamos um link seguro direto para sua caixa de entrada.
                </p>
              </div>
            } @else {
              <!-- Link Enviado -->
              <div class="space-y-6 animate-in slide-in-from-right duration-300">
                <div class="text-center p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
                  <div class="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 mx-auto mb-6 rotate-3">
                    <i data-lucide="check-circle" class="w-8 h-8"></i>
                  </div>
                  <h3 class="text-2xl font-black text-indigo-900 mb-2">Verifique seu e-mail</h3>
                  <p class="text-indigo-600 font-medium leading-relaxed">
                    Enviamos um link de acesso para <br>
                    <span class="font-bold text-indigo-900">{{ email }}</span>.
                  </p>
                </div>

                <button (click)="emailSent.set(false)" class="w-full text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors uppercase tracking-widest">
                  Tentar outro e-mail
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
  email = '';
  loading = signal(false);
  emailSent = signal(false);

  async sendMagicLink() {
    if (!this.email) return;
    this.loading.set(true);
    try {
      const { error } = await this.auth.login(this.email);
      if (!error) {
        this.emailSent.set(true);
      } else {
        alert('Erro ao enviar e-mail: ' + error.message);
      }
    } finally {
      this.loading.set(false);
    }
  }
}
