import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI;

export interface ArticulationAnalysis {
  transcript: string;
  score: number;
  summary: string;
  strengths: string[];
  suggestions: string[];
}

export async function analyzeArticulation(audioBase64: string, mimeType: string, expectedText?: string | null): Promise<ArticulationAnalysis> {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });
  }

  let systemInstruction = "Berperanlah sebagai pelatih pidato dan artikulasi profesional. Analisis audio percakapan seseorang yang diberikan. Evaluasi artikulasi, kejelasan, kecepatan (pacing), dan pelafalannya. Berikan transkrip dari apa yang mereka katakan. Berikan skor 0 hingga 100 yang mewakili kualitas artikulasi keseluruhan mereka. Ringkas temuan Anda secara singkat. Daftarkan kekuatan yang Anda perhatikan, dan berikan saran yang bisa diterapkan (actionable suggestions) agar mereka dapat meningkatkan artikulasinya.";
  
  if (expectedText) {
    systemInstruction += `\n\nUntuk konteks, pembicara diminta untuk membaca teks berikut: "${expectedText}". Bandingkan ucapan mereka dengan teks ini dan berikan feedback spesifik jika ada kata yang terlewat atau salah dilafalkan.`;
  }

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      transcript: { type: Type.STRING, description: "Transkrip teks dari audio." },
      score: { type: Type.INTEGER, description: "Skor dari 0 hingga 100 untuk kualitas artikulasi." },
      summary: { type: Type.STRING, description: "Ringkasan singkat tentang artikulasi pembicara." },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar kekuatan pembicara." },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Saran spesifik untuk perbaikan artikulasi." }
    },
    required: ["transcript", "score", "summary", "strengths", "suggestions"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: {
      parts: [
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType,
          }
        }
      ]
    },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    }
  });

  try {
    if (!response.text) {
        throw new Error("Respons AI kosong.");
    }
    return JSON.parse(response.text.trim()) as ArticulationAnalysis;
  } catch (e) {
    throw new Error("Gagal mengurai respons AI.");
  }
}
