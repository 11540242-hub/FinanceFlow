import { GoogleGenAI } from "@google/genai";
import { StockHolding } from "../types";

// Helper to safely get environment variables
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key] || import.meta.env[`VITE_${key}`];
  }
  return '';
};

// Safely initialize API
const getAiClient = () => {
  // Use process.env.API_KEY directly as per guidelines and to ensure it works with Vite's define
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const fetchStockPrice = async (symbol: string, stockName: string): Promise<number | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    // Use Google Search grounding to find the real-time price
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the current real-time stock price for ${stockName} (${symbol}). 
      If it is a Taiwan stock, look for TWSE data. 
      If it is a US stock, look for US market data.
      Return ONLY the numeric price value. Do not include currency symbols or text.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text?.trim();
    if (!text) return null;

    // Extract number from string (remove commas, currency signs)
    const cleanText = text.replace(/[^0-9.]/g, '');
    const price = parseFloat(cleanText);

    return isNaN(price) ? null : price;
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
};

export const generateFinancialAdvice = async (
  totalAssets: number,
  monthlyIncome: number,
  monthlyExpense: number,
  topExpenseCategory: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "無法連接 AI 服務以生成建議 (API Key 未設定)。";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        作為一位專業的理財顧問，請根據以下數據提供一段簡短的繁體中文財務建議 (100字以內):
        總資產: ${totalAssets}
        本月收入: ${monthlyIncome}
        本月支出: ${monthlyExpense}
        最大支出類別: ${topExpenseCategory}
        
        請給出具體且鼓勵性的建議。
      `,
    });
    return response.text || "目前無法生成建議。";
  } catch (error) {
    console.error("Advice generation error", error);
    return "系統繁忙，稍後再試。";
  }
};