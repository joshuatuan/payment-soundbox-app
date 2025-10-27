# Start ngrok tunnel for GKash payment app
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Starting ngrok HTTPS tunnel..." -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`nMake sure your dev server is running on port 3000!" -ForegroundColor Yellow
Write-Host "If not, run: npm run dev" -ForegroundColor Gray
Write-Host ""

# Start ngrok
Start-Process -FilePath "npx" -ArgumentList "ngrok", "http", "3000" -NoNewWindow

# Wait for ngrok to start
Write-Host "Waiting for ngrok to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Get the tunnel URL
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
    $httpsUrl = $response.tunnels | Where-Object { $_.proto -eq 'https' } | Select-Object -ExpandProperty public_url
    
    Write-Host "`n==================================================" -ForegroundColor Cyan
    Write-Host "  NGROK TUNNEL ACTIVE!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Cyan
    
    Write-Host "`nYour HTTPS URL (use this on your phone):" -ForegroundColor Yellow
    Write-Host "  $httpsUrl" -ForegroundColor White -BackgroundColor DarkGreen
    
    Write-Host "`nHow to Test Camera on Your Phone:" -ForegroundColor Yellow
    Write-Host "  1. Copy the HTTPS URL above" -ForegroundColor White
    Write-Host "  2. Open it in Chrome on your Android phone" -ForegroundColor White
    Write-Host "  3. Navigate to /payer page" -ForegroundColor White
    Write-Host "  4. Click 'Scan QR Code' button" -ForegroundColor White
    Write-Host "  5. Allow camera access when prompted" -ForegroundColor White
    Write-Host "  6. Camera will work!" -ForegroundColor Green
    
    Write-Host "`nngrok Web Interface (view requests):" -ForegroundColor Yellow
    Write-Host "  http://localhost:4040" -ForegroundColor Cyan
    
    Write-Host "`nPress Ctrl+C to stop ngrok" -ForegroundColor Gray
    Write-Host "==================================================" -ForegroundColor Cyan
    
    # Keep the script running
    Write-Host "`nngrok is running... (Press Ctrl+C to stop)" -ForegroundColor Yellow
    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host "`nError: Could not connect to ngrok API" -ForegroundColor Red
    Write-Host "Make sure ngrok is running and port 3000 is accessible" -ForegroundColor Yellow
}

