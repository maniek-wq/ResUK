# Skrypt testowy dla endpointow Web Push Notifications
# Uzycie: .\test-push-endpoints.ps1

$baseUrl = "http://localhost:3000"
$email = "admin@restauracja.pl"
# Uwaga: Domyślne hasło z seed.js to "Admin123!@$%" (jeśli nie ustawiono ADMIN_PASSWORD w .env)
# Jeśli masz inne hasło w .env, zmień poniższą wartość
$password = "Admin123!@$%"

Write-Host "Logowanie jako $email..." -ForegroundColor Cyan
Write-Host "Upewnij sie, ze serwer backend dziala na $baseUrl" -ForegroundColor Yellow

# Krok 1: Logowanie
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success) {
        $token = $loginResponse.token
        Write-Host "Zalogowano pomyslnie!" -ForegroundColor Green
        Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
    } else {
        Write-Host "Blad logowania: $($loginResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Blad logowania: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nMożliwe przyczyny:" -ForegroundColor Yellow
    Write-Host "  1. Serwer backend nie dziala (sprawdz czy npm start/run dev jest uruchomione)" -ForegroundColor Gray
    Write-Host "  2. Nieprawidlowe haslo (domyslne z seed.js: Admin123!@`$%)" -ForegroundColor Gray
    Write-Host "  3. Admin nie istnieje w bazie (uruchom: npm run seed)" -ForegroundColor Gray
    Write-Host "  4. Sprawdz czy .env ma poprawne ADMIN_EMAIL i ADMIN_PASSWORD" -ForegroundColor Gray
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Krok 2: Pobierz publiczny klucz VAPID
Write-Host "`nPobieranie publicznego klucza VAPID..." -ForegroundColor Cyan
try {
    $publicKeyResponse = Invoke-RestMethod -Uri "$baseUrl/api/push/public-key" -Method Get
    if ($publicKeyResponse.success) {
        Write-Host "Publiczny klucz VAPID:" -ForegroundColor Green
        Write-Host $publicKeyResponse.publicKey -ForegroundColor Gray
    } else {
        Write-Host "Web Push nie jest skonfigurowane (brak kluczy VAPID)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Blad: $($_.Exception.Message)" -ForegroundColor Red
}

# Krok 3: Pobierz liste zarejestrowanych urzadzen
Write-Host "`nPobieranie listy urzadzen..." -ForegroundColor Cyan
try {
    $devicesResponse = Invoke-RestMethod -Uri "$baseUrl/api/push/devices" -Method Get -Headers $headers
    if ($devicesResponse.success) {
        Write-Host "Zarejestrowane urzadzenia: $($devicesResponse.count)" -ForegroundColor Green
        if ($devicesResponse.count -gt 0) {
            $devicesResponse.data | ForEach-Object {
                Write-Host "  - $($_.deviceInfo) ($($_.endpoint.Substring(0, 30))...)" -ForegroundColor Gray
            }
        } else {
            Write-Host "  Brak zarejestrowanych urzadzen" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Blad: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   Token wygasl lub jest nieprawidlowy" -ForegroundColor Yellow
    }
}

Write-Host "`nTest zakonczony!" -ForegroundColor Green
Write-Host "`nAby zarejestrowac subscription, uzyj frontendu Angular (po implementacji)" -ForegroundColor Cyan
Write-Host "   lub wyslij POST do /api/push/subscribe z subscription object z przegladarki" -ForegroundColor Gray
