// Lokalne środowisko development
// Backend powinien działać na porcie 3000 (lub 10000 jeśli używasz Render lokalnie)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // Alternatywnie, jeśli backend działa na porcie 10000:
  // apiUrl: 'http://localhost:10000/api'
  recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Test key - ZMIEŃ w produkcji!
  googleMapsApiKey: 'AIzaSyD6Oi7SFG2Y4ovR7TQ4hKeSJIrW-M-FCj4'
};
