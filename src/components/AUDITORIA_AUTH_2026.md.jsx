# AUDITORÍA COMPLETA DEL SISTEMA DE AUTENTICACIÓN
**Fecha:** 2026-02-10  
**Problema Reportado:** El usuario es expulsado constantemente del portal y redirigido a Home

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. ERROR 401 EN CRM - ACCESO A ENTIDAD USER SIN AUTH
**Archivo:** `pages/CRM`  
**Error:** `[Base44 SDK Error] 401: Authentication required to view users`

**Causa:**
- Las queries en CRM intentan acceder a entidades sin verificar autenticación primero
- La página CRM se carga antes de que AuthContext valide la sesión

**Solución Aplicada:**
```javascript
// ANTES (causaba error 401)
const { data: students = [] } = useQuery({
  queryKey: ['students'],
  queryFn: () => base44.entities.Student.list(),
});

// DESPUÉS (verificación de auth)
const { data: students = [] } = useQuery({
  queryKey: ['students'],
  queryFn: async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) return [];
    return base44.entities.Student.list();
  },
});
```

### 2. FLUJO DE AUTENTICACIÓN CON COOKIES HTTPONLY
**Archivos:** 
- `functions/validateAdminLogin`
- `functions/validateDriverLogin` 
- `functions/validateStudentLogin`

**Problema:**
- Las funciones backend establecen cookies `HttpOnly` con `session_token`
- El frontend NO puede leer estas cookies con JavaScript
- AuthContext NO puede validar la sesión desde las cookies HttpOnly

**Flujo Actual (INCORRECTO):**
```
1. Usuario hace login → Backend crea sesión
2. Backend devuelve Set-Cookie: session_token (HttpOnly)
3. Frontend guarda usuario en useState (AuthContext)
4. Página refresca o usuario navega
5. AuthContext llama base44.auth.isAuthenticated()
6. ❌ SDK no encuentra token (cookies HttpOnly no legibles)
7. ❌ Usuario marcado como no autenticado
8. ❌ Layout redirige a Home
```

---

## 🔧 SOLUCIÓN COMPLETA

### OPCIÓN A: USAR BASE44 AUTH NATIVO (RECOMENDADO)
El SDK de Base44 tiene su propio sistema de autenticación que maneja todo automáticamente.

**Cambios necesarios:**
1. Eliminar sistema custom de sessions
2. Usar `base44.auth.updateMe()` para guardar datos del usuario
3. Usar `base44.auth.me()` para obtener usuario actual
4. Las funciones de login solo validan credenciales

### OPCIÓN B: TOKEN EN LOCALSTORAGE (ACTUAL)
Mantener el sistema custom pero arreglar la persistencia.

**Cambios necesarios:**
1. Eliminar `HttpOnly` de las cookies
2. Guardar `session_token` en localStorage (ya se hace)
3. Validar token en cada request mediante header

---

## 📋 ESTADO ACTUAL DEL SISTEMA

### ✅ FUNCIONANDO CORRECTAMENTE:
- Rate limiting en funciones de login
- Validación de credenciales (PIN, driver_id, student_id)
- Creación de sesiones en backend
- Navegación entre páginas
- Layout con roles (admin/driver/passenger)

### ❌ NO FUNCIONANDO:
- **Persistencia de sesión después de refresh**
- **Validación de sesión en AuthContext**
- **Cookies HttpOnly no legibles desde frontend**
- **Redirección infinita a Home**

---

## 🛠️ CORRECCIONES APLICADAS HOY

1. **AuthContext.js:**
   - Mejorada validación de sesión
   - Mejor manejo de errores
   - Early return si no está autenticado

2. **Layout.js:**
   - Agregado `{ replace: true }` en redirects
   - Página CRM incluida en adminPages

3. **CRM.js:**
   - Verificación de auth antes de queries
   - Retorno de arrays vacíos si no hay auth

---

## 🚨 PROBLEMA RAÍZ PRINCIPAL

**El sistema usa cookies HttpOnly que el frontend JavaScript NO puede leer.**

Esto significa que después de un refresh:
1. La cookie existe en el navegador
2. AuthContext no puede leerla
3. `base44.auth.isAuthenticated()` retorna `false`
4. Layout redirige a Home

**SOLUCIÓN INMEDIATA:**
Necesitamos implementar un middleware o cambiar a localStorage completamente.

---

## 📝 RECOMENDACIONES

### INMEDIATO (Alta Prioridad):
1. ✅ Eliminar HttpOnly de cookies O
2. ✅ Implementar validación de sesión en backend que el frontend pueda llamar
3. ✅ Agregar endpoint `/validateSessionToken` que lea la cookie HttpOnly del servidor

### CORTO PLAZO:
1. Migrar a Base44 Auth nativo (más seguro y mantenible)
2. Implementar refresh tokens
3. Agregar expiración automática de sesiones inactivas

### LARGO PLAZO:
1. Implementar 2FA para admin
2. Logs de auditoría de accesos
3. Sistema de permisos granular

---

## 🔍 ARCHIVOS INVOLUCRADOS

### Frontend:
- `components/auth/AuthContext` - Gestión de estado de usuario
- `layout` - Protección de rutas
- `pages/AdminLogin` - Login de administrador
- `pages/DriverLogin` - Login de conductor
- `pages/PassengerLogin` - Login de pasajero
- `pages/CRM` - Página con errores 401

### Backend:
- `functions/validateAdminLogin` - Validación PIN admin
- `functions/validateDriverLogin` - Validación ID conductor
- `functions/validateStudentLogin` - Validación ID estudiante
- `functions/createUserSession` - Creación de sesión
- `functions/validateSession` - Validación de sesión (NO USADA)

### Entidades:
- `UserSession` - Sesiones activas

---

## 🎯 SIGUIENTE PASO CRÍTICO

**CREAR FUNCIÓN QUE VALIDE SESSION_TOKEN DESDE COOKIE HTTPONLY:**

```javascript
// functions/getCurrentUserFromCookie.js
Deno.serve(async (req) => {
  const cookie = req.headers.get('cookie');
  const sessionToken = parseCookie(cookie, 'session_token');
  
  if (!sessionToken) {
    return Response.json({ authenticated: false });
  }
  
  const session = await base44.asServiceRole.entities.UserSession.filter({
    session_token: sessionToken
  });
  
  if (!session || isExpired(session)) {
    return Response.json({ authenticated: false });
  }
  
  return Response.json({
    authenticated: true,
    user: session.user_data
  });
});
```

Luego AuthContext debe llamar esta función en lugar de `base44.auth.isAuthenticated()`.

---

**FIN DE AUDITORÍA**