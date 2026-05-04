# 🔍 OSINT Recon

> An AI-powered Open Source Intelligence (OSINT) dashboard for IP, domain, and email reconnaissance — built as a cybersecurity portfolio project.

![OSINT Recon](https://img.shields.io/badge/OSINT-Recon-38bdf8?style=for-the-badge&logo=shield&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-Free_Tier-4285F4?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📸 Overview

OSINT Recon is a full-stack cybersecurity tool that lets you investigate any IP address, domain, or email address using real threat intelligence APIs combined with Google Gemini AI for automated risk analysis. It also includes a file forensics engine that detects phishing, scams, and malicious content in uploaded email files and attachments.

Built by **Talha Chougle** as a portfolio project to demonstrate practical cybersecurity and full-stack development skills.

---

## ✨ Features

### 🌐 IP / Domain Reconnaissance
- Real-time geolocation (city, country, ISP, ASN, coordinates)
- DNS record lookup — A, AAAA, MX, NS, TXT, CNAME
- AI-powered threat scoring (0–100 risk score)
- WHOIS registration data estimation
- Port exposure analysis for 20+ common services
- VPN / Proxy / Tor exit node detection
- Indicators of Compromise (IOC) extraction
- Live recon terminal log

### 📧 Email Recon
- Email address validation and format checking
- MX and SPF record verification
- Disposable / throwaway email detection
- Role account identification (admin@, info@, noreply@)
- Breach likelihood estimation
- Domain reputation scoring

### 📎 File Forensics
- Upload any file received via email — .eml, .msg, .pdf, images, .txt, .csv, .json, .doc, .zip
- AI reads full email headers (SPF, DKIM, DMARC results)
- Detects phishing indicators, malicious URLs, social engineering
- Extracts all URLs and email addresses from content
- Reply-To mismatch and header anomaly detection
- Per-file verdict: SAFE / SUSPICIOUS / MALICIOUS
- 12 built-in sample files to test instantly (no upload needed)

### 📋 Other
- Scan history with one-click replay (localStorage)
- Clickable use-case examples on every tab
- Live clock and system status indicator
- Full recon log terminal for every scan

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Express.js (Node 18+) |
| AI Engine | Google Gemini 2.5 Flash (free tier) |
| Geolocation | ip-api.com (free, no key needed) |
| DNS Lookup | Google DNS-over-HTTPS (free) |
| File Uploads | Multer (memory storage) |
| Security | Helmet + Rate Limiter + CORS |
| Deployment | Netlify (frontend) + Render (backend) |

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+ — https://nodejs.org
- A free Google Gemini API key — https://aistudio.google.com/app/apikey

### 1. Clone the repo
```bash
git clone https://github.com/TalhaChougle/osint-recon.git
cd osint-recon
```

### 2. Install all dependencies
```bash
npm install
npm run install:all
```

### 3. Set up your API key
```bash
copy backend\.env.example backend\.env
```
Open `backend/.env` and add your Gemini key:
```env
GEMINI_API_KEY=AIzaSy...your_key_here
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 4. Run
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🌍 Deployment

| Service | Platform | Cost |
|---------|----------|------|
| Frontend | Netlify | Free |
| Backend | Render | Free |

See **DEPLOY.md** for complete step-by-step deployment instructions.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/scan` | IP / Domain OSINT scan |
| POST | `/api/email` | Email address analysis |
| POST | `/api/forensics` | File forensics (multipart upload) |

---

## 📁 Project Structure

```
osint-recon/
├── backend/
│   ├── src/server.js          # Express API — Gemini, ip-api, dns.google
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ScanPanel.jsx      # IP/Domain tab
│   │   │   ├── EmailPanel.jsx     # Email recon + file forensics
│   │   │   ├── HistoryPanel.jsx   # Scan history
│   │   │   ├── AboutPanel.jsx     # Project info
│   │   │   ├── Header.jsx
│   │   │   └── UI.jsx             # Shared components
│   │   ├── hooks/
│   │   │   └── useOSINT.js        # All scan state and API calls
│   │   └── utils/
│   │       ├── api.js             # Axios API client
│   │       └── sampleFiles.js     # 12 embedded sample files
│   ├── netlify.toml
│   └── vite.config.js
├── sample-emails/             # Sample files for local testing
├── DEPLOY.md                  # Full deployment guide
└── package.json               # Root scripts
```

---

## 🔒 Security

- API key lives only on the backend — never exposed to the browser
- Helmet.js for HTTP security headers
- Rate limiting: 100 requests per 15 minutes per IP
- CORS restricted to configured frontend origin only
- `.env` files excluded from Git via `.gitignore`

---

## ⚠️ Disclaimer

This tool is for **educational and ethical security research purposes only**. Only scan IP addresses, domains, and emails you own or have explicit permission to analyze. Unauthorized OSINT on third-party targets may violate applicable laws. The AI threat analysis is heuristic and should not be used as sole evidence of malicious activity.

---

## 👤 Author

**Talha Chougle**
- GitHub: [@TalhaChougle](https://github.com/TalhaChougle)
- Email: tchougle60@gmail.com
- B.Sc. Computer Science — Cybersecurity & Ethical Hacking, Mumbai

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
