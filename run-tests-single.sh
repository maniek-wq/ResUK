#!/bin/bash
# Uruchom testy pojedynczo - identyfikacja zawieszonych testów

echo "🔍 Uruchamianie testów pojedynczo..."
echo ""

# Lista testów do uruchomienia
tests=(
  "TC-SEC-001"
  "TC-SEC-002"
  "TC-SEC-003"
  "TC-SEC-004"
  "TC-SEC-005"
  "TC-SEC-007"
  "TC-SEC-008"
  "TC-SEC-009"
  "TC-SEC-010"
  "TC-SEC-011"
  "TC-SEC-012"
  "TC-SEC-013"
  "TC-SEC-014"
  "TC-SEC-015"
  "TC-SEC-016"
  "TC-SEC-017"
  "TC-SEC-021"
  "TC-SEC-023"
  "TC-SEC-024"
  "TC-SEC-025"
  "TC-SEC-027"
  "TC-SEC-028"
)

passed=0
failed=0
skipped=0

for test in "${tests[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "▶️  Uruchamianie: $test"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  npx playwright test e2e/security -g "$test" --reporter=line --timeout=30000
  
  exit_code=$?
  
  if [ $exit_code -eq 0 ]; then
    echo "✅ $test - PASSED"
    ((passed++))
  elif [ $exit_code -eq 1 ]; then
    echo "❌ $test - FAILED"
    ((failed++))
  else
    echo "⏭️  $test - SKIPPED"
    ((skipped++))
  fi
  
  echo ""
  sleep 1
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Podsumowanie:"
echo "   ✅ Passed: $passed"
echo "   ❌ Failed: $failed"
echo "   ⏭️  Skipped: $skipped"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
