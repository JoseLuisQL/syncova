@echo off
title SIVAC - Backend
color 0B

echo.
echo ========================================
echo   SIVAC - Sistema de Vacunas Apurimac
echo   Iniciando Backend...
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

REM Cambiar al directorio backend
if not exist "backend" (
    echo ERROR: No se encontró el directorio backend
    echo Asegurate de estar en el directorio raiz del proyecto
    pause
    exit /b 1
)

cd backend

REM Verificar si existe package.json
if not exist "package.json" (
    echo ERROR: No se encontró package.json en el directorio backend
    pause
    exit /b 1
)

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo Instalando dependencias del backend...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Falló la instalación de dependencias
        pause
        exit /b 1
    )
)

REM Verificar archivo .env
if not exist ".env" (
    echo.
    echo WARNING: No se encontró archivo .env
    echo El backend puede no funcionar correctamente sin configuración
    echo.
)

echo.
echo Iniciando servidor del backend...
echo.
echo El backend estará disponible en:
echo - Local: http://localhost:3001
echo - Red local: http://[TU-IP]:3001
echo.

REM Mostrar IP local
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /R "IPv4.*Address"') do (
    set "ip=%%i"
    setlocal enabledelayedexpansion
    set "ip=!ip: =!"
    echo Tu IP local es: !ip!
    echo URL API para otras PCs: http://!ip!:3001/api
    endlocal
)

echo.
echo Presiona Ctrl+C para detener el servidor
echo.

npm run dev

pause
