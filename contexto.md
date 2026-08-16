# Contexto del proyecto

## Objetivo

`clinica-whatsapp-gateway` es una aplicación intermediaria que conecta la WhatsApp Cloud API oficial de Meta con múltiples instalaciones de Clínica Electron.

Cada clínica puede tener su propio número de WhatsApp. El gateway vive en la nube y los backends de Clínica Electron viven en laptops o PCs locales.

## Decisión principal de red

Las laptops no deben exponerse directamente a Internet. Cada instalación local inicia solicitudes HTTPS hacia el gateway y consulta sus eventos pendientes. Esta conexión saliente funciona aunque la clínica esté detrás de NAT o un router sin reglas de port forwarding.

El MVP usa polling porque es sencillo de instalar y recuperar. La tabla `whatsapp_events` actúa como cola persistente. El campo `lease_until` evita que un evento quede bloqueado permanentemente cuando una laptop falla.

## Multi-tenancy

La unidad de aislamiento es `clinic_id`. Una conexión contiene:

- `clinic_id`: identificador interno de la instalación.
- `phone_number_id`: número de Meta que recibe y envía mensajes.
- `waba_id`: WhatsApp Business Account asociada.
- `access_token_encrypted`: token de Meta cifrado con AES-256-GCM.
- `clinic_key_hash`: hash de la credencial que usa Clínica Electron.

El webhook identifica la clínica con `metadata.phone_number_id`. Nunca se debe confiar en un `clinic_id` enviado dentro del webhook.

## Flujo entrante

```text
Meta → POST /webhooks/meta → firma HMAC → normalización
     → búsqueda por phone_number_id → whatsapp_events
     → GET /v1/events/next desde Clínica Electron → POST /ack
```

Los eventos se deduplican por `external_id`, normalmente el identificador del mensaje o del estado entregado por Meta.

## Flujo saliente

```text
Clínica Electron → POST /v1/messages
                 → autenticación por clínica
                 → token cifrado descifrado en memoria
                 → Graph API de Meta
```

El gateway no debe implementar lógica clínica, agenda, historias médicas ni reglas propias de cada instalación. Su responsabilidad es transportar y registrar el estado técnico de WhatsApp.

## Contrato de autenticación local

La instalación usa dos headers:

```text
x-clinic-id
x-clinic-key
```

La clave se genera al registrar la conexión y solo se muestra una vez. La base de datos guarda únicamente su hash SHA-256.

## Migraciones

1. `001_whatsapp_connections.sql`: conexiones de Meta y credenciales de las clínicas.
2. `002_whatsapp_events.sql`: cola persistente e idempotencia de eventos.
3. `003_clinic_tokens.sql`: espacio preparado para futuras credenciales rotables por clínica.

## Próximas mejoras recomendadas

1. Crear un pequeño agente de Windows para Clínica Electron que haga polling, confirme eventos y traduzca el contrato HTTP a funciones internas.
2. Añadir reintentos de envío saliente con una tabla de mensajes.
3. Añadir endpoint de desactivación y rotación de credenciales.
4. Añadir rate limiting, métricas y alertas.
5. Añadir pruebas automatizadas del webhook, firma, idempotencia y aislamiento entre clínicas.
6. Revisar periódicamente `META_GRAPH_VERSION` según la versión soportada por Meta.
