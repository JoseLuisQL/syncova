@echo off
setlocal enabledelayedexpansion
title SIVAC - Sistema Unificado
color 0F

echo.
echo =======================================================
echo   SIVAC - Sistema de Vacunas Apurimac
echo   Iniciando Sistema Unificado (Backend y Frontend)
echo =======================================================
echo.

REM Verificar si Node.js esta instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado o no esta en el PATH
    echo Por favor instala Node.js primero.
    pause
    exit /b 1
)

REM Verificar/Instalar dependencias de root/frontend
if exist "node_modules" goto skip_front_deps
echo [SISTEMA] Preparando dependencias iniciales Frontend...
call npm install --silent >nul 2>&1
:skip_front_deps

REM Verificar/Instalar dependencias del backend
if not exist "backend" goto skip_back_deps
cd backend
if exist "node_modules" goto skip_back_deps_install
echo [SISTEMA] Preparando dependencias iniciales Backend...
call npm install --silent >nul 2>&1
:skip_back_deps_install
cd ..
:skip_back_deps

echo [SISTEMA] Configurando entorno de red...
set "ip="
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /R "IPv4.*Address"') do (
    set "ip=%%i"
    set "ip=!ip: =!"
    goto :found_ip
)

:found_ip

echo.
echo =======================================================
echo   ACCESOS DISPONIBLES
echo =======================================================
echo.
echo   [FRONTEND]
echo   - Local: http://localhost:5173
if defined ip (
    echo   - Red:   http://!ip!:5173
)
echo.
echo   [BACKEND API]
echo   - Local: http://localhost:3001
if defined ip (
    echo   - Red:   http://!ip!:3001/api
)
echo.
echo =======================================================
echo [SISTEMA] Iniciando servidores sin ventanas extra...
echo [SISTEMA] Pulse Ctrl+C para detener ambos servicios.
echo =======================================================
echo.

REM Ejecutamos usando npx concurrently para una ejecucion limpia, sincronizada y profesional.
call npx -y concurrently --kill-others -p "[{name}]" -n "Backend,Frontend" -c "cyan.bold,green.bold" "cd backend && npm run dev" "npm run dev"

pause
