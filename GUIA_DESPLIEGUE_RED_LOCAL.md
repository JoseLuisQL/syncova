# 🌐 Guía de Despliegue en Red Local - SIVAC

## 📋 Requisitos Previos

### Software Necesario
- ✅ **Node.js** (versión 18 o superior)
  - Descargar desde: https://nodejs.org/
- ✅ **Git** (opcional, para clonación)
- ✅ **PostgreSQL** (para la base de datos)

### Verificación del Sistema
```cmd
node --version
npm --version
```

## 🚀 Pasos de Instalación y Configuración

### 1. Preparación del Proyecto
```cmd
# Navegar al directorio del proyecto
cd C:\Proyectos\syncova

# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

### 2. Configuración de Red

#### ✅ Frontend (Ya configurado)
El archivo `vite.config.ts` ya está configurado para aceptar conexiones de red:
- Host: `0.0.0.0` (acepta conexiones desde cualquier IP)
- Puerto: `5173`

#### ✅ Backend (Ya configurado)
El archivo `backend/src/index.ts` ya está configurado para red local:
- Host: `0.0.0.0` (acepta conexiones desde cualquier IP)
- Puerto: `3001`

### 3. Configuración del Firewall de Windows

#### Opción A: Configuración Automática (Recomendada)
Cuando ejecutes los scripts por primera vez, Windows te preguntará:
1. Aparecerá un popup del **Firewall de Windows Defender**
2. ✅ **Marcar ambas casillas:**
   - ☑️ Redes privadas (como redes domésticas o del trabajo)
   - ☑️ Redes públicas (como las de aeropuertos y cafeterías)
3. Hacer clic en **"Permitir acceso"**

#### Opción B: Configuración Manual
Si necesitas configurar manualmente:

1. **Abrir Firewall de Windows:**
   - Presiona `Win + R`
   - Escribe: `wf.msc`
   - Presiona Enter

2. **Crear regla para el Frontend (Puerto 5173):**
   - Clic en "Reglas de entrada" → "Nueva regla..."
   - Tipo: "Puerto" → Siguiente
   - Protocolo: TCP, Puerto específico: `5173` → Siguiente
   - Acción: "Permitir la conexión" → Siguiente
   - Perfil: Marcar todas las opciones → Siguiente
   - Nombre: "SIVAC Frontend" → Finalizar

3. **Crear regla para el Backend (Puerto 3001):**
   - Repetir los pasos anteriores con puerto `3001`
   - Nombre: "SIVAC Backend"

### 4. Configuración de Base de Datos

Asegúrate de que el archivo `backend/.env` esté configurado correctamente:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/sivac_db"
PORT=3001
NODE_ENV=development
```

## 🎯 Métodos de Inicio

### Método 1: Inicio Automático (Recomendado)
```cmd
# Desde el directorio raíz del proyecto
.\start-system.bat
```
Este script:
- ✅ Iniciará automáticamente backend y frontend
- ✅ Mostrará tu IP local
- ✅ Abrirá ventanas separadas para cada servicio

### Método 2: Inicio Manual
```cmd
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (nueva terminal)
npm run dev
```

### Método 3: Scripts Individuales
```cmd
# Solo backend
.\start-backend.bat

# Solo frontend
.\start-frontend.bat
```

## 🌐 Acceso desde Otras PCs

### 1. Obtener tu IP Local
```cmd
ipconfig
```
Busca la línea que dice "Dirección IPv4" (ejemplo: `192.168.1.100`)

### 2. URLs de Acceso

#### Desde la PC Principal:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api

#### Desde Otras PCs en la Red:
- **Frontend:** http://[TU-IP]:5173
- **Backend API:** http://[TU-IP]:3001/api

**Ejemplo:** Si tu IP es `192.168.1.100`:
- Frontend: http://192.168.1.100:5173
- Backend: http://192.168.1.100:3001/api

## 🔧 Verificación del Sistema

### 1. Verificar Backend
Abrir en navegador: http://localhost:3001/health
```json
{
  "success": true,
  "message": "Sistema SIVAC funcionando correctamente",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Verificar Frontend
Abrir en navegador: http://localhost:5173
- Debe cargar la interfaz del sistema SIVAC

### 3. Verificar Conectividad de Red
Desde otra PC, abrir: http://[TU-IP]:5173

## 🚨 Solución de Problemas

### Problema: "No se puede conectar desde otra PC"
**Soluciones:**
1. ✅ Verificar que el firewall esté configurado
2. ✅ Confirmar que ambos servicios estén ejecutándose
3. ✅ Verificar que estén en la misma red WiFi/LAN
4. ✅ Probar con: `ping [TU-IP]` desde la otra PC

### Problema: "Puerto en uso"
**Soluciones:**
```cmd
# Verificar procesos usando los puertos
netstat -ano | findstr :5173
netstat -ano | findstr :3001

# Terminar proceso si es necesario
taskkill /PID [NUMERO_PID] /F
```

### Problema: "Error de base de datos"
**Soluciones:**
1. ✅ Verificar que PostgreSQL esté ejecutándose
2. ✅ Confirmar configuración en `backend/.env`
3. ✅ Ejecutar migraciones: `cd backend && npm run db:migrate`

## 📱 Acceso desde Dispositivos Móviles

El sistema también es accesible desde dispositivos móviles en la misma red:
- **URL:** http://[TU-IP]:5173
- La interfaz se adaptará automáticamente al tamaño de pantalla

## 🔒 Consideraciones de Seguridad

### Para Redes Privadas (Recomendado)
- ✅ Usar solo en redes domésticas o de oficina confiables
- ✅ El sistema está configurado para desarrollo, no para producción

### Para Mayor Seguridad
- 🔐 Configurar autenticación adicional
- 🔐 Usar HTTPS en producción
- 🔐 Configurar VPN para acceso remoto

## 📞 Soporte

Si encuentras problemas:
1. Verificar los logs en las ventanas de terminal
2. Revistar esta guía paso a paso
3. Verificar que todos los servicios estén ejecutándose
4. Confirmar configuración de red y firewall

---

## 🎉 ¡Sistema Listo!

Una vez completados estos pasos, tu sistema SIVAC estará disponible para todas las PCs en tu red local de manera profesional y rápida.

**URLs de acceso rápido:**
- Sistema principal: http://[TU-IP]:5173
- API de salud: http://[TU-IP]:3001/health
- Documentación API: http://[TU-IP]:3001/api
