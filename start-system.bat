@echo off
title SIVAC - Sistema Completo
color 0E

echo.
echo ========================================
echo   SIVAC - Sistema de Vacunas Apurimac
echo   Iniciando Sistema Completo
echo ========================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado o no está en el PATH
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo Preparando sistema...
echo.

REM Mostrar IP local
echo Obteniendo información de red...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /R "IPv4.*Address"') do (
    set "ip=%%i"
    setlocal enabledelayedexpansion
    set "ip=!ip: =!"
    echo.
    echo ========================================
    echo   INFORMACIÓN DE ACCESO
    echo ========================================
    echo.
    echo Tu IP local es: !ip!
    echo.
    echo URLs para esta PC:
    echo - Frontend: http://localhost:5173
    echo - Backend:  http://localhost:3001
    echo.
    echo URLs para otras PCs en la red:
    echo - Frontend: http://!ip!:5173
    echo - Backend:  http://!ip!:3001/api
    echo.
    echo ========================================
    echo.
    endlocal
    goto :found_ip
)

:found_ip

echo Iniciando backend en una nueva ventana...
start "SIVAC Backend" cmd /k "cd /d "%~dp0" && start-backend.bat"

REM Esperar 3 segundos para que el backend inicie
timeout /t 3 /nobreak >nul

echo Iniciando frontend en una nueva ventana...
start "SIVAC Frontend" cmd /k "cd /d "%~dp0" && start-frontend.bat"

echo.
echo ========================================
echo   SISTEMA INICIADO
echo ========================================
echo.
echo Se han abierto dos ventanas:
echo 1. Backend (Puerto 3001)
echo 2. Frontend (Puerto 5173)
echo.
echo IMPORTANTE:
echo - NO cierres estas ventanas mientras uses el sistema
echo - Para acceder desde otras PCs, usa las URLs mostradas arriba
echo - Asegurate de configurar el firewall de Windows
echo.
echo Para detener el sistema, cierra ambas ventanas
echo o presiona Ctrl+C en cada una.
echo.

pause
