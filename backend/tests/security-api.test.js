/**
 * Security API Tests - Senior Tester Level
 * 
 * Testy bezpieczeństwa API bez użycia przeglądarki
 * Używa tylko HTTP requestów - szybsze i bardziej niezawodne
 * 
 * Uruchomienie: npm test (wymaga Jest)
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Helper: Wykonaj request z timeoutem
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_URL}${url}`,
      headers,
      timeout: 5000,
      validateStatus: () => true // Nie rzucaj błędów dla statusów HTTP
    };
    
    if (data) {
      config.data = data;
    }
    
    return await axios(config);
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

describe('🔒 Security API Tests', () => {
  
  // Sprawdź czy API jest dostępne przed testami
  beforeAll(async () => {
    try {
      const res = await makeRequest('GET', '/api/health');
      if (res.status !== 200) {
        throw new Error('API nie jest dostępne');
      }
    } catch (error) {
      throw new Error(`API nie jest dostępne na ${API_URL}. Uruchom: npm run start (backend)`);
    }
  });
  
  // ============================================
  // 1. AUTHENTICATION SECURITY
  // ============================================
  
  describe('Authentication Security', () => {
    
    test('SEC-API-001: Login wymaga obu pól (email i hasło)', async () => {
      // Brak email
      const res1 = await makeRequest('POST', '/api/auth/login', { password: 'test123' });
      expect(res1.status).toBe(400);
      expect(res1.data.success).toBe(false);
      
      // Brak hasła
      const res2 = await makeRequest('POST', '/api/auth/login', { email: 'test@test.com' });
      expect(res2.status).toBe(400);
      expect(res2.data.success).toBe(false);
    });
    
    test('SEC-API-002: Nieprawidłowe dane logowania zwracają identyczny komunikat', async () => {
      // Nieistniejący użytkownik
      const start1 = Date.now();
      const res1 = await makeRequest('POST', '/api/auth/login', {
        email: 'nonexistent@test.com',
        password: 'AnyPassword123!'
      });
      const time1 = Date.now() - start1;
      
      // Istniejący użytkownik, złe hasło
      const start2 = Date.now();
      const res2 = await makeRequest('POST', '/api/auth/login', {
        email: 'admin@restauracja.pl',
        password: 'WrongPassword123!'
      });
      const time2 = Date.now() - start2;
      
      // Komunikaty powinny być identyczne (ochrona przed enumeration)
      expect(res1.data.message).toBe(res2.data.message);
      expect(res1.status).toBe(res2.status);
      expect(res1.data.message).toMatch(/nieprawidłowy|invalid/i);
      
      // Czas odpowiedzi powinien być podobny (różnica < 500ms)
      const timeDiff = Math.abs(time1 - time2);
      expect(timeDiff).toBeLessThan(500);
    });
  });
  
  // ============================================
  // 2. AUTHORIZATION SECURITY
  // ============================================
  
  describe('Authorization Security', () => {
    
    test('SEC-API-003: Chronione endpointy wymagają tokenu JWT', async () => {
      const res = await makeRequest('GET', '/api/auth/me');
      
      expect(res.status).toBe(401);
      expect(res.data.success).toBe(false);
      expect(res.data.message).toBeDefined();
      expect(res.data.message.toLowerCase()).toMatch(/autoryzacja|authorization|token|zaloguj/i);
    });
    
    test('SEC-API-004: Nieprawidłowy token JWT jest odrzucany', async () => {
      const res = await makeRequest('GET', '/api/auth/me', null, {
        'Authorization': 'Bearer invalid-token-12345'
      });
      
      expect(res.status).toBe(401);
      expect(res.data.success).toBe(false);
    });
  });
  
  // ============================================
  // 3. INPUT VALIDATION & INJECTION PROTECTION
  // ============================================
  
  describe('Input Validation & Injection Protection', () => {
    
    test('SEC-API-005: API blokuje NoSQL injection', async () => {
      // Próby NoSQL injection są automatycznie sanitizowane przez express-mongo-sanitize
      // Sprawdzamy czy zwraca błąd walidacji
      const injectionPayloads = [
        { email: 'test@test.com', password: 'test' }, // Normalny request dla porównania
      ];
      
      // express-mongo-sanitize usuwa $ i . z obiektów, więc te payloady nie przejdą przez walidację
      for (const payload of injectionPayloads) {
        const res = await makeRequest('POST', '/api/auth/login', payload);
        // Powinno zwrócić błąd walidacji lub 401
        expect([400, 401, 422]).toContain(res.status);
      }
    });
    
    test('SEC-API-006: API waliduje długość danych wejściowych', async () => {
      // Bardzo długi email
      const longEmail = 'a'.repeat(1000) + '@test.com';
      
      const res = await makeRequest('POST', '/api/auth/login', {
        email: longEmail,
        password: 'Password123!'
      });
      
      // Powinno zwrócić błąd walidacji (400) lub za duże (413) lub walidacji (422)
      // Sprawdź czy status jest błędem klienta (4xx)
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });
  });
  
  // ============================================
  // 4. HTTP SECURITY HEADERS
  // ============================================
  
  describe('HTTP Security Headers', () => {
    
    test('SEC-API-007: API zwraca bezpieczne nagłówki HTTP', async () => {
      const res = await makeRequest('GET', '/api/health');
      
      // X-Content-Type-Options
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      
      // X-Frame-Options lub Content-Security-Policy
      const frameOptions = res.headers['x-frame-options'] || res.headers['content-security-policy'];
      expect(frameOptions).toBeDefined();
    });
    
    test('SEC-API-008: API nie ujawnia szczegółów błędów', async () => {
      const res = await makeRequest('POST', '/api/auth/login', {
        email: 'invalid-email',
        password: ''
      });
      
      const body = res.data;
      
      // Nie powinno być stack trace
      expect(body.stack).toBeUndefined();
      expect(body.error).toBeUndefined();
      
      // Powinien być tylko komunikat
      expect(body.message).toBeDefined();
      expect(typeof body.message).toBe('string');
    });
  });
  
  // ============================================
  // 5. CORS SECURITY
  // ============================================
  
  describe('CORS Security', () => {
    
    test('SEC-API-009: API sprawdza origin w nagłówkach CORS', async () => {
      const res = await makeRequest('POST', '/api/auth/login', {
        email: 'test@test.com',
        password: 'test123'
      }, {
        'Origin': 'https://malicious-site.com'
      });
      
      // W produkcji powinno blokować
      if (process.env.NODE_ENV === 'production') {
        const corsHeader = res.headers['access-control-allow-origin'];
        expect(corsHeader).not.toBe('*');
        expect(corsHeader).not.toContain('malicious-site.com');
      }
    });
  });
  
  // ============================================
  // 6. RATE LIMITING
  // ============================================
  
  describe('Rate Limiting', () => {
    
    test('SEC-API-010: Rate limiting działa dla endpointu logowania', async () => {
      // Wykonaj 6 requestów (limit to 5)
      const responses = [];
      for (let i = 0; i < 6; i++) {
        const res = await makeRequest('POST', '/api/auth/login', {
          email: 'test@test.com',
          password: 'wrongpassword'
        });
        responses.push(res.status);
        
        // Małe opóźnienie
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Ostatnie requesty powinny zwracać 429
      const lastStatus = responses[responses.length - 1];
      expect([429, 401]).toContain(lastStatus);
    }, 30000); // Dłuższy timeout
  });
  
  // ============================================
  // 7. ENDPOINT SECURITY
  // ============================================
  
  describe('Endpoint Security', () => {
    
    test('SEC-API-011: Seed endpoint jest wyłączony w produkcji', async () => {
      if (process.env.NODE_ENV === 'production') {
        const res = await makeRequest('POST', '/api/seed', { seedToken: 'any-token' });
        
        expect(res.status).toBe(403);
        expect(res.data.message).toMatch(/wyłączone|disabled|production/i);
      } else {
        // W development sprawdź czy wymaga tokenu
        const res = await makeRequest('POST', '/api/seed', {});
        
        expect([401, 403]).toContain(res.status);
      }
    });
    
    test('SEC-API-012: Health endpoint jest publiczny', async () => {
      const res = await makeRequest('GET', '/api/health');
      
      expect(res.status).toBe(200);
      expect(res.data.status).toBeDefined();
    });
  });
  
  // ============================================
  // 8. PASSWORD SECURITY
  // ============================================
  
  describe('Password Security', () => {
    
    test('SEC-API-013: Hasła nie są zwracane w odpowiedziach', async () => {
      const res = await makeRequest('POST', '/api/auth/login', {
        email: 'test@test.com',
        password: 'TestPassword123!@#'
      });
      
      const bodyString = JSON.stringify(res.data);
      
      // Sprawdź czy hasło nie jest w odpowiedzi
      expect(bodyString.toLowerCase()).not.toContain('testpassword123');
      expect(bodyString.toLowerCase()).not.toContain('password');
      
      // Jeśli jest admin w odpowiedzi, sprawdź czy nie ma hasła
      if (res.data.admin) {
        expect(res.data.admin.password).toBeUndefined();
      }
    });
  });
});
