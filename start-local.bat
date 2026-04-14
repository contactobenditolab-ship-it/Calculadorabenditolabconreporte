@echo off
setlocal
cd /d "%~dp0"

REM Inicia un servidor local para evitar restricciones de file://
REM Requiere Python (viene instalado en muchos PCs; si no, usa start-local.ps1 con opciones).

python -m http.server 8000 >nul 2>&1
if %errorlevel% neq 0 (
  py -m http.server 8000
)

