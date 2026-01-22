const http = require('http');

// Konfiguracja testu
const BASE_URL = 'http://localhost:3000';
const ENDPOINTS = {
  login: {
    path: '/api/auth/login',
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@restauracja.pl',
      password: 'Admin123!'
    }),
    limiter: 'loginLimiter', // 5 prób / 15 min
    expectedLimit: 5
  },
  public: {
    path: '/api/locations',
    method: 'GET',
    limiter: 'publicLimiter', // 100 requestów / 15 min
    expectedLimit: 100
  },
  health: {
    path: '/api/health',
    method: 'GET',
    limiter: 'none', // Brak limitera
    expectedLimit: null
  }
};

// Funkcja do wysłania requestu
function makeRequest(endpoint, requestNumber) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint.path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (endpoint.body) {
      options.headers['Content-Length'] = Buffer.byteLength(endpoint.body);
    }

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          requestNumber
        });
      });
    });

    req.on('error', (error) => {
      reject({ error, requestNumber });
    });

    if (endpoint.body) {
      req.write(endpoint.body);
    }
    
    req.end();
  });
}

// Test rate limitingu
async function testRateLimit(endpointName, count = 10) {
  const endpoint = ENDPOINTS[endpointName];
  
  if (!endpoint) {
    console.error(`❌ Nieznany endpoint: ${endpointName}`);
    return;
  }

  console.log(`\n🧪 Testowanie rate limitingu dla: ${endpointName}`);
  console.log(`📍 Endpoint: ${endpoint.method} ${endpoint.path}`);
  console.log(`🔢 Wysyłanie ${count} requestów...\n`);

  const results = [];
  const startTime = Date.now();

  // Wysyłaj requesty sekwencyjnie
  for (let i = 1; i <= count; i++) {
    try {
      const result = await makeRequest(endpoint, i);
      results.push(result);
      
      const rateLimitRemaining = result.headers['ratelimit-remaining'];
      const rateLimitLimit = result.headers['ratelimit-limit'];
      const rateLimitReset = result.headers['ratelimit-reset'];
      
      if (result.statusCode === 429) {
        console.log(`❌ Request #${i}: 429 Too Many Requests (Rate limit przekroczony)`);
        if (rateLimitReset) {
          const resetTime = new Date(parseInt(rateLimitReset) * 1000);
          console.log(`   ⏰ Reset za: ${resetTime.toLocaleTimeString()}`);
        }
      } else if (result.statusCode === 200 || result.statusCode === 401) {
        console.log(`✅ Request #${i}: ${result.statusCode} - Pozostało: ${rateLimitRemaining || 'N/A'} / ${rateLimitLimit || 'N/A'}`);
      } else {
        console.log(`⚠️  Request #${i}: ${result.statusCode}`);
      }
      
      // Małe opóźnienie między requestami
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`❌ Request #${i}: Błąd -`, error.error?.message || error.message);
      results.push({ error, requestNumber: i });
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Podsumowanie
  console.log(`\n📊 Podsumowanie testu:`);
  console.log(`   ⏱️  Czas: ${duration}s`);
  console.log(`   ✅ Sukces: ${results.filter(r => r.statusCode === 200 || r.statusCode === 401).length}`);
  console.log(`   ❌ Rate Limit (429): ${results.filter(r => r.statusCode === 429).length}`);
  console.log(`   ⚠️  Inne: ${results.filter(r => r.statusCode && r.statusCode !== 200 && r.statusCode !== 401 && r.statusCode !== 429).length}`);
  
  if (endpoint.expectedLimit) {
    const first429 = results.find(r => r.statusCode === 429);
    if (first429) {
      console.log(`\n✅ Rate limiting działa! Limit przekroczony przy request #${first429.requestNumber}`);
      console.log(`   Oczekiwany limit: ${endpoint.expectedLimit} requestów`);
    } else {
      console.log(`\n⚠️  Rate limiting nie został przekroczony (wysłano ${count} requestów, limit: ${endpoint.expectedLimit})`);
    }
  }
}

// Główna funkcja
async function main() {
  console.log('🚀 Test Rate Limitingu - Restauracja Backend\n');
  console.log('⚠️  Upewnij się, że backend działa na http://localhost:3000\n');

  // Test 1: Login limiter (5 prób)
  await testRateLimit('login', 7); // Wysyłamy 7, żeby przekroczyć limit 5

  // Czekaj chwilę
  console.log('\n⏳ Czekam 2 sekundy...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Public limiter (100 requestów)
  await testRateLimit('public', 10); // Tylko 10, żeby nie przekroczyć limitu 100

  // Test 3: Health check (bez limitera)
  await testRateLimit('health', 5);

  console.log('\n✅ Testy zakończone!\n');
}

// Uruchom testy
main().catch(console.error);
