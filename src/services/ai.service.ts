
import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

@Injectable({ providedIn: 'root' })
export class AiService {
  // Acesso seguro ao process.env injetado pelo Vercel via globalThis
  private ai = new GoogleGenAI({ 
    apiKey: (globalThis as any).process?.env?.['API_KEY'] || '' 
  });

  async getBusinessInsight(data: { appointmentsCount: number, revenue: number, topService: string }): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analise estes dados de um salão de beleza hoje: ${data.appointmentsCount} atendimentos, R$ ${data.revenue} de faturamento. O serviço mais procurado foi ${data.topService}. Dê uma dica curta e motivadora de 1 frase para o dono do negócio.`,
        config: {
          systemInstruction: "Você é um consultor de negócios especialista em estética e beleza. Seja breve, profissional e motivador."
        }
      });
      // Correção TS2322: Forçando retorno de string mesmo que response.text seja undefined
      return response.text || 'Continue brilhando e oferecendo o melhor serviço aos seus clientes!';
    } catch (error) {
      console.error('Erro na IA:', error);
      return 'Foque na excelência do atendimento para fidelizar seus clientes hoje!';
    }
  }
}
