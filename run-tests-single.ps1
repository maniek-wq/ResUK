# Uruchom testy pojedynczo - identyfikacja zawieszonych testów (PowerShell)

Write-Host "🔍 Uruchamianie testów pojedynczo..." -ForegroundColor Cyan
Write-Host ""

# Lista testów do uruchomienia
$tests = @(
  "TC-SEC-001",
  "TC-SEC-002",
  "TC-SEC-003",
  "TC-SEC-004",
  "TC-SEC-005",
  "TC-SEC-007",
  "TC-SEC-008",
  "TC-SEC-009",
  "TC-SEC-010",
  "TC-SEC-011",
  "TC-SEC-012",
  "TC-SEC-013",
  "TC-SEC-014",
  "TC-SEC-015",
  "TC-SEC-016",
  "TC-SEC-017",
  "TC-SEC-021",
  "TC-SEC-023",
  "TC-SEC-024",
  "TC-SEC-025",
  "TC-SEC-027",
  "TC-SEC-028"
)

$passed = 0
$failed = 0
$skipped = 0

foreach ($test in $tests) {
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
  Write-Host "▶️  Uruchamianie: $test" -ForegroundColor Yellow
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
  
  $result = & npx playwright test e2e/security -g "$test" --reporter=line --timeout=30000 2>&1
  
  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ $test - PASSED" -ForegroundColor Green
    $passed++
  } elseif ($LASTEXITCODE -eq 1) {
    Write-Host "❌ $test - FAILED" -ForegroundColor Red
    $failed++
  } else {
    Write-Host "⏭️  $test - SKIPPED" -ForegroundColor Yellow
    $skipped++
  }
  
  Write-Host ""
  Start-Sleep -Seconds 1
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📊 Podsumowanie:" -ForegroundColor Cyan
Write-Host "   ✅ Passed: $passed" -ForegroundColor Green
Write-Host "   ❌ Failed: $failed" -ForegroundColor Red
Write-Host "   ⏭️  Skipped: $skipped" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
