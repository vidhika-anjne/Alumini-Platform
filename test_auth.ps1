# Test authentication endpoints

Write-Host "Testing Alumni Platform Authentication Endpoints" -ForegroundColor Green

# Test backend health
Write-Host "`nTesting backend health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method GET
    Write-Host "Backend health: $healthResponse" -ForegroundColor Green
} catch {
    Write-Host "Backend health check failed: $_" -ForegroundColor Red
}

# Test student registration
Write-Host "`nTesting student registration..." -ForegroundColor Yellow
try {
    $studentData = @{
        name = "John Doe"
        enrollmentNumber = "ST001"
        email = "john@example.com"
        password = "password123"
        course = "Computer Science"
        graduationYear = "2024"
    } | ConvertTo-Json
    
    $regResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/students/register" -Method POST -ContentType "application/json" -Body $studentData
    Write-Host "Student registration response:" -ForegroundColor Green
    $regResponse | ConvertTo-Json -Depth 2
} catch {
    Write-Host "Student registration failed: $_" -ForegroundColor Red
}

# Test student login
Write-Host "`nTesting student login..." -ForegroundColor Yellow
try {
    $loginData = @{
        enrollmentNumber = "ST001"
        password = "password123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/students/login" -Method POST -ContentType "application/json" -Body $loginData
    Write-Host "Student login response:" -ForegroundColor Green
    $loginResponse | ConvertTo-Json -Depth 2
} catch {
    Write-Host "Student login failed: $_" -ForegroundColor Red
}

# Test alumni registration
Write-Host "`nTesting alumni registration..." -ForegroundColor Yellow
try {
    $alumniData = @{
        name = "Jane Smith"
        enrollmentNumber = "AL001"
        email = "jane@example.com"
        password = "password123"
        company = "Tech Corp"
        position = "Software Engineer"
        graduationYear = "2020"
    } | ConvertTo-Json
    
    $alumniRegResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/alumni/register" -Method POST -ContentType "application/json" -Body $alumniData
    Write-Host "Alumni registration response:" -ForegroundColor Green
    $alumniRegResponse | ConvertTo-Json -Depth 2
} catch {
    Write-Host "Alumni registration failed: $_" -ForegroundColor Red
}

# Test alumni login
Write-Host "`nTesting alumni login..." -ForegroundColor Yellow
try {
    $alumniLoginData = @{
        enrollmentNumber = "AL001"
        password = "password123"
    } | ConvertTo-Json
    
    $alumniLoginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/alumni/login" -Method POST -ContentType "application/json" -Body $alumniLoginData
    Write-Host "Alumni login response:" -ForegroundColor Green
    $alumniLoginResponse | ConvertTo-Json -Depth 2
} catch {
    Write-Host "Alumni login failed: $_" -ForegroundColor Red
}

Write-Host "`nTesting completed!" -ForegroundColor Green