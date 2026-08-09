# Traceboard — IoT Component Advisor

> Pick the right parts for any IoT project in 4 steps. Get a matched wiring diagram, a full buy list, starter code, and an AI-powered code editor — all in a single HTML file.

---

## What is Traceboard?

Traceboard is a browser-based IoT build advisor. You describe your project, pick your constraints (power, connectivity, budget, experience), and the recommendation engine scores 88+ catalogued parts to surface the best picks for your build. The result is a wiring diagram, component cards with pros/cons, direct buy links, auto-generated Arduino/MicroPython code, and an AI chat assistant that can modify that code using your own API key.

No sign-up required to browse. Full features unlock with a free or paid account.

---

## Live Features

### Landing / Intro Page
- Shown on first visit with feature highlights and plan teaser
- "Get started free", "Sign in", and "Continue as guest" flows

### Auth System
- Email + password sign up / sign in
- Forgot password flow
- Google auth (ready for backend integration)
- Plan selection during sign up
- Credentials stored in `localStorage` (demo mode — swap in a real backend)

### 4-Step Wizard
| Step | What happens |
|------|-------------|
| **1 — Project type** | Choose from 7 categories or describe a custom idea (Pro+) |
| **2 — Constraints** | Pick parts needed, power, connectivity, budget, experience |
| **3 — Components** | Multi-select MCU / connectivity / power / sensors from scored shortlist |
| **4 — Results** | Wiring diagram, product cards, buy list, cost estimate, code generator |

### Custom Project AI (Pro+)
Type your idea in plain English — "smart irrigation with solar and LoRa" — and the analyser detects the project domain, connectivity preference, power type, and matched components, then pre-fills the wizard.

### Wiring Diagram
Auto-generated SVG circuit diagram for every build. Colour-coded by interface type (I²C, SPI, UART, PWM, Analog, Digital, Power).

### AI Code Generator + Editor
Click **</> Generate Code** after Step 4 to open the full-screen code editor:
- Generates complete Arduino C++ or MicroPython starter code
- Three styles: Basic with comments / Class-based OOP / FreeRTOS multi-task
- Built-in line-numbered editor with Tab indentation support
- Copy to clipboard or download as `.ino` / `main.py`

### AI Chat Assistant (bring your own key)
Inside the code editor, click **✦ AI Chat** to open the assistant panel:
- Supports **OpenAI GPT**, **Google Gemini**, **Groq** (free tier), and **Ollama** (local, no key needed)
- The AI receives your current code as context with every message
- AI code blocks show an **⎘ Apply to editor** button — one click replaces or patches the code
- API key stored only in `localStorage` — never leaves your browser except to the chosen provider

| Provider | Default model | Where to get key |
|----------|--------------|-----------------|
| OpenAI | `gpt-4o-mini` | platform.openai.com |
| Gemini | `gemini-1.5-flash` | aistudio.google.com |
| Groq | `llama-3.1-70b-versatile` | console.groq.com (free) |
| Ollama | `codellama` | No key — local only |

### Subscription Plans
| Plan | Price | Save builds | Export BOM | Custom project AI |
|------|-------|-------------|------------|-------------------|
| **Basic** | Free | ✗ | ✗ | ✗ |
| **Starter** | ₹199/mo | ✓ (10 max) | ✓ | ✗ |
| **Pro** | ₹499/mo | ✓ Unlimited | ✓ | ✓ |
| **Enterprise** | ₹1499/mo | ✓ Unlimited | ✓ | ✓ + Team + API |

- Feature gating enforced client-side with upgrade modals
- Current plan badge in the header — click to switch instantly

### Parts Catalogue Browser
- Search all 88+ parts by name or description
- Filter chips: All / ESP32 Boards / Arduino Boards / Sensors / Actuators / Connectivity / Power
- Each card shows category tag, radio badge, price range, and top pro

### Saved Builds
- Save up to 10 builds (Starter) or unlimited (Pro+)
- Builds persist in `localStorage` across sessions
- Per-build export button, load build back into Step 4, delete

---

## Parts Catalogue — 88 Total

### Microcontrollers (29)

**ESP32 Family — 13 boards**

| Board | Wi-Fi | BLE | Price (₹) | Best for |
|-------|-------|-----|-----------|---------|
| ESP32 DevKit V1 | ✓ | ✓ | 350–450 | General IoT |
| ESP32-S3 DevKit | ✓ | ✓ | 450–600 | ML / TinyAI |
| ESP32-S2 Solo | ✓ | — | 350–480 | USB HID sensors |
| ESP32-C3 Mini | ✓ | ✓ | 250–380 | Budget Wi-Fi+BLE |
| ESP32-C6 DevKit | ✓ Wi-Fi 6 | ✓ 5.3 | 400–550 | Matter / Zigbee |
| ESP32-H2 DevKit | — | ✓ 5.3 | 380–520 | Zigbee/Thread mesh |
| ESP32-CAM | ✓ | — | 600–850 | Camera nodes |
| ESP32-WROOM-32 | ✓ | ✓ | 180–280 | Custom PCB |
| ESP32-WROVER-E | ✓ | ✓ | 280–420 | Large buffers / PSRAM |
| LOLIN32 (Wemos D32) | ✓ | ✓ | 400–550 | LiPo battery builds |
| TTGO T-Display | ✓ | ✓ | 700–950 | Standalone dashboards |
| FireBeetle 2 ESP32-E | ✓ | ✓ | 550–750 | Ultra-low-power |
| ESP32-C3 Super Mini | ✓ | ✓ | 200–300 | Tiny wearables |

**Arduino Family — 11 boards**

| Board | Notes | Price (₹) |
|-------|-------|-----------|
| Arduino Nano (ATmega328P) | Tiny, breadboard-friendly | 180–280 |
| Arduino Mega 2560 | 54 digital I/O, 4 UART | 550–750 |
| Arduino Pro Mini 3.3V/5V | Bare-bones, needs FTDI | 120–200 |
| Arduino Due (SAM3X8E) | 84MHz ARM, 12-bit DAC | 900–1200 |
| Arduino MKR WiFi 1010 | Wi-Fi + BT, LiPo charger | 1800–2200 |
| Arduino Yún | Linux + AVR + Wi-Fi | 2500–3200 |
| Arduino Leonardo (ATmega32U4) | Native USB HID | 450–650 |
| Arduino LilyPad | Sewable e-textiles | 500–700 |
| Arduino Nano Every | 6KB SRAM upgrade of Nano | 350–500 |
| Arduino Nano 33 BLE Sense | 9 onboard sensors, BLE 5 | 1500–1900 |
| Arduino Portenta H7 | Dual-core 480MHz, Edge AI | 5500–7000 |

**Other MCUs — 5 boards**

| Board | Notes | Price (₹) |
|-------|-------|-----------|
| ESP8266 NodeMCU | Wi-Fi only, budget | 200–280 |
| Raspberry Pi Pico W | RP2040, Wi-Fi+BLE, MicroPython | 450–550 |
| Arduino Uno R3 | Classic, 5V, huge ecosystem | 450–600 |
| Arduino Nano 33 IoT | Wi-Fi+BLE+IMU, compact | 1200–1500 |
| STM32 Blue Pill F103C8 | ARM Cortex-M3, 32-bit | 250–350 |

### Sensors (48)

**Temperature & Humidity**
DHT11, DHT22, BME280 (temp+humidity+pressure), AHT20 (I²C), DS18B20 (waterproof 1-Wire), LM35 (analog), MLX90614 (non-contact IR), MAX6675 (K-type thermocouple up to 1024°C)

**Pressure & Air Quality**
BMP280 (barometric + altitude), MQ-135 (NH₃/NOx/CO₂/smoke), MQ-2 (LPG/propane/smoke), MQ-7 (carbon monoxide), SDS011 (PM2.5/PM10 laser dust), MH-Z19B (NDIR CO₂ 0–5000 ppm), VEML6075 (UV index)

**Motion & Presence**
HC-SR501 PIR, AM312 Mini PIR (3.3V, low-power), Reed switch, SW-420 vibration, A3144 Hall effect, VS1838B IR receiver

**Distance & Ranging**
HC-SR04 ultrasonic, JSN-SR04T waterproof ultrasonic, VL53L0X ToF (I²C, 2m, colour-independent)

**Soil & Agriculture**
Capacitive soil moisture v2.0, Resistive soil probe, Soil NPK (RS485), YF-S201 flow meter, Turbidity sensor, pH sensor (BNC probe)

**Biometric & Wearable**
MAX30102 (pulse oximeter + HR), MPU6050 (6-axis IMU), GSR galvanic skin response, Flex sensor 2.2"

**Imaging & ID**
ESP32-CAM, RC522 RFID reader, R307 optical fingerprint sensor

**Electrical & Energy**
ACS712 current sensor, ZMPT101B voltage sensor, PZEM-004T all-in-one energy meter

**Input & Interface**
PS2 joystick (dual analog), KY-040 rotary encoder, IR line follower pair, Load cell + HX711 24-bit ADC

**Expansion**
GPS Neo-6M (UART), ADS1115 16-bit I²C ADC, TCS3200 colour sensor

### Actuators (2)
SG90 micro servo, 1/2/4-channel relay module

### Connectivity (4)
HC-05 Bluetooth, NRF24L01 2.4GHz mesh, SIM800L GSM/GPRS, LoRa Ra-02 (SX1278)

### Power (5)
18650 Li-ion + TP4056, LiPo 3.7V + charger, 6V solar panel + controller, 5V USB adapter, AMS1117 3.3V regulator

---

## Project Categories & Sensor Roles

| Category | Roles |
|----------|-------|
| 🏠 Home Automation | Motion (PIR), climate (DHT22), switching (relay) |
| 🌿 Environment | Temp/humidity, pressure/altitude, air quality |
| ⌚ Wearable Health | Heart rate + SpO2, 6-axis IMU, GSR stress |
| 🌾 Agriculture | Soil moisture, climate, irrigation flow / NPK |
| 🔒 Security | Intrusion (PIR), camera (ESP32-CAM), RFID |
| 🤖 Robotics | Ultrasonic distance, IMU, servo actuation |
| ⚡ Energy Monitoring | Current (ACS712), voltage (ZMPT101B), full meter (PZEM-004T) |

---

## Getting Started

### Frontend only (no backend needed)

Just open the HTML file:

```
# Windows
start index_2.html

# macOS / Linux
open index_2.html
```

Or serve it with any static server:

```bash
npx serve .         # from the project root
```

The entire frontend is a **single self-contained HTML file** — no build step, no npm install, no bundler.

### Backend API (optional — for persistent storage)

The backend adds a REST API with SQLite persistence for builds and analytics.

**Requirements:** Node.js 22.5.0+

```bash
cd backend
npm install

# Start (production)
node server.js

# Start (development, auto-reload)
npm run dev
```

Server starts at `http://localhost:3001`. On first run the database is created and all 88 parts are seeded automatically.

```
  ✦  Traceboard API running on http://localhost:3001
     Health check → http://localhost:3001/api/health
```

**Environment variables** — copy `backend/.env.example` to `backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API port |
| `ALLOWED_ORIGINS` | `*` | Comma-separated CORS allowlist |

---

## Backend API Reference

Base URL: `http://localhost:3001`

### Health
```
GET /api/health
```

### Parts Catalogue
```
GET  /api/parts               # full list (?cat=mcu&q=esp32)
GET  /api/parts/stats         # counts per category
GET  /api/parts/:id           # single part
```

### Recommendation Engine
```
POST /api/recommend
{
  "project": "home",        // home | environment | wearable | agriculture | security | robotics | energy
  "power":   "battery",     // battery | solar | mains
  "conn":    "wifi",        // wifi | ble | lora | gsm | none
  "budget":  "standard",    // budget | standard | premium
  "exp":     "beginner"     // beginner | intermediate | advanced
}
```

### Saved Builds
```
GET    /api/builds?session=<uuid>   # list builds
POST   /api/builds                  # save build
GET    /api/builds/:id              # load one
DELETE /api/builds/:id              # delete
```

### Export
```
POST /api/export/txt    # plain-text BOM download
POST /api/export/json   # structured JSON export
```

### Analytics
```
GET /api/analytics/popular-projects
GET /api/analytics/popular-mcus
GET /api/analytics/prefs
```

---

## Code Generator — Supported Parts

The code generator produces ready-to-compile code with the correct library includes, pin defines, `setup()` and `loop()` for every part below.

| Part | Library used |
|------|-------------|
| DHT11 / DHT22 | DHT sensor library (Adafruit) |
| BME280 | Adafruit BME280 |
| BMP280 | Adafruit BMP280 |
| AHT20 | AHTxx by dvarrel |
| MPU6050 | MPU6050_light |
| MAX30102 | SparkFun MAX3010x |
| DS18B20 | DallasTemperature + OneWire |
| HC-SR04 ultrasonic | built-in `pulseIn` |
| PIR / relay / reed | built-in `digitalRead/Write` |
| SG90 servo | Servo (built-in) |
| RC522 RFID | MFRC522 |
| ACS712 current | built-in `analogRead` |
| MQ-135 | MQ135 by GeorgK |
| MQ-2 | built-in `analogRead` |
| MH-Z19B CO₂ | MHZ19 by WifWaf |
| VL53L0X ToF | VL53L0X by Pololu |
| GPS Neo-6M | TinyGPS++ |
| SDS011 dust | SDS011 by ricki-z |
| Soil moisture | built-in `analogRead` |
| Wi-Fi (ESP32) | WiFi.h (built-in) |

---

## Project Structure

```
Traceboard/
├── index_2.html          ← Complete frontend (single-page app, ~3700 lines)
├── README.md
└── backend/
    ├── server.js         ← Express entry point (port 3001)
    ├── package.json
    ├── .env.example
    ├── db/
    │   ├── database.js   ← SQLite init + auto-seed on first run
    │   ├── schema.sql    ← parts, saved_builds, recommendation_log tables
    │   └── seed.js       ← 88-part catalogue seed data
    ├── engine/
    │   └── recommender.js  ← Scoring & pick logic (mirrors frontend)
    └── routes/
        ├── parts.js      ← GET /api/parts
        ├── recommend.js  ← POST /api/recommend
        ├── builds.js     ← CRUD /api/builds
        ├── export.js     ← POST /api/export/txt|json
        └── analytics.js  ← GET /api/analytics/*
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML / CSS / JS — zero dependencies, single file |
| Fonts | Space Grotesk + JetBrains Mono (Google Fonts) |
| Backend runtime | Node.js 22.5+ |
| Backend framework | Express 4 |
| Database | SQLite via `node:sqlite` (built-in, no native addon) |
| Validation | express-validator |
| Security | helmet, cors |
| Logging | morgan |
| AI providers | OpenAI API / Google Gemini API / Groq API / Ollama (local) |

---

## Browser Compatibility

Works in any modern browser. No polyfills needed.

| Browser | Minimum version |
|---------|----------------|
| Chrome / Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ |

**AI Chat** requires the browser to have network access to the chosen provider endpoint. Ollama requires a locally running Ollama server with CORS enabled.

---

## Security Notes

- API keys entered in the AI Chat panel are stored only in the browser's `localStorage` — they are never sent to Traceboard servers
- All outbound AI requests go directly from your browser to the chosen provider (OpenAI / Google / Groq / Ollama)
- Auth credentials in demo mode are stored hashed (`btoa`) in `localStorage` — replace with a real auth backend before production deployment
- The backend uses `helmet` for HTTP security headers and `express-validator` for input sanitisation

---

## Roadmap

- [ ] Real backend auth (JWT + bcrypt)
- [ ] Cloud-synced saved builds
- [ ] Shareable build URLs
- [ ] PDF BOM export
- [ ] Component compatibility checker
- [ ] Kicad / Fritzing wiring export
- [ ] Multi-project workspace (Enterprise)
- [ ] Mobile app (PWA)

---

## License

MIT — see `LICENSE` for details.

---

*Built by Crazy Whale · Traceboard IoT Component Advisor*
