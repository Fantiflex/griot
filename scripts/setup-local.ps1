# Installation locale LeGriot sur Windows (PowerShell 5.1+).
#   powershell -ExecutionPolicy Bypass -File scripts\setup-local.ps1
# 1. Installe Ollama (winget) s'il manque, 2. télécharge Gemma 3 4B, 3. crée .env, 4. installe les dépendances Node.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "== LeGriot : installation locale ==" -ForegroundColor Cyan

# Ollama
$ollama = Get-Command ollama -ErrorAction SilentlyContinue
if (-not $ollama) {
  Write-Host "Ollama absent : installation via winget..." -ForegroundColor Yellow
  winget install --id Ollama.Ollama -e --accept-source-agreements --accept-package-agreements
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
  $ollama = Get-Command ollama -ErrorAction SilentlyContinue
  if (-not $ollama) { Write-Host "Relancez ce script après l'installation d'Ollama (ou téléchargez-le sur https://ollama.com)." -ForegroundColor Red; exit 1 }
}

# Modèle
$model = if ($env:LLM_MODEL) { $env:LLM_MODEL } else { "gemma3:4b" }
Write-Host "Téléchargement du modèle $model (une seule fois, ~3 Go)..." -ForegroundColor Yellow
ollama pull $model

# .env
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  (Get-Content ".env") -replace "^LLM_MODEL=.*", "LLM_MODEL=$model" -replace "^LLM_VISION_MODEL=.*", "LLM_VISION_MODEL=$model" | Set-Content ".env" -Encoding utf8
  Write-Host ".env créé." -ForegroundColor Green
}

# Node
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Write-Host "Node.js 20+ requis : https://nodejs.org" -ForegroundColor Red; exit 1 }
npm install

Write-Host ""
Write-Host "Prêt. Lancer :  npm run dev   puis ouvrir http://localhost:3000" -ForegroundColor Green
Write-Host "Téléphones sur le même Wi-Fi : npm run cert:dev puis relancer avec SSL_CERT/SSL_KEY (voir .env.example)."
Write-Host "Voix serveur (optionnel) : voir services/tts/README.md"
