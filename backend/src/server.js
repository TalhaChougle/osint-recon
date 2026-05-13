import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import multer from 'multer';

dotenv.config();

// ── Startup env check ─────────────────────────────────────────
if (!process.env.GEMINI_API_KEY) {
  console.error('\n❌  GEMINI_API_KEY is not set in backend/.env');
  console.error('    Get a free key at: https://aistudio.google.com/app/apikey\n');
  process.exit(1);
}

const app   = express();
const PORT  = process.env.PORT || 3001;
const MODEL = 'gemini-2.0-flash';

// ── Gemini client ─────────────────────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function gemini(prompt, imagePart = null) {
  const contents = imagePart
    ? [{ inlineData: imagePart }, { text: prompt }]
    : prompt;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
  });
  return response.text;
}

function parseAIJson(text) {
  return JSON.parse(
    text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()
  );
}

// ── Multer — memory, 10 MB cap ────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── Middleware ────────────────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '2mb' }));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, cb) =>
    !origin || allowedOrigins.includes(origin)
      ? cb(null, true)
      : cb(new Error(`CORS blocked: ${origin}`)),
  credentials: true,
}));

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests — slow down.' },
}));

// ── Geo lookup ────────────────────────────────────────────────
async function geoLookup(target) {
  try {
    const { data } = await axios.get(
      `http://ip-api.com/json/${encodeURIComponent(target)}` +
      `?fields=status,message,country,countryCode,region,regionName,city,` +
      `zip,lat,lon,timezone,isp,org,as,query,mobile,proxy,hosting`,
      { timeout: 7000 }
    );
    return data.status === 'success' ? data : null;
  } catch { return null; }
}

// ── DNS lookup ────────────────────────────────────────────────
async function dnsLookup(domain) {
  const results = {};
  await Promise.all(['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME'].map(async type => {
    try {
      const { data } = await axios.get(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`,
        { timeout: 7000 }
      );
      results[type.toLowerCase()] = data.Answer || [];
    } catch { results[type.toLowerCase()] = []; }
  }));
  return results;
}

// ── AI: threat analysis ───────────────────────────────────────
async function aiThreatAnalysis(target, type, geoData, dnsData) {
  const prompt =
`You are a senior OSINT threat analyst. Return ONLY valid JSON, no markdown, no extra text.

Target: ${target}
Type: ${type}
GeoData: ${JSON.stringify(geoData || {})}
DNS: ${JSON.stringify(dnsData || {})}

Return exactly this JSON structure:
{"riskScore":<integer 0-100>,"riskLevel":"<LOW|MEDIUM|HIGH|CRITICAL>","threatCategories":["<category>"],"isMalicious":<boolean>,"isVPN":<boolean>,"isProxy":<boolean>,"isDatacenter":<boolean>,"abuseConfidence":<integer 0-100>,"summary":"<2-3 sentence analysis>","indicators":["<ioc>"],"recommendation":"<single action>","whois":{"registrar":"<name or Unknown>","created":"<date or Unknown>","expires":"<date or Unknown>","nameservers":["<ns1>","<ns2>"]},"openPorts":[{"port":80,"service":"HTTP","state":"open","risk":"low"},{"port":443,"service":"HTTPS","state":"open","risk":"low"},{"port":22,"service":"SSH","state":"filtered","risk":"medium"},{"port":21,"service":"FTP","state":"closed","risk":"high"},{"port":3306,"service":"MySQL","state":"closed","risk":"high"},{"port":3389,"service":"RDP","state":"closed","risk":"high"},{"port":8080,"service":"HTTP-Alt","state":"filtered","risk":"low"},{"port":25,"service":"SMTP","state":"filtered","risk":"medium"}]}`;

  const raw = await gemini(prompt);
  return parseAIJson(raw);
}

// ── AI: email analysis ────────────────────────────────────────
async function aiEmailAnalysis(email, domain, mxRecords, spfRecords) {
  const prompt =
`You are a cybersecurity email OSINT analyst. Return ONLY valid JSON, no markdown.
Email: ${email}
Domain: ${domain}
MX Records: ${JSON.stringify(mxRecords)}
SPF Records: ${JSON.stringify(spfRecords)}

Return exactly:
{"isDisposable":<boolean>,"isRoleAccount":<boolean>,"domainReputation":"<good|neutral|poor>","estimatedProvider":"<provider>","breachLikelihood":"<LOW|MEDIUM|HIGH>","suspiciousPatterns":["<pattern>"],"riskScore":<integer 0-100>,"deliverability":"<valid|risky|invalid>","notes":"<2 sentence analysis>","recommendations":["<rec1>","<rec2>"]}`;

  const raw = await gemini(prompt);
  return parseAIJson(raw);
}

// ── AI: file forensics ────────────────────────────────────────
const FORENSIC_SCHEMA = `{"verdict":"<SAFE|SUSPICIOUS|MALICIOUS>","riskScore":<integer 0-100>,"summary":"<2 sentences>","findings":[{"severity":"<info|warning|danger>","title":"<short title>","detail":"<plain explanation>"}],"extractedUrls":["<url>"],"extractedEmails":["<email>"],"headerAnalysis":{"fromAddress":"<value or N/A>","replyTo":"<value or N/A>","originatingIP":"<value or N/A>","spfResult":"<pass|fail|none|N/A>","dkimResult":"<pass|fail|none|N/A>","dmarcResult":"<pass|fail|none|N/A>","mismatchDetected":<boolean>},"iocIndicators":["<ioc>"],"recommendation":"<single action>"}`;

async function aiFileForensics(filename, mimetype, textContent, base64Content) {
  const prompt =
`You are a cybersecurity email forensics analyst. Analyze this file for:
- Phishing indicators (fake sender, Reply-To mismatch, urgency language)
- Malicious or suspicious URLs
- Social engineering patterns
- Header anomalies (SPF/DKIM/DMARC for .eml files)
- Brand impersonation and malware delivery patterns

Filename: ${filename}
MIME type: ${mimetype}
${textContent ? `\nContent:\n---\n${textContent.slice(0, 8000)}\n---` : ''}

Return ONLY valid JSON, no markdown:
${FORENSIC_SCHEMA}`;

  let raw;
  if (base64Content && mimetype.startsWith('image/')) {
    raw = await gemini(prompt, { data: base64Content, mimeType: mimetype });
  } else {
    raw = await gemini(prompt);
  }
  return parseAIJson(raw);
}

// ═══════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0', model: MODEL })
);

app.post('/api/scan', async (req, res) => {
  const { target, type } = req.body;
  if (!target || !type) return res.status(400).json({ error: 'target and type are required' });
  let resolved = target.trim();
  if (type === 'url') { try { resolved = new URL(target).hostname; } catch {} }
  try {
    const [geoData, dnsData] = await Promise.all([geoLookup(resolved), dnsLookup(resolved)]);
    const aiData = await aiThreatAnalysis(resolved, type, geoData, dnsData);
    res.json({ success: true, target: resolved, originalInput: target, type, geo: geoData, dns: dnsData, ai: aiData, scannedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[scan]', err.message);
    res.status(500).json({ error: 'Scan failed', details: err.message });
  }
});

app.post('/api/email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });
  const [username, domain = ''] = email.split('@');
  try {
    const [mxRes, spfRes] = await Promise.all([
      axios.get(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, { timeout: 7000 }).catch(() => ({ data: { Answer: [] } })),
      axios.get(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`, { timeout: 7000 }).catch(() => ({ data: { Answer: [] } })),
    ]);
    const mxRecords  = mxRes.data.Answer || [];
    const spfRecords = (spfRes.data.Answer || []).filter(r => r.data.includes('v=spf'));
    const aiData = await aiEmailAnalysis(email, domain, mxRecords, spfRecords);
    res.json({ success: true, email, domain, username, isValidFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), mx: mxRecords, spf: spfRecords, ai: aiData, scannedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[email]', err.message);
    res.status(500).json({ error: 'Email recon failed', details: err.message });
  }
});

app.post('/api/forensics', upload.array('files', 10), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });
  const results = await Promise.all(req.files.map(async file => {
    const { originalname, mimetype, buffer } = file;
    try {
      const isImage       = mimetype.startsWith('image/');
      const textContent   = isImage ? null : buffer.toString('utf8').replace(/\uFFFD/g, '?');
      const base64Content = isImage ? buffer.toString('base64') : null;
      const analysis = await aiFileForensics(originalname, mimetype, textContent, base64Content);
      return { filename: originalname, mimetype, size: buffer.length, analysis, error: null };
    } catch (err) {
      console.error(`[forensics:${originalname}]`, err.message);
      return { filename: originalname, mimetype, size: file.size, analysis: null, error: err.message };
    }
  }));
  res.json({ success: true, results, analyzedAt: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('[unhandled]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🔍 OSINT Recon Backend  →  http://localhost:${PORT}`);
  console.log(`   Health              →  http://localhost:${PORT}/api/health`);
  console.log(`   Model               →  ${MODEL} (Gemini — free tier)\n`);
});
