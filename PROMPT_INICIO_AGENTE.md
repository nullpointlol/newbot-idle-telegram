# 🚀 PROMPT DE INICIO DE PROYECTO PARA AGENTE DE DESARROLLO (AUTÓNOMO)

Actúa como Tech Lead y Desarrollador Full-Stack Senior. Vas a implementar de forma autónoma el proyecto digital diseñado y validado por el Board de Arquitectura y Deliberación Colegiada de SociocrAI.

---

## 📌 1. INFORMACIÓN Y UBICACIÓN FÍSICA DEL PROYECTO
- **Proyecto ID**: `proj_1791433410091`
- **Título / Slug**: `actua-como-arquitecto-de-software-y-estratega`
- **Objetivo Central**:
  "Actúa como arquitecto de software y estratega de crecimiento digital para diseñar un ecosistema en Telegram enfocado en capitalizar tiempo y atención de usuarios mediante mecánicas incrementales y encuestas interactivas sin venta forzada. El producto debe funcionar como un bot conectado a una Telegram Mini App construida sobre un bucle matemático pasivo idéntico al de Adventure Capitalist, monetizado con anuncios de recompensa mediante la red Adsgram y micropagos con Telegram Stars para aceleradores cosméticos. Analiza y compara a fondo las bases técnicas listas para acelerar la producción visual y lógica, evaluando repositorios de código abierto de Telegram Mini App clicker basados en React y Node, exportaciones ligeras a HTML5 generadas desde Construct 3 o Godot Engine, y la persistencia de datos relacionales en PostgreSQL o Supabase con Redis para el procesamiento de colas y sesiones. Diseña la lógica matemática exacta del juego abarcando la tasa de generación por segundo, el cálculo de ganancias fuera de línea comparando marcas de tiempo Unix y el reinicio por prestigio que otorga multiplicadores permanentes. Para la distribución masiva y automatizada, estructura un sistema viral de referidos con enlaces profundos donde ambos usuarios ganan bonificaciones, un módulo de tareas automáticas que verifique suscripciones a canales patrocinados a través de la API oficial de Telegram para liberar multiplicadores temporales, y un sistema de difusión programada que respete los límites de peticiones del protocolo para reactivar jugadores inactivos con avisos de producción acumulada. Entrega una comparativa técnica detallada de cada plantilla, el esquema de tablas de base de datos, los requerimientos de servidor y el plan de lanzamiento paso a paso enfocado en retención masiva."
- **Directorio Raíz de Especificaciones Técnicas y Backlog**:
  `C:\Users\x\Downloads\Projects\board\projects\actua-como-arquitecto-de-software-y-estratega`
- **Base de Datos SQLite de Origen (Referencia / Trazabilidad)**:
  `C:\Users\x\Downloads\Projects\board\data\sociocrai.db` (Tabla: `task_cards`)
- **Total de Tareas Técnicas Aprobadas**: 136 tareas (100% Consenso)

---

## 📂 2. ARCHIVOS QUE DEBES EXAMINAR Y CLONAR
En el directorio `C:\Users\x\Downloads\Projects\board\projects\actua-como-arquitecto-de-software-y-estratega` se encuentran todos los archivos generados listos para producción:

1. `DOCUMENTO_MAESTRO.md`:
   - Especificación Técnico-Funcional formal (PRD/SRS).
   - Visión de negocio, arquitectura estructural, modelo de entidades, matriz de seguridad OWASP y requerimientos con criterios de aceptación Gherkin (`Dado / Cuando / Entonces`).
2. `PLANIFICACION_UNICA.md`:
   - Hoja de ruta cronológica por fases (Fase 1: MVP Core, Fase 2: Resiliencia & Seguridad, Fase 3: Facturación, Fase 4: Rendimiento).
   - Matriz de riesgos, Definition of Done (DoD) y dependencias críticas.
3. `tasks.json`:
   - Lista estructurada en JSON de las 136 tareas técnicas aprobadas.
   - Cada tarea incluye: `id`, `title`, `phase`, `severity`, `technicalSpec`, `acceptanceCriteria` e `developerInstructions`.
4. `project.json`:
   - Manifiesto completo con metadatos del proyecto.
5. `DEVELOPER_HANDOFF.md`:
   - Guía ejecutiva para el desarrollador.

---

## ⚡ 3. PASO 1: COPIAR LOS ARCHIVOS A TU ESPACIO DE TRABAJO
Ejecuta el siguiente comando en tu terminal para clonar todos los archivos de especificación en el directorio donde vas a programar el proyecto:

### En Windows (PowerShell):
```powershell
Copy-Item -Path "C:\Users\x\Downloads\Projects\board\projects\actua-como-arquitecto-de-software-y-estratega\*" -Destination . -Recurse -Force
```

### En Bash / Linux / macOS:
```bash
cp -r "C:/Users/x/Downloads/Projects/board/projects/actua-como-arquitecto-de-software-y-estratega/"* .
```

---

## 🛠️ 4. PASO 2: SECUENCIA DE ACCIÓN Y DESARROLLO

1. **Lectura y Apropiación**:
   - Lee `PLANIFICACION_UNICA.md` y `DOCUMENTO_MAESTRO.md` para comprender el modelo de datos, la arquitectura y los estándares no funcionales.
2. **Desarrollo Guiado por Fases (TDD / Clean Code)**:
   - Comienza estrictamente por la **Fase 1: MVP Core** utilizando las tareas definidas en `tasks.json`.
   - Para cada tarea técnica:
     - Implementa el código cumpliendo la especificación técnica (`technicalSpec`).
     - Asegura que se cumplan estrictamente los criterios de aceptación Gherkin (`acceptanceCriteria`).
     - Aplica las directivas de `developerInstructions`.
3. **Persistencia y Calidad**:
   - No requieres conectarte a la base de datos SQLite del board (`sociocrai.db`); toda la información técnica ya está en `tasks.json` y el Markdown.
   - Estructura el código de forma modular y desacoplada.
4. **Verificación**:
   - Al completar las tareas de cada fase, ejecuta pruebas unitarias/integración para garantizar cero regresiones antes de pasar a la siguiente fase del roadmap.

---

👉 **INSTRUCCIÓN INMEDIATA**:
Copia los archivos a tu espacio de trabajo con el comando indicado, confírmame que los tienes disponibles y muéstrame el plan de ejecución con el que comenzarás la Fase 1.