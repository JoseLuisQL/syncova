@echo off
title SIVAC - Reiniciar Sistema
color 0C

echo.
echo ========================================
echo   SIVAC - Reiniciando Sistema
echo ========================================
echo.

echo Deteniendo servicios existentes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im tsx.exe >nul 2>&1

echo Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo Iniciando sistema con nueva configuracion...
start "SIVAC Backend" cmd /k "cd /d "%~dp0" && start-backend.bat"

timeout /t 3 /nobreak >nul

start "SIVAC Frontend" cmd /k "cd /d "%~dp0" && start-frontend.bat"

echo.
echo ========================================
echo   SISTEMA REINICIADO
echo ========================================
echo.
echo Los servicios se han reiniciado con la nueva configuracion.
echo Ahora deberia funcionar correctamente desde la red local.
echo.

pause
