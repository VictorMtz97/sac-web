# AGENTS.md — Proyecto IA

Proyecto React con Vite + Supabase (Auth + Base de datos).

## Comandos

- **Iniciar servidor dev:** `npm run dev`
- **Build producción:** `npm run build`
- **Preview build:** `npm run preview`
- **Abrir en navegador:** `start http://localhost:5173` (Windows)
- **Activar venv:** `venv\Scripts\activate` (Windows) o `source venv/bin/activate` (macOS/Linux)
- No hay scripts de lint ni typecheck.

## Estructura

```
.env               → credenciales de Supabase
index.html          → shell de Vite (título: "SUPP")
src/
├── main.jsx        → entry point de React
├── App.jsx         → componente principal (login + auth)
├── App.css         → estilos del sitio
├── index.css       → reset global
└── lib/
    └── supabase.js → cliente de Supabase
```

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

## Notas

- **Siempre leer este archivo (AGENTS.md) primero** cuando alguien pregunte algo, escriba un mensaje o asigne una tarea.
- **Trabajar siempre en la rama `development`**, nunca en `main`.
- Build con Vite. Sin framework de CSS.
- No hay tests configurados.
- `.env` está en `.gitignore` — las credenciales de Supabase nunca se suben al repositorio.
- **Preguntar siempre antes** de ejecutar cualquier operación de Git (commit, push, pull, merge, cambiar de rama, etc.).
- Si se agregan herramientas (linter, tester, etc.), documentar comandos aquí.
