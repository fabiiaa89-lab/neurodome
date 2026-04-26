const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
// Try to initialize. If it fails, we will know.
const ai = new GoogleGenAI({ apiKey: 'AIzaSyAfW_ip5uWc0ZmjMen5-VuvbW2RHCS5rhA' });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Translate to English: "Hola mundo"',
    });
    console.log(response.text);
  } catch (e) {
    console.error("API error:", e.message);
  }
}
run();
