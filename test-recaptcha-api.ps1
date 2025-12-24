# PowerShell Script for Testing reCAPTCHA Enterprise Verify API
# Usage: .\test-recaptcha-api.ps1 -Token "YOUR_TOKEN" -Action "submit_form" -SiteKey "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF"

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    
    [Parameter(Mandatory=$false)]
    [string]$Action = "verify",
    
    [Parameter(Mandatory=$false)]
    [string]$SiteKey = "6LfbrDUsAAAAANW7dquyqmz0CWMsoGv9q99pGXNF",
    
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "reCAPTCHA Enterprise Verify API Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prepare request body
$requestBody = @{
    token = $Token
    expectedAction = $Action
    siteKey = $SiteKey
} | ConvertTo-Json

Write-Host "Request Details:" -ForegroundColor Yellow
Write-Host "  URL: $BaseUrl/api/recaptcha/verify" -ForegroundColor Gray
Write-Host "  Method: POST" -ForegroundColor Gray
Write-Host "  Site Key: $SiteKey" -ForegroundColor Gray
Write-Host "  Action: $Action" -ForegroundColor Gray
Write-Host "  Token: $($Token.Substring(0, [Math]::Min(50, $Token.Length)))..." -ForegroundColor Gray
Write-Host ""

# Make API request
try {
    Write-Host "Sending request..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/recaptcha/verify" `
        -Method Post `
        -ContentType "application/json" `
        -Body $requestBody `
        -ErrorAction Stop
    
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
    
    Write-Host ""
    if ($response.success) {
        Write-Host "✓ Verification SUCCESS" -ForegroundColor Green
        Write-Host "  Score: $($response.score)" -ForegroundColor Cyan
        Write-Host "  Action: $($response.action)" -ForegroundColor Cyan
        
        # Score interpretation
        if ($response.score -ge 0.7) {
            Write-Host "  Interpretation: Likely human" -ForegroundColor Green
        } elseif ($response.score -ge 0.5) {
            Write-Host "  Interpretation: Probably human" -ForegroundColor Yellow
        } elseif ($response.score -ge 0.3) {
            Write-Host "  Interpretation: Suspicious" -ForegroundColor Yellow
        } else {
            Write-Host "  Interpretation: Likely bot" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Verification FAILED" -ForegroundColor Red
        Write-Host "  Error: $($response.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host ""
    Write-Host "✗ Request FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Response Body: $responseBody" -ForegroundColor Red
    }
    
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

