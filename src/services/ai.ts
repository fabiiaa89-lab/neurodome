interface AIRequest {
  prompt: string;
}

export class GeminiService {
  private static MAX_RETRIES = 2;
  private static TIMEOUT_MS = 15000;
  private static API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  private static API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  static async generateContent({ prompt }: AIRequest, currentAttempt = 1): Promise<string> {
    if (!this.API_KEY) throw new Error('API Key no configurada en variables de entorno.');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error('Respuesta malformada de la API');

      return text;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (currentAttempt < this.MAX_RETRIES) {
        return this.generateContent({ prompt }, currentAttempt + 1);
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout en conexión con IA.');
      }

      throw new Error(error instanceof Error ? error.message : 'Fallo en GeminiService');
    }
  }
}
