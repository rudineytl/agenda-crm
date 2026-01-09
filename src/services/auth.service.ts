
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
  businessId?: string;
  role: 'admin' | 'staff';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<User | null>(null);
  currentUser = this._currentUser.asReadonly();

  constructor(private router: Router) {
    const saved = localStorage.getItem('bs_user');
    if (saved) {
      this._currentUser.set(JSON.parse(saved));
    }
  }

  login(email: string) {
    // Simulando que se for o primeiro login de um email específico, ele pode ser admin
    // Em um sistema real, isso viria do banco de dados (Supabase)
    const mockUser: User = { 
      id: 'u-' + Math.random().toString(36).substr(2, 5), 
      email, 
      name: 'Usuário',
      role: 'admin' // No MVP, o primeiro acesso via Onboarding define o admin
    };
    
    this._currentUser.set(mockUser);
    localStorage.setItem('bs_user', JSON.stringify(mockUser));
    
    const business = localStorage.getItem('bs_business');
    if (!business) {
      this.router.navigate(['/onboarding']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  updateProfile(name: string, role?: 'admin' | 'staff') {
    const user = this._currentUser();
    if (user) {
      const updated = { ...user, name, role: role || user.role };
      this._currentUser.set(updated);
      localStorage.setItem('bs_user', JSON.stringify(updated));
    }
  }

  logout() {
    this._currentUser.set(null);
    localStorage.removeItem('bs_user');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this._currentUser();
  }

  updateBusiness(businessId: string) {
    const user = this._currentUser();
    if (user) {
      const updated = { ...user, businessId };
      this._currentUser.set(updated);
      localStorage.setItem('bs_user', JSON.stringify(updated));
    }
  }
}
