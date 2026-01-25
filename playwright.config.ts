import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration dla testów E2E bezpieczeństwa
 * 
 * Uruchomienie z roota projektu:
 * - npm run test:e2e:security (z frontend/)
 * - npx playwright test e2e/security (z roota)
 */
export default defineConfig({
  // Testy są w katalogu e2e w roota projektu
  testDir: './e2e',
  testMatch: '**/*.e2e.spec.ts',
  
  // Timeout dla pojedynczego testu (60 sekund)
  timeout: 60 * 1000,
  
  // Global timeout dla wszystkich testów (15 minut - niektóre testy rate limiting są wolne)
  globalTimeout: 15 * 60 * 1000,
  
  // Timeout dla całego test suite
  expect: {
    timeout: 5000
  },
  
  // Uruchom testy równolegle (można zmniejszyć dla testów bezpieczeństwa)
  fullyParallel: false,
  
  // Nie uruchamiaj ponownie po błędach (dla testów bezpieczeństwa)
  forbidOnly: !!process.env.CI,
  
  // Nie retry testów bezpieczeństwa (ważne dla rate limiting)
  retries: 0,
  
  // Workers - 1 dla testów bezpieczeństwa (żeby nie interferować z rate limiting)
  workers: 1,
  
  // Uruchom testy sekwencyjnie (jeden po drugim)
  fullyParallel: false,
  
  // Reporter - 'line' pokazuje progress w czasie rzeczywistym
  reporter: [
    ['line'], // Pokazuje progress w czasie rzeczywistym
    ['html'],
    ['json', { outputFile: 'e2e-results.json' }]
  ],
  
  // Shared settings dla wszystkich projektów
  use: {
    // Base URL aplikacji
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4200',
    
    // Timeout dla akcji (10 sekund)
    actionTimeout: 10 * 1000,
    
    // Timeout dla nawigacji (30 sekund)
    navigationTimeout: 30 * 1000,
    
    // Screenshot tylko przy błędach
    screenshot: 'only-on-failure',
    
    // Video tylko przy błędach
    video: 'retain-on-failure',
    
    // Trace dla debugowania
    trace: 'retain-on-failure',
  },

  // Projekty testowe
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
