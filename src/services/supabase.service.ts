
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  public client!: SupabaseClient;
  public isReady = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const url = environment.supabaseUrl;
      const key = environment.supabaseAnonKey;

      if (url && key && url.startsWith('http')) {
        this.client = createClient(url, key);
        this.isReady = true;
        console.log('Supabase initialized successfully');
      } else {
        console.warn('Supabase credentials not configured, using placeholder');
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
