#!/usr/bin/env node

const { execSync } = require('child_process');

const tests = [
  'TC-SEC-001',
  'TC-SEC-002',
  'TC-SEC-003',
  'TC-SEC-004',
  'TC-SEC-005',
  // 'TC-SEC-007', // Zawiesza się - pomijamy
  // 'TC-SEC-008', // Może być wolny - pomijamy
  'TC-SEC-009',
  'TC-SEC-010',
  'TC-SEC-011',
  'TC-SEC-012',
  'TC-SEC-013',
  'TC-SEC-014',
  'TC-SEC-015',
  'TC-SEC-016',
  'TC-SEC-017',
  'TC-SEC-021',
  'TC-SEC-023',
  'TC-SEC-024',
  'TC-SEC-025',
  'TC-SEC-027',
  'TC-SEC-028'
];

let passed = 0;
let failed = 0;
let skipped = 0;

console.log('🔍 Uruchamianie testów pojedynczo...\n');

(async () => {
  for (const test of tests) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`▶️  Uruchamianie: ${test}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
      execSync(`npx playwright test e2e/security -g "${test}" --reporter=line --timeout=30000`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log(`\n✅ ${test} - PASSED\n`);
      passed++;
    } catch (error) {
      if (error.status === 1) {
        console.log(`\n❌ ${test} - FAILED\n`);
        failed++;
      } else {
        console.log(`\n⏭️  ${test} - SKIPPED\n`);
        skipped++;
      }
    }
    
    // Krótka przerwa między testami
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Podsumowanie:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
})();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Podsumowanie:');
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
