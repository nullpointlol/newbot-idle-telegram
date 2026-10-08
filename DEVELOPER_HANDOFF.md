# Actúa como arquitecto de software y estratega de crecimiento digital para diseñar un ecosistema en Telegram enfocado en capitalizar tiempo y atención de usuarios mediante mecánicas incrementales y encuestas interactivas sin venta forzada. El producto debe funcionar como un bot conectado a una Telegram Mini App construida sobre un bucle matemático pasivo idéntico al de Adventure Capitalist, monetizado con anuncios de recompensa mediante la red Adsgram y micropagos con Telegram Stars para aceleradores cosméticos. Analiza y compara a fondo las bases técnicas listas para acelerar la producción visual y lógica, evaluando repositorios de código abierto de Telegram Mini App clicker basados en React y Node, exportaciones ligeras a HTML5 generadas desde Construct 3 o Godot Engine, y la persistencia de datos relacionales en PostgreSQL o Supabase con Redis para el procesamiento de colas y sesiones. Diseña la lógica matemática exacta del juego abarcando la tasa de generación por segundo, el cálculo de ganancias fuera de línea comparando marcas de tiempo Unix y el reinicio por prestigio que otorga multiplicadores permanentes. Para la distribución masiva y automatizada, estructura un sistema viral de referidos con enlaces profundos donde ambos usuarios ganan bonificaciones, un módulo de tareas automáticas que verifique suscripciones a canales patrocinados a través de la API oficial de Telegram para liberar multiplicadores temporales, y un sistema de difusión programada que respete los límites de peticiones del protocolo para reactivar jugadores inactivos con avisos de producción acumulada. Entrega una comparativa técnica detallada de cada plantilla, el esquema de tablas de base de datos, los requerimientos de servidor y el plan de lanzamiento paso a paso enfocado en retención masiva.
> **Objetivo:** Actúa como arquitecto de software y estratega de crecimiento digital para diseñar un ecosistema en Telegram enfocado en capitalizar tiempo y atención de usuarios mediante mecánicas incrementales y encuestas interactivas sin venta forzada. El producto debe funcionar como un bot conectado a una Telegram Mini App construida sobre un bucle matemático pasivo idéntico al de Adventure Capitalist, monetizado con anuncios de recompensa mediante la red Adsgram y micropagos con Telegram Stars para aceleradores cosméticos. Analiza y compara a fondo las bases técnicas listas para acelerar la producción visual y lógica, evaluando repositorios de código abierto de Telegram Mini App clicker basados en React y Node, exportaciones ligeras a HTML5 generadas desde Construct 3 o Godot Engine, y la persistencia de datos relacionales en PostgreSQL o Supabase con Redis para el procesamiento de colas y sesiones. Diseña la lógica matemática exacta del juego abarcando la tasa de generación por segundo, el cálculo de ganancias fuera de línea comparando marcas de tiempo Unix y el reinicio por prestigio que otorga multiplicadores permanentes. Para la distribución masiva y automatizada, estructura un sistema viral de referidos con enlaces profundos donde ambos usuarios ganan bonificaciones, un módulo de tareas automáticas que verifique suscripciones a canales patrocinados a través de la API oficial de Telegram para liberar multiplicadores temporales, y un sistema de difusión programada que respete los límites de peticiones del protocolo para reactivar jugadores inactivos con avisos de producción acumulada. Entrega una comparativa técnica detallada de cada plantilla, el esquema de tablas de base de datos, los requerimientos de servidor y el plan de lanzamiento paso a paso enfocado en retención masiva.  
> **Identificador:** `proj_1791433410091` | **Slug:** `actua-como-arquitecto-de-software-y-estratega`  
> **Estado:** running (136 tareas aprobadas)

## Instrucciones para el Desarrollador (Asistente de IA)
Este paquete contiene todas las decisiones arquitectónicas, requerimientos técnicos y criterios de aceptación consensuados por el ecosistema deliberativo de SociocrAI.

### Archivos Incluidos:
1. `DOCUMENTO_MAESTRO.md`: Especificación funcional formal punta a punta (PRD/SRS) con criterios de aceptación Gherkin.
2. `PLANIFICACION_UNICA.md`: Hoja de ruta secuencial fase por fase con Definition of Done (DoD).
3. `tasks.json`: Lista completa de tareas técnicas estructuradas para consumir directamente en un ciclo de desarrollo sin dependencias.
4. `PROMPT_INICIO_AGENTE.md`: Prompt integral listo para copiar y pegar en un agente externo (Antigravity/Cursor/Aider).
5. `project.json`: Manifiesto completo con metadatos del proyecto.

### Base de Datos Relacional de Origen (Trazabilidad y Queries SQL):
- **Ubicación del archivo SQLite**: `C:\Users\x\Downloads\Projects\board\data\sociocrai.db`
- **Tabla**: `task_cards`
- **Query SQL para extraer tareas directamente**:
  ```sql
  SELECT id, title, severity, phase, assigned_area, owner_agent, 
         technical_spec, acceptance_criteria, developer_instructions, status
  FROM task_cards 
  WHERE project_id = 'proj_1791433410091' AND status = 'approved'
  ORDER BY id ASC;
  ```

### ¿Es necesario conectarse a la base de datos para desarrollar?
**No es necesario.** La documentación (`DOCUMENTO_MAESTRO.md`), la planificación (`PLANIFICACION_UNICA.md`) y el archivo `tasks.json` contienen el 100% de la información técnica, funcional y de negocio requerida para que cualquier agente de IA (Antigravity, Cursor, Claude Code, Aider, etc.) implemente el proyecto sin dependencias de base de datos.
La referencia a la base de datos SQLite se proporciona para automatización por lotes, consultas SQL avanzadas o sincronización bidireccional.

### Cómo comenzar el desarrollo en un nuevo repositorio/carpeta:
1. Copia estos archivos o utiliza la herramienta de exportación:
   ```bash
   node C:\Users\x\Downloads\Projects\board\tools\get-project.js actua-como-arquitecto-de-software-y-estratega <directorio_destino>
   ```
2. O ejecuta el comando de clonación rápida desde PowerShell:
   ```powershell
   Copy-Item -Path "C:\Users\x\Downloads\Projects\board\projects\actua-como-arquitecto-de-software-y-estratega\*" -Destination . -Recurse -Force
   ```
3. Comienza implementando secuencialmente desde **TASK-01** hasta **TASK-136**.
