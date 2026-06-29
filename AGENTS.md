# AGENTS.md — Proyecto IA

Proyecto React con Vite + Supabase (Auth + Base de datos).

## Comandos

- **Iniciar servidor dev:** `npm run dev`
- **Build producción:** `npm run build`
- **Preview build:** `npm run preview`
- **Abrir en navegador:** `start http://localhost:5173` (Windows)
- **Activar venv:** `venv\Scripts\activate` (Windows) o `source venv/bin/activate` (macOS/Linux)
- No hay scripts de lint ni typecheck.

## Variables de entorno

- `VITE_SUPABASE_URL` — URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY` — API key anónima pública

## Estilo (respetar siempre)

- Fondo: gradiente `#0a1628` → `#1a5276` — azul marino oscuro a azul medio.
- Header: fondo `rgba(0,0,0,0.25)` con logo blanco y enlaces blancos semitransparentes.
- Formulario: fondo blanco semitransparente, inputs con borde `#d0d7de` y foco `#1a5276`, botón `#1a5276` que oscurece a `#0d2c45` en hover.
- Tipografía: `'Segoe UI', sans-serif`.
- No cambiar colores ni agregar otros sin confirmación.
- Después de cada cambio, preguntar al usuario si está conforme o si quiere revertirlo.

## Despliegue en Vercel

- `vercel.json` en la raíz con framework Vite.
- Las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` deben configurarse en el dashboard de Vercel (Project > Settings > Environment Variables).
- `npm run build` genera la carpeta `dist/` que Vercel despliega automáticamente.

## Ramas

- `main` — producción.
- `development` — rama principal de trabajo.
- `registro-y-verificacion-de-correo` — rama para registro + verificación por correo.
- `apartado-admin-registro` — rama activa para panel de administración de admins.
- `cotizaciones-admin` — apartado de cotizaciones para admin (cards, filtros, aceptar/rechazar).
- `cotizaciones-clientes` — funcionalidades cliente: motivo rechazo, cancelar, imprimir.

## Notas

- **Siempre leer este archivo (AGENTS.md) primero** cuando alguien pregunte algo, escriba un mensaje o asigne una tarea.
- Build con Vite. Sin framework de CSS.
- No hay tests configurados.
- `.env` está en `.gitignore` — las credenciales de Supabase nunca se suben al repositorio.
- **Preguntar siempre antes** de ejecutar cualquier operación de Git (commit, push, pull, merge, cambiar de rama, etc.).
- **⚠️ Alerta al crear ramas nuevas:** Si se crea una rama desde `development`, puede que no incluya funcionalidades que existen en otras ramas (ej: `apartado-admin-registro`). Siempre verificar que la rama base tenga todo lo necesario o hacer merge de las ramas faltantes.
- Si se agregan herramientas (linter, tester, etc.), documentar comandos aquí.

## Flujo de registro

1. Usuario llena formulario (nombre, email, password con requisitos).
2. Se valida que el email no exista en `Clientes` (onBlur + submit).
3. `INSERT` en tabla `Clientes` (Name, Email, Password).
4. `supabase.auth.signInWithOtp({ email })` envía código de 8 dígitos al correo.
5. Usuario ingresa el código en la pantalla de verificación (8 inputs individuales).
6. `supabase.auth.verifyOtp()` confirma el código.
7. Usuario es redirigido al login.

## Login

- Busca por `Usuario` + `Password` primero en `Admins`, luego por `Name` + `Password` en `Clientes`.
- Si es admin, se normaliza `Name: admin.Nombre || admin.Usuario` para mostrar en Dashboard.
- La comparación de nombre/usuario es case-insensitive (`ilike`).
- RLS requiere políticas SELECT `TO public` en ambas tablas.

## Estructura

```
.env               → credenciales de Supabase
index.html          → shell de Vite (título: "SUPP")
src/
├── main.jsx        → entry point de React
├── App.jsx         → componente principal (login + auth + registro + verificación)
├── App.css         → estilos del sitio (incluye verify-box, code-inputs, req-list, email-taken)
├── index.css       → reset global
├── Dashboard.jsx   → panel post-login
├── Dashboard.css   → estilos del dashboard
└── lib/
    └── supabase.js → cliente de Supabase
```

## Versionado Semántico (SemVer)

Este proyecto sigue [SemVer 2.0.0](https://semver.org/lang/es/). Formato: `MAYOR.MENOR.PARCHE`.

| Incremento | Cuándo aplica | Ejemplo |
|---|---|---|
| **MAYOR** | Cambios incompatibles en API/funcionalidad que rompen compatibilidad con versiones anteriores | `1.0.0` → `2.0.0` |
| **MENOR** | Nueva funcionalidad compatible con versiones anteriores | `1.0.0` → `1.1.0` |
| **PARCHE** | Corrección de errores compatible con versiones anteriores | `1.0.0` → `1.0.1` |

- Versiones `0.y.z` = desarrollo inicial, todo puede cambiar.
- Prelanzamiento: `-alpha`, `-beta`, `-rc.1`, etc.
- Antes de cada cambio se indicará qué tipo de incremento corresponde y la versión resultante.
- La versión en `package.json` se actualiza solo cuando se acuerde.

## Environment Badge

- En la esquina inferior derecha de **todas las páginas** se muestra un badge con el entorno (`Staging`) y la versión (`v0.0.1`).
- Está implementado en `App.jsx` como `<div className="env-badge">` y se renderiza siempre, sin importar la página o el estado de autenticación.
- **Toda nueva página o componente** debe agregarse dentro de la estructura renderizada por `App.jsx` (dentro del fragmento principal) para que herede automáticamente el badge. No crear layouts independientes que omitan `App.jsx`.
- Estilos del badge en `App.css` (clases `.env-badge`, `.env-badge-label`, `.env-badge-version`).
- La versión se obtiene automáticamente de `package.json` mediante `import { version } from '../package.json'`. Para cambiar la versión, actualizar `package.json`.
