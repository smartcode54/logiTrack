# Simple PowerShell Script for Testing reCAPTCHA Enterprise Verify API
# This script creates a sample request.json file and shows how to test

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "reCAPTCHA Enterprise Verify API Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:3000"
$siteKey = "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF"
$action = "verify"

# Prompt for token
Write-Host "Please enter the reCAPTCHA token:" -ForegroundColor Yellow
Write-Host "(You can get this from browser console: grecaptcha.enterprise.execute('$siteKey', {action: '$action'}))" -ForegroundColor Gray
Write-Host ""
$token = Read-Host "Token"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "Error: Token is required" -ForegroundColor Red
    exit 1
}

# Create request body
$requestBody = @{
    token = $token
    expectedAction = $action
    siteKey = $siteKey
} | ConvertTo-Json

Write-Host ""
Write-Host "Request Body:" -ForegroundColor Yellow
Write-Host $requestBody -ForegroundColor Gray
Write-Host ""

# Save to request.json (optional)
$requestBody | Out-File -FilePath "request.json" -Encoding UTF8
Write-Host "Request body saved to request.json" -ForegroundColor Green
Write-Host ""

# Make API request
try {
    Write-Host "Sending POST request to $baseUrl/api/recaptcha/verify..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/recaptcha/verify" `
        -Method Post `
        -ContentType "application/json" `
        -Body $requestBody
    
    Write-Host ""
    Write-Host "✓ Request successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    
    Write-Host ""
    if ($response.success) {
        Write-Host "Status: SUCCESS" -ForegroundColor Green
        Write-Host "Score: $($response.score)" -ForegroundColor Cyan
        Write-Host "Action: $($response.action)" -ForegroundColor Cyan
    } else {
        Write-Host "Status: FAILED" -ForegroundColor Red
        Write-Host "Error: $($response.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host ""
    Write-Host "✗ Request failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read response body" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

