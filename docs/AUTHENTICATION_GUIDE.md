# Guía de Autenticación - Sistema SIVAC

## 🔐 Problema: Error 401 (Unauthorized)

Si estás viendo errores como:
```
GET http://localhost:3001/api/redes? 401 (Unauthorized)
Error fetching redes: Error: Error 401: Unauthorized
```

Esto significa que **necesitas iniciar sesión** en el sistema antes de poder acceder a los módulos.

## 🚀 Solución: Iniciar Sesión

### Paso 1: Verificar que el Backend esté Ejecutándose

Asegúrate de que el servidor backend esté corriendo:

```bash
# En la carpeta backend/
cd backend
npm run dev
```

El servidor debería estar ejecutándose en `http://localhost:3001`

### Paso 2: Verificar que la Base de Datos esté Configurada

Si es la primera vez que ejecutas el sistema, necesitas configurar la base de datos:

```bash
# En la carpeta backend/
cd backend

# Generar la base de datos
npx prisma generate
npx prisma db push

# Poblar con datos de prueba (incluye usuarios)
npx prisma db seed
```

### Paso 3: Acceder al Sistema

1. **Abrir la aplicación**: Ve a `http://localhost:5173` (o el puerto donde esté corriendo Vite)

2. **Pantalla de Login**: El sistema automáticamente te mostrará la pantalla de login si no estás autenticado

3. **Usar credenciales de prueba**: Utiliza una de estas cuentas creadas automáticamente:

## 👥 Usuarios de Prueba Disponibles

### Administrador del Sistema
- **Usuario**: `admin`
- **Contraseña**: `Admin123!`
- **Rol**: Administrador (acceso completo)
- **Email**: admin@saludapurimac.gob.pe

### Coordinador Regional
- **Usuario**: `mrodriguez`
- **Contraseña**: `Coord123!`
- **Rol**: Coordinador
- **Email**: coordinadora@saludapurimac.gob.pe

### Responsables de Acopio
- **Usuario**: `cmendoza`
- **Contraseña**: `Resp123!`
- **Rol**: Responsable de Acopio
- **Email**: cmendoza@saludapurimac.gob.pe

### Operadores
- **Usuario**: `rcondori`
- **Contraseña**: `Oper123!`
- **Rol**: Operador
- **Email**: rcondori@saludapurimac.gob.pe

## 🔧 Solución de Problemas

### Error: "Sesión expirada"
Si ves el mensaje "Sesión expirada. Por favor, inicie sesión nuevamente":

1. **Automático**: El sistema limpiará automáticamente los tokens inválidos
2. **Manual**: Puedes limpiar manualmente el localStorage:
   ```javascript
   // En la consola del navegador (F12)
   localStorage.clear();
   location.reload();
   ```

### Error: Backend no responde
Si el backend no responde:

1. **Verificar puerto**: Asegúrate de que el backend esté en `http://localhost:3001`
2. **Verificar logs**: Revisa la consola del backend para errores
3. **Reiniciar**: Reinicia el servidor backend

### Error: Base de datos no configurada
Si hay errores de base de datos:

1. **Verificar archivo .env**: Asegúrate de que `DATABASE_URL` esté configurado
2. **Regenerar base de datos**:
   ```bash
   cd backend
   npx prisma db push --force-reset
   npx prisma db seed
   ```

## 🎯 Flujo de Autenticación

### 1. Usuario No Autenticado
- El sistema detecta que no hay token válido
- Muestra automáticamente la pantalla de login
- No se pueden acceder a los módulos protegidos

### 2. Proceso de Login
- Usuario ingresa credenciales
- Sistema valida con el backend
- Si es exitoso, guarda token en localStorage
- Redirige al dashboard principal

### 3. Usuario Autenticado
- Todas las peticiones incluyen el token de autorización
- Acceso completo a los módulos según el rol
- Token se renueva automáticamente

### 4. Expiración de Sesión
- Si el token expira, se muestra mensaje de sesión expirada
- Tokens inválidos se limpian automáticamente
- Usuario debe iniciar sesión nuevamente

## 📋 Verificación del Sistema

### Verificar que Todo Funciona:

1. **Backend corriendo**: `http://localhost:3001/api/health` debería responder
2. **Frontend corriendo**: `http://localhost:5173` debería cargar
3. **Base de datos**: Debería tener usuarios de prueba
4. **Login**: Debería poder iniciar sesión con `admin` / `Admin123!`
5. **Módulos**: Después del login, debería poder acceder a Establecimientos

## 🔒 Seguridad

### Tokens de Autenticación
- **JWT**: Se usa JSON Web Tokens para autenticación
- **Expiración**: Los tokens tienen tiempo de vida limitado
- **Renovación**: Se renuevan automáticamente cuando es posible
- **Limpieza**: Tokens inválidos se eliminan automáticamente

### Roles y Permisos
- **Administrador**: Acceso completo a todos los módulos
- **Coordinador**: Acceso a gestión y reportes
- **Responsable de Acopio**: Acceso a su centro asignado
- **Operador**: Acceso limitado a operaciones básicas

## 📞 Soporte

Si continúas teniendo problemas:

1. **Verificar logs**: Revisa la consola del navegador (F12) y del backend
2. **Limpiar caché**: Limpia localStorage y cookies del navegador
3. **Reiniciar servicios**: Reinicia tanto frontend como backend
4. **Verificar configuración**: Revisa archivos .env y configuración de base de datos

## ✅ Estado Esperado Después del Login

Una vez que inicies sesión correctamente:

- ✅ No más errores 401 (Unauthorized)
- ✅ Acceso al módulo de Establecimientos
- ✅ Navegación entre Redes → Microredes → Centros de Acopio
- ✅ Operaciones CRUD funcionando correctamente
- ✅ Datos de prueba visibles en las tablas

¡El sistema CRUD jerárquico estará completamente funcional!
