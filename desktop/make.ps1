# Builds the Steam upload folder outside OneDrive:
#   %USERPROFILE%\cataklem-desktop\dist\win-unpacked\CATAKLEM.exe
# OneDrive should not sync node_modules, so the build happens in that separate folder.
$ErrorActionPreference = 'Stop'
$env:Path = "C:\Program Files\nodejs;" + $env:Path
$S = $PSScriptRoot
$B = Join-Path $env:USERPROFILE 'cataklem-desktop'

New-Item -ItemType Directory -Force (Join-Path $B 'app') | Out-Null
Copy-Item (Join-Path $S 'package.json'), (Join-Path $S 'main.js'), (Join-Path $S 'fetch-fonts.js') $B -Force
Copy-Item (Join-Path $S 'app\index.html') (Join-Path $B 'app\index.html') -Force
Set-Location $B

if (-not (Test-Path 'node_modules')) { npm install --no-audit --no-fund }

# Electron's own unzip step can stop early on new Node versions; unpack the cached zip with Windows instead.
if (-not (Test-Path 'node_modules\electron\dist\electron.exe')) {
  node node_modules\electron\install.js
  $z = Get-ChildItem "$env:LOCALAPPDATA\electron\Cache" -Recurse -Filter 'electron-v*-win32-x64.zip' | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $z) { throw 'Electron download not found in cache' }
  Remove-Item 'node_modules\electron\dist' -Recurse -Force -ErrorAction SilentlyContinue
  Expand-Archive -Path $z.FullName -DestinationPath 'node_modules\electron\dist' -Force
  Set-Content -Path 'node_modules\electron\path.txt' -Value 'electron.exe' -NoNewline -Encoding ascii
}

node fetch-fonts.js
$env:CSC_IDENTITY_AUTO_DISCOVERY = 'false'
npx electron-builder --win dir
Write-Host ''
Write-Host ('Done: ' + (Join-Path $B 'dist\win-unpacked\CATAKLEM.exe'))
