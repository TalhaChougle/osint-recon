# OSINT Lens 🔍

A full-stack Open Source Intelligence (OSINT) dashboard for IP/domain recon, threat intelligence, DNS analysis, and email investigation — powered by real APIs and Claude AI.

Built as a cybersecurity portfolio project by **Talha Chougle** ([@TalhaChougle](https://github.com/TalhaChougle)).

---

## Features

- **IP & Domain Recon** — Real geolocation via ip-api.com (city, ISP, ASN, proxy/VPN detection)
- **AI Threat Analysis** — Claude gemini-1.5-flash model generates risk scores, threat categories, IOCs, WHOIS estimates, and port analysis
- **Live DNS Lookup** — A, AAAA, MX, NS, TXT, CNAME records via Google DNS-over-HTTPS
- **Email Recon** — Format validation, MX/SPF verification, breach likelihood, disposable detection
- **Port Exposure Analysis** — AI-assessed exposure of 8 common service ports
- **Scan History** — Persistent history via localStorage with one-click replay
- **Security Hardened Backend** — Helmet.js, CORS, and rate limiting (50 req/15 min)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Express.js (Node 18+) |
| AI | Anthropic SDK (gemini-1.5-flash) |
| Geo API | ip-api.com |
| DNS API | dns.google (DoH) |
| Security | Helmet.js, express-rate-limit |
| Deploy | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
osint-lens/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx     # Top nav with live clock
│   │   │   ├── ScanPanel.jsx  # IP/domain scan UI
│   │   │   ├── EmailPanel.jsx # Email recon UI
│   │   │   ├── HistoryPanel.jsx
│   │   │   ├── AboutPanel.jsx
│   │   │   └── UI.jsx         # Shared primitives (Card, Badge, Terminal, etc.)
│   │   ├── hooks/
│   │   │   └── useOSINT.js    # Core state + API calls hook
│   │   ├── utils/
│   │   │   └── api.js         # Axios API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/favicon.svg
│   ├── index.html
│   ├── vite.config.js
│   └── vercel.json
│
├── backend/                   # Express API server
│   └── src/
│       └── server.js          # All routes + AI + geo + DNS logic
│
├── render.yaml                # Render deployment config
├── package.json               # Root monorepo scripts
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- An [Google Gemini API (free) key](https://console.anthropic.com/)

### 1. Clone the repo

```bash
git clone https://github.com/TalhaChougle/osint-lens.git
cd osint-lens
```

### 2. Install dependencies

```bash
# Install root + both workspaces
npm install
npm run install:all
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
GEMINI_API_KEY=sk-ant-your-key-here
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 4. Run both servers

From the project root:
```bash
npm run dev
```

This starts:
- Backend on `http://localhost:3001`
- Frontend on `http://localhost:5173`

The Vite dev server proxies all `/api` requests to the backend automatically.

---

## Deployment

### Backend → Render (Free)

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set **Root Directory** to `backend`
4. Set environment variables in Render dashboard:
   - `GEMINI_API_KEY` = your key
   - `FRONTEND_URL` = your Vercel URL (e.g. `https://osint-lens.vercel.app`)
5. Build: `npm install` | Start: `npm start`

Or use the included `render.yaml` for one-click deploy.

### Frontend → Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL + `/api`  
     e.g. `https://osint-lens-backend.onrender.com/api`
5. Deploy — Vercel auto-detects Vite

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/scan` | IP/domain/URL recon |
| POST | `/api/email` | Email recon |

### POST `/api/scan`
```json
{ "target": "8.8.8.8", "type": "ip" }
```
`type` can be: `ip`, `domain`, `url`

### POST `/api/email`
```json
{ "email": "user@example.com" }
```

---

## Security Notes

- Rate limited to 50 requests per 15 minutes per IP
- CORS locked to configured frontend origin
- `GEMINI_API_KEY` is backend-only — never exposed to client
- No user data is stored server-side

---

## Ethical Use Disclaimer

This tool is intended **for educational and ethical security research only**. Only scan IP addresses, domains, and emails you own or have explicit authorization to analyze. Unauthorized reconnaissance may violate laws in your jurisdiction including the IT Act 2000 (India), CFAA (USA), and similar statutes.

---

## Author

**Talha Chougle**  
B.Sc. Computer Science (Cybersecurity) — Royal College, Mumbai  
GitHub: [@TalhaChougle](https://github.com/TalhaChougle)  
Email: tchougle60@gmail.com

---

## License

MIT License — see [LICENSE](LICENSE) for details.
