
import { GoogleGenAI } from "@google/genai";

// Standard initialization using the API_KEY environment variable as per guidelines.
// Note: In Vite, use import.meta.env.VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getFleetInsights = async (osData: any[]) => {
  try {
    // Request fleet analysis and recommendations based on current service orders data.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise o status atual da frota baseado nestas ordens de serviço: ${JSON.stringify(osData)}. Forneça um resumo curto e recomendações de manutenção preventiva.`,
      config: {
        systemInstruction: "Você é um especialista em gestão de frotas logísticas. Forneça insights práticos e concisos em português."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Não foi possível gerar insights no momento.";
  }
};

export const generatePreventiveEmailBody = async (vehicle: any, diffKm: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escreva um e-mail formal e urgente para o responsável pelo veículo ${vehicle.plate} (${vehicle.model}). 
      O veículo atingiu ${vehicle.km}km e já rodou ${diffKm}km desde a última preventiva. 
      O limite de 10.000km foi excedido. Inclua os riscos de segurança e produtividade caso a manutenção não seja agendada imediatamente.`,
      config: {
        systemInstruction: "Você é um sistema automatizado de gestão de frotas. O tom deve ser profissional, direto e alertar para riscos técnicos."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Email Error:", error);
    return `Alerta de Manutenção Preventiva: O veículo ${vehicle.plate} excedeu o limite de quilometragem (${diffKm}km rodados). Favor agendar revisão.`;
  }
};
