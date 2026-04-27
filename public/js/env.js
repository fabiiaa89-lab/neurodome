// Safe environment variables loader
try {
  window.GEMINI_API_KEY_ENV = ''; 
} catch(e) {
  console.warn('Env loader info:', e);
}
