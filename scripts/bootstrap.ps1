$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

Set-Location $projectRoot

if (-not (Test-Path ".env.local")) {
  Copy-Item ".env.example" ".env.local"
  Write-Host "Se creó .env.local a partir de .env.example"
}

npm.cmd --prefix apps/web install
npm.cmd run check:structure

Write-Host "VISION AI está preparado. Ejecuta: npm.cmd run dev"
