
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  public client!: SupabaseClient;
  public isReady = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Tenta encontrar a URL em diferentes padrões de nomes do Vercel/Supabase
      const url = 
        process.env['NEXT_PUBLIC_SUPABASE_URL'] || 
        process.env['AGENDA_CRM_SUPABASE_URL'] || 
        process.env['SUPABASE_URL'] || 
        '';

      // Tenta encontrar a Key (Anon Key ou Publishable Key)
      const key = 
        process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 
        process.env['NEXT_PUBLIC_AGENDA_CRM_SUPABASE_ANON_KEY'] || 
        process.env['AGENDA_CRM_SUPABASE_PUBLISHABLE_KEY'] || 
        process.env['SUPABASE_KEY'] || 
        '';

      if (url && key && url.startsWith('http')) {
        this.client = createClient(url, key);
        this.isReady = true;
      } else {
        this.createPlaceholderClient();
      }
    } catch (error) {
      console.error('Supabase Init Error - Falling back to Mock Mode:', error);
      this.createPlaceholderClient();
    }
  }

  private createPlaceholderClient() {
    // Cria um cliente fake para evitar que chamadas de métodos quebrem a aplicação
    this.client = createClient(
      'https://placeholder-project.supabase.co',
      'placeholder-key'
    );
    this.isReady = false;
  }
}
