@echo off
rem Instala Clawd Pet en VS Code. Debe estar en la misma carpeta que el .vsix.
cd /d "%~dp0"
set VSIX=
for %%f in (clawd-pet-*.vsix) do set VSIX=%%f
if not defined VSIX (
  echo No se encontro el archivo clawd-pet-*.vsix en esta carpeta.
  pause
  exit /b 1
)
where code >nul 2>nul
if errorlevel 1 (
  echo No se encontro el comando "code" de VS Code.
  echo Instala manualmente: en VS Code abre Extensiones ^> menu "..." ^> "Install from VSIX..." y elige %VSIX%
  pause
  exit /b 1
)
echo Instalando %VSIX% ...
call code --install-extension "%VSIX%" --force
echo.
echo Listo. Reinicia VS Code (o "Developer: Reload Window") y busca "Clawd" en el Explorador.
pause
