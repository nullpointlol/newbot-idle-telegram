# DOCUMENTO TÉCNICO-FUNCIONAL MAESTRO (v33.0)
> **ESTADO**: APROBADO POR EL 100% DE LAS ÁREAS (UNANIMIDAD ABSOLUTA)  
> **PROYECTO ID**: `proj_1791433410091`  
> **FECHA DE ACTUALIZACIÓN**: 2026-10-08T22:21:16.382Z  
> **GOBERNANZA**: Aprobación colegiada sin objeciones bloqueantes de daño operativo.

---

## 1. Visión de Negocio y Alineación con el Cliente (Business Owner)
- **Objetivo Central**: Actúa como arquitecto de software y estratega de crecimiento digital para diseñar un ecosistema en Telegram enfocado en capitalizar tiempo y atención de usuarios mediante mecánicas incrementales y encuestas interactivas sin venta forzada. El producto debe funcionar como un bot conectado a una Telegram Mini App construida sobre un bucle matemático pasivo idéntico al de Adventure Capitalist, monetizado con anuncios de recompensa mediante la red Adsgram y micropagos con Telegram Stars para aceleradores cosméticos. Analiza y compara a fondo las bases técnicas listas para acelerar la producción visual y lógica, evaluando repositorios de código abierto de Telegram Mini App clicker basados en React y Node, exportaciones ligeras a HTML5 generadas desde Construct 3 o Godot Engine, y la persistencia de datos relacionales en PostgreSQL o Supabase con Redis para el procesamiento de colas y sesiones. Diseña la lógica matemática exacta del juego abarcando la tasa de generación por segundo, el cálculo de ganancias fuera de línea comparando marcas de tiempo Unix y el reinicio por prestigio que otorga multiplicadores permanentes. Para la distribución masiva y automatizada, estructura un sistema viral de referidos con enlaces profundos donde ambos usuarios ganan bonificaciones, un módulo de tareas automáticas que verifique suscripciones a canales patrocinados a través de la API oficial de Telegram para liberar multiplicadores temporales, y un sistema de difusión programada que respete los límites de peticiones del protocolo para reactivar jugadores inactivos con avisos de producción acumulada. Entrega una comparativa técnica detallada de cada plantilla, el esquema de tablas de base de datos, los requerimientos de servidor y el plan de lanzamiento paso a paso enfocado en retención masiva.
- **Propósito y Visión de Producto**: Monetizar la atención y el tiempo de usuarios de Telegram mediante un ecosistema de juego incremental de alta retención, integrando publicidad recompensada y microtransacciones para un crecimiento viral y escalable.
- **Usuarios Objetivo & Valor Operativo**: Usuarios casuales de Telegram que buscan entretenimiento de baja fricción, progresión pasiva y recompensas digitales. — *Transforma el tiempo de inactividad del usuario en ingresos mediante mecánicas de juego automatizadas, publicidad integrada y sistemas de referidos virales.*
- **Límites de Alcance Acordados**: Incluye: Mini App, lógica matemática de idle, sistema de referidos y monetización. Excluye: Juegos AAA, multijugador competitivo en tiempo real o integraciones fuera del ecosistema Telegram.

---

## 2. Arquitectura de Solución y Relevamiento de Dominio (Arquitecto de Soluciones)
- **Solución Estructural**: Event-driven architecture. Frontend: React or HTML5 (Godot/Construct 3) via TMA. Backend: Node.js. Data: Supabase (PostgreSQL) with Redis for session/queue management. Integrations: Telegram Bot API, Adsgram SDK, and Telegram Stars/WebApp API.
- **Modelo de Entidades de Dominio**: User (balance, prestige), Asset (level, rate, cost), Transaction (ads, stars, referral), Task (status, multiplier), and Referral (linkage). Relationships: Users own assets, trigger transactions, complete tasks, and drive referral growth.
- **Requerimientos No Funcionales (NFRs)**: High availability for mass scaling, sub-second latency for game state, strict anti-cheat integrity, secure Telegram Stars processing, and comprehensive auditability for all financial and transactional movements.
- **Límites y Contratos**: Interfaces REST/JSON estrictamente tipadas con validación defensiva en capa de transporte.
- **Rendimiento Garantizado**: Consumo acotado (< 25MB RAM), arranque autónomo y respuestas de interfaz < 50ms.

---

## 3. Modelo de Persistencia, Datos y Trazabilidad del Backlog
- **Ubicación de la Base de Datos SQLite**: `C:\Users\x\Downloads\Projects\board\data\sociocrai.db`
- **Tabla Relacional de Requerimientos**: `task_cards` (Clave de filtrado: `project_id = 'proj_1791433410091'`)
- **Consulta SQL de Extracción para Agentes de Desarrollo**:
  ```sql
  SELECT id, title, severity, phase, assigned_area, owner_agent, 
         technical_spec, acceptance_criteria, developer_instructions, status
  FROM task_cards 
  WHERE project_id = 'proj_1791433410091' AND status = 'approved'
  ORDER BY 
    CASE phase 
      WHEN 'MVP_CORE' THEN 1 
      WHEN 'RESILIENCE_SECURITY' THEN 2 
      WHEN 'BILLING_OPERATIONS' THEN 3 
      WHEN 'SCALE_PERF' THEN 4 
      ELSE 5 
    END,
    id ASC;
  ```
- **Exportación Estructurada Desacoplada**: Archivo `projects/proj_1791433410091/tasks.json` con todas las especificaciones.
- **Modo de Concurrencia**: SQLite relacional con transacciones ACID en modo WAL (Write-Ahead Logging).

---

## 4. Requerimientos Funcionales Aprobados (136 en Backlog)

### 1. [CRITICAL] Esquema relacional PostgreSQL y Redis para persistencia y sesiones (`TCK-0091-C1-01`)
- **Fase**: `MVP_CORE` | **Área Asignada**: **Arquitectura** (Owner: `data_arch`)
- **Especificación Técnica**: Tablas `users` (con columna `version`), `assets`, `transactions`, `tasks` y `referrals` en Supabase. Mutaciones de balance en Redis validadas vía Redlock. Sincronización asíncrona a PostgreSQL ejecutada mediante transacciones serializables y lógica "compare-and-swap" para evitar condiciones de carrera en el cálculo pasivo.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario acumula recursos, Cuando se actualice el balance en Redis, Entonces se sincronizará transaccionalmente en PostgreSQL sin pérdida de datos.


### 2. [HIGH] Implementación de lógica matemática idle y cálculo offline (`TCK-0091-C1-02`)
- **Fase**: `MVP_CORE` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Desarrollar algoritmo en Node.js que calcule ganancias offline usando la fórmula de progresión geométrica basada en la diferencia de timestamps Unix.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario regresa tras horas de ausencia, Cuando el backend procesa su timestamp, Entonces calcula y acredita exactamente el recurso acumulado.


### 3. [HIGH] Integración del SDK de Adsgram y pasarela de Telegram Stars (`TCK-0091-C1-03`)
- **Fase**: `MVP_CORE` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar endpoints Node.js con control de unicidad para Stars, SDK Adsgram con manejo de fallos de red y matriz de pruebas automatizadas QA.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario visualiza un anuncio o paga con Stars, Cuando el SDK/webhook responde con éxito, Entonces se acredita el multiplicador o acelerador.


### 4. [MEDIUM] Módulo de referidos profundos y verificación de tareas automáticas (`TCK-0091-C1-04`)
- **Fase**: `MVP_CORE` | **Área Asignada**: **Desarrollo** (Owner: `solution_arch`)
- **Especificación Técnica**: Aceptar escenarios Gherkin separados. Validar idempotencia en Supabase mediante Redis, mockear la API de Telegram y ejecutar pruebas de carga automatizadas para evitar race conditions.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario invita a otro o se une a un canal patrocinado, Cuando la API verifica la acción, Entonces el sistema otorga la bonificación.


### 5. [CRITICAL] Blindaje de transacciones atómicas para cálculo de ganancia offline (`TCK-0091-C2-01`)
- **Fase**: `RESILIENCE_SECURITY` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar un procedimiento almacenado en PostgreSQL envuelto en bloque PL/pgSQL transaccional que valide la marca de tiempo del cliente contra el servidor usando exclusión de filas (SELECT FOR UPDATE).
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario reanuda la TMA tras desconexión, Cuando se procesa el evento de sincronización offline, Entonces la base de datos aplica la ganancia de forma atómica sin permitir condiciones de carrera.


### 6. [HIGH] Sanitización estricta de parámetros initData y control OWASP (`TCK-0091-C2-02`)
- **Fase**: `RESILIENCE_SECURITY` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Implementar middleware de validación HMAC con logging estructurado para fallos de firma, sanitizar entradas PII y adjuntar reporte de pruebas unitarias al pull request.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que una petición HTTP externa carece de la firma HMAC válida de Telegram, Cuando el middleware intercepta la solicitud, Entonces el servidor rechaza el acceso con código HTTP 401.


### 7. [HIGH] Manejo resiliente de colas Redis ante fallos de red en Adsgram (`TCK-0091-C2-03`)
- **Fase**: `RESILIENCE_SECURITY` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Desarrollar middleware backend que verifique el hash HMAC de los payloads de Adsgram, registre UUIDs transaccionales procesados para evitar replay attacks, y gestione los fallos de red en Redis de forma segura.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el callback de Adsgram falla por corte de red, Cuando el servicio recupera la conectividad, Entonces la tarea en cola reintenta la acreditación del multiplicador temporal al usuario.


### 8. [HIGH] Suite de pruebas QA para consistencia de estado en Telegram Stars (`TCK-0091-C2-04`)
- **Fase**: `RESILIENCE_SECURITY` | **Área Asignada**: **QA** (Owner: `qa_lead`)
- **Especificación Técnica**: Construir una suite de pruebas automatizadas usando Jest y Supertest que simule webhooks de pago duplicados, caídas de conexión pre-confirmación y timeouts de API.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que ocurre un timeout durante un micropago con Stars, Cuando el cliente reintenta la validación, Entonces el sistema detecta la transacción previa en la base de datos y evita duplicar el activo cosmético.


### 9. [CRITICAL] Implementar pasarela de Telegram Stars para microtransacciones de aceleradores (`TCK-0091-C3-01`)
- **Fase**: `BILLING_OPERATIONS` | **Área Asignada**: **Facturación** (Owner: `finops_lead`)
- **Especificación Técnica**: Desarrollar endpoint webhook en Node.js procesando `pre_checkout_query` y `successful_payment`. El RPC en Supabase debe verificar y registrar el `telegram_payment_charge_id` con restricción UNIQUE estricta antes de actualizar los saldos del usuario.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario inicia una compra con Telegram Stars, Cuando Telegram confirma el pago, Entonces el backend acredita el acelerador cosmético de forma atómica.


### 10. [HIGH] Integrar SDK de Adsgram para monetización mediante anuncios recompensados (`TCK-0091-C3-02`)
- **Fase**: `BILLING_OPERATIONS` | **Área Asignada**: **Desarrollo** (Owner: `frontend_lead`)
- **Especificación Técnica**: Dado que el usuario visualiza un anuncio, cuando Adsgram emite el evento de éxito, el backend debe recibir, verificar la firma HMAC del webhook S2S y actualizar la base de datos de forma atómica para acreditar los activos.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario visualiza un anuncio completo en Adsgram, Cuando el SDK emite la recompensa, Entonces el sistema acredita el multiplicador temporal.


### 11. [MEDIUM] Desarrollar consola de diagnóstico y mesa de soporte para incidencias de cobro (`TCK-0091-C3-03`)
- **Fase**: `BILLING_OPERATIONS` | **Área Asignada**: **Soporte** (Owner: `ops_support`)
- **Especificación Técnica**: Implementar en la tabla Transaction una restricción UNIQUE en el ID de Telegram. El backend ejecutará los reintentos bajo transacciones estrictamente serializables y control de idempotencia validado.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario reporta una Stars no acreditada, Cuando el agente de soporte accede a la consola, Entonces puede consultar el estado de la transacción y forzar su sincronización.


### 12. [HIGH] Optimización de Redis para consultas de balance <50ms (`TCK-0091-C4-01`)
- **Fase**: `SCALE_PERF` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Configurar Redis usando scripts Lua atómicos para saldos, aislamiento estricto de sesiones JWT, y sincronización por lotes idempotente con Supabase para latencia <50ms sin riesgos.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario interactúa con la Mini App, cuando solicita su balance actual, entonces el servidor responde en menos de 50ms utilizando la caché de Redis.


### 13. [CRITICAL] Indexación de tablas PostgreSQL para cálculo offline masivo (`TCK-0091-C4-02`)
- **Fase**: `SCALE_PERF` | **Área Asignada**: **Desarrollo** (Owner: `data_arch`)
- **Especificación Técnica**: Ejecutar en producción: `CREATE INDEX CONCURRENTLY idx_user_offline ON "User"(id, last_active_timestamp);` y `CREATE INDEX CONCURRENTLY idx_asset_user ON "Asset"(user_id);`. El pipeline de CI/CD validará el script de rollback y las firmas de aprobación digital de DIR-01 y AUDIT-01 previo al despliegue.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario inactivo regresa al bot, cuando el sistema calcula sus ganancias fuera de línea, entonces la consulta SQL se ejecuta en menos de 30ms gracias a los índices.


### 14. [HIGH] Reducción de huella de memoria RAM en backend Node.js (`TCK-0091-C4-03`)
- **Fase**: `SCALE_PERF` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar pruebas de carga automatizadas con Artillery/K6 validando un umbral de tolerancia del 15% bajo concurrencia pico, integrando Redis para gestión de sesiones y PostgreSQL para persistencia transaccional.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el servidor procesa una carga concurrente simulada de 1000 usuarios, cuando se monitorea el consumo, entonces la RAM se mantiene estrictamente por debajo de 25MB.


### 15. [CRITICAL] Sincronización de Producción Offline mediante Comparativa de Timestamps Unix (`TCK-0091-C5-01`)
- **Fase**: `CONTINUOUS_EVOLUTION` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar lógica en Node.js que calcule (Current_Unix - Last_Logout_Unix) * Total_CPS. Persistir en Supabase y validar contra límites máximos de acumulación configurables.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario regresa tras 2 horas de inactividad, cuando la Mini App inicia, entonces el balance se incrementa exactamente según su tasa de generación por segundo.


### 16. [HIGH] Implementación de Webhooks para Validación de Tareas de Suscripción (`TCK-0091-C5-02`)
- **Fase**: `CONTINUOUS_EVOLUTION` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: 1. Endpoint HTTPS receptor de webhooks de Telegram. 2. Persistencia temporal en caché Redis con TTL de 1 hora. 3. Worker en Node.js para procesamiento idempotente de colas. 4. Pruebas de carga automatizadas.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario reclama un multiplicador, cuando el bot confirma su suscripción al canal, entonces el multiplicador se activa inmediatamente en la base de datos.


### 17. [HIGH] Integración de Adsgram SDK para Recompensas por Video (`TCK-0091-C5-03`)
- **Fase**: `CONTINUOUS_EVOLUTION` | **Área Asignada**: **Desarrollo** (Owner: `frontend_lead`)
- **Especificación Técnica**: El cliente invoca el SDK de Adsgram, el servidor de Adsgram envía un webhook validado por HMAC al backend, el cual actualiza el multiplicador en Supabase/Redis de forma atómica y segura.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario ve un anuncio completo, cuando el SDK devuelve el evento 'onReward', entonces se aplica un boost de 4 horas a su generación.


### 18. [MEDIUM] Gestión de Colas Redis para Notificaciones de Producción Acumulada (`TCK-0091-C5-04`)
- **Fase**: `CONTINUOUS_EVOLUTION` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Diseñar sistema de colas en Redis con BullMQ para procesar envíos programados de mensajes de reactivación respetando el límite de 30 mensajes/segundo.
- **Criterio de Aceptación (Gherkin)**:
  > Dado un grupo de usuarios inactivos por 24 horas, cuando el worker procesa la cola, entonces reciben un mensaje personalizado con su saldo acumulado.


### 19. [HIGH] Módulo de Pagos con Telegram Stars para Aceleradores Cosméticos (`TCK-0091-C5-05`)
- **Fase**: `CONTINUOUS_EVOLUTION` | **Área Asignada**: **Facturación** (Owner: `finops_lead`)
- **Especificación Técnica**: Base de datos con tabla `stars_ledger` (id, user_id, telegram_payment_charge_id UNIQUE, status, audit_signature, updated_at). El webhook de Telegram procesa el pago de Stars de forma idempotente, verifica la firma criptográfica SHA256 y, tras la confirmación exitosa, actualiza el estado a 'completed' y desbloquea el activo cosmético.
- **Criterio de Aceptación (Gherkin)**:
  > Dado un intento de compra de un skin, cuando el usuario confirma el pago en Stars, entonces el activo se desbloquea permanentemente en su perfil.


### 20. [HIGH] Cálculo de ganancias offline tolerante a desajustes de reloj (`TCK-0091-C6-01`)
- **Fase**: `EVOLUTION_CYCLE_6` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Middleware en Node.js que valide timestamps Unix usando Redis contra el reloj del servidor, aplicando la fórmula incremental de Adventure Capitalist.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario se desconecta por 2 horas, cuando vuelve a iniciar la Mini App, entonces el backend calcula la producción pasiva usando el delta de tiempo del servidor y actualiza el saldo en Supabase.


### 21. [CRITICAL] Integración de webhook Adsgram con firmas criptográficas y colas (`TCK-0091-C6-02`)
- **Fase**: `EVOLUTION_CYCLE_6` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Endpoint de webhook en Node.js que verifique la firma HMAC de Adsgram, encole eventos en Redis y actualice multiplicadores de producción.
- **Criterio de Aceptación (Gherkin)**:
  > Dado un webhook de recompensa de Adsgram con firma válida, cuando se procesa por la cola de Redis, entonces se incrementa el balance del usuario de forma segura y asíncrona.


### 22. [HIGH] Ledger de transacciones idempotente para compras con Telegram Stars (`TCK-0091-C6-03`)
- **Fase**: `EVOLUTION_CYCLE_6` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Diseñar tabla transaccional en PostgreSQL con restricción UNIQUE en 'telegram_payment_charge_id' y lógica de conciliación asíncrona mediante colas.
- **Criterio de Aceptación (Gherkin)**:
  > Dado un pago con Telegram Stars reintentado por fallas de red, cuando el bot procesa el payload, entonces el sistema ignora transacciones duplicadas y no duplica el acelerador.


### 23. [HIGH] Cola de difusión masiva respetando límites de Telegram API (`TCK-0091-C6-04`)
- **Fase**: `EVOLUTION_CYCLE_6` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Configurar BullMQ en Redis para dosificar las llamadas de envío de mensajes a un máximo estricto de 25 peticiones por segundo.
- **Criterio de Aceptación (Gherkin)**:
  > Dado un lote de 100,000 usuarios inactivos, cuando se inicia la campaña de difusión, entonces los mensajes se envían a través de BullMQ sin generar errores 429 de Telegram.


### 24. [HIGH] Optimización del cálculo offline con Redis y PostgreSQL (`TCK-0091-C7-01`)
- **Fase**: `EVOLUTION_CYCLE_7` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar un servicio en Node.js que consulte la última marca de tiempo Unix en Redis, compute la tasa de ganancia por segundo y actualice Supabase.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario reingresa a la TMA, Cuando el backend procesa la sesión, Entonces calcula exactamente la producción pasiva basada en la diferencia de marcas de tiempo Unix.


### 25. [MEDIUM] Verificación automática de suscripciones mediante API de Telegram (`TCK-0091-C7-02`)
- **Fase**: `EVOLUTION_CYCLE_7` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: La API ejecutará validaciones en segundo plano usando colas de Redis para mitigar errores HTTP 429, almacenando temporalmente el estado del usuario en caché antes de actualizar la tabla Task.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario clica en verificar tarea, Cuando la API de Telegram confirma la suscripción, Entonces el sistema desbloquea el multiplicador temporal asociado.


### 26. [HIGH] Configuración de Adsgram y pasarela de Telegram Stars (`TCK-0091-C7-03`)
- **Fase**: `EVOLUTION_CYCLE_7` | **Área Asignada**: **Facturación** (Owner: `finops_lead`)
- **Especificación Técnica**: Desarrollar controladores con validación estricta de firmas (S2S Adsgram/Telegram). Esquema: `transactions` (id_unico, firma_hash, estado_procesado, timestamp). Bloqueo de ejecución si `transaction_id` existe. Uso de Redis para caché de idempotencia temporal y PostgreSQL para persistencia inmutable.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario adquiere un acelerador con Telegram Stars, Cuando el pago es validado, Entonces se registra la transacción y se aplica el beneficio cosmético inmediatamente.


### 27. [MEDIUM] Gestión de tasa de llamadas para difusión programada en Redis (`TCK-0091-C7-04`)
- **Fase**: `EVOLUTION_CYCLE_7` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Implementar una cola basada en Redis utilizando BullMQ para despachar mensajes de difusión programada respetando el límite de 30 mensajes por segundo.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que se activa una campaña de difusión, Cuando la cola procesa los mensajes, Entonces se envían respetando el límite de tasa sin generar errores 429 de Telegram.


### 28. [HIGH] Optimización del cálculo offline de activos con Redis y Postgres (`TCK-0091-C8-01`)
- **Fase**: `EVOLUTION_CYCLE_8` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar un script en Node.js que procese la diferencia de marcas de tiempo Unix entre desconexión (almacenada en Redis) y conexión actual, actualizando saldos atómicamente en Supabase.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario abre la TMA tras 8 horas de inactividad, Cuando el backend procesa la sesión, Entonces calcula y acredita exactamente el rendimiento pasivo acumulado sin desbordar el balance.


### 29. [CRITICAL] Mitigación de fraudes en validación de anuncios Adsgram y Telegram Stars (`TCK-0091-C8-02`)
- **Fase**: `EVOLUTION_CYCLE_8` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Validar criptográficamente los callbacks de anuncios recompensados (Adsgram) y eventos de pago con Telegram Stars mediante firmas HMAC en el servidor Node.js antes de otorgar multiplicadores.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el cliente simula un evento de recompensa publicitaria sin callback válido del SDK, Cuando el backend recibe la petición, Entonces rechaza la transacción y registra el intento de fraude.


### 30. [MEDIUM] Automatización de verificación de suscripciones con API de Telegram (`TCK-0091-C8-03`)
- **Fase**: `EVOLUTION_CYCLE_8` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Crear un módulo en Node.js con cola en Redis que consulte el método getChatMember de la API de Telegram respetando estrictamente la cuota de peticiones por segundo.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario pulsa verificar tarea de canal, Cuando el bot consulta la API oficial, Entonces valida la membresía activa y desbloquea el multiplicador temporal en menos de 2 segundos.


### 31. [HIGH] Resiliencia y rate limiting en sistema de difusión masiva (`TCK-0091-C8-04`)
- **Fase**: `EVOLUTION_CYCLE_8` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Configurar una cola de mensajes en Redis con procesamiento por lotes (throttling) controlado para enviar difusiones programadas mediante la Bot API a un ritmo inferior a 30 msgs/segundo.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que se ejecuta una campaña de reenganche para 50,000 usuarios inactivos, Cuando el sistema procesa la cola, Entonces entrega los avisos progresivamente sin disparar errores 429 Too Many Requests.


### 32. [HIGH] Optimización del cálculo offline con Redis y PostgreSQL (`TCK-0091-C9-01`)
- **Fase**: `EVOLUTION_CYCLE_9` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar un script en Node.js que lea la última sesión desde Redis, calcule el delta con la hora actual y persista en PostgreSQL asíncronamente.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario reabre la TMA tras 4 horas, cuando el backend procesa el timestamp Unix, entonces calcula y acredita el saldo pasivo exacto sin latencia percibida.


### 33. [CRITICAL] Mitigación de fraudes en Adsgram y Telegram Stars (`TCK-0091-C9-02`)
- **Fase**: `EVOLUTION_CYCLE_9` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Validar firmas HMAC de Adsgram y los webhooks de pago de Telegram Stars en Node.js antes de actualizar saldos de activos en Supabase.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario simula un evento de anuncio falso, cuando el backend verifica la firma criptográfica, entonces rechaza la transacción y registra el intento de fraude.


### 34. [MEDIUM] Automatización de verificación de canales patrocinados vía API (`TCK-0091-C9-03`)
- **Fase**: `EVOLUTION_CYCLE_9` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Implementar consultas en lotes a getChatMember validando estrictamente cada chat_id de entrada, utilizando Redis protegido con autenticación robusta y credenciales centralizadas en variables de entorno seguras.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario completa una tarea de suscripción, cuando el sistema valida su membresía vía API, entonces desbloquea el multiplicador temporal de forma idempotente.


### 35. [HIGH] Despliegue de infraestructura resiliente para TMA y Webhooks (`TCK-0091-C9-04`)
- **Fase**: `EVOLUTION_CYCLE_9` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Implementar app Node/Bun en servidor único con consumo <25MB, configurar validación estricta de Webhooks de Telegram y verificar initData de la Mini App antes de procesar cualquier transacción o persistencia.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que ocurre una campaña viral de referidos, cuando el tráfico se duplica en minutos, entonces la infraestructura responde con latencia menor a 200ms sin pérdida de sesiones.


### 36. [HIGH] Optimización de cálculo offline mediante sincronización de marcas Unix (`TCK-0091-C10-01`)
- **Fase**: `EVOLUTION_CYCLE_10` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: La API validará el token de sesión firmado, comparará marcas Unix y ejecutará una transacción PostgreSQL con control de versión para actualizar el saldo pasivo de forma atómica, previniendo condiciones de carrera y trampas de cliente.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario cierra la app, cuando regresa tras X tiempo, entonces el balance se actualiza exactamente con la ganancia offline calculada en el backend.


### 37. [CRITICAL] Implementación de middleware de validación para Adsgram SDK (`TCK-0091-C10-02`)
- **Fase**: `EVOLUTION_CYCLE_10` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Crear un endpoint protegido que valide el token de callback de Adsgram contra la firma secreta antes de aplicar el multiplicador de moneda al balance del usuario.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario ve un anuncio, cuando Adsgram envía el callback, entonces el sistema valida la firma y acredita la recompensa únicamente tras éxito verificado.


### 38. [MEDIUM] Arquitectura de colas en Redis para notificaciones push programadas (`TCK-0091-C10-03`)
- **Fase**: `EVOLUTION_CYCLE_10` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Configurar una cola en Redis (BullMQ) que procese el envío de mensajes mediante un worker con limitador de tasa (rate limiter) integrado (máx 30 peticiones/seg).
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario está inactivo > 24h, cuando el worker procesa la cola, entonces se envía el aviso de 'producción acumulada' respetando el rate limit global.


### 39. [HIGH] Sistema de referidos con enlaces profundos y validación de tareas (`TCK-0091-C10-04`)
- **Fase**: `EVOLUTION_CYCLE_10` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Prohibido el uso de triggers para lógica externa. Implementar arquitectura orientada a eventos: el cliente solicita validación, el worker encola la tarea, verifica mediante API con caché TTL (Redis) y actualiza balances mediante transacciones atómicas en Node.js tras confirmación satisfactoria del estado.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario invita a otro, cuando el nuevo usuario completa el tutorial, entonces el sistema asigna bonos a ambos mediante transacción atómica.


### 40. [CRITICAL] Implementar motor de cálculo offline mediante sincronización Unix (`TCK-0091-C11-01`)
- **Fase**: `EVOLUTION_CYCLE_11` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar endpoint protegido por JWT. El cálculo offline debe ejecutarse mediante transacción `SELECT FOR UPDATE` en PostgreSQL para asegurar atomicidad. El servidor ignorará el timestamp del cliente, usando `NOW()` del sistema para calcular `offline_gain`. Solo tras la confirmación de escritura en PostgreSQL, Redis se actualizará como caché de lectura.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario cierra la app, cuando regresa tras 1 hora, entonces el balance debe incrementarse exactamente por el producto de su tasa actual y el tiempo transcurrido.


### 41. [HIGH] Integración de Adsgram SDK con callback de validación segura (`TCK-0091-C11-02`)
- **Fase**: `EVOLUTION_CYCLE_11` | **Área Asignada**: **Desarrollo** (Owner: `frontend_lead`)
- **Especificación Técnica**: El backend procesará webhooks verificando la firma criptográfica del payload y el timestamp. Las transacciones usarán estados bloqueantes y llaves de idempotencia para evitar duplicidades y ataques de repetición.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario visualiza el anuncio completo, cuando el SDK dispara el evento 'onReward', entonces el servidor debe acreditar el multiplicador y registrar el evento en PostgreSQL.


### 42. [HIGH] Sistema de referidos con enlaces profundos y validación de suscripción (`TCK-0091-C11-03`)
- **Fase**: `EVOLUTION_CYCLE_11` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Generar `start=refID_signature`. El worker validará la firma, sanitizará el ID y ejecutará una función RPC en Supabase para procesar la bonificación atómicamente. Se requiere bloqueo optimista en base de datos y registro de auditoría para prevenir inyecciones y asegurar consistencia entre colas y persistencia.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un nuevo usuario utiliza un enlace de referido, cuando se confirma la suscripción al canal obligatorio, entonces ambos usuarios reciben la bonificación permanente de tasa.


### 43. [MEDIUM] Optimización de persistencia en PostgreSQL con caché Redis (`TCK-0091-C11-04`)
- **Fase**: `EVOLUTION_CYCLE_11` | **Área Asignada**: **Infraestructura** (Owner: `data_arch`)
- **Especificación Técnica**: Arquitectura: Redis para lectura rápida; PostgreSQL para estado persistente mediante transacciones ACID. Requerimiento: Cada incremento de balance debe procesarse mediante colas asíncronas con persistencia en WAL. Eventos críticos (prestigio/transacciones) requieren confirmación de escritura síncrona en BD antes de actualizar el estado en caché.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario realiza múltiples clics rápidos, cuando se consulta el balance, entonces el sistema retorna el valor desde Redis con latencia < 50ms.


### 44. [CRITICAL] Implementación de lógica de cálculo offline mediante Unix timestamps (`TCK-0091-C12-01`)
- **Fase**: `EVOLUTION_CYCLE_12` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Backend: Node.js con validación JWT/HMAC y reloj de servidor como única fuente de verdad (SSoT). Prohibido cálculo de delta en el cliente. Base de datos: Transacciones SQL ACID con bloqueo de fila selectivo para evitar condiciones de carrera en el balance.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario cierra la app, Cuando transcurren 60 minutos, Entonces al abrir, el balance debe incrementarse exactamente por 3600 * tasa_actual.


### 45. [HIGH] Configuración de persistencia y caché con Redis para sesiones (`TCK-0091-C12-02`)
- **Fase**: `EVOLUTION_CYCLE_12` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Desarrolladores: Usar Redis para estado volátil con versioning por registro. Ingesta validada mediante Zod y firma HMAC. Persistencia en Postgres vía Job asíncrono con bloqueo optimista (versión en tabla). Prohibido acceso directo sin capa de validación y control de concurrencia mediante secuencias log.
- **Criterio de Aceptación (Gherkin)**:
  > Dado un clic en la app, Cuando el usuario interactúa, Entonces el estado se actualiza en Redis instantáneamente y se persiste en Postgres asincrónicamente.


### 46. [HIGH] Integración del SDK de Adsgram con callback de recompensa (`TCK-0091-C12-03`)
- **Fase**: `EVOLUTION_CYCLE_12` | **Área Asignada**: **Desarrollo** (Owner: `frontend_lead`)
- **Especificación Técnica**: Implementar flujo: 1. Cliente recibe token firmado; 2. Backend valida HMAC y nonce único en Redis; 3. Consulta S2S a Adsgram API vía `reward_id`; 4. Actualización atómica en Supabase tras validación exitosa. Uso estricto de secretos rotativos para firmas.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario ve un anuncio completo, Cuando el SDK dispara el evento, Entonces el backend acredita el multiplicador tras validar la firma.


### 47. [MEDIUM] Sistema de verificación de suscripciones vía Telegram API (`TCK-0091-C12-04`)
- **Fase**: `EVOLUTION_CYCLE_12` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Validación obligatoria de `initData` mediante firma HMAC-SHA256 antes de procesar el `getChatMember`. Lógica de reintento con backoff exponencial para errores 429. Cacheo en Redis con `TTL_VERIFY` configurable. Integrar logs de auditoría para cada validación exitosa y fallida. Prohibido omitir validación de integridad en producción.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario completa una tarea de suscripción, Cuando el bot verifica el estado, Entonces el sistema desbloquea el multiplicador tras confirmar la pertenencia.


### 48. [CRITICAL] Diseño de esquema relacional para activos y sistema prestigio (`TCK-0091-C12-05`)
- **Fase**: `EVOLUTION_CYCLE_12` | **Área Asignada**: **Arquitectura** (Owner: `data_arch`)
- **Especificación Técnica**: Esquema: Users, Assets, Prestigios y Referrals con columna 'deleted_at'. Implementar triggers en PostgreSQL para volcar cambios a tablas de auditoría (audit_logs). Prohibido el borrado físico; toda baja se gestiona mediante actualización de estado. Integridad referencial garantizada vía restricciones de clave foránea sin cascada.
- **Criterio de Aceptación (Gherkin)**:
  > Dado un evento de prestigio, Cuando el usuario confirma, Entonces el balance se reinicia, el multiplicador aumenta y la transacción queda registrada en el historial.


### 49. [HIGH] Optimización de cálculo de ganancias offline mediante Unix timestamps (`TCK-0091-C13-01`)
- **Fase**: `EVOLUTION_CYCLE_13` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Desarrollar middleware en Node.js que procese el delta (now - lastLogin) mediante transacciones ACID. Validar payloads con HMAC-SHA256. Almacenar saldo y multiplicadores como BigInt en PostgreSQL con caché en Redis, asegurando que cada actualización de sesión sea atómica y auditable contra el log de eventos.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario regresa tras 1 hora, cuando se procesa el evento de login, entonces el balance se incrementa exactamente por la tasa de producción acumulada sin errores de redondeo.


### 50. [CRITICAL] Integración de Adsgram SDK con callback de validación segura (`TCK-0091-C13-02`)
- **Fase**: `EVOLUTION_CYCLE_13` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Desarrollar middleware de verificación de firma con Secret Manager. El flujo: recepción Webhook -> validación HMAC/nonce -> cola Redis -> ejecución transacción ACID en Supabase. Prohibido procesar eventos sin verificación criptográfica estricta y control de concurrencia para evitar duplicidad de recompensas.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario completa un anuncio, cuando el webhook recibe el evento validado, entonces el balance se actualiza en el estado global y el usuario recibe el multiplicador.


### 51. [HIGH] Sistema de referidos con validación de profundidad en PostgreSQL (`TCK-0091-C13-03`)
- **Fase**: `EVOLUTION_CYCLE_13` | **Área Asignada**: **Desarrollo** (Owner: `data_arch`)
- **Especificación Técnica**: Esquema: Tabla 'referrals' (id, referrer_id, referee_id, path ltree). Backend: API emite eventos a BullMQ tras insertar registro. Worker asíncrono procesa bonos, verifica suscripciones mediante API Telegram y actualiza estados con logs de auditoría. Restricción CHECK previene autorreferencias y recursión infinita.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario A refiere al usuario B, cuando B completa el onboarding, entonces A recibe el bono y la relación queda guardada en la base de datos.


### 52. [MEDIUM] Implementación de rate limiting en notificaciones push de Telegram (`TCK-0091-C13-04`)
- **Fase**: `EVOLUTION_CYCLE_13` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: El worker debe capturar excepciones 429, extraer el parámetro 'retry_after' y pausar la cola dinámicamente. Implementar reintentos con backoff exponencial. El sistema debe loguear métricas de éxito/fallo y ajustar la tasa de procesamiento en tiempo real según la respuesta de los servidores Telegram.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que hay 10,000 usuarios inactivos, cuando se ejecuta el script de difusión, entonces todos los mensajes se envían progresivamente sin exceder la tasa de peticiones permitida.


### 53. [CRITICAL] Implementación de motor de cálculo offline y lógica de prestigio (`TCK-0091-C14-01`)
- **Fase**: `EVOLUTION_CYCLE_14` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Desarrollar middleware en Node.js que calcule ganancias comparando 'last_sync' con 'current_time' usando BigInt para evitar desbordamientos, aplicando multiplicadores de prestigio logarítmicos almacenados en Supabase.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario regresa tras 4 horas, cuando el sistema valide el timestamp, entonces debe acreditar el balance exacto aplicando el multiplicador de prestigio activo.


### 54. [HIGH] Integración de Adsgram SDK para multiplicadores de recompensa temporales (`TCK-0091-C14-02`)
- **Fase**: `EVOLUTION_CYCLE_14` | **Área Asignada**: **Desarrollo** (Owner: `frontend_lead`)
- **Especificación Técnica**: Implementar endpoint de webhook con validación HMAC-SHA256. Al recibir confirmación S2S, actualizar multiplicador en Redis (SETEX) y PostgreSQL. La lógica de generación y el cálculo de ganancias offline deben ejecutarse exclusivamente en backend comparando marcas de tiempo Unix, eliminando cualquier manipulación de estado desde el frontend.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario ve un anuncio completo, cuando el SDK retorne éxito, entonces el backend debe duplicar la tasa de generación por segundo (GPS) inmediatamente.


### 55. [HIGH] Sistema de colas Redis para reactivación masiva mediante Telegram Bot (`TCK-0091-C14-03`)
- **Fase**: `EVOLUTION_CYCLE_14` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Configurar BullMQ en Redis para procesar envíos de mensajes en lotes de 30 por segundo, respetando el protocolo MTProto y gestionando reintentos ante errores 429.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que hay 10,000 usuarios inactivos, cuando se active el trigger de difusión, entonces los mensajes deben entregarse gradualmente sin exceder los límites oficiales.


### 56. [MEDIUM] Módulo de validación de tareas sociales vía API oficial (`TCK-0091-C14-04`)
- **Fase**: `EVOLUTION_CYCLE_14` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Backend: Node.js con BullMQ y Redis. Validaciones: Webhooks 'chat_member' para actualizaciones en tiempo real y caché (TTL 300s). Seguridad: Validación JWT, sanitización con Zod y consultas parametrizadas a PostgreSQL/Supabase. Prohibido: Llamadas síncronas a 'getChatMember' desde el endpoint de reclamación.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario reclama un bono por suscripción, cuando el sistema verifique el ID en el canal, entonces debe desbloquear permanentemente el activo correspondiente.


### 57. [HIGH] Auditoría de integridad de marcas de tiempo y prevención de fraude (`TCK-0091-C14-05`)
- **Fase**: `EVOLUTION_CYCLE_14` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Arquitectura Server-Side Only: Implementar endpoints que calculen `earnings = (current_server_time - last_sync_timestamp) * rate`. El payload del cliente solo debe incluir la acción de 'claim'. Se rechaza cualquier parámetro de tiempo externo. Persistencia obligatoria en Redis para lecturas rápidas y PostgreSQL para auditoría.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario intenta adelantar el reloj de su dispositivo, cuando sincronice con el servidor, entonces la transacción debe ser rechazada y marcada como sospechosa.


### 58. [CRITICAL] Implementación de cálculo de ganancias offline con marcas Unix (`TCK-0091-C15-01`)
- **Fase**: `EVOLUTION_CYCLE_15` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar endpoint `POST /sync-earnings`. Backend debe ignorar cualquier timestamp enviado por el cliente. Utilizar `CURRENT_TIMESTAMP` de PostgreSQL para el cálculo del delta. Retornar balance actualizado y `last_login` refrescado. Toda operación debe ejecutarse dentro de una transacción ACID para evitar condiciones de carrera.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario cierra la App, cuando reabre tras 1 hora, entonces el balance se actualiza correctamente sumando el rate_per_second * 3600.


### 59. [HIGH] Optimización de persistencia con Redis para estados de sesión (`TCK-0091-C15-02`)
- **Fase**: `EVOLUTION_CYCLE_15` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Implementar patrón write-behind: actualizaciones de saldo en Redis con volcado periódico a PostgreSQL mediante colas de mensajes (BullMQ/Node.js).
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario genera 10 clics/seg, cuando el sistema opera, entonces el tiempo de respuesta de API debe ser < 50ms sin bloquear PostgreSQL.


### 60. [HIGH] Integración de Adsgram SDK con callback de verificación segura (`TCK-0091-C15-03`)
- **Fase**: `EVOLUTION_CYCLE_15` | **Área Asignada**: **Facturación** (Owner: `finops_lead`)
- **Especificación Técnica**: Desarrolladores: Implementen middleware de validación criptográfica en el endpoint `/adsgram/callback`. Es obligatorio verificar la firma HMAC-SHA256 del payload, validar el nonce contra una caché Redis para prevenir duplicados y aplicar transacciones ACID en PostgreSQL para la actualización de saldos. Rechazar cualquier petición sin firma válida.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario ve un anuncio, cuando el callback de Adsgram retorna éxito, entonces se acredita el multiplicador y se registra la transacción.


### 61. [MEDIUM] Sistema de difusión (Push) segmentado para usuarios inactivos (`TCK-0091-C15-04`)
- **Fase**: `EVOLUTION_CYCLE_15` | **Área Asignada**: **Negocio** (Owner: `func_analyst`)
- **Especificación Técnica**: Arquitectura: Redis (BullMQ) para colas distribuidas. Lógica: Middleware con reintentos configurables y backoff exponencial. Seguridad: Aserciones de idempotencia mediante `request_id` único en PostgreSQL. Cumplimiento: Monitorización de tasas de peticiones (Rate Limiting) con Circuit Breaker para evitar baneos y garantizar entrega masiva eficiente.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario lleva 24h offline, cuando el cron job se ejecuta, entonces recibe un mensaje con su ganancia acumulada esperando.


### 62. [HIGH] Auditoría de integridad de referidos mediante enlaces profundos (`TCK-0091-C15-05`)
- **Fase**: `EVOLUTION_CYCLE_15` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Implementar middleware en Node.js que valide el initData, aplique Rate Limiting por ID de usuario en Redis y consulte la API de Telegram para verificar la antigüedad, añadiendo un periodo de enfriamiento antes de liberar bonos.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario invita a otro, cuando el invitado inicia la App, entonces ambos reciben el bono solo si el invitado es cuenta verificada.


### 63. [HIGH] Optimización del cálculo offline con marcas de tiempo Unix (`TCK-0091-C16-01`)
- **Fase**: `EVOLUTION_CYCLE_16` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar función PL/pgSQL en Supabase que calcule el delta entre `last_active_at` y timestamp actual aplicando tasa exponencial por activo.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario reingresa tras horas de inactividad, Cuando el backend procesa la sesión, Entonces el balance refleja el incremento exacto sin desbordamiento.


### 64. [CRITICAL] Mitigación de fraudes en verificación de tareas de canales (`TCK-0091-C16-02`)
- **Fase**: `EVOLUTION_CYCLE_16` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Desarrolladores: Descartar Redis para validación. Configurar endpoint de Webhook para capturar eventos `chat_member`. Al recibir el evento, actualizar tabla `user_tasks` en Supabase. Solo si el estado es 'member'/'administrator', habilitar botón de reclamo en la Mini App. Validar estado persistente antes de procesar Stars.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario intenta reclamar una tarea sin unirse al canal, Cuando el sistema valida vía API, Entonces se rechaza la recompensa y se registra el intento.


### 65. [HIGH] Integración y persistencia segura de pagos con Telegram Stars (`TCK-0091-C16-03`)
- **Fase**: `EVOLUTION_CYCLE_16` | **Área Asignada**: **Facturación** (Owner: `finops_lead`)
- **Especificación Técnica**: Crear tabla 'transactions' con order_id único. En el callback, verificar existencia del order_id, abrir transacción atómica en Supabase, registrar el pago, otorgar el acelerador y confirmar. Retornar error HTTP 409 ante duplicados.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que se completa un pago con Telegram Stars, Cuando el webhook responde exitosamente, Entonces el balance del usuario se actualiza de manera atómica.


### 66. [MEDIUM] Automatización de difusión masiva respetando límites de Telegram (`TCK-0091-C16-04`)
- **Fase**: `EVOLUTION_CYCLE_16` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Implementar worker en Node.js con Zod para validación de mensajes. Almacenar tokens cifrados en Redis con acceso vía ACL. Ejecutar envíos por lotes con backoff exponencial. Asegurar persistencia de PII en PostgreSQL mediante cifrado en reposo, cumpliendo con los límites de peticiones (Rate Limiting) de Telegram.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que se programa una campaña de difusión inactiva, Cuando el worker procesa la cola, Entonces se envían los avisos respetando estrictamente el límite de tasa.


### 67. [CRITICAL] Implementación de cálculo de ganancias offline mediante Unix timestamps (`TCK-0091-C17-01`)
- **Fase**: `EVOLUTION_CYCLE_17` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Backend debe utilizar PostgreSQL con aislamiento serializable. El estado del usuario se actualiza mediante procedimientos almacenados que calculan el delta desde la última marca de tiempo persistida en BD. Prohibida la lógica de cálculo en cliente. Sesiones protegidas por firmas criptográficas y validación estricta de integridad.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario cierra la app, cuando regresa tras 1 hora, entonces el sistema calcula correctamente la tasa acumulada y actualiza el balance en la BD.


### 68. [HIGH] Integración de Adsgram SDK con validación de eventos Webhook (`TCK-0091-C17-02`)
- **Fase**: `EVOLUTION_CYCLE_17` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Desarrollar middleware de verificación HMAC. La transacción atómica debe insertar `event_id` en `event_log` antes de actualizar el balance mediante `UPDATE users SET balance = balance + X, version = version + 1 WHERE id = Y AND version = current_version`. Incluir suite de pruebas con mocks para carga concurrente.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario completa un anuncio, cuando el webhook recibe el evento, entonces el balance del usuario se incrementa automáticamente sin refrescar la app.


### 69. [MEDIUM] Optimización de persistencia con Redis para sesiones de alta frecuencia (`TCK-0091-C17-03`)
- **Fase**: `EVOLUTION_CYCLE_17` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Prohibida la sincronización basada en tiempo. Usar Redis Lua para atomicidad de balance. Implementar 'Write-Through' para transacciones financieras y 'Write-Behind' con WAL para el balance incremental. Validar integridad del lado del servidor antes de cada commit en PostgreSQL.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que hay 1000 usuarios activos, cuando realizan clics, entonces la latencia de respuesta se mantiene bajo 100ms mediante el uso de caché en memoria.


### 70. [HIGH] Sistema de referidos con enlaces profundos y validación automática (`TCK-0091-C17-04`)
- **Fase**: `EVOLUTION_CYCLE_17` | **Área Asignada**: **Negocio** (Owner: `biz_owner`)
- **Especificación Técnica**: Endpoint de registro en Node.js con rate-limiting y validación HMAC de Telegram InitData. Inserción en Redis (stream/queue). Worker dedicado procesa el evento con transacciones SQL atómicas para actualizar balances. Prohibido el uso de triggers para lógica de negocio. Uso de UUIDs únicos para idempotencia.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el Usuario A invita al Usuario B, cuando B completa el onboarding, entonces ambos reciben la bonificación definida en la tabla de configuración.


### 71. [MEDIUM] Módulo de verificación de suscripción vía Telegram Bot API (`TCK-0091-C17-05`)
- **Fase**: `EVOLUTION_CYCLE_17` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Implementar método getChatMember en el bot. Cachear resultado por 300 segundos en Redis para evitar exceder límites de peticiones de la API oficial.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario intenta reclamar una recompensa, cuando la API confirma la suscripción, entonces el multiplicador temporal se activa en la cuenta del usuario.


### 72. [CRITICAL] Implementar cálculo de ganancias offline mediante diferencial Unix (`TCK-0091-C18-01`)
- **Fase**: `EVOLUTION_CYCLE_18` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Crear endpoint de sincronización que ejecute una transacción PostgreSQL ACID. Validar `last_login_timestamp` con `NOW()`, calcular `delta = (now - last_login) * rate`, actualizar balance de forma atómica y registrar auditoría de sesión para evitar fraude.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario cierra la app, Cuando transcurren 60 minutos, Entonces al reabrir el bot, el balance debe reflejar el ingreso acumulado correctamente.


### 73. [HIGH] Estructurar esquema relacional para persistencia de activos y prestigio (`TCK-0091-C18-02`)
- **Fase**: `EVOLUTION_CYCLE_18` | **Área Asignada**: **Arquitectura** (Owner: `data_arch`)
- **Especificación Técnica**: Tablas: Users(id, balance, prestige_multiplier), Assets(id, user_id, type, level, rate), Transactions(id, user_id, amount, type). Indexar user_id en todas las tablas relacionales.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario reinicia por prestigio, Cuando se ejecuta la lógica de reseteo, Entonces los niveles se limpian y el multiplicador permanente se actualiza exitosamente.


### 74. [HIGH] Integración de Adsgram con validación de eventos post-recompensa (`TCK-0091-C18-03`)
- **Fase**: `EVOLUTION_CYCLE_18` | **Área Asignada**: **Desarrollo** (Owner: `frontend_lead`)
- **Especificación Técnica**: Implementar middleware de verificación HMAC-SHA256 en el endpoint de callback. El backend debe validar: firma del payload, timestamp de expiración, nonce único y ejecutar un bloqueo `SELECT FOR UPDATE` en PostgreSQL para acreditar el balance atómicamente, eliminando toda lógica de confianza en el frontend.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario ve un anuncio, Cuando el evento es validado por Adsgram, Entonces el backend debe incrementar el balance en 30 segundos de producción.


### 75. [MEDIUM] Sistema de difusión (Push) para reactivación de usuarios (`TCK-0091-C18-04`)
- **Fase**: `EVOLUTION_CYCLE_18` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Arquitectura: Cola Redis con worker asíncrono. Flujo: 1) Verificación de estado (API getChatMember); 2) Envío con limitador de 30 msg/s; 3) Middleware de reintento con backoff exponencial para errores 429. Registro de logs obligatorio para auditoría de entregas y persistencia de estados de usuario.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario lleva 24h inactivo, Cuando el cron job se ejecuta, Entonces el bot envía un mensaje notificando la producción acumulada sin errores 429.


### 76. [CRITICAL] Implementación de cálculo offline mediante sincronización de marcas Unix (`TCK-0091-C19-01`)
- **Fase**: `EVOLUTION_CYCLE_19` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Endpoint protegido mediante HMAC-SHA256. Lógica de cálculo en backend con transacciones SERIALIZABLE. Esquema: tabla 'user_state' con campos 'last_active_ts' (BigInt) y 'balance' (Decimal). Validación estricta de marcas Unix y logs de auditoría por cada evento de sincronización para asegurar consistencia absoluta.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario cierra la App, Cuando regresa tras N segundos, Entonces el balance debe incrementarse exactamente por (rate * N) sin discrepancias de cliente.


### 77. [HIGH] Integración de Adsgram SDK con callback de validación segura (`TCK-0091-C19-02`)
- **Fase**: `EVOLUTION_CYCLE_19` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Implementar webhook con firma HMAC para validar callbacks de Adsgram antes de acreditar recompensas al balance del usuario en la base de datos.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario ve un anuncio, Cuando Adsgram envía el evento, Entonces el servidor debe verificar el hash y acreditar el multiplicador solo si es válido.


### 78. [MEDIUM] Optimización de persistencia con Redis para estados de sesión (`TCK-0091-C19-03`)
- **Fase**: `EVOLUTION_CYCLE_19` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Arquitectura: Redis para estado 'hot' con persistencia AOF habilitada. Escrituras críticas mediante transacciones atómicas (MULTI/EXEC). Sincronización a PostgreSQL vía Kafka con semántica 'at-least-once'. Implementar WAL en el backend para auditoría y recuperación ante desastres en el ecosistema de Telegram.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario hace clics constantes, Cuando se consulta el balance, Entonces la respuesta debe servirse desde Redis en <50ms evitando bloqueos de BD.


### 79. [HIGH] Módulo de verificación de suscripciones vía Telegram Bot API (`TCK-0091-C19-04`)
- **Fase**: `EVOLUTION_CYCLE_19` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Crear microservicio con cola de procesamiento (BullMQ) para consultar getChatMember, implementando un backoff exponencial para respetar los límites de la API de Telegram.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario completa una tarea de suscripción, Cuando el bot verifica el estado, Entonces el multiplicador debe activarse automáticamente en el perfil.


### 80. [CRITICAL] Implementación de cálculo de ingresos offline mediante timestamps Unix (`TCK-0091-C20-01`)
- **Fase**: `EVOLUTION_CYCLE_20` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Validar initData/HMAC en middleware. Obtener last_sync de PostgreSQL; calcular delta = now_server - last_sync (bloqueando delta negativo o superior a max_offline_cap). Ejecutar update atómico de balance y last_sync en PostgreSQL bajo SELECT FOR UPDATE. Emitir log con hash de verificación a Redis para auditoría.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario estuvo offline 3600s, cuando abra la TMA, entonces el balance debe incrementarse exactamente por el rate acumulado en ese periodo.


### 81. [HIGH] Integración de Adsgram SDK con validación de callback segura (`TCK-0091-C20-02`)
- **Fase**: `EVOLUTION_CYCLE_20` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Implementar endpoint protegido que verifique el hash de Adsgram. Solo tras la confirmación del servidor, actualizar balance del usuario en PostgreSQL usando una transacción con bloqueo de fila.
- **Criterio de Aceptación (Gherkin)**:
  > Dado un evento de anuncio visto, cuando el servidor recibe el callback, entonces solo se acredita la recompensa si el hash es criptográficamente válido.


### 82. [MEDIUM] Optimización de Redis para colas de eventos de referidos (`TCK-0091-C20-03`)
- **Fase**: `EVOLUTION_CYCLE_20` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Arquitectura: Redis para buffering, worker asíncrono con bloqueo optimista en PostgreSQL. Cada evento requiere un UUID único de transacción. Implementar lógica de reintento con control de idempotencia y validación periódica de consistencia mediante aserciones programadas contra la tabla de estados de usuario.
- **Criterio de Aceptación (Gherkin)**:
  > Dado un pico de 1000 referidos simultáneos, cuando se procesa la cola, entonces el sistema debe registrar todos los bonos sin errores de concurrencia en la DB.


### 83. [HIGH] Arquitectura de persistencia de prestigio y multiplicadores permanentes (`TCK-0091-C20-04`)
- **Fase**: `EVOLUTION_CYCLE_20` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Estructura: `Users` (id, balance, prestige_lvl), `Assets` (id, user_id, base_rate), `Asset_Modifiers` (id, asset_id, multiplier, type). Cálculos offline: ejecutar mediante procedimientos almacenados en SQL para asegurar atomicidad y validación rígida antes de persistir el estado final del usuario.
- **Criterio de Aceptación (Gherkin)**:
  > Dado un usuario con prestigio nivel 1, cuando ejecuta el reinicio, entonces los activos deben resetearse y el multiplicador global debe actualizarse correctamente en la base.


### 84. [CRITICAL] Implementar motor de cálculo offline mediante sincronización Unix timestamp (`TCK-0091-C21-01`)
- **Fase**: `EVOLUTION_CYCLE_21` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar middleware en Node.js que procese el balance offline mediante: (1) Consulta a PostgreSQL por 'last_seen_at', (2) Cálculo delta = (server_now - last_seen_at) * rate, (3) Aplicación de 'cap' de seguridad, (4) Actualización atómica del balance en DB. El cliente solo recibe el estado final sincronizado.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario cierra la app, Cuando transcurren 60 minutos, Entonces al abrirla, el sistema debe acreditar el balance exacto calculado por el servidor.


### 85. [HIGH] Optimización de colas en Redis para eventos de Adsgram (`TCK-0091-C21-02`)
- **Fase**: `EVOLUTION_CYCLE_21` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Arquitectura: Adsgram Webhook -> HMAC Validation -> Redis (Optimistic Locking) -> Worker (PostgreSQL ACID). Criterio: UI 'optimistic' con feedback de estado. Prohibido procesar payloads sin firma válida. Implementar polling de verificación para inconsistencias entre Redis y PostgreSQL.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario ve un anuncio, Cuando el SDK de Adsgram confirma el evento, Entonces el saldo se actualiza en < 200ms en el cliente.


### 86. [HIGH] Sistema de verificación de suscripción vía Telegram Bot API (`TCK-0091-C21-03`)
- **Fase**: `EVOLUTION_CYCLE_21` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Desarrollar middleware que escuche eventos de Telegram para actualizar PostgreSQL. Al reclamar recompensas, el sistema debe consultar el estado en Redis; si es nulo o expirado, ejecutar 'getChatMember' directo y refrescar caché. Incluir escenarios Gherkin para manejar errores 4xx/5xx y estados 'left/kicked' de forma transaccional.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario realiza una tarea, Cuando el bot verifica el status 'member' en el canal, Entonces se habilita el multiplicador en la DB.


### 87. [MEDIUM] Diseño de esquema relacional para sistema de prestigio y referidos (`TCK-0091-C21-04`)
- **Fase**: `EVOLUTION_CYCLE_21` | **Área Asignada**: **Arquitectura** (Owner: `data_arch`)
- **Especificación Técnica**: Esquema PostgreSQL con índices optimizados, sentencias preparadas, control de concurrencia y validación estricta de parámetros de referidos mediante HMAC-SHA256.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un nuevo usuario se registra, Cuando ingresa vía link de referido, Entonces el padre recibe automáticamente la bonificación en su balance.


### 88. [HIGH] Optimización del cálculo offline con Supabase y marcas Unix (`TCK-0091-C22-01`)
- **Fase**: `EVOLUTION_CYCLE_22` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Node.js extrae la marca Unix del JWT, valida la diferencia temporal contra el servidor y ejecuta la función SQL de Supabase pasando parámetros limpios y seguros.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario abre la TMA tras horas de inactividad, cuando el backend procesa la sesión, entonces calcula y acredita el saldo pasivo exacto sin desbordar la base de datos.


### 89. [CRITICAL] Integración y validación transaccional segura con Telegram Stars (`TCK-0091-C22-02`)
- **Fase**: `EVOLUTION_CYCLE_22` | **Área Asignada**: **Facturación** (Owner: `finops_lead`)
- **Especificación Técnica**: Configurar webhooks de Node.js para procesar eventos pre_checkout_query y successful_payment, actualizando el inventario del usuario en Supabase mediante transacciones ACID.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario completa un pago con Stars, cuando el webhook valida el evento, entonces se acredita el acelerador cosmético de forma atómica y sin duplicidades.


### 90. [HIGH] Mitigación de abuso en la verificación de tareas de canales (`TCK-0091-C22-03`)
- **Fase**: `EVOLUTION_CYCLE_22` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Configurar Redis con TTL de 300s y actualización vía webhook. Añadir middleware de rate-limiting por usuario, validación de firmas criptográficas y verificación atómica previa al otorgamiento de multiplicadores.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario solicita la recompensa de tarea, cuando el backend consulta la API de Telegram y valida el estado, entonces libera el multiplicador y almacena el estado en caché.


### 91. [MEDIUM] Orquestación de notificaciones push masivas respetando límites de tasa (`TCK-0091-C22-04`)
- **Fase**: `EVOLUTION_CYCLE_22` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Desarrollar una cola en Redis consumida por workers de Node.js que envíen mensajes masivos respetando estrictamente el límite de 30 mensajes por segundo de Telegram.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que se activa una campaña de reenganche, cuando la cola procesa los envíos, entonces entrega los avisos de producción acumulada sin disparar errores 429 de la API.


### 92. [HIGH] Optimización de cálculo offline con Redis y PostgreSQL (`TCK-0091-C23-01`)
- **Fase**: `EVOLUTION_CYCLE_23` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Endpoint protegido con validación estricta en servidor. Uso de Redis para sesión y marcas de tiempo, almacenamiento relacional en PostgreSQL con control de precisión de punto flotante y matriz de pruebas E2E.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario reingresa a la TMA, cuando el backend procesa la diferencia temporal, entonces calcula y acredita las ganancias pasivas exactamente.


### 93. [CRITICAL] Integración y validación segura de Adsgram y Telegram Stars (`TCK-0091-C23-02`)
- **Fase**: `EVOLUTION_CYCLE_23` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Desarrollar middleware de verificación de firmas HMAC para WebAppInitData de Telegram y webhooks de Adsgram en el servidor Node.js.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario completa un anuncio o compra un acelerador, cuando el servidor valida el hash, entonces otorga el multiplicador de forma segura.


### 94. [MEDIUM] Motor de verificación automatizada de suscripciones a canales (`TCK-0091-C23-03`)
- **Fase**: `EVOLUTION_CYCLE_23` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Configurar Webhooks (getUpdates/setWebhook) como fuente primaria de estado. Redis actuará como capa de persistencia con TTL de 30 minutos. El worker procesará reintentos mediante BullMQ, aplicando 'p-throttle' para respetar los límites globales de la API de Telegram y validación estricta de inputs vía Zod.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario reclama una tarea de canal, cuando el sistema valida su membresía vía API, entonces desbloquea el multiplicador temporal.


### 95. [HIGH] Despliegue de infraestructura altamente disponible con Supabase y Redis (`TCK-0091-C23-04`)
- **Fase**: `EVOLUTION_CYCLE_23` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Arquitectura: Supabase (PostgreSQL) con Redis para colas/caché. Implementar: 1) Escritura asíncrona con reintentos exponenciales; 2) Validación de esquemas (Zod) en cada endpoint; 3) Inyección de secretos vía Vault; 4) Middleware JWT con sanitización estricta. Todo despliegue debe pasar pruebas de carga bajo concurrencia simulada.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que se produce un pico de tráfico por difusión masiva, cuando el sistema procesa las solicitudes, entonces mantiene un tiempo de respuesta menor a 200ms.


### 96. [CRITICAL] Implementación de cálculo de ganancias offline basado en Unix (`TCK-0091-C24-01`)
- **Fase**: `EVOLUTION_CYCLE_24` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Prohibido calcular `balance` en cliente. El frontend solo solicita el estado. El backend (Node.js) ejecutará un Stored Procedure en cada petición de 'claim': validar timestamp, calcular delta, aplicar multiplicadores y actualizar balance vía transacción atómica con `SELECT FOR UPDATE`. Redis almacenará sesiones para evitar peticiones redundantes.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario cierra la App, Cuando regresa tras T segundos, Entonces el balance aumenta exactamente en (T * tasa_global) sin errores de concurrencia.


### 97. [HIGH] Integración de Adsgram SDK con eventos de recompensa (`TCK-0091-C24-02`)
- **Fase**: `EVOLUTION_CYCLE_24` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Backend debe implementar endpoint para Adsgram Webhook con verificación HMAC usando secret compartido. El flujo: Adsgram notifica evento -> Backend valida firma y nonce -> Consulta S2S a Adsgram API para confirmar ID de evento -> Persistencia atómica en PostgreSQL con UUID único para idempotencia.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario ve un anuncio completo, Cuando el SDK dispara el callback, Entonces el backend acredita la recompensa y registra el evento.


### 98. [MEDIUM] Optimización de colas de difusión con Redis (`TCK-0091-C24-03`)
- **Fase**: `EVOLUTION_CYCLE_24` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Utilizar Redis BullMQ para gestionar colas de mensajes, aplicando 'rate limiting' de 30 mensajes/segundo por bot para respetar los límites de la API oficial.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que se programa una campaña de reactivación, Cuando se ejecuta, Entonces los mensajes se envían secuencialmente sin exceder los límites de la API.


### 99. [HIGH] Sistema de verificación de suscripción vía API Telegram (`TCK-0091-C24-04`)
- **Fase**: `EVOLUTION_CYCLE_24` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Desarrollar middleware en backend que consulte Redis antes de llamar a 'getChatMember', registrando eventos entrantes vía Webhook de Telegram para garantizar persistencia y baja latencia.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario intenta reclamar una tarea, Cuando el backend consulta la API, Entonces solo otorga el multiplicador si status es 'member' o 'administrator'.


### 100. [HIGH] Optimización de Sincronización Offline con Redis y Supabase (`TCK-0091-C25-01`)
- **Fase**: `EVOLUTION_CYCLE_25` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar un servicio en Node.js que procese marcas de tiempo Unix comparando el último timestamp en Redis con el servidor para calcular el delta acumulado.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario reabre la TMA tras 8 horas, Cuando el backend procesa la sesión, Entonces calcula y acredita exactamente el recurso acumulado basado en la tasa activa sin saturar Supabase.


### 101. [CRITICAL] Mitigación de Fraude en Tareas de Suscripción Telegram (`TCK-0091-C25-02`)
- **Fase**: `EVOLUTION_CYCLE_25` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Desarrollar un middleware de caché en Redis para almacenar estados de verificación de tareas por usuario durante 5 minutos antes de consultar getChatMember.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario reclama una tarea patrocinada, Cuando la API valida la suscripción, Entonces se verifica el estado actual y se bloquea el reintento masivo mediante caché.


### 102. [HIGH] Integración del SDK de Adsgram y MicroPagos con Telegram Stars (`TCK-0091-C25-03`)
- **Fase**: `EVOLUTION_CYCLE_25` | **Área Asignada**: **Facturación** (Owner: `finops_lead`)
- **Especificación Técnica**: Configurar endpoints webhooks seguros en Node.js para procesar eventos pre-checkout de Telegram Stars y callbacks de Adsgram, actualizando Supabase atómicamente.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario completa un pago con Stars, Cuando el webhook valida la transacción, Entonces se acredita el acelerador cosmético en la base de datos de forma inmediata.


### 103. [MEDIUM] Estructuración del Sistema de Referidos con Enlaces Profundos (`TCK-0091-C25-04`)
- **Fase**: `EVOLUTION_CYCLE_25` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Diseñar la lógica de captura del parámetro startapp en el frontend de React y registrar la relación de referencia en PostgreSQL mediante una función RPC atómica.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario nuevo ingresa mediante un enlace profundo, Cuando se inicializa la TMA, Entonces se vincula correctamente al referidor y ambos reciben la bonificación establecida.


### 104. [HIGH] Optimización de cálculo fuera de línea mediante Redis y PostgreSQL (`TCK-0091-C26-01`)
- **Fase**: `EVOLUTION_CYCLE_26` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar un servicio en Node.js que compare el timestamp Unix almacenado en Redis con la hora actual al abrir la TMA, aplicando la fórmula incremental y actualizando Supabase.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario regresa tras una hora de inactividad, cuando abre la TMA, entonces el sistema calcula y acredita exactamente el producto del tiempo transcurrido por la tasa total de activos.


### 105. [CRITICAL] Verificación automatizada de suscripciones a canales patrocinados vía Telegram API (`TCK-0091-C26-02`)
- **Fase**: `EVOLUTION_CYCLE_26` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Desarrollar un middleware con caché en Redis utilizando getChatMember de la API de Telegram para validar lotes de usuarios antes de liberar recompensas en Supabase.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario completa una tarea de canal patrocinado, cuando el bot verifica su estatus mediante la API, entonces el sistema valida la membresía y aplica el multiplicador temporal sin exceder los límites de tasa.


### 106. [HIGH] Integración del SDK de Adsgram para monetización con anuncios de recompensa (`TCK-0091-C26-03`)
- **Fase**: `EVOLUTION_CYCLE_26` | **Área Asignada**: **Desarrollo** (Owner: `frontend_lead`)
- **Especificación Técnica**: El backend procesará webhooks S2S de Adsgram validando el token HMAC criptográfico. Solo tras autenticar la firma, Node.js acreditará los recursos del multiplicador en PostgreSQL y Redis.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario visualiza completamente un anuncio recompensado de Adsgram, cuando el SDK emite el evento de éxito, entonces el backend acredita instantáneamente los recursos correspondientes en la base de datos.


### 107. [HIGH] Estructuración y persistencia del bucle de prestigio y multiplicadores (`TCK-0091-C26-04`)
- **Fase**: `EVOLUTION_CYCLE_26` | **Área Asignada**: **Arquitectura** (Owner: `data_arch`)
- **Especificación Técnica**: Definir tablas relacionales en Supabase (PostgreSQL) para registrar el nivel de prestigio, el factor multiplicador permanente y la auditoría de reinicios de activos.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario cumple las condiciones de reinicio por prestigio, cuando ejecuta la acción en la TMA, entonces se reinician los activos, se incrementa el multiplicador permanente y se persiste en Supabase de forma atómica.


### 108. [HIGH] Optimización de cálculo offline mediante Redis y PostgreSQL (`TCK-0091-C27-01`)
- **Fase**: `EVOLUTION_CYCLE_27` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: 1. Validar marcas de tiempo Unix como enteros positivos. 2. Ejecutar sentencias SQL parametrizadas para evitar inyecciones. 3. Cargar secretos exclusivamente mediante variables de entorno protegidas. 4. Procesar transacciones atómicas con manejo robusto de excepciones.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario reingresa a la Mini App, cuando el backend procesa su última conexión, entonces calcula con precisión milimétrica las ganancias pasivas acumuladas.


### 109. [HIGH] Verificación automatizada de suscripciones a canales patrocinados (`TCK-0091-C27-02`)
- **Fase**: `EVOLUTION_CYCLE_27` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Integrar un middleware en Node.js que consulte getChatMember de la API de Telegram con caché en Redis para evitar bloqueos por saturación.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario completa una tarea de suscripción, cuando el sistema verifica su estado mediante la API oficial, entonces libera el multiplicador temporal de forma segura.


### 110. [CRITICAL] Mitigación de fraudes en micropagos con Telegram Stars (`TCK-0091-C27-03`)
- **Fase**: `EVOLUTION_CYCLE_27` | **Área Asignada**: **Facturación** (Owner: `finops_lead`)
- **Especificación Técnica**: Configurar webhooks seguros en Node.js para procesar los eventos pre_checkout_query y successful_payment, actualizando los activos del usuario en Supabase.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario adquiere un acelerador con Telegram Stars, cuando el pago es validado, entonces se acredita el recurso digital de forma transaccional sin duplicidades.


### 111. [MEDIUM] Automatización de difusión masiva con control de tasa de envío (`TCK-0091-C27-04`)
- **Fase**: `EVOLUTION_CYCLE_27` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Construir una cola basada en Redis (BullMQ) para procesar el envío masivo de notificaciones respetando estrictamente el límite de 30 mensajes por segundo.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que se programa una campaña de difusión para usuarios inactivos, cuando se ejecuta la cola, entonces se despachan los mensajes gradualmente sin generar errores 429 de Telegram.


### 112. [HIGH] Optimización de cálculo de ganancias offline con Redis y PostgreSQL (`TCK-0091-C28-01`)
- **Fase**: `EVOLUTION_CYCLE_28` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar un servicio en Node.js que calcule ganancias offline usando la diferencia de timestamps Unix, validando con estado en Redis y persistiendo en Supabase.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario reabre la TMA tras inactividad, Cuando el backend procesa el timestamp actual, Entonces calcula y acredita exactamente el recurso acumulado sin sobrecargar la base de datos.


### 113. [CRITICAL] Integración segura de Adsgram y validación de Telegram Stars (`TCK-0091-C28-02`)
- **Fase**: `EVOLUTION_CYCLE_28` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Validar firmas HMAC en webhooks de Telegram Stars y callbacks criptográficos del SDK de Adsgram antes de actualizar saldos de activos.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que se emite un callback de recompensa publicitaria, Cuando el backend recibe la petición sin firma válida, Entonces rechaza la transacción y registra el intento anómalo.


### 114. [MEDIUM] Verificación automatizada de suscripciones a canales patrocinados vía API (`TCK-0091-C28-03`)
- **Fase**: `EVOLUTION_CYCLE_28` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Construir una cola en Redis para procesar llamadas asíncronas a getChatMember mediante la API de Telegram, aplicando backoff exponencial ante saturación.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario completa una tarea de suscripción, Cuando el sistema valida su membresía, Entonces libera el multiplicador temporal respetando los límites de la API oficial.


### 115. [MEDIUM] Motor de difusión programada para re-engagement de usuarios inactivos (`TCK-0091-C28-04`)
- **Fase**: `EVOLUTION_CYCLE_28` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Arquitectura: Redis para colas, PostgreSQL para persistencia. Desarrollar worker con: 1. Validación Zod estricta. 2. Middleware de reintento con backoff exponencial. 3. Enmascaramiento de PII en logs. 4. Pruebas de carga con k6 para validar umbrales de rate-limit de Telegram API.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario supera el umbral de inactividad, Cuando el worker ejecuta la campaña de difusión, Entonces entrega la notificación de producción acumulada sin errores de rate limit.


### 116. [HIGH] Implementación de validación de ganancias offline mediante marcas de tiempo Unix (`TCK-0091-C29-01`)
- **Fase**: `EVOLUTION_CYCLE_29` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Crear endpoint `/sync` en Node.js. Implementar transacción SQL que bloquee la fila del usuario, calcule el tiempo transcurrido, aplique multiplicadores, actualice PostgreSQL y refresque la sesión en Redis.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario desconecta su sesión de juego, cuando vuelve a conectarse después de N segundos, entonces el backend calcula y suma las ganancias pasivas exactas aplicando su multiplicador de prestigio y actualiza el saldo en la base de datos sin discrepancias temporales.


### 117. [CRITICAL] Validación criptográfica de initData de Telegram en cada petición API (`TCK-0091-C29-02`)
- **Fase**: `EVOLUTION_CYCLE_29` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Middleware de Node.js que extrae `initData` de las cabeceras, calcula el hash HMAC-SHA256 con el token del bot y valida la firma antes de procesar transacciones de Stars o Adsgram.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un cliente realiza una llamada a la API del backend, cuando la firma de `initData` es inválida o ha expirado, entonces el servidor rechaza la solicitud con un código de estado 401 Unauthorized de inmediato.


### 118. [HIGH] Cola de mensajería BullMQ en Redis para difusión masiva resiliente (`TCK-0091-C29-03`)
- **Fase**: `EVOLUTION_CYCLE_29` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Configurar BullMQ con Redis para procesar trabajos de difusión con limitación de tasa integrada de 25 peticiones por segundo, gestionando reintentos automáticos ante errores 429.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que se inicia una campaña de reactivación para 10,000 usuarios inactivos, cuando se envían los mensajes a través de la cola de Redis, entonces la tasa de envío no supera las 30 peticiones por segundo y se reintentan los fallos por límite de tasa de forma transparente.


### 119. [HIGH] Integración de webhook seguro de Adsgram para multiplicadores temporales (`TCK-0091-C29-04`)
- **Fase**: `EVOLUTION_CYCLE_29` | **Área Asignada**: **Desarrollo** (Owner: `frontend_lead`)
- **Especificación Técnica**: Exigir verificación estricta de firma HMAC-SHA256 en Node.js, almacenamiento temporal de nonces en Redis con TTL de 5 minutos, y actualización atómica del multiplicador en PostgreSQL.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario completa la visualización de un anuncio premiado, cuando el SDK de Adsgram emite el evento de éxito verificado por el backend, entonces se activa un multiplicador de x2 en su tasa de generación por 4 horas.


### 120. [HIGH] Optimización del cálculo offline con Redis y PostgreSQL (`TCK-0091-C30-01`)
- **Fase**: `EVOLUTION_CYCLE_30` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Utilizar PostgreSQL con transacciones `SERIALIZABLE` para el saldo, validando el `initData` de Telegram vía HMAC-SHA-256. Redis actuará solo como caché volátil de sesión. Sanitizar todo input con librerías validadoras (Joi/Zod) antes de cualquier operación de escritura.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario reingresa a la Mini App tras horas de inactividad, cuando el backend procesa su sesión, entonces calcula y acredita el saldo offline exacto sin sobrecargar la base de datos relacional.


### 121. [CRITICAL] Mitigación de fraudes en verificación de tareas con API de Telegram (`TCK-0091-C30-02`)
- **Fase**: `EVOLUTION_CYCLE_30` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Desarrollar un worker en Node.js con cola en Redis que consulte el estado de membresía mediante getChatMember con reintentos exponenciales y validación de firma criptográfica.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario reclama una recompensa de tarea patrocinada, cuando el sistema verifica su suscripción, entonces valida el estado real vía API de Telegram antes de liberar el multiplicador temporal.


### 122. [HIGH] Resiliencia en entrega de Adsgram y webhooks de Telegram Stars (`TCK-0091-C30-03`)
- **Fase**: `EVOLUTION_CYCLE_30` | **Área Asignada**: **Facturación** (Owner: `finops_lead`)
- **Especificación Técnica**: Crear un endpoint idempotente en Node.js protegido por HMAC para procesar webhooks de Adsgram y Telegram Stars, respaldando cada transacción en Supabase con estados estrictos.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario completa un anuncio recompensado o adquiere estrellas, cuando la pasarela emite el webhook, entonces el balance y los aceleradores se actualizan de forma atómica e idempotente.


### 123. [MEDIUM] Orquestación de difusiones masivas respetando rate limits del bot (`TCK-0091-C30-04`)
- **Fase**: `EVOLUTION_CYCLE_30` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Configurar una cola de mensajes en Redis con BullMQ que limite estrictamente las peticiones salientes a 30 mensajes por segundo hacia la API de Telegram.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el sistema ejecuta una campaña de difusión para usuarios inactivos, cuando se procesa la cola de envío, entonces se distribuyen los avisos respetando el umbral máximo de peticiones permitido.


### 124. [HIGH] Optimización de cálculo de ganancias offline mediante Redis (`TCK-0091-C31-01`)
- **Fase**: `EVOLUTION_CYCLE_31` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar un script en Node.js utilizando marcas de tiempo Unix almacenadas en Redis para calcular el delta productivo offline de forma atómica.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario abre la Mini App tras horas de inactividad, Cuando el backend procesa la sesión, Entonces calcula y acredita el saldo exacto en menos de 100ms sin sobrecargar PostgreSQL.


### 125. [CRITICAL] Mitigación de fraudes en validación de anuncios Adsgram y Stars (`TCK-0091-C31-02`)
- **Fase**: `EVOLUTION_CYCLE_31` | **Área Asignada**: **Ciberseguridad** (Owner: `sec_auditor`)
- **Especificación Técnica**: Validar criptográficamente los callbacks de Adsgram y las webhooks de Telegram Stars en el backend Node.js antes de actualizar saldos.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que se intenta simular un evento de recompensa publicitaria desde el cliente, Cuando el backend recibe el callback manipulado, Entonces rechaza la transacción y registra la alerta de seguridad.


### 126. [MEDIUM] Automatización de verificación de suscripciones en canales patrocinados (`TCK-0091-C31-03`)
- **Fase**: `EVOLUTION_CYCLE_31` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar un microservicio Node.js conectado a Webhooks para capturar eventos de membresía, respaldado por Redis con TTL de 15 minutos para evitar consultas redundantes a getChatMember.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario completa una tarea de suscripción, Cuando el sistema valida su membresía, Entonces libera el multiplicador temporal respetando los límites de la API oficial.


### 127. [HIGH] Estructuración de difusión masiva para reactivación de inactivos (`TCK-0091-C31-04`)
- **Fase**: `EVOLUTION_CYCLE_31` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Desplegar un worker dedicado en Node.js que procese lotes de difusión desde PostgreSQL utilizando un sistema de limitación de tasa basado en token bucket en Redis.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que se ejecuta una campaña de reengagement, Cuando el worker procesa la lista de inactivos, Entonces envía las alertas cumpliendo estrictamente el límite de 30 mensajes por segundo.


### 128. [CRITICAL] Implementar motor de cálculo offline mediante diff de Unix timestamp (`TCK-0091-C32-01`)
- **Fase**: `EVOLUTION_CYCLE_32` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Backend (Node.js) ejecutará: `gain = (now - last_sync) * rate`. Se validará contra el timestamp de servidor. La respuesta incluirá el nuevo balance y `last_sync` actualizado. El cliente tratará estos datos como inmutables, bloqueando cualquier modificación local del estado financiero.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario cierra la app, cuando regresa tras 1 hora, entonces el balance debe incrementarse exactamente por el producto de su tasa actual por 3600 segundos.


### 129. [HIGH] Integración del SDK Adsgram con validación de eventos server-side (`TCK-0091-C32-02`)
- **Fase**: `EVOLUTION_CYCLE_32` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Arquitectura: Webhook listener valida firma HMAC + nonce único. Supabase ejecuta transacciones atómicas con verificación de estado previo. El cliente debe confirmar el evento mediante token de sesión cifrado para prevenir manipulación local. Logs de auditoría obligatorios para cada incremento de balance.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario ve un anuncio, cuando el callback de Adsgram llega al servidor, entonces el balance de Stars/Bonificación aumenta solo si el hash es válido.


### 130. [HIGH] Sistema de referidos virales con deep linking y bonificación bidireccional (`TCK-0091-C32-03`)
- **Fase**: `EVOLUTION_CYCLE_32` | **Área Asignada**: **Negocio** (Owner: `func_analyst`)
- **Especificación Técnica**: Implementar middleware de validación HMAC en el endpoint de inicio. Registro en Redis con TTL de 24h para huella digital (IP/DeviceID). PostgreSQL almacenará la relación `referrer_id` tras verificar la firma y la unicidad de sesión, asegurando integridad contra bots y fraude.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario nuevo entra por un link, cuando completa el tutorial, entonces ambos usuarios reciben el multiplicador de producción permanente asignado.


### 131. [MEDIUM] Automatización de notificaciones push para reactivación de usuarios inactivos (`TCK-0091-C32-04`)
- **Fase**: `EVOLUTION_CYCLE_32` | **Área Asignada**: **Infraestructura** (Owner: `infra_sre`)
- **Especificación Técnica**: Arquitectura basada en BullMQ con Redis. Configurar 'limiter' para respetar los rate limits de Telegram (30 msg/s). Implementar job idempotente con TTL, reintentos automáticos configurables y una Dead Letter Queue (DLQ) para auditoría de notificaciones fallidas, garantizando persistencia total y escalabilidad horizontal.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario lleva 24h inactivo, cuando el job de cron se ejecuta, entonces el bot envía un mensaje de 'producción acumulada' respetando el rate limit.


### 132. [HIGH] Capa de persistencia con Redis para caché de sesiones de juego (`TCK-0091-C32-05`)
- **Fase**: `EVOLUTION_CYCLE_32` | **Área Asignada**: **Ciberseguridad** (Owner: `data_arch`)
- **Especificación Técnica**: Utilizar Redis con persistencia AOF habilitada. Ejecutar incrementos de balance mediante scripts Lua para asegurar atomicidad. El worker asíncrono realizará el volcado a PostgreSQL bajo transacciones ACID, utilizando un sistema de versionado de registro para evitar colisiones y asegurar la integridad referencial en cada evento de prestigio.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario realiza clics rápidos, cuando se consulta el balance, entonces la lectura es inmediata desde Redis y la persistencia en Postgres es eventual.


### 133. [CRITICAL] Implementar lógica de cálculo de ganancias offline vía Unix (`TCK-0091-C33-01`)
- **Fase**: `EVOLUTION_CYCLE_33` | **Área Asignada**: **Desarrollo** (Owner: `backend_lead`)
- **Especificación Técnica**: Implementar endpoint `/sync_offline` protegido por JWT. El backend calculará `(now - last_seen) * rate` mediante función SQL transaccional. Prohibido procesar timestamps enviados por cliente. Balance actualizado debe validarse contra límites de 'cap' definidos en Redis para evitar desbordamientos.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario cierra la app, Cuando retorna tras 1 hora, Entonces el balance se incrementa exactamente según el rate acumulado registrado en servidor.


### 134. [HIGH] Integración de Adsgram SDK con validación de eventos (`TCK-0091-C33-02`)
- **Fase**: `EVOLUTION_CYCLE_33` | **Área Asignada**: **Desarrollo** (Owner: `frontend_lead`)
- **Especificación Técnica**: Implementar middleware de verificación HMAC en el endpoint de callback. El payload debe incluir el 'initData' de Telegram y la firma de Adsgram. El backend comparará la firma con el secreto compartido antes de ejecutar la transacción SQL atómica en Supabase que actualiza el balance.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario inicia un anuncio, Cuando finaliza la visualización completa, Entonces el balance se actualiza y se registra la transacción en Supabase.


### 135. [HIGH] Optimización de base de datos con Redis para estados (`TCK-0091-C33-03`)
- **Fase**: `EVOLUTION_CYCLE_33` | **Área Asignada**: **Infraestructura** (Owner: `data_arch`)
- **Especificación Técnica**: Redis actuará como fuente de verdad volátil con persistencia mediante AOF (Append Only File) habilitado. Las transacciones críticas usarán `MULTI/EXEC` para escritura síncrona en PostgreSQL. Los estados incrementales de balance se volcarán vía worker asíncrono con checkpointing de integridad cada 60s, validado por transacciones previas en el WAL.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que el usuario realiza múltiples clicks por segundo, Cuando el sistema procesa las peticiones, Entonces la latencia de respuesta se mantiene bajo 100ms mediante Redis.


### 136. [MEDIUM] Automatización de verificación de suscripciones vía Telegram API (`TCK-0091-C33-04`)
- **Fase**: `EVOLUTION_CYCLE_33` | **Área Asignada**: **Arquitectura** (Owner: `solution_arch`)
- **Especificación Técnica**: Implementar validación estricta con Zod en el job queue. Enmascarar IDs en logs mediante middleware de serialización. Usar variables de entorno para tokens con permisos mínimos de lectura (getChatMember). Integrar Redis con persistencia encriptada para evitar inyecciones en callbacks.
- **Criterio de Aceptación (Gherkin)**:
  > Dado que un usuario completa una tarea, Cuando el bot consulta la API, Entonces el multiplicador temporal se desbloquea tras confirmar la suscripción.


---

## 5. Matriz de Seguridad y Cumplimiento OWASP
- Cero almacenamiento de contraseñas en texto plano.
- Sanitización estricta de entradas en frontend y backend para mitigar XSS y SQLi.
- Aislamiento de variables sensibles en variables de entorno locales.

---

## 6. Registro de Firmas de Aprobación Unánime (100% de Especialistas)
Todos los directores, arquitectos, analistas y líderes operativos firman de conformidad:
- [x] **[LIA-01] Strategic Client Liaison & Objective Auditor** — Strategic Client Liaison & Objective Auditor (*Intermediación Estratégica*): **APROBADO SIN OBJECIONES**
- [x] **[BIZ-01] Business Owner & Client Advocate** — Business Owner & Client Advocate (*Negocio*): **APROBADO SIN OBJECIONES**
- [x] **[FIN-01] FinOps & Monetization Manager** — FinOps & Monetization Manager (*Facturación*): **APROBADO SIN OBJECIONES**
- [x] **[OPS-01] Customer Operations & Support Lead** — Customer Operations & Support Lead (*Soporte*): **APROBADO SIN OBJECIONES**
- [x] **[ARCH-01] Lead Solution Architect** — Lead Solution Architect (*Arquitectura*): **APROBADO SIN OBJECIONES**
- [x] **[FUNC-01] Technical-Functional Analyst** — Technical-Functional Analyst (*Análisis Funcional*): **APROBADO SIN OBJECIONES**
- [x] **[DBA-01] Database & Persistence Architect** — Database & Persistence Architect (*Persistencia*): **APROBADO SIN OBJECIONES**
- [x] **[BACKEND-01] Principal Backend Engineer** — Principal Backend Engineer (*Desarrollo Backend*): **APROBADO SIN OBJECIONES**
- [x] **[FRONTEND-01] Principal Frontend & UI/UX Engineer** — Principal Frontend & UI/UX Engineer (*Desarrollo Frontend*): **APROBADO SIN OBJECIONES**
- [x] **[SRE-01] DevOps & Site Reliability Engineer** — DevOps & Site Reliability Engineer (*Infraestructura*): **APROBADO SIN OBJECIONES**
- [x] **[QA-01] QA Automation Lead** — QA Automation Lead (*QA & Testing*): **APROBADO SIN OBJECIONES**
- [x] **[SEC-01] Cybersecurity & Compliance Auditor** — Cybersecurity & Compliance Auditor (*Ciberseguridad*): **APROBADO SIN OBJECIONES**
- [x] **[DIR-01] Engineering Director** — Engineering Director (*Dirección Técnica*): **APROBADO SIN OBJECIONES**
- [x] **[AUDIT-01] Governance & Audit Manager** — Governance & Audit Manager (*Auditoría*): **APROBADO SIN OBJECIONES**
