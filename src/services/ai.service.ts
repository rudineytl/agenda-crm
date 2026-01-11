
import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiService {
  private getApiKey(): string {
    return environment.geminiApiKey;
  }

  async getBusinessInsight(data: { appointmentsCount: number, revenue: number, topService: string }): Promise<string> {
    const key = this.getApiKey();
    if (!key) return 'Foque na excelência do atendimento hoje!';

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analise estes dados de um negócio de beleza hoje: ${data.appointmentsCount} atendimentos, R$ ${data.revenue} de faturamento. O serviço mais procurado foi ${data.topService}. Dê uma dica curta e motivadora de 1 frase para o dono do negócio.`,
        config: {
          systemInstruction: "Você é um consultor de negócios especialista em estética e beleza. Seja breve, profissional e motivador."
        }
      });

      return response.text || 'Continue brilhando e oferecendo o melhor serviço!';
    } catch (error) {
      console.error('IA Error:', error);
      return 'Foque na excelência do atendimento para fidelizar seus clientes!';
    }
  }
}
