# Script de test de l'API ArchiClean

Write-Host "====== Tests de l'API d'Authentification ArchiClean ======`n" -ForegroundColor Cyan

# Test 1: Verifier que le serveur repond
Write-Host "[1] Test de connexion au serveur..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000" -Method Get -ErrorAction Stop
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "[OK] Serveur accessible (404 attendu sur /)`n" -ForegroundColor Green
    } else {
        Write-Host "[ERREUR] Erreur de connexion: $_`n" -ForegroundColor Red
        exit 1
    }
}

# Test 2: Register un nouvel utilisateur
Write-Host "[2] Test d'inscription (register)..." -ForegroundColor Yellow
$registerBody = @{
    email = "testuser$(Get-Random)@test.com"
    password = "Test123!"
    firstName = "Test"
    lastName = "User"
    phoneNumber = "0123456789"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -ContentType "application/json" -Body $registerBody -ErrorAction Stop
    Write-Host "[OK] Inscription reussie!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.id)`n" -ForegroundColor Gray
} catch {
    Write-Host "[ERREUR] Erreur d'inscription: $($_.Exception.Message)`n" -ForegroundColor Red
    Write-Host "Details: $($_.ErrorDetails.Message)`n" -ForegroundColor Gray
}

# Test 3: Login avec l'admin existant
Write-Host "[3] Test de connexion (login)..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@archiclean.com"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -ErrorAction Stop
    Write-Host "[OK] Connexion reussie!" -ForegroundColor Green
    Write-Host "Access Token: $($loginResponse.accessToken.Substring(0, 20))...`n" -ForegroundColor Gray
    $global:accessToken = $loginResponse.accessToken
} catch {
    Write-Host "[ERREUR] Erreur de connexion: $($_.Exception.Message)`n" -ForegroundColor Red
    Write-Host "Details: $($_.ErrorDetails.Message)`n" -ForegroundColor Gray
}

# Test 4: Acceder au profil (avec authentification)
if ($global:accessToken) {
    Write-Host "[4] Test d'acces au profil authentifie..." -ForegroundColor Yellow
    try {
        $headers = @{
            Authorization = "Bearer $global:accessToken"
        }
        $profileResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/me" -Method Get -Headers $headers -ErrorAction Stop
        Write-Host "[OK] Profil recupere!" -ForegroundColor Green
        Write-Host "Email: $($profileResponse.email)`n" -ForegroundColor Gray
    } catch {
        Write-Host "[ERREUR] Erreur d'acces au profil: $($_.Exception.Message)`n" -ForegroundColor Red
    }
}

# Test 5: Lister les profils publics
Write-Host "[5] Test de listage des profils publics..." -ForegroundColor Yellow
try {
    $publicProfiles = Invoke-RestMethod -Uri "http://localhost:3000/users/public" -Method Get -ErrorAction Stop
    Write-Host "[OK] Profils publics recuperes!" -ForegroundColor Green
    Write-Host "Nombre de profils: $($publicProfiles.users.Count)`n" -ForegroundColor Gray
} catch {
    Write-Host "[ERREUR] Erreur de recuperation des profils publics: $($_.Exception.Message)`n" -ForegroundColor Red
}

Write-Host "`n====== Fin des tests ======`n" -ForegroundColor Cyan
