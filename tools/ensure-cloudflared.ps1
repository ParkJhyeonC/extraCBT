$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$installDir = Join-Path $repoRoot '.tools\cloudflared'
$installPath = Join-Path $installDir 'cloudflared.exe'
$latestDownload = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe'

if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
    $command = Get-Command cloudflared | Select-Object -First 1
    Write-Host "[extraCBT] cloudflared already available: $($command.Source)"
    exit 0
}

if (Test-Path $installPath) {
    Write-Host "[extraCBT] cloudflared already downloaded: $installPath"
    exit 0
}

New-Item -ItemType Directory -Force -Path $installDir | Out-Null

if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host '[extraCBT] Installing cloudflared with winget...'
    winget install --id Cloudflare.cloudflared -e --accept-package-agreements --accept-source-agreements --disable-interactivity
    if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
        $command = Get-Command cloudflared | Select-Object -First 1
        Write-Host "[extraCBT] winget install complete: $($command.Source)"
        exit 0
    }
    Write-Host '[extraCBT] winget install did not expose cloudflared on PATH yet. Falling back to direct download...'
}

Write-Host "[extraCBT] Downloading cloudflared to $installPath"
Invoke-WebRequest -Uri $latestDownload -OutFile $installPath
Write-Host "[extraCBT] Download complete: $installPath"
