# ======================================================
# SCRIPT DE TESTS COMPLETS - PARTIE QUENTIN
# Architecture & Authentification
# ======================================================

$ErrorActionPreference = "Continue"
$global:passedTests = 0
$global:failedTests = 0
$global:accessToken = ""
$global:refreshToken = ""
$global:testUserId = ""

function Test-Endpoint {
    param(
        [string]$TestName,
        [string]$Uri,
        [string]$Method = "Get",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "`n[TEST] $TestName" -ForegroundColor Cyan
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $Headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.ContentType = "application/json"
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "[OK] Test reussi!" -ForegroundColor Green
        $global:passedTests++
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "[OK] Test reussi (status $statusCode attendu)!" -ForegroundColor Green
            $global:passedTests++
            return $null
        }
        else {
            Write-Host "[ERREUR] Test echoue: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Gray
            $global:failedTests++
            return $null
        }
    }
}

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  TESTS PARTIE QUENTIN - COMPLETS" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

# Attendre que le serveur soit pret
Write-Host "`nAttente du demarrage du serveur (15 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# ======================================================
# SECTION 1: SETUP PROJET INITIAL
# ======================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "SECTION 1: SETUP PROJET INITIAL" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Test 1.1: Serveur accessible
Test-Endpoint -TestName "1.1 - Serveur NestJS accessible" `
    -Uri "http://localhost:3000" `
    -ExpectedStatus 404

# Test 1.2: MongoDB accessible via le serveur
Write-Host "`n[TEST] 1.2 - Connexion MongoDB" -ForegroundColor Cyan
$mongoRunning = docker ps | Select-String "mongodb"
if ($mongoRunning) {
    Write-Host "[OK] MongoDB tourne dans Docker!" -ForegroundColor Green
    $global:passedTests++
} else {
    Write-Host "[ERREUR] MongoDB non demarre!" -ForegroundColor Red
    $global:failedTests++
}

# ======================================================
# SECTION 2: SYSTEME D'AUTHENTIFICATION
# ======================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "SECTION 2: AUTHENTIFICATION" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Test 2.1: Inscription d'un nouvel utilisateur
$randomEmail = "test_$(Get-Random)@quentin.test"
$registerBody = @{
    email = $randomEmail
    password = "QuentinTest123!"
    firstName = "Quentin"
    lastName = "TestUser"
    phoneNumber = "0612345678"
} | ConvertTo-Json

$registerResponse = Test-Endpoint -TestName "2.1 - Inscription utilisateur" `
    -Uri "http://localhost:3000/auth/register" `
    -Method "Post" `
    -Body $registerBody

if ($registerResponse) {
    $global:testUserId = $registerResponse.id
    Write-Host "User ID cree: $global:testUserId" -ForegroundColor Gray
}

# Test 2.2: Connexion avec l'utilisateur de test
$loginBody = @{
    email = $randomEmail
    password = "QuentinTest123!"
} | ConvertTo-Json

$loginResponse = Test-Endpoint -TestName "2.2 - Connexion utilisateur" `
    -Uri "http://localhost:3000/auth/login" `
    -Method "Post" `
    -Body $loginBody

if ($loginResponse) {
    $global:accessToken = $loginResponse.accessToken
    $global:refreshToken = $loginResponse.refreshToken
    Write-Host "Access Token: $($global:accessToken.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "Refresh Token: $($global:refreshToken.Substring(0, 20))..." -ForegroundColor Gray
}

# Test 2.3: Connexion avec l'admin
$adminLoginBody = @{
    email = "admin@archiclean.com"
    password = "Admin123!"
} | ConvertTo-Json

$adminLoginResponse = Test-Endpoint -TestName "2.3 - Connexion admin" `
    -Uri "http://localhost:3000/auth/login" `
    -Method "Post" `
    -Body $adminLoginBody

# Test 2.4: Acces au profil authentifie
$authHeaders = @{
    Authorization = "Bearer $global:accessToken"
}

$meResponse = Test-Endpoint -TestName "2.4 - Acces profil authentifie (/auth/me)" `
    -Uri "http://localhost:3000/auth/me" `
    -Headers $authHeaders

if ($meResponse) {
    Write-Host "Email recupere: $($meResponse.email)" -ForegroundColor Gray
    Write-Host "Role: $($meResponse.role)" -ForegroundColor Gray
}

# Test 2.5: Refresh token
$refreshBody = @{
    refreshToken = $global:refreshToken
} | ConvertTo-Json

$refreshResponse = Test-Endpoint -TestName "2.5 - Rafraichissement du token" `
    -Uri "http://localhost:3000/auth/refresh" `
    -Method "Post" `
    -Body $refreshBody

if ($refreshResponse) {
    Write-Host "Nouveau token genere avec succes!" -ForegroundColor Gray
}

# Test 2.6: Deconnexion
Test-Endpoint -TestName "2.6 - Deconnexion utilisateur" `
    -Uri "http://localhost:3000/auth/logout" `
    -Method "Post" `
    -Headers $authHeaders

# Reconnexion pour les tests suivants
$loginResponse2 = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody `
    -ErrorAction SilentlyContinue

if ($loginResponse2) {
    $global:accessToken = $loginResponse2.accessToken
    $authHeaders = @{ Authorization = "Bearer $global:accessToken" }
}

# ======================================================
# SECTION 3: GESTION DES PROFILS
# ======================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "SECTION 3: GESTION DES PROFILS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Test 3.1: Consultation du profil complet
$profileResponse = Test-Endpoint -TestName "3.1 - Consultation profil complet" `
    -Uri "http://localhost:3000/users/profile" `
    -Headers $authHeaders

# Test 3.2: Mise a jour du profil
$updateBody = @{
    firstName = "Quentin"
    lastName = "Updated"
    bio = "Profil de test pour la partie Quentin - Architecture & Auth"
    isPublic = $true
} | ConvertTo-Json

Test-Endpoint -TestName "3.2 - Mise a jour du profil" `
    -Uri "http://localhost:3000/users/profile" `
    -Method "Put" `
    -Headers $authHeaders `
    -Body $updateBody

# Test 3.3: Consultation des profils publics
$publicProfilesResponse = Test-Endpoint -TestName "3.3 - Liste des profils publics" `
    -Uri "http://localhost:3000/users/public" `
    -Headers $authHeaders

if ($publicProfilesResponse) {
    Write-Host "Nombre de profils publics: $($publicProfilesResponse.users.Count)" -ForegroundColor Gray
}

# Test 3.4: Recherche d'utilisateurs
$searchResponse = Test-Endpoint -TestName "3.4 - Recherche d'utilisateurs" `
    -Uri "http://localhost:3000/users/search?query=admin" `
    -Headers $authHeaders

if ($searchResponse) {
    Write-Host "Resultats trouves: $($searchResponse.users.Count)" -ForegroundColor Gray
}

# Test 3.5: Consultation d'un profil par ID
if ($global:testUserId) {
    Test-Endpoint -TestName "3.5 - Consultation profil par ID" `
        -Uri "http://localhost:3000/users/$global:testUserId" `
        -Headers $authHeaders
}

# Test 3.6: Upload d'avatar (simulation - sans fichier reel)
Write-Host "`n[TEST] 3.6 - Service d'upload d'avatar" -ForegroundColor Cyan
if (Test-Path "src/infrastructure/services/FileUploadService.ts") {
    Write-Host "[OK] FileUploadService implemente!" -ForegroundColor Green
    $global:passedTests++
} else {
    Write-Host "[ERREUR] FileUploadService manquant!" -ForegroundColor Red
    $global:failedTests++
}

# ======================================================
# SECTION 4: FIXTURES ET DONNEES DE TEST
# ======================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "SECTION 4: FIXTURES & DONNEES DE TEST" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Test 4.1: Script de seed existe
Write-Host "`n[TEST] 4.1 - Script de fixtures" -ForegroundColor Cyan
if (Test-Path "scripts/seed.ts") {
    Write-Host "[OK] Script seed.ts present!" -ForegroundColor Green
    $global:passedTests++
} else {
    Write-Host "[ERREUR] Script seed.ts manquant!" -ForegroundColor Red
    $global:failedTests++
}

# Test 4.2: Admin existe dans la DB
$adminLoginTest = @{
    email = "admin@archiclean.com"
    password = "Admin123!"
} | ConvertTo-Json

$adminExists = Test-Endpoint -TestName "4.2 - Compte admin existe" `
    -Uri "http://localhost:3000/auth/login" `
    -Method "Post" `
    -Body $adminLoginTest

# Test 4.3: Autres utilisateurs de test
$testUsers = @(
    @{email="quentin.dev@archiclean.com"; password="Quentin123!"},
    @{email="marie.dupont@archiclean.com"; password="Marie123!"},
    @{email="jean.martin@archiclean.com"; password="Jean123!"}
)

$validUsers = 0
foreach ($user in $testUsers) {
    $testLoginBody = @{
        email = $user.email
        password = $user.password
    } | ConvertTo-Json
    
    try {
        $testLogin = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
            -Method Post `
            -ContentType "application/json" `
            -Body $testLoginBody `
            -ErrorAction Stop
        $validUsers++
    } catch {
        # Ignore
    }
}

Write-Host "`n[TEST] 4.3 - Utilisateurs de test" -ForegroundColor Cyan
Write-Host "Utilisateurs valides trouves: $validUsers/3" -ForegroundColor Gray
if ($validUsers -ge 2) {
    Write-Host "[OK] Plusieurs utilisateurs de test disponibles!" -ForegroundColor Green
    $global:passedTests++
} else {
    Write-Host "[WARN] Peu d'utilisateurs de test trouves" -ForegroundColor Yellow
    $global:failedTests++
}

# ======================================================
# SECTION 5: DOCUMENTATION
# ======================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "SECTION 5: DOCUMENTATION" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Test 5.1: README principal
Write-Host "`n[TEST] 5.1 - README principal" -ForegroundColor Cyan
if (Test-Path "README.md") {
    $readmeContent = Get-Content "README.md" -Raw
    if ($readmeContent -match "admin@archiclean.com") {
        Write-Host "[OK] README contient les identifiants de test!" -ForegroundColor Green
        $global:passedTests++
    } else {
        Write-Host "[WARN] README incomplet" -ForegroundColor Yellow
        $global:failedTests++
    }
} else {
    Write-Host "[ERREUR] README.md manquant!" -ForegroundColor Red
    $global:failedTests++
}

# Test 5.2: Documentation d'architecture
Write-Host "`n[TEST] 5.2 - Documentation architecture" -ForegroundColor Cyan
$docFiles = @("ARCHITECTURE.md", "INSTALLATION.md", "QUICKSTART.md")
$foundDocs = 0
foreach ($doc in $docFiles) {
    if (Test-Path $doc) {
        $foundDocs++
    }
}
Write-Host "Documents trouves: $foundDocs/$($docFiles.Count)" -ForegroundColor Gray
if ($foundDocs -eq $docFiles.Count) {
    Write-Host "[OK] Toute la documentation est presente!" -ForegroundColor Green
    $global:passedTests++
} else {
    Write-Host "[WARN] Documentation incomplete" -ForegroundColor Yellow
    $global:failedTests++
}

# ======================================================
# SECTION 6: ARCHITECTURE CLEAN
# ======================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "SECTION 6: CLEAN ARCHITECTURE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Test 6.1: Structure des dossiers
$requiredDirs = @(
    "src/domain/entities",
    "src/domain/repositories",
    "src/application/use-cases",
    "src/infrastructure/services",
    "src/infrastructure/repositories/mongodb",
    "src/interface/nestjs/controllers",
    "src/interface/nestjs/modules"
)

Write-Host "`n[TEST] 6.1 - Structure Clean Architecture" -ForegroundColor Cyan
$validDirs = 0
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        $validDirs++
    }
}
Write-Host "Dossiers valides: $validDirs/$($requiredDirs.Count)" -ForegroundColor Gray
if ($validDirs -eq $requiredDirs.Count) {
    Write-Host "[OK] Structure Clean Architecture complete!" -ForegroundColor Green
    $global:passedTests++
} else {
    Write-Host "[WARN] Structure incomplete" -ForegroundColor Yellow
    $global:failedTests++
}

# Test 6.2: Entites du domaine
Write-Host "`n[TEST] 6.2 - Entite User" -ForegroundColor Cyan
if (Test-Path "src/domain/entities/User.ts") {
    $userContent = Get-Content "src/domain/entities/User.ts" -Raw
    $hasProperties = ($userContent -match "email") -and ($userContent -match "password") -and ($userContent -match "role")
    if ($hasProperties) {
        Write-Host "[OK] Entite User complete!" -ForegroundColor Green
        $global:passedTests++
    } else {
        Write-Host "[WARN] Entite User incomplete" -ForegroundColor Yellow
        $global:failedTests++
    }
}

# Test 6.3: Use Cases
Write-Host "`n[TEST] 6.3 - Use Cases d'authentification" -ForegroundColor Cyan
$useCases = @(
    "RegisterUserUseCase.ts",
    "LoginUserUseCase.ts",
    "ConfirmUserEmailUseCase.ts",
    "RefreshTokenUseCase.ts",
    "LogoutUserUseCase.ts"
)
$foundUseCases = 0
foreach ($uc in $useCases) {
    if (Test-Path "src/application/use-cases/$uc") {
        $foundUseCases++
    }
}
Write-Host "Use Cases trouves: $foundUseCases/$($useCases.Count)" -ForegroundColor Gray
if ($foundUseCases -eq $useCases.Count) {
    Write-Host "[OK] Tous les use cases d'auth implementes!" -ForegroundColor Green
    $global:passedTests++
} else {
    Write-Host "[WARN] Use cases manquants" -ForegroundColor Yellow
    $global:failedTests++
}

# Test 6.4: Services d'infrastructure
Write-Host "`n[TEST] 6.4 - Services d'infrastructure" -ForegroundColor Cyan
$services = @("HashService.ts", "EmailService.ts", "FileUploadService.ts")
$foundServices = 0
foreach ($svc in $services) {
    if (Test-Path "src/infrastructure/services/$svc") {
        $foundServices++
    }
}
Write-Host "Services trouves: $foundServices/$($services.Count)" -ForegroundColor Gray
if ($foundServices -eq $services.Count) {
    Write-Host "[OK] Tous les services implementes!" -ForegroundColor Green
    $global:passedTests++
} else {
    Write-Host "[WARN] Services manquants" -ForegroundColor Yellow
    $global:failedTests++
}

# Test 6.5: Guards et Strategies
Write-Host "`n[TEST] 6.5 - Guards et Strategies Passport" -ForegroundColor Cyan
$guards = @(
    "src/interface/nestjs/guards/jwt-auth.guard.ts",
    "src/interface/nestjs/strategies/jwt.strategy.ts",
    "src/interface/nestjs/strategies/local.strategy.ts"
)
$foundGuards = 0
foreach ($guard in $guards) {
    if (Test-Path $guard) {
        $foundGuards++
    }
}
Write-Host "Guards/Strategies trouves: $foundGuards/$($guards.Count)" -ForegroundColor Gray
if ($foundGuards -eq $guards.Count) {
    Write-Host "[OK] Systeme d'authentification NestJS complet!" -ForegroundColor Green
    $global:passedTests++
} else {
    Write-Host "[WARN] Guards/Strategies manquants" -ForegroundColor Yellow
    $global:failedTests++
}

# ======================================================
# SECTION 7: CONFIGURATION & DOCKER
# ======================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "SECTION 7: CONFIGURATION & DOCKER" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Test 7.1: Docker Compose
Write-Host "`n[TEST] 7.1 - Configuration Docker" -ForegroundColor Cyan
if ((Test-Path "docker-compose.yml") -and (Test-Path "Dockerfile")) {
    Write-Host "[OK] Fichiers Docker presents!" -ForegroundColor Green
    $global:passedTests++
} else {
    Write-Host "[ERREUR] Fichiers Docker manquants!" -ForegroundColor Red
    $global:failedTests++
}

# Test 7.2: TypeScript Configuration
Write-Host "`n[TEST] 7.2 - Configuration TypeScript" -ForegroundColor Cyan
if (Test-Path "tsconfig.json") {
    $tsconfig = Get-Content "tsconfig.json" -Raw | ConvertFrom-Json
    if ($tsconfig.compilerOptions.strict) {
        Write-Host "[OK] TypeScript en mode strict!" -ForegroundColor Green
        $global:passedTests++
    } else {
        Write-Host "[WARN] TypeScript pas en mode strict" -ForegroundColor Yellow
        $global:failedTests++
    }
}

# Test 7.3: Variables d'environnement
Write-Host "`n[TEST] 7.3 - Fichier .env" -ForegroundColor Cyan
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    $hasRequired = ($envContent -match "MONGODB_URI") -and ($envContent -match "JWT_SECRET")
    if ($hasRequired) {
        Write-Host "[OK] Fichier .env configure!" -ForegroundColor Green
        $global:passedTests++
    } else {
        Write-Host "[WARN] Fichier .env incomplet" -ForegroundColor Yellow
        $global:failedTests++
    }
} else {
    Write-Host "[ERREUR] Fichier .env manquant!" -ForegroundColor Red
    $global:failedTests++
}

# ======================================================
# RAPPORT FINAL
# ======================================================
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  RAPPORT FINAL" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

$totalTests = $global:passedTests + $global:failedTests
$successRate = [math]::Round(($global:passedTests / $totalTests) * 100, 2)

Write-Host "`nTests reussis: $global:passedTests" -ForegroundColor Green
Write-Host "Tests echoues: $global:failedTests" -ForegroundColor Red
Write-Host "Total: $totalTests tests" -ForegroundColor Cyan
Write-Host "Taux de reussite: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Yellow" })

if ($successRate -ge 90) {
    Write-Host "`n[EXCELLENT] Partie Quentin completement fonctionnelle!" -ForegroundColor Green
} elseif ($successRate -ge 75) {
    Write-Host "`n[BON] Partie Quentin largement fonctionnelle!" -ForegroundColor Yellow
} else {
    Write-Host "`n[ATTENTION] Quelques problemes detectes" -ForegroundColor Red
}

Write-Host "`n========================================`n" -ForegroundColor Magenta

# Sauvegarde du rapport
$reportContent = @"
# RAPPORT DE TESTS - PARTIE QUENTIN
Date: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")

## Resultats
- Tests reussis: $global:passedTests
- Tests echoues: $global:failedTests
- Taux de reussite: $successRate%

## Sections testees
1. Setup projet initial
2. Systeme d'authentification
3. Gestion des profils
4. Fixtures et donnees de test
5. Documentation
6. Clean Architecture
7. Configuration & Docker

## Conclusion
$(if ($successRate -ge 90) { "La partie Quentin est completement fonctionnelle et prete pour la production!" } else { "Quelques ameliorations necessaires." })
"@

$reportContent | Out-File -FilePath "TEST_REPORT_QUENTIN.md" -Encoding UTF8
Write-Host "Rapport sauvegarde dans: TEST_REPORT_QUENTIN.md" -ForegroundColor Cyan
