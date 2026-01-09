
import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth.component';
import { OnboardingComponent } from './components/onboarding.component';
import { DashboardComponent } from './components/dashboard.component';
import { CalendarComponent } from './components/calendar.component';
import { ClientsComponent } from './components/clients.component';
import { CashierComponent } from './components/cashier.component';
import { SettingsComponent } from './components/settings.component';
import { ServicesComponent } from './components/services.component';
import { ProfessionalsComponent } from './components/professionals.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: AuthComponent },
  { path: 'onboarding', component: OnboardingComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'agenda', component: CalendarComponent, canActivate: [authGuard] },
  { path: 'clientes', component: ClientsComponent, canActivate: [authGuard] },
  { path: 'caixa', component: CashierComponent, canActivate: [authGuard] },
  { path: 'configuracoes', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'servicos', component: ServicesComponent, canActivate: [authGuard] },
  { path: 'profissionais', component: ProfessionalsComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
