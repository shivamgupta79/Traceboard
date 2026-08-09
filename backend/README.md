# Traceboard — Backend API

Node.js + Express REST API that powers the Traceboard IoT Component Advisor.

## Stack

| Layer        | Technology               |
|--------------|--------------------------|
| Runtime      | Node.js 18+              |
| Framework    | Express 4                |
| Database     | SQLite 3 via better-sqlite3 |
| Validation   | express-validator        |
| Security     | helmet, cors             |
| Logging      | morgan                   |

---

## Quick start

```bash
cd backend
npm install
node server.js          # production
npm run dev             # development (auto-reload via nodemon)
```

The API listens on **http://localhost:3001** by default.

---

## Environment variables

Copy `.env.example` → `.env` and adjust if needed.

| Variable           | Default | Description                       |
|--------------------|---------|-----------------------------------|
| `PORT`             | `3001`  | HTTP port                         |
| `ALLOWED_ORIGINS`  | `*`     | Comma-separated CORS origins      |

---

## API Reference

### Health

```
GET /api/health
```

---

### Parts catalogue

| Method | Path               | Description                         |
|--------|--------------------|-------------------------------------|
| GET    | `/api/parts`       | Full catalogue. Optional `?cat=mcu&q=esp32` filters |
| GET    | `/api/parts/stats` | Total count + counts per category   |
| GET    | `/api/parts/:id`   | Single part detail                  |

**Category values:** `mcu`, `sensor`, `actuator`, `connectivity`, `power`

---

### Recommendation engine

```
POST /api/recommend
Content-Type: application/json

{
  "project": "home",          // home | environment | wearable | agriculture | security | robotics | energy
  "power":   "battery",       // battery | solar | mains
  "conn":    "wifi",          // wifi | ble | lora | gsm | none
  "budget":  "standard",      // budget | standard | premium
  "exp":     "beginner"       // beginner | intermediate | advanced
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "state": { ... },
    "mcuPick":   { "best": {...}, "alts": [...] },
    "connPick":  { "builtin": false, "best": {...}, "alts": [...] },
    "powerPick": { "best": {...}, "alts": [...] },
    "roles": [
      { "role": "Motion / presence sensing", "best": {...}, "alts": [...] }
    ],
    "step3Defaults": {
      "mcus":          ["esp32"],
      "connectivities":["builtin"],
      "powers":        ["li18650"],
      "components":    ["pir", "dht22", "relay"]
    }
  }
}
```

---

### Saved builds

| Method | Path                          | Description                   |
|--------|-------------------------------|-------------------------------|
| GET    | `/api/builds?session=<uuid>`  | List builds for a session     |
| POST   | `/api/builds`                 | Save a new build              |
| GET    | `/api/builds/:id`             | Load one build                |
| DELETE | `/api/builds/:id`             | Delete a build                |

**Save build body:**
```json
{
  "sessionId":   "550e8400-e29b-41d4-a716-446655440000",
  "title":       "My Home Automation Build",
  "projectId":   "home",
  "projectName": "Home Automation",
  "meta": {
    "power":  "battery",
    "conn":   "wifi",
    "budget": "standard",
    "exp":    "beginner"
  },
  "selected": {
    "mcuList":    ["esp32"],
    "connList":   [],
    "powerList":  ["li18650"],
    "components": ["pir", "dht22", "relay"],
    "regulator":  "ams1117"
  }
}
```

---

### Export

| Method | Path               | Description                      |
|--------|--------------------|----------------------------------|
| POST   | `/api/export/txt`  | Download a plain-text parts list |
| POST   | `/api/export/json` | Download a structured JSON export|

Both accept the same body:
```json
{
  "selected": { "mcuList": [...], "connList": [...], "powerList": [...], "components": [...], "regulator": "ams1117" },
  "meta":     { "projectName": "Home Automation", "power": "battery", "conn": "wifi", "budget": "standard", "exp": "beginner" }
}
```
`selected` values are **part ID strings**, not full objects.

---

### Analytics

| Method | Path                                  | Description                     |
|--------|---------------------------------------|---------------------------------|
| GET    | `/api/analytics/popular-projects`     | Top project types by usage      |
| GET    | `/api/analytics/popular-mcus`         | Most recommended MCUs           |
| GET    | `/api/analytics/prefs`                | Budget / exp / conn breakdown   |

---

## File structure

```
backend/
├── server.js               ← entry point
├── package.json
├── .env.example
├── db/
│   ├── database.js         ← SQLite init + seed
│   ├── schema.sql          ← table definitions
│   └── seed.js             ← parts catalogue data
├── engine/
│   └── recommender.js      ← scoring & pick logic
└── routes/
    ├── parts.js
    ├── recommend.js
    ├── builds.js
    ├── export.js
    └── analytics.js
```
