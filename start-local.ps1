$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

function Start-ServerWithPython {
  param([int]$Port = 8000)
  try {
    python -m http.server $Port
    return $true
  } catch {}
  try {
    py -m http.server $Port
    return $true
  } catch {}
  return $false
}

Write-Host ""
Write-Host "Iniciando servidor local en http://localhost:8000/ ..."
Write-Host "Abre en el navegador: http://localhost:8000/"
Write-Host ""

if (-not (Start-ServerWithPython -Port 8000)) {
  Write-Host "No se encontro Python en tu PC."
  Write-Host ""
  Write-Host "Solucion 1 (recomendada): instala Python desde Microsoft Store y vuelve a ejecutar este script."
  Write-Host "Solucion 2: ejecuta: npx serve ."
  Write-Host ""
  throw "No se pudo iniciar el servidor."
}

