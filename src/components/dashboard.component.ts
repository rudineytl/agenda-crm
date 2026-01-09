
import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { DbService, Appointment, ServiceItem, Client } from '../services/db.service';
import { AiService } from '../services/ai.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  db = inject(DbService);
  ai = inject(AiService);
  
  showModal = signal(false);
  showNewClientModal = signal(false);
  showQuickAddService = signal(false);
  editingAppointmentId = signal<string | null>(null);
  conflictError = signal('');
  stats = this.db.getTodayStats();
  aiInsight = signal<string | null>(null);

  todayFormatted = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  todayAppointments = computed(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.db.appointments()
      .filter(a => a.date === todayStr && a.status !== 'cancelled')
      .sort((a, b) => a.time.localeCompare(b.time));
  });

  newApp = {
    clientId: '',
    serviceId: '',
    professionalId: '',
    time: '09:00',
    status: 'pending' as 'pending' | 'confirmed' | 'completed' | 'cancelled'
  };

  clientForm = { name: '', whatsapp: '' };

  async ngOnInit() {
    const stats = this.stats();
    const services = this.db.services();
    const topService = services.length > 0 ? services[0].name : 'Nenhum';
    
    if (stats.count > 0) {
      try {
        const insight = await this.ai.getBusinessInsight({
          appointmentsCount: stats.count,
          revenue: stats.faturamento,
          topService: topService
        });
        // Garantindo que o valor seja string ou null, evitando undefined
        this.aiInsight.set(insight || 'Aproveite o dia para encantar seus clientes!');
      } catch (e) {
        console.error('Falha ao obter insight da IA', e);
      }
    }
  }

  openMainModal() {
    this.editingAppointmentId.set(null);
    this.conflictError.set('');
    this.newApp = { 
      clientId: '', 
      serviceId: '', 
      professionalId: this.db.professionals()[0]?.id || '', 
      time: this.getCurrentTime(),
      status: 'pending'
    };
    this.showModal.set(true);
  }

  getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:00`;
  }

  openNewClientModal() {
    this.clientForm = { name: '', whatsapp: '' };
    this.showNewClientModal.set(true);
  }

  saveNewClient() {
    if (!this.clientForm.name) return;
    const newId = 'c-' + Math.random().toString(36).substr(2, 5);
    const bid = this.db.business()?.id || '';
    this.db.addClient({ id: newId, name: this.clientForm.name, whatsapp: this.clientForm.whatsapp, businessId: bid });
    this.newApp.clientId = newId;
    this.showNewClientModal.set(false);
  }

  openQuickAddService() {
    // Redireciona para página de serviços por simplicidade no MVP
  }

  saveAppointment() {
    if (!this.newApp.clientId || !this.newApp.serviceId) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const check = this.db.isAvailable(this.newApp.professionalId, todayStr, this.newApp.time, this.newApp.serviceId, this.editingAppointmentId() || undefined);
    
    if (!check.available) {
      this.conflictError.set(check.conflict || 'Horário ocupado');
      return;
    }

    const bid = this.db.business()?.id || '';
    if (this.editingAppointmentId()) {
      const existing = this.db.appointments().find(a => a.id === this.editingAppointmentId());
      if (existing) {
        this.db.updateAppointment({ ...existing, ...this.newApp, date: todayStr });
      }
    } else {
      this.db.addAppointment({
        id: 'a-' + Math.random().toString(36).substr(2, 5),
        ...this.newApp,
        date: todayStr,
        businessId: bid
      });
    }

    this.showModal.set(false);
    this.editingAppointmentId.set(null);
  }

  sendReminderLink() {
    const app = this.db.appointments().find(a => a.id === this.editingAppointmentId());
    if (!app) return;
    const client = this.db.clients().find(c => c.id === app.clientId);
    if (!client) return;
    const service = this.db.services().find(s => s.id === app.serviceId);
    const professional = this.db.getProfessionalName(app.professionalId);
    const business = this.db.business();
    const formattedDate = new Date(app.date).toLocaleDateString('pt-BR');
    const message = `Confirmado: ${business?.name}. ${service?.name} em ${formattedDate} às ${app.time} com ${professional}.`;
    window.open(`https://wa.me/55${client.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  }

  complete(id: string) {
    this.db.updateAppointmentStatus(id, 'completed');
  }

  selectApp(app: Appointment) {
    this.newApp = {
      clientId: app.clientId,
      serviceId: app.serviceId,
      professionalId: app.professionalId,
      time: app.time,
      status: app.status
    };
    this.editingAppointmentId.set(app.id);
    this.conflictError.set('');
    this.showModal.set(true);
  }
}
