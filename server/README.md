# Gasóleo REST API (MySQL)

Small Express server for fuel and oil entries. **No authentication** — use only on trusted networks (home LAN or dev). Add API keys or JWT before exposing to the internet.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MySQL](https://dev.mysql.com/downloads/) 8.x (or compatible)

## MySQL setup

1. Log in as root (or a user that can create databases):

   ```bash
   mysql -u root -p
   ```

2. Create database and user (adjust password):

   ```sql
   CREATE DATABASE gasoleo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'gasoleo'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON gasoleo.* TO 'gasoleo'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Import the schema (from the `server` folder):

   ```bash
   mysql -u gasoleo -p gasoleo < schema.sql
   ```

## Server configuration

1. Copy `.env.example` to `.env`.
2. Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and optionally `PORT` (default `3001`).

## Run the API

```bash
cd server
npm install
npm run dev
```

You should see: `Gasóleo API listening on http://localhost:PORT`.

Health check: `GET http://localhost:3001/health`

## Expo / React Native and the API base URL

The app must reach the machine where Node runs. **localhost** on the phone means the phone itself, not your PC.

| Environment | Typical `EXPO_PUBLIC_API_URL` / app `extra.apiUrl` |
|-------------|---------------------------------------------------|
| Web / same machine | `http://localhost:3001` |
| iOS Simulator (Mac) | `http://localhost:3001` |
| Android Emulator | `http://10.0.2.2:3001` (maps to host loopback) |
| Physical device (Wi‑Fi) | `http://<your-computer-LAN-IP>:3001` (e.g. `http://192.168.1.50:3001`) |

Ensure the host firewall allows inbound TCP on the chosen port.

Configure the app in `app.json` → `expo.extra.apiUrl`, or set `EXPO_PUBLIC_API_URL` in a `.env` file at the project root (Expo loads `EXPO_PUBLIC_*` at bundle time).

## API overview

- `GET/POST /api/fuel` — list / create  
- `GET/PUT/DELETE /api/fuel/:id` — read / update / delete  
- `GET/POST /api/oil` — list / create  
- `GET/PUT/DELETE /api/oil/:id` — read / update / delete  

JSON bodies use **`date` in ISO form `YYYY-MM-DD`**, numeric fields as numbers or strings.
