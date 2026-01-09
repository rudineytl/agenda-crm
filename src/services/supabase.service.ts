
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private getEnv(key: string): string {
    return (globalThis as any).process?.env?.[key] || '';
  }

  public client: SupabaseClient;

  constructor() {
    const url = this.getEnv('SUPABASE_URL');
    const key = this.getEnv('SUPABASE_KEY');

    if (!url || url === '') {
      console.error('CRITICAL: SUPABASE_URL is missing. Please check your environment variables.');
    }

    this.client = createClient(
      url || 'https://placeholder.supabase.co',
      key || 'placeholder-key'
    );
  }
}
