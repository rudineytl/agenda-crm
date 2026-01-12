
import { Component, inject, computed, effect, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { DbService } from './services/db.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-white">
      
      @if (!auth.isInitialized()) {
        <!-- Splash Screen Profissional -->
        <div class="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-[999] animate-in fade-in duration-500">
          <div class="relative mb-8">
             <div class="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 rotate-12 animate-pulse">
                <i data-lucide="calendar-check" class="text-white w-12 h-12"></i>
             </div>
             <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
             </div>
          </div>
          <h1 class="text-3xl font-black text-white tracking-tighter italic mb-2">Agenda - CRM</h1>
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      } @else {
        @if (auth.isAuthenticated()) {
          <div class="flex flex-col md:flex-row min-h-screen bg-slate-50 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <!-- Sidebar Desktop -->
            <aside class="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
              <div class="p-6">
                <div class="flex items-center gap-3 mb-10">
                  @if (db.business()?.logo_url) {
                    <img [src]="db.business()?.logo_url" class="w-10 h-10 rounded-xl object-cover shadow-sm">
                  } @else {
                    <div [style.backgroundColor]="db.brandColor()" 
                         class="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0 transition-colors duration-500">
                      <i data-lucide="calendar-check" [style.color]="db.brandContrastColor()" class="w-6 h-6"></i>
                    </div>
                  }
                  <span class="font-black text-xl text-slate-800 tracking-tighter italic shrink-0">
                    {{ db.business()?.name || 'Agenda - CRM' }}
                  </span>
                </div>

                <nav class="space-y-1">
                  @for (item of menuItems; track item.link) {
                    <a [routerLink]="item.link" 
                       routerLinkActive="active-nav"
                       [style.--brand-color]="db.brandColor()"
                       class="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all group nav-item">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 group-hover:bg-white transition-colors">
                         <i [attr.data-lucide]="item.icon" class="w-5 h-5"></i>
                      </div>
                      {{ item.label }}
                    </a>
                  }
                </nav>
              </div>
              
              <div class="mt-auto p-6 border-t border-slate-100">
                <div class="mb-4 p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                  <div [style.backgroundColor]="db.brandColor()" 
                       [style.color]="db.brandContrastColor()"
                       class="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm uppercase shadow-sm shrink-0 transition-colors duration-500">
                    {{ auth.currentUser()?.name?.charAt(0) }}
                  </div>
                  <div class="overflow-hidden">
                    <p class="text-sm font-black text-slate-800 truncate">{{ auth.currentUser()?.name }}</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{{ auth.currentUser()?.role }}</p>
                  </div>
                </div>
                <button (click)="auth.logout()" class="flex items-center gap-3 px-4 py-3 w-full text-rose-500 font-bold text-sm hover:bg-rose-50 rounded-xl transition-all active:scale-95">
                  <i data-lucide="log-out" class="w-5 h-5"></i>
                  Encerrar Sessão
                </button>
              </div>
            </aside>

            <!-- Cabeçalho Mobile -->
            <div class="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-100 px-6 py-4 z-50 flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div [style.backgroundColor]="db.brandColor()" class="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0 transition-colors duration-500">
                   <i data-lucide="calendar-check" [style.color]="db.brandContrastColor()" class="w-4 h-4"></i>
                </div>
                <span class="font-black text-slate-800 tracking-tighter italic truncate text-lg">{{ db.business()?.name || 'Agenda - CRM' }}</span>
              </div>
              <button (click)="auth.logout()" class="p-2 text-rose-500"><i data-lucide="log-out" class="w-5 h-5"></i></button>
            </div>

            <!-- Navegação Mobile Bottom -->
            <nav class="fixed bottom-0 w-full bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-50 md:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
              @for (item of menuItems; track item.link) {
                <a [routerLink]="item.link" 
                   routerLinkActive="active-mobile-nav"
                   [style.--brand-color]="db.brandColor()"
                   class="flex flex-col items-center text-slate-400 mobile-nav-item px-2 py-1 rounded-xl">
                  <i [attr.data-lucide]="item.icon" class="w-6 h-6"></i>
                  <span class="text-[9px] mt-1 font-black uppercase tracking-tighter">{{ item.label }}</span>
                </a>
              }
            </nav>

            <!-- Conteúdo Principal App -->
            <main class="flex-1 w-full max-w-6xl mx-auto md:px-8 pt-20 pb-28 md:pb-10 overflow-y-auto no-scrollbar">
              <router-outlet></router-outlet>
            </main>
          </div>
        } @else {
          <!-- Modo Público: Landing / Login -->
          <main class="w-full h-full min-h-screen animate-in fade-in duration-700">
            <router-outlet></router-outlet>
          </main>
        }
      }
    </div>

    <style>
      .active-nav {
        background-color: var(--brand-color) !important;
        color: white !important;
        box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.15);
      }
      .active-nav div {
        background-color: rgba(255,255,255,0.2) !important;
      }
      .active-mobile-nav {
        color: var(--brand-color) !important;
        background-color: var(--brand-color-light, rgba(79, 70, 229, 0.05));
      }
    </style>
  `
})
export class AppComponent {
  auth = inject(AuthService);
  db = inject(DbService);
  router = inject(Router);

  menuItems = [
    { link: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { link: '/agenda', label: 'Agenda', icon: 'calendar' },
    { link: '/clientes', label: 'Clientes', icon: 'users' },
    { link: '/caixa', label: 'Caixa', icon: 'wallet' },
    { link: '/configuracoes', label: 'Ajustes', icon: 'settings' }
  ];

  constructor(private router_inj: Router) {
    effect(() => {
      const user = this.auth.currentUser();
      const initialized = this.auth.isInitialized();
      const currentUrl = window.location.href;
      const hasAuthToken = currentUrl.includes('access_token=') ||
        currentUrl.includes('code=') ||
        currentUrl.includes('token_hash=') ||
        currentUrl.includes('type=recovery');

      if (initialized) {
        if (user) {
          // Se logado e sem empresa, manda pro onboarding (a menos que já esteja lá)
          if (!user.businessId && !currentUrl.includes('onboarding')) {
            this.router.navigate(['/onboarding']);
          }
          // Se logado e com empresa, e tentou ir pro login ou raiz, vai pro dashboard
          else if (user.businessId && (currentUrl.includes('login') || currentUrl.endsWith('/#') || currentUrl.endsWith(window.location.origin + '/'))) {
            this.router.navigate(['/dashboard']);
          }
        } else {
          // Se NÃO está logado, NÃO tem token na URL e NÃO está na página de login, redireciona
          if (!hasAuthToken && !currentUrl.includes('login')) {
            this.router.navigate(['/login']);
          }
        }
      }
    });

    effect(() => {
      const businessName = this.db.business()?.name;
      document.title = businessName ? `${businessName} - Agenda CRM` : 'Agenda - CRM - Gestão Profissional';
    });

    // Refresh icons lucide
    setInterval(() => {
      if ((window as any).lucide) (window as any).lucide.createIcons();
    }, 500);
  }
}
