
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
      const url = 
        process.env['NEXT_PUBLIC_SUPABASE_URL'] || 
        process.env['SUPABASE_URL'] || 
        '';

      const key = 
        process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 
        process.env['SUPABASE_KEY'] || 
        '';

      if (url && key && url.startsWith('http')) {
        this.client = createClient(url, key);
        this.isReady = true;
      } else {
        this.createPlaceholderClient();
      }
    } catch (error) {
      console.error('Supabase Init Failed:', error);
      this.createPlaceholderClient();
    }
  }

  private createPlaceholderClient() {
    this.client = createClient(
      'https://placeholder-project.supabase.co',
      'placeholder-key'
    );
    this.isReady = false;
  }
}
