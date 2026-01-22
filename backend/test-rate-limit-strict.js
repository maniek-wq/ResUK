const http = require('http');

// Test z nieprawidłowymi danymi logowania, żeby wymusić błąd
async function testLoginRateLimit() {
  console.log('🧪 Testowanie login rate limitera z nieprawidłowymi danymi\n');
  console.log('📍 Endpoint: POST /api/auth/login');
  console.log('🔢 Wysyłanie 7 requestów z błędnymi danymi...\n');

  const endpoint = {
    path: '/api/auth/login',
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@restauracja.pl',
      password: 'ZleHaslo123!' // Nieprawidłowe hasło
    })
  };

  const results = [];
  
  for (let i = 1; i <= 7; i++) {
    try {
      const result = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: endpoint.path,
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(endpoint.body)
          }
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data,
              requestNumber: i
            });
          });
        });

        req.on('error', reject);
        req.write(endpoint.body);
        req.end();
      });

      results.push(result);
      
      const rateLimitRemaining = result.headers['ratelimit-remaining'];
      const rateLimitLimit = result.headers['ratelimit-limit'];
      const rateLimitReset = result.headers['ratelimit-reset'];
      
      if (result.statusCode === 429) {
        console.log(`❌ Request #${i}: 429 Too Many Requests`);
        console.log(`   📝 Body: ${result.body.substring(0, 100)}...`);
        if (rateLimitReset) {
          const resetTime = new Date(parseInt(rateLimitReset) * 1000);
          console.log(`   ⏰ Reset za: ${resetTime.toLocaleTimeString()}`);
        }
      } else if (result.statusCode === 401) {
        console.log(`⚠️  Request #${i}: 401 Unauthorized (błędne dane) - Pozostało: ${rateLimitRemaining || 'N/A'} / ${rateLimitLimit || 'N/A'}`);
      } else if (result.statusCode === 200) {
        console.log(`✅ Request #${i}: 200 OK - Pozostało: ${rateLimitRemaining || 'N/A'} / ${rateLimitLimit || 'N/A'}`);
      } else {
        console.log(`⚠️  Request #${i}: ${result.statusCode} - Pozostało: ${rateLimitRemaining || 'N/A'} / ${rateLimitLimit || 'N/A'}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Request #${i}: Błąd -`, error.message);
    }
  }

  console.log(`\n📊 Podsumowanie:`);
  console.log(`   ✅ 200 OK: ${results.filter(r => r.statusCode === 200).length}`);
  console.log(`   ⚠️  401 Unauthorized: ${results.filter(r => r.statusCode === 401).length}`);
  console.log(`   ❌ 429 Rate Limit: ${results.filter(r => r.statusCode === 429).length}`);
  
  const first429 = results.find(r => r.statusCode === 429);
  if (first429) {
    console.log(`\n✅ Rate limiting działa poprawnie!`);
    console.log(`   Limit przekroczony przy request #${first429.requestNumber}`);
    console.log(`   Oczekiwany limit: 5 prób logowania / 15 min`);
  } else {
    console.log(`\n⚠️  Rate limiting nie został przekroczony`);
    console.log(`   Możliwe przyczyny:`);
    console.log(`   - skipSuccessfulRequests: true (nie liczy udanych prób)`);
    console.log(`   - Wszystkie próby były nieudane (401), ale limit nie został osiągnięty`);
  }
}

// Test public limiter z większą liczbą requestów
async function testPublicRateLimit() {
  console.log('\n\n🧪 Testowanie public rate limitera (100 requestów / 15 min)\n');
  console.log('📍 Endpoint: GET /api/locations');
  console.log('🔢 Wysyłanie 105 requestów...\n');

  const results = [];
  let first429 = null;
  
  for (let i = 1; i <= 105; i++) {
    try {
      const result = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/locations',
          method: 'GET'
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              requestNumber: i
            });
          });
        });

        req.on('error', reject);
        req.end();
      });

      results.push(result);
      
      const rateLimitRemaining = result.headers['ratelimit-remaining'];
      
      if (result.statusCode === 429 && !first429) {
        first429 = i;
        console.log(`❌ Request #${i}: 429 Too Many Requests (PIERWSZY BŁĄD)`);
      } else if (i % 20 === 0 || i === 105) {
        // Wyświetlaj co 20 requestów
        if (result.statusCode === 429) {
          console.log(`❌ Request #${i}: 429 Too Many Requests`);
        } else {
          console.log(`✅ Request #${i}: ${result.statusCode} - Pozostało: ${rateLimitRemaining || 'N/A'}`);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 10));
    } catch (error) {
      console.error(`❌ Request #${i}: Błąd -`, error.message);
    }
  }

  console.log(`\n📊 Podsumowanie:`);
  console.log(`   ✅ Sukces: ${results.filter(r => r.statusCode === 200).length}`);
  console.log(`   ❌ Rate Limit (429): ${results.filter(r => r.statusCode === 429).length}`);
  
  if (first429) {
    console.log(`\n✅ Rate limiting działa poprawnie!`);
    console.log(`   Limit przekroczony przy request #${first429}`);
    console.log(`   Oczekiwany limit: 100 requestów / 15 min`);
  } else {
    console.log(`\n⚠️  Rate limiting nie został przekroczony`);
  }
}

// Główna funkcja
async function main() {
  console.log('🚀 Test Rate Limitingu - Restauracja Backend\n');
  console.log('⚠️  Upewnij się, że backend działa na http://localhost:3000\n');
  
  await testLoginRateLimit();
  await testPublicRateLimit();
  
  console.log('\n✅ Wszystkie testy zakończone!\n');
}

main().catch(console.error);
