const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function askGemini(prompt: string, apiKey: string, systemPrompt: string = "") {
  try {
    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      system_instruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    };

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Error en la respuesta de la IA");

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo obtener respuesta.";
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "Error de conexión con el sistema de IA.";
  }
}
