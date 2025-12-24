# PowerShell Script that shows how to test using curl command
# This script generates the curl command for testing

param(
    [Parameter(Mandatory=$false)]
    [string]$Token = "",
    
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

# If token not provided, prompt for it
if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "Please enter the reCAPTCHA token:" -ForegroundColor Yellow
    Write-Host "(Get from browser: grecaptcha.enterprise.execute('$SiteKey', {action: '$Action'}))" -ForegroundColor Gray
    Write-Host ""
    $Token = Read-Host "Token"
}

if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "Error: Token is required" -ForegroundColor Red
    exit 1
}

# Create request.json file
$requestBody = @{
    event = @{
        token = $Token
        expectedAction = $Action
        siteKey = $SiteKey
    }
} | ConvertTo-Json -Depth 10

$requestBody | Out-File -FilePath "request.json" -Encoding UTF8
Write-Host "✓ Created request.json file" -ForegroundColor Green
Write-Host ""

# Show the request.json content
Write-Host "request.json content:" -ForegroundColor Yellow
Get-Content "request.json" | Write-Host -ForegroundColor Gray
Write-Host ""

# Generate curl command
Write-Host "Curl command to test:" -ForegroundColor Yellow
Write-Host ""

$curlCommand = @"
curl -X POST `"$BaseUrl/api/recaptcha/verify`" `
  -H `"Content-Type: application/json`" `
  -d '@request.json'
"@

Write-Host $curlCommand -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to execute
$execute = Read-Host "Do you want to execute this request? (Y/N)"

if ($execute -eq "Y" -or $execute -eq "y") {
    Write-Host ""
    Write-Host "Executing request..." -ForegroundColor Yellow
    Write-Host ""
    
    # Use Invoke-RestMethod instead of curl (more reliable in PowerShell)
    $apiRequestBody = @{
        token = $Token
        expectedAction = $Action
        siteKey = $SiteKey
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/recaptcha/verify" `
            -Method Post `
            -ContentType "application/json" `
            -Body $apiRequestBody
        
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
        Write-Host "✗ Request failed!" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Skipped execution. Use the curl command above to test manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

