
import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

@Injectable({ providedIn: 'root' })
export class AiService {
  // A API KEY é injetada via variável de ambiente no processo de build/execução
  private ai = new GoogleGenAI({ apiKey: (process as any).env.API_KEY });

  async getBusinessInsight(data: { appointmentsCount: number, revenue: number, topService: string }) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analise estes dados de um salão de beleza hoje: ${data.appointmentsCount} atendimentos, R$ ${data.revenue} de faturamento. O serviço mais procurado foi ${data.topService}. Dê uma dica curta e motivadora de 1 frase para o dono do negócio.`,
        config: {
          systemInstruction: "Você é um consultor de negócios especialista em estética e beleza. Seja breve, profissional e motivador."
        }
      });
      return response.text;
    } catch (error) {
      console.error('Erro na IA:', error);
      return 'Continue brilhando e oferecendo o melhor serviço aos seus clientes!';
    }
  }
}
