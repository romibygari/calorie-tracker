# Calorie Tracker

Private calorie tracking app for 2 people. Android APK sideloaded — no app store needed.

## Stack
- **Mobile**: React Native + Expo (TypeScript)
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL (Render free tier)
- **Hosting**: Render.com

---

## Project Structure

```
calorie-tracker/
├── apps/
│   ├── backend/    # Express API + Prisma
│   └── mobile/     # Expo React Native app
└── package.json    # npm workspaces root
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Backend — set up database

Create a free PostgreSQL on [render.com](https://render.com):
- Dashboard → New → PostgreSQL → copy **External Database URL**

Create `apps/backend/.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/calorie_tracker"
PORT=3000
```

Run migrations and seed 2 users:
```bash
cd apps/backend
npx prisma migrate dev --name init
npm run db:seed
```

### 3. Import food list

Drop your `foods.csv` in `apps/backend/data/` then:
```bash
npm run db:import --workspace=apps/backend
# or: cd apps/backend && npm run db:import /path/to/your/foods.csv
```

**CSV format:**
```csv
name,brand,calories,protein,carbs,fat,fiber,servingSize,servingUnit
Chicken Breast,,165,31,0,3.6,0,100,g
Brown Rice,,216,4.5,45,1.8,1.8,100,g
```

A sample file is at `apps/backend/data/foods_sample.csv`.

### 4. Set API URL in mobile app

Edit `apps/mobile/app.json`:
```json
"extra": {
  "apiBaseUrl": "https://your-app-name.onrender.com"
}
```

For local development, use your machine's local IP:
```json
"apiBaseUrl": "http://192.168.1.xxx:3000"
```

---

## Running locally

**Backend:**
```bash
npm run backend
# Starts on http://localhost:3000
```

**Mobile (Expo dev server):**
```bash
npm run mobile
# Scan QR with Expo Go app on Android
```

---

## Deploying backend to Render

1. Push repo to GitHub
2. Render → New → Web Service → connect repo
   - Root directory: `apps/backend`
   - Build command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - Start command: `node dist/app.js`
   - Add env var: `DATABASE_URL` = your Render PostgreSQL URL
3. Deploy → copy the URL (e.g. `https://calorie-tracker-xyz.onrender.com`)
4. Update `apiBaseUrl` in `apps/mobile/app.json`

---

## Building the Android APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo (free account at expo.dev)
eas login

# Build APK (runs in cloud, ~10 min, free tier = 30 builds/month)
cd apps/mobile
eas build --platform android --profile preview
```

Download the `.apk` from your Expo dashboard.

**Sideload on Android:**
1. Transfer APK to phone (USB, email, or direct download link)
2. Settings → Security → Install unknown apps → enable
3. Tap the APK to install
4. Repeat for both devices — same APK, pick your profile on first launch

---

## Customizing user names

To change "You" and "Friend" to real names, either:

**Option A** — via API (once backend is deployed):
```bash
curl -X PUT https://your-app.onrender.com/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'

curl -X PUT https://your-app.onrender.com/api/users/2 \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob"}'
```

**Option B** — in the app: Settings screen → edit your name → Save.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List both users |
| PUT | `/api/users/:id` | Update name/targets |
| GET | `/api/foods?search=chicken` | Search foods |
| POST | `/api/foods` | Add custom food |
| POST | `/api/foods/import` | Bulk import CSV/JSON |
| GET | `/api/logs?userId=1&date=2026-03-18` | Get day's logs |
| POST | `/api/logs` | Log a food entry |
| DELETE | `/api/logs/:id` | Remove a log entry |
| GET | `/api/analytics/daily?userId=1&date=X` | Daily summary |
| GET | `/api/analytics/history?userId=1&days=30` | History data |
