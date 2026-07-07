Write-Host "Starting Mini-ELK Stack Components..." -ForegroundColor Cyan

# Check if Meilisearch container is running
$meili = docker ps -q -f name=mini-elk-meilisearch
if ([string]::IsNullOrWhiteSpace($meili)) {
    Write-Host "Starting Meilisearch container..." -ForegroundColor Yellow
    docker-compose up -d
}

Write-Host "Starting Node.js Ingestion Server..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k node server.js" -WorkingDirectory ".\ingestion-server" -WindowStyle Normal

Write-Host "Starting Python Log Generator..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k python log_generator.py" -WorkingDirectory ".\agent" -WindowStyle Normal

Write-Host "Starting Python Log Agent (UDP Shipper)..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k python agent.py" -WorkingDirectory ".\agent" -WindowStyle Normal

Write-Host "Starting React Frontend..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k npm run dev" -WorkingDirectory ".\frontend" -WindowStyle Normal

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "All processes launched in separate windows!" -ForegroundColor Cyan
Write-Host "Frontend is running at http://localhost:5173" -ForegroundColor White
Write-Host "To stop, simply close the opened command windows." -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan
