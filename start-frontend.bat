@echo off
title SIVAC - Frontend
color 0A

echo.
echo ========================================
echo   SIVAC - Sistema de Vacunas Apurimac
echo   Iniciando Frontend...
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

REM Verificar si existe package.json
if not exist "package.json" (
    echo ERROR: No se encontró package.json en el directorio actual
    echo Asegurate de estar en el directorio raiz del proyecto
    pause
    exit /b 1
)

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo Instalando dependencias del frontend...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Falló la instalación de dependencias
        pause
        exit /b 1
    )
)

echo.
echo Iniciando servidor de desarrollo del frontend...
echo.
echo El frontend estará disponible en:
echo - Local: http://localhost:5173
echo - Red local: http://[TU-IP]:5173
echo.

REM Mostrar IP local
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /R "IPv4.*Address"') do (
    set "ip=%%i"
    setlocal enabledelayedexpansion
    set "ip=!ip: =!"
    echo Tu IP local es: !ip!
    echo URL para otras PCs: http://!ip!:5173
    endlocal
)

echo.
echo Presiona Ctrl+C para detener el servidor
echo.

npm run dev

pause
