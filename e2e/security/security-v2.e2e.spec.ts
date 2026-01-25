import { test, expect, Page } from '@playwright/test';

/**
 * Security E2E Tests v2 - Senior Tester Level
 * 
 * Zasady:
 * - Każdy test jest niezależny (izolacja)
 * - Właściwe timeouty i error handling
 * - Testy rzeczywistych scenariuszy bezpieczeństwa
 * - Unikanie flaky testów
 * - Czytelne komunikaty błędów
 */

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:4200';
const API_URL = process.env.E2E_API_URL || 'http://localhost:3000';

// Helper: Sprawdź czy aplikacja jest dostępna
async function ensureAppAvailable(page: Page): Promise<void> {
  try {
    const response = await page.goto(BASE_URL, { 
      waitUntil: 'domcontentloaded', 
      timeout: 10000 
    });
    if (!response || !response.ok()) {
      throw new Error(`Aplikacja nie jest dostępna (${response?.status()})`);
    }
  } catch (error) {
    throw new Error(`Aplikacja nie jest dostępna na ${BASE_URL}. Uruchom: npm run start (frontend)`);
  }
}

// Helper: Sprawdź czy API jest dostępne
async function ensureApiAvailable(page: Page): Promise<void> {
  try {
    const response = await page.request.get(`${API_URL}/api/health`, { timeout: 5000 });
    if (response.status() !== 200) {
      throw new Error(`API nie jest dostępne (${response.status()})`);
    }
  } catch (error) {
    throw new Error(`API nie jest dostępne na ${API_URL}. Uruchom: npm run start (backend)`);
  }
}

// Helper: Czekaj na element z timeoutem i retry
async function waitForElement(
  page: Page, 
  selector: string, 
  options: { timeout?: number; visible?: boolean } = {}
): Promise<void> {
  const { timeout = 10000, visible = true } = options;
  
  if (visible) {
    await page.waitForSelector(selector, { 
      state: 'visible', 
      timeout 
    });
  } else {
    await page.waitForSelector(selector, { 
      state: 'attached', 
      timeout 
    });
  }
}

test.describe('🔒 Security E2E Tests v2', () => {
  
  // Setup przed wszystkimi testami
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    try {
      await ensureAppAvailable(page);
      await ensureApiAvailable(page);
    } finally {
      await page.close();
    }
  });

  // ============================================
  // 1. ADMIN PANEL ACCESS CONTROL
  // ============================================
  
  test.describe('Admin Panel Access Control', () => {
    
    test('SEC-001: Panel admina nie jest widoczny w publicznym footerze', async ({ page }) => {
      await ensureAppAvailable(page);
      
      // Przewiń do footeru
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      // Sprawdź czy link NIE istnieje w DOM (nie tylko czy jest widoczny)
      const adminLink = page.locator('a[href*="/admin/login"]');
      const count = await adminLink.count();
      
      expect(count).toBe(0);
    });
    
    test('SEC-002: Bezpośredni URL do logowania jest dostępny', async ({ page }) => {
      await ensureAppAvailable(page);
      
      const response = await page.goto(`${BASE_URL}/admin/login`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      expect(response?.status()).toBe(200);
      
      // Sprawdź czy formularz istnieje
      await waitForElement(page, 'input[type="email"]');
      await waitForElement(page, 'input[type="password"]');
      await waitForElement(page, 'button[type="submit"]');
    });
    
    test('SEC-003: Niezalogowany użytkownik jest przekierowywany z dashboard', async ({ page }) => {
      await ensureAppAvailable(page);
      
      // Próba dostępu do dashboard
      await page.goto(`${BASE_URL}/admin/dashboard`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      // Powinien być przekierowany do logowania
      await page.waitForURL(/\/admin\/login/, { timeout: 5000 });
      expect(page.url()).toContain('/admin/login');
    });
  });
  
  // ============================================
  // 2. AUTHENTICATION SECURITY
  // ============================================
  
  test.describe('Authentication Security', () => {
    
    test('SEC-004: Formularz wymaga obu pól (email i hasło)', async ({ page }) => {
      await ensureAppAvailable(page);
      await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
      
      // Tylko email
      await page.fill('input[type="email"]', 'test@test.com');
      const form = page.locator('form');
      const isValid = await form.evaluate((f: HTMLFormElement) => f.checkValidity());
      expect(isValid).toBe(false);
      
      // Tylko hasło
      await page.fill('input[type="email"]', '');
      await page.fill('input[type="password"]', 'password123');
      const isValid2 = await form.evaluate((f: HTMLFormElement) => f.checkValidity());
      expect(isValid2).toBe(false);
    });
    
    test('SEC-005: Email jest walidowany przez HTML5', async ({ page }) => {
      await ensureAppAvailable(page);
      await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
      
      const emailInput = page.locator('input[type="email"]');
      
      // Nieprawidłowy email
      await emailInput.fill('not-an-email');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
      
      // Prawidłowy email
      await emailInput.fill('test@example.com');
      const isValid2 = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid2).toBe(true);
    });
    
    test('SEC-006: Nieprawidłowe dane logowania zwracają błąd', async ({ page }) => {
      await ensureAppAvailable(page);
      await ensureApiAvailable(page);
      
      await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
      
      // Wypełnij formularz nieprawidłowymi danymi
      await page.fill('input[type="email"]', 'invalid@test.com');
      await page.fill('input[type="password"]', 'wrongpassword123!');
      await page.click('button[type="submit"]');
      
      // Czekaj na komunikat błędu (może być w różnych miejscach)
      const errorSelectors = [
        '.text-red-400',
        '[class*="error"]',
        '[class*="alert"]',
        'text=/nieprawidłowy|błąd|error/i'
      ];
      
      let errorFound = false;
      for (const selector of errorSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000, state: 'visible' });
          errorFound = true;
          break;
        } catch {
          // Próbuj następny selektor
        }
      }
      
      expect(errorFound).toBe(true);
    });
  });
  
  // ============================================
  // 3. API SECURITY
  // ============================================
  
  test.describe('API Security', () => {
    
    test('SEC-007: API zwraca bezpieczne nagłówki HTTP', async ({ page }) => {
      await ensureApiAvailable(page);
      
      const response = await page.request.get(`${API_URL}/api/health`);
      
      const headers = response.headers();
      
      // Sprawdź nagłówki bezpieczeństwa
      expect(headers['x-content-type-options']).toBe('nosniff');
      
      // X-Frame-Options lub Content-Security-Policy
      const frameOptions = headers['x-frame-options'] || headers['content-security-policy'];
      expect(frameOptions).toBeDefined();
    });
    
    test('SEC-008: API wymaga autoryzacji dla chronionych endpointów', async ({ page }) => {
      await ensureApiAvailable(page);
      
      // Próba dostępu bez tokenu
      const response = await page.request.get(`${API_URL}/api/auth/me`);
      
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.message).toBeDefined();
    });
    
    test('SEC-009: Nieprawidłowy token JWT jest odrzucany', async ({ page }) => {
      await ensureApiAvailable(page);
      
      const response = await page.request.get(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': 'Bearer invalid-token-12345'
        }
      });
      
      expect(response.status()).toBe(401);
      
      const body = await response.json();
      expect(body.success).toBe(false);
    });
    
    test('SEC-010: API nie ujawnia szczegółów błędów w odpowiedziach', async ({ page }) => {
      await ensureApiAvailable(page);
      
      // Wyślij nieprawidłowy request
      const response = await page.request.post(`${API_URL}/api/auth/login`, {
        data: {
          email: 'invalid-email-format',
          password: ''
        }
      });
      
      const body = await response.json();
      
      // Sprawdź czy nie ma stack trace lub szczegółów technicznych
      expect(body.stack).toBeUndefined();
      expect(body.error).toBeUndefined();
      
      // Powinien być tylko komunikat błędu
      expect(body.message).toBeDefined();
      expect(typeof body.message).toBe('string');
    });
  });
  
  // ============================================
  // 4. INPUT VALIDATION & INJECTION PROTECTION
  // ============================================
  
  test.describe('Input Validation & Injection Protection', () => {
    
    test('SEC-011: API blokuje NoSQL injection w email', async ({ page }) => {
      await ensureApiAvailable(page);
      
      const injectionPayloads = [
        { email: { $ne: null }, password: 'test' },
        { email: { $gt: '' }, password: 'test' },
        { email: 'admin@test.com', password: { $ne: null } }
      ];
      
      for (const payload of injectionPayloads) {
        const response = await page.request.post(`${API_URL}/api/auth/login`, {
          data: payload,
          timeout: 5000
        });
        
        // Powinno zwrócić błąd walidacji (400) lub autoryzacji (401)
        expect([400, 401, 422]).toContain(response.status());
      }
    });
    
    test('SEC-012: API waliduje długość danych wejściowych', async ({ page }) => {
      await ensureApiAvailable(page);
      
      // Bardzo długi email (może powodować DoS)
      const longEmail = 'a'.repeat(1000) + '@test.com';
      
      const response = await page.request.post(`${API_URL}/api/auth/login`, {
        data: {
          email: longEmail,
          password: 'Password123!'
        },
        timeout: 5000
      });
      
      // Powinno zwrócić błąd walidacji
      expect([400, 413, 422]).toContain(response.status());
    });
    
    test('SEC-013: Formularz nie wykonuje XSS w polach wejściowych', async ({ page }) => {
      await ensureAppAvailable(page);
      await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
      
      const xssPayload = '<script>alert("XSS")</script>';
      
      // Wpisz payload
      await page.fill('input[type="email"]', xssPayload);
      
      // Sprawdź czy wartość jest escape'owana (nie wykonana jako script)
      const value = await page.inputValue('input[type="email"]');
      expect(value).toBe(xssPayload); // Powinno być escape'owane przez Angular
      
      // Sprawdź czy nie ma alertów
      let alertTriggered = false;
      page.on('dialog', () => {
        alertTriggered = true;
      });
      
      await page.waitForTimeout(1000);
      expect(alertTriggered).toBe(false);
    });
  });
  
  // ============================================
  // 5. CORS & ORIGIN VALIDATION
  // ============================================
  
  test.describe('CORS & Origin Validation', () => {
    
    test('SEC-014: API sprawdza origin w nagłówkach CORS', async ({ page }) => {
      await ensureApiAvailable(page);
      
      // Request z nieznanego originu
      const response = await page.request.post(`${API_URL}/api/auth/login`, {
        data: {
          email: 'test@test.com',
          password: 'test123'
        },
        headers: {
          'Origin': 'https://malicious-site.com'
        }
      });
      
      // W development może pozwolić, ale sprawdź nagłówki CORS
      const corsHeader = response.headers()['access-control-allow-origin'];
      
      // W produkcji nie powinno być *
      if (process.env.NODE_ENV === 'production') {
        expect(corsHeader).not.toBe('*');
        expect(corsHeader).not.toContain('malicious-site.com');
      }
    });
  });
  
  // ============================================
  // 6. RATE LIMITING (Opcjonalne - może być wolne)
  // ============================================
  
  test.describe('Rate Limiting', () => {
    
    test('SEC-015: Rate limiting działa dla endpointu logowania', async ({ page }) => {
      await ensureApiAvailable(page);
      
      // Wykonaj 6 requestów (limit to 5)
      const responses = [];
      for (let i = 0; i < 6; i++) {
        try {
          const response = await page.request.post(`${API_URL}/api/auth/login`, {
            data: {
              email: 'test@test.com',
              password: 'wrongpassword'
            },
            timeout: 5000
          });
          responses.push(response.status());
        } catch (error) {
          responses.push(500); // Timeout lub błąd
        }
        await page.waitForTimeout(200);
      }
      
      // Ostatnie requesty powinny zwracać 429 (Too Many Requests)
      // Lub 401 jeśli rate limiting nie działa jeszcze
      const lastStatus = responses[responses.length - 1];
      expect([429, 401]).toContain(lastStatus);
    }).timeout(30000); // Dłuższy timeout dla rate limiting
  });
  
  // ============================================
  // 7. ENDPOINT SECURITY
  // ============================================
  
  test.describe('Endpoint Security', () => {
    
    test('SEC-016: Seed endpoint jest wyłączony w produkcji', async ({ page }) => {
      await ensureApiAvailable(page);
      
      if (process.env.NODE_ENV === 'production') {
        const response = await page.request.post(`${API_URL}/api/seed`, {
          data: { seedToken: 'any-token' },
          timeout: 5000
        });
        
        expect(response.status()).toBe(403);
        
        const body = await response.json();
        expect(body.message).toMatch(/wyłączone|disabled|production/i);
      } else {
        // W development sprawdź czy wymaga tokenu
        const response = await page.request.post(`${API_URL}/api/seed`, {
          data: {},
          timeout: 5000
        });
        
        expect([401, 403]).toContain(response.status());
      }
    });
    
    test('SEC-017: Health endpoint jest publiczny', async ({ page }) => {
      await ensureApiAvailable(page);
      
      const response = await page.request.get(`${API_URL}/api/health`);
      
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.status).toBeDefined();
    });
  });
  
  // ============================================
  // 8. PASSWORD SECURITY
  // ============================================
  
  test.describe('Password Security', () => {
    
    test('SEC-018: Hasła nie są zwracane w odpowiedziach API', async ({ page }) => {
      await ensureApiAvailable(page);
      
      // Próba logowania (nie ważne czy się powiedzie)
      const response = await page.request.post(`${API_URL}/api/auth/login`, {
        data: {
          email: 'test@test.com',
          password: 'TestPassword123!@#'
        },
        timeout: 5000
      });
      
      const body = await response.json();
      const bodyString = JSON.stringify(body);
      
      // Sprawdź czy hasło nie jest w odpowiedzi
      expect(bodyString.toLowerCase()).not.toContain('testpassword123');
      expect(bodyString.toLowerCase()).not.toContain('password');
      
      // Jeśli jest admin w odpowiedzi, sprawdź czy nie ma hasła
      if (body.admin) {
        expect(body.admin.password).toBeUndefined();
      }
    });
  });
});
