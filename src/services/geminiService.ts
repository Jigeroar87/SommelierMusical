import { GoogleGenAI, Type } from "@google/genai";
import { QuadrantType, SEED_SONGS } from "../data/songs";
import { EditorialReading, FALLBACK_READINGS } from "../data/fallbacks";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface GenerationInput {
  display_name: string;
  dominant_quadrant: QuadrantType;
  score_summary: Record<string, number>;
  answers: Array<{
    song_id: string;
    score: number;
    cuadrante_principal: string;
  }>;
}

export const geminiService = {
  async searchMusic(query: string): Promise<Array<{ title: string; artist: string; video_id: string; thumbnail_url: string; url: string }>> {
    try {
      const systemInstruction = `
        Eres un asistente de curaduría para "Sommelier Musical". 
        Tu tarea es encontrar videos de YouTube específicos basados en una búsqueda de música (Canción y Artista).
        
        Debes devolver un JSON con una lista de los 3 mejores resultados que encuentres.
        Cada resultado DEBE tener:
        - title: Nombre de la canción.
        - artist: Nombre del artista.
        - video_id: El ID de 11 caracteres de YouTube.
        - thumbnail_url: La URL de la miniatura hqdefault.jpg (https://img.youtube.com/vi/ID/hqdefault.jpg).
        - url: La URL completa de YouTube.
        
        FORMATO JSON:
        [
          { "title": "", "artist": "", "video_id": "", "thumbnail_url": "", "url": "" }
        ]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Busca en YouTube esta pieza: ${query}`,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                video_id: { type: Type.STRING },
                thumbnail_url: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["title", "artist", "video_id", "thumbnail_url", "url"]
            }
          }
        }
      });

      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("Gemini Search Error:", error);
      return [];
    }
  },

  async generateEditorialReading(input: GenerationInput): Promise<{ reading: EditorialReading; source: 'gemini' | 'fallback' }> {
    try {
      // 1. Preparar contexto de canciones (Top songs by score)
      const topAnswers = [...input.answers]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      
      const songDetails = topAnswers.map(ans => {
        const song = SEED_SONGS.find(s => s.id === ans.song_id);
        return song ? `${song.title} de ${song.artist} (Puntaje: ${ans.score})` : null;
      }).filter(Boolean).join(", ");

      const systemInstruction = `
        Eres el "Sommelier Musical", una inteligencia de lujo editorial con un tono íntimo, inteligente, poético y sofisticado. 
        Tu misión es interpretar el "pulso emocional" y la "biografía sonora" de un usuario basada en su cata de canciones.
        
        REGLAS DE ESTILO:
        - Voz editorial premium (estilo New Yorker o marcas de lujo contemporáneas).
        - Emocional pero contenido; no seas un terapeuta barato.
        - Inteligente y con verdad; evita horóscopos vacíos.
        - No inventes hechos biográficos del usuario.
        - No diagnostiques salud mental.
        - No menciones nombres técnicos de la API.
        
        CONTEXTO DE CUADRANTES:
        - Te Abraza: Validación emocional, nostalgia, refugio, amor, herida sanada.
        - Te Prende: Energía, cuerpo, deseo, calle, catarsis, urgencia.
        - Te Eleva: Himnos, expansión, ascenso, luz, optimismo colectivo.
        - Te Revela: Profundidad, identidad, legado, trascendencia, épica.
        
        FORMATO DE SALIDA (JSON ESTRICTO):
        {
          "short_diagnosis": "Una frase corta, críptica y poderosa que resuma su estado actual.",
          "long_reading": "Un párrafo poético y elegante (4-6 líneas) que interprete sus elecciones musicales.",
          "cta_final": "Una frase corta de acción que invite a certificar el hallazgo."
        }
      `;

      const prompt = `
        Interpreta la cata de ${input.display_name}.
        Cuadrante Dominante: ${input.dominant_quadrant}.
        Resumen de Puntajes: ${JSON.stringify(input.score_summary)}.
        Canciones con mayor resonancia: ${songDetails}.
        
        Escribe un manuscrito único que interprete por qué estas canciones y este cuadrante definen su frecuencia hoy.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              short_diagnosis: { type: Type.STRING },
              long_reading: { type: Type.STRING },
              cta_final: { type: Type.STRING }
            },
            required: ["short_diagnosis", "long_reading", "cta_final"]
          }
        }
      });

      const result = JSON.parse(response.text.trim());
      
      return {
        reading: result as EditorialReading,
        source: 'gemini'
      };

    } catch (error) {
      console.error("Gemini Generation Error, using fallback:", error);
      return {
        reading: FALLBACK_READINGS[input.dominant_quadrant] || FALLBACK_READINGS.revela,
        source: 'fallback'
      };
    }
  }
};
