
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  public client: SupabaseClient;

  constructor() {
    // Acesso direto via process.env conforme padrões do ambiente
    const url = process.env['SUPABASE_URL'] || '';
    const key = process.env['SUPABASE_KEY'] || '';

    if (!url || !key) {
      console.warn('AVISO: Variáveis de ambiente SUPABASE_URL ou SUPABASE_KEY não encontradas.');
    }

    // Inicialização com fallback para evitar crash imediato
    this.client = createClient(
      url || 'https://placeholder-url.supabase.co',
      key || 'placeholder-key'
    );
  }
}
