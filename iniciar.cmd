@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 ou mais recente precisa estar instalado.
  pause
  exit /b 1
)
echo Abra http://127.0.0.1:4173/characters depois que o servidor iniciar.
echo Para encerrar, pressione Ctrl+C.
node server.cjs
pause
