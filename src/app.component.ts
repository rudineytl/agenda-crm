
import { Component, inject, computed, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { DbService } from './services/db.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      @if (auth.isAuthenticated()) {
        <!-- Sidebar Desktop (White Label) -->
        <aside class="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-8">
              @if (db.business()?.logo_url) {
                <img [src]="db.business()?.logo_url" class="w-10 h-10 rounded-xl object-cover shadow-sm">
              } @else {
                <div [style.backgroundColor]="db.brandColor()" 
                     class="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <i data-lucide="sparkles" [style.color]="db.brandContrastColor()" class="w-6 h-6"></i>
                </div>
              }
              <span class="font-bold text-lg text-slate-800 tracking-tight truncate">
                {{ db.business()?.name || 'White Label' }}
              </span>
            </div>

            <nav class="space-y-1">
              @for (item of menuItems; track item.link) {
                <a [routerLink]="item.link" 
                   routerLinkActive="active-nav"
                   [style.--brand-color]="db.brandColor()"
                   class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 font-medium hover:bg-slate-50 transition-all nav-item">
                  <i [data-lucide]="item.icon" class="w-5 h-5"></i>
                  {{ item.label }}
                </a>
              }
            </nav>
          </div>
          
          <div class="mt-auto p-6 border-t border-slate-100">
            <div class="mb-4 px-4 py-3 bg-slate-50 rounded-2xl flex items-center gap-3">
              <div [style.backgroundColor]="db.brandColor()" 
                   [style.color]="db.brandContrastColor()"
                   class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                {{ auth.currentUser()?.name?.charAt(0) }}
              </div>
              <div class="overflow-hidden">
                <p class="text-xs font-bold text-slate-700 truncate">{{ auth.currentUser()?.name }}</p>
                <p class="text-[10px] text-slate-400 font-medium truncate uppercase tracking-tighter">{{ auth.currentUser()?.role }}</p>
              </div>
            </div>
            <button (click)="auth.logout()" class="flex items-center gap-3 px-4 py-2 w-full text-rose-500 font-bold text-sm hover:bg-rose-50 rounded-xl transition-colors">
              <i data-lucide="log-out" class="w-5 h-5"></i>
              Sair do Sistema
            </button>
          </div>
        </aside>

        <!-- Cabeçalho Mobile -->
        <div class="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-100 px-6 py-4 z-50 flex items-center gap-3">
          <div [style.backgroundColor]="db.brandColor()" 
               class="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0">
             <i data-lucide="sparkles" [style.color]="db.brandContrastColor()" class="w-4 h-4"></i>
          </div>
          <span class="font-bold text-slate-800 tracking-tight truncate">{{ db.business()?.name || 'Sistema' }}</span>
        </div>

        <!-- Navegação Mobile Bottom -->
        <nav class="fixed bottom-0 w-full bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-50 md:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
          @for (item of menuItems; track item.link) {
            <a [routerLink]="item.link" 
               routerLinkActive="active-mobile-nav"
               [style.--brand-color]="db.brandColor()"
               class="flex flex-col items-center text-slate-400 mobile-nav-item">
              <i [data-lucide]="item.icon" class="w-6 h-6"></i>
              <span class="text-[10px] mt-1 font-bold">{{ item.label }}</span>
            </a>
          }
        </nav>
      }

      <main class="flex-1 w-full max-w-6xl mx-auto md:px-8 pb-24 md:pb-8 overflow-y-auto no-scrollbar"
            [class.pt-20]="auth.isAuthenticated()">
        <router-outlet></router-outlet>
      </main>
    </div>

    <style>
      .active-nav {
        background-color: var(--brand-color) !important;
        color: white !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
      .active-mobile-nav {
        color: var(--brand-color) !important;
      }
      .nav-item:hover {
        color: var(--brand-color);
      }
    </style>
  `
})
export class AppComponent {
  auth = inject(AuthService);
  db = inject(DbService);

  menuItems = [
    { link: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { link: '/agenda', label: 'Agenda', icon: 'calendar' },
    { link: '/clientes', label: 'Clientes', icon: 'users' },
    { link: '/caixa', label: 'Caixa', icon: 'wallet' },
    { link: '/configuracoes', label: 'Ajustes', icon: 'settings' }
  ];

  constructor() {
    effect(() => {
      const businessName = this.db.business()?.name;
      document.title = businessName ? `${businessName} - Gestão` : 'BelezaSimples - Gestão Profissional';
    });

    setInterval(() => {
      if ((window as any).lucide) (window as any).lucide.createIcons();
    }, 500);
  }
}
