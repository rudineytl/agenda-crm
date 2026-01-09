
import { Injectable, signal, inject } from '@angular/core';
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
  private router = inject(Router);
  private _currentUser = signal<User | null>(null);
  currentUser = this._currentUser.asReadonly();

  constructor() {
    const saved = localStorage.getItem('bs_user');
    if (saved) {
      try {
        this._currentUser.set(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('bs_user');
      }
    }
  }

  login(email: string) {
    // No MVP, simulamos a busca de um usuário. 
    // Em um SaaS real, buscaríamos na tabela 'profiles' do Supabase.
    const mockUser: User = { 
      id: 'u-' + Math.random().toString(36).substr(2, 5), 
      email, 
      name: 'Usuário',
      role: 'admin'
    };
    
    this._currentUser.set(mockUser);
    localStorage.setItem('bs_user', JSON.stringify(mockUser));
    
    // Verificamos se este e-mail já tem uma empresa vinculada
    // Para o MVP, usamos localStorage para simular o vínculo
    const savedBusinessId = localStorage.getItem(`biz_${email}`);
    
    if (savedBusinessId) {
      this.updateBusiness(savedBusinessId);
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/onboarding']);
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
      
      // Vinculamos permanentemente este e-mail a esta empresa no MVP
      localStorage.setItem(`biz_${user.email}`, businessId);
    }
  }
}
