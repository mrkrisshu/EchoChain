# Start EchoChain Development Environment

Write-Host "🚀 Starting EchoChain Dev Environment..." -ForegroundColor Cyan

# Check dependencies
if (!(Get-Command solana -ErrorAction SilentlyContinue)) {
    Write-Error "Solana CLI is not found in PATH. Please install Solana: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
}
if (!(Get-Command anchor -ErrorAction SilentlyContinue)) {
    Write-Error "Anchor CLI is not found in PATH. Please install Anchor: https://www.anchor-lang.com/docs/installation"
    exit 1
}

# 1. Start Solana Validator (detached)
Write-Host "Starting Solana Test Validator..." -ForegroundColor Yellow
$validatorProcess = Start-Process solana-test-validator -PassThru -NoNewWindow
Start-Sleep -Seconds 5

# 2. Build & Deploy Anchor Program
Write-Host "Building and Deploying Anchor Program..." -ForegroundColor Yellow
# We use localnet for development
anchor deploy --provider.cluster localnet

if ($LASTEXITCODE -ne 0) {
    Write-Error "Anchor deploy failed. Please check the errors above."
    Stop-Process -Id $validatorProcess.Id -Force
    exit 1
}

# 3. Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
Set-Location frontend
npm run dev
