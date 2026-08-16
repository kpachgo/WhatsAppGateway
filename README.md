# Clínica WhatsApp Gateway

Gateway multi-instalación para conectar Meta WhatsApp Cloud API con backends locales de Clínica Electron.

## Requisitos

- Node.js 20 o superior.
- MySQL 8.
- Una aplicación de Meta configurada con WhatsApp y un webhook HTTPS público.

## Instalación

```bash
npm install
copy .env.example .env
```

Edita `.env`. `TOKEN_ENCRYPTION_KEY` debe ser una clave aleatoria de 32 bytes expresada en hexadecimal. Por ejemplo, puede generarse con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

En Railway debes agregar estas variables en la pestaña **Variables**. Railway no utiliza automáticamente el `.env` de tu computadora:

```text
META_GRAPH_VERSION=v23.0
META_APP_SECRET=...
META_WEBHOOK_VERIFY_TOKEN=...
TOKEN_ENCRYPTION_KEY=...
ADMIN_API_TOKEN=...
```

Si agregas un servicio MySQL de Railway, sus variables `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER` y `MYSQLPASSWORD` son aceptadas directamente por la aplicación. Si usas una base externa, configura sus equivalentes `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER` y `MYSQL_PASSWORD`.

Crea la base de datos y ejecuta el script único:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS clinica_whatsapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p clinica_whatsapp < sql/schema.sql
```

Inicia el gateway:

```bash
npm start
```

## Endpoints

### Meta

- `GET /webhooks/meta`: verificación del webhook usando `META_WEBHOOK_VERIFY_TOKEN`.
- `POST /webhooks/meta`: recibe eventos y valida `X-Hub-Signature-256` con `META_APP_SECRET`.

### Administración

Requiere el header `x-admin-token: ADMIN_API_TOKEN`.

Crear una conexión (la respuesta contiene `clinicKey`; debe guardarse porque no se vuelve a mostrar):

```http
POST /v1/connections
x-admin-token: ...
Content-Type: application/json

{
  "clinicId": "clinica-san-miguel",
  "phoneNumberId": "123456789",
  "wabaId": "987654321",
  "accessToken": "TOKEN_DE_META"
}
```

### Cliente local de Clínica Electron

Todos los endpoints siguientes requieren:

```http
x-clinic-id: clinica-san-miguel
x-clinic-key: CLAVE_GENERADA_AL_REGISTRAR
```

- `GET /v1/events/next`: obtiene el siguiente evento pendiente. El evento queda bloqueado temporalmente (`EVENT_LEASE_SECONDS`).
- `POST /v1/events/:id/ack`: confirma que Clínica Electron procesó el evento.
- `POST /v1/messages`: envía un mensaje por el número asociado a la clínica.

Ejemplo de envío:

```json
{
  "to": "50370000000",
  "type": "text",
  "body": "Su cita ha sido confirmada"
}
```

## Flujo de eventos

1. Meta envía un webhook al gateway.
2. El gateway valida la firma y normaliza el evento.
3. Se busca la conexión por `phone_number_id`.
4. El evento se guarda una sola vez mediante `external_id`.
5. La instalación local consulta `/v1/events/next` desde una conexión saliente.
6. Después de procesarlo, confirma con `/ack`.

Si la laptop se desconecta, el evento permanece pendiente. Si no confirma antes de vencer el lease, vuelve a estar disponible.

## Seguridad

- No subir `.env` al repositorio.
- Usar HTTPS en producción.
- El token de Meta se almacena cifrado; el gateway nunca lo devuelve por API.
- Rotar `ADMIN_API_TOKEN`, `META_APP_SECRET` y las claves de clínicas si se filtran.
- El gateway no debe almacenar historias clínicas; solo conserva los eventos estrictamente necesarios para transportar WhatsApp.

## Estado del MVP

El transporte local usa polling autenticado porque funciona detrás de NAT sin abrir puertos en las laptops. En una segunda fase puede agregarse WebSocket, panel administrativo, reintentos avanzados y métricas.
