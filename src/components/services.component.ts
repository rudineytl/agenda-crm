
import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, ServiceItem } from '../services/db.service';
import { Router } from '@angular/router';
import { ServiceModalComponent } from './shared/modals.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule, ServiceModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 md:py-10">
      <header class="flex items-center gap-4 mb-8">
        <button (click)="router.navigate(['/configuracoes'])" class="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100">
           <i data-lucide="arrow-left" class="w-6 h-6"></i>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-slate-800 tracking-tight">Serviços</h1>
          <p class="text-slate-500 font-medium">Cadastre e edite o que você oferece.</p>
        </div>
      </header>

      <button (click)="openModal()" [style.backgroundColor]="db.brandColor() + '15'" [style.color]="db.brandColor()" class="w-full py-5 rounded-2xl font-bold mb-8 flex items-center justify-center gap-2 border shadow-sm">
        <i data-lucide="plus" class="w-5 h-5"></i> Adicionar Novo Serviço
      </button>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (s of db.services(); track s.id) {
          <div (click)="openModal(s)" class="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center group shadow-sm cursor-pointer hover:border-indigo-100">
            <div class="flex-1">
              <p class="font-bold text-slate-800 text-lg leading-tight">{{ s.name }}</p>
              <div class="flex items-center gap-2 mt-1.5">
                <span [style.backgroundColor]="db.brandColor() + '10'" [style.color]="db.brandColor()" class="text-xs px-2.5 py-1 rounded-lg font-bold">R$ {{ s.price }}</span>
                <span class="text-xs text-slate-400 font-medium">• {{ s.duration }} min</span>
              </div>
            </div>
            <button (click)="delete(s); $event.stopPropagation()" class="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-100">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        }
      </div>

      @if (showModal()) {
        <app-service-modal [editingService]="selectedService()" (close)="showModal.set(false)"></app-service-modal>
      }
    </div>
  `
})
export class ServicesComponent {
  db = inject(DbService);
  router = inject(Router);
  showModal = signal(false);
  selectedService = signal<ServiceItem | null>(null);

  openModal(service: ServiceItem | null = null) { this.selectedService.set(service); this.showModal.set(true); }
  async delete(s: ServiceItem) { if (confirm(`Remover "${s.name}"?`)) await this.db.deleteService(s.id); }
}
