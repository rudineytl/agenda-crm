
import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export interface User {
  id: string;
  email: string;
  name: string;
  businessId?: string;
  professionalId?: string;
  role: 'admin' | 'staff';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private supabase = inject(SupabaseService);
  private _currentUser = signal<User | null>(null);
  private _isInitialized = signal(false);

  currentUser = this._currentUser.asReadonly();
  isInitialized = this._isInitialized.asReadonly();

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window === 'undefined') {
      this._isInitialized.set(true);
      return;
    }

    // Wait for supabase to be ready (max 5 seconds)
    let retries = 0;
    while (!this.supabase.isReady && retries < 10) {
      await new Promise(r => setTimeout(r, 500));
      retries++;
    }

    if (!this.supabase.isReady) {
      console.error('Supabase failed to initialize after 5 seconds');
      this._isInitialized.set(true); // Proceed anyway to show login/error state
      return;
    }

    // Initialize listener first
    this.supabase.client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.refreshProfile(session.user.id, session.user.email!);
      } else {
        this._currentUser.set(null);
        if (event === 'SIGNED_OUT') this.router.navigate(['/login']);
      }
    });

    let { data: { session } } = await this.supabase.client.auth.getSession();

    // Se houver um token na URL, vamos dar um tempo para o Supabase processar antes de marcar como inicializado sem usuário
    const hasToken = window.location.href.includes('access_token=') ||
      window.location.href.includes('code=') ||
      window.location.href.includes('token_hash=');

    if (!session && hasToken) {
      let retryCount = 0;
      while (retryCount < 10) { // Up to 5s
        await new Promise(r => setTimeout(r, 500));
        const { data: { session: retrySession } } = await this.supabase.client.auth.getSession();
        if (retrySession) { session = retrySession; break; }
        retryCount++;
      }
    }

    if (session?.user) {
      await this.refreshProfile(session.user.id, session.user.email!);
    }

    this._isInitialized.set(true);
  }

  async refreshProfile(id: string, email: string) {
    const { data: profile } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (profile) {
      this._currentUser.set({
        id: profile.id,
        email: profile.email || email,
        name: profile.full_name || email.split('@')[0],
        businessId: profile.business_id,
        professionalId: profile.professional_id,
        role: profile.role
      });
    } else {
      this._currentUser.set({
        id,
        email,
        name: email.split('@')[0],
        role: 'staff'
      });
    }
  }

  async login(email: string) {
    const { error } = await this.supabase.client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    return { error };
  }

  async logout() {
    await this.supabase.client.auth.signOut();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this._currentUser();
  }

  async updateBusiness(businessId: string) {
    const user = this._currentUser();
    if (user) {
      const { error } = await this.supabase.client
        .from('profiles')
        .update({ business_id: businessId, role: 'admin' })
        .eq('id', user.id);

      if (!error) {
        await this.refreshProfile(user.id, user.email);
      }
      return { error };
    }
    return { error: 'No user' };
  }

  async updateProfessional(professionalId: string) {
    const user = this._currentUser();
    if (user) {
      const { error } = await this.supabase.client
        .from('profiles')
        .update({ professional_id: professionalId })
        .eq('id', user.id);

      if (!error) {
        await this.refreshProfile(user.id, user.email);
      }
      return { error };
    }
    return { error: 'No user' };
  }
}
