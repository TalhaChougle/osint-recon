# Sample Email Files — OSINT Recon Test Pack

Upload these files in the **Email Recon → Analyze Files / Attachments** tab to test the AI forensics feature.

## File Naming Convention
- `LEGIT-*` — Safe, legitimate emails
- `PHISHING-*` — Active phishing attacks
- `SCAM-*` — Scam / fraud emails
- `SUSPICIOUS-*` — Suspicious but not confirmed malicious

---

## Files Included

### ✅ Legitimate (Safe)
| File | What it is |
|------|-----------|
| `LEGIT-github-notification.eml` | Real-style GitHub PR notification — valid DKIM, SPF, DMARC |
| `LEGIT-google-security-alert.eml` | Google account sign-in alert — passes all authentication |
| `LEGIT-college-assignment-confirmation.eml` | College academics confirmation email |
| `LEGIT-internship-offer-letter.txt` | Formal internship offer letter document |

### 🚨 Phishing (Malicious)
| File | What it is |
|------|-----------|
| `PHISHING-fake-bank-alert.eml` | Fake HDFC Bank suspension alert — fails SPF/DKIM/DMARC, suspicious domain, originates from Russian IP |
| `PHISHING-fake-microsoft-password.eml` | Fake Microsoft 365 password expiry — typosquatted domain, credential harvesting links |

### ⚠️ Scam (Fraud)
| File | What it is |
|------|-----------|
| `SCAM-fake-google-lottery.eml` | Classic advance-fee lottery scam — no authentication, Nigerian IP |
| `SCAM-fake-amazon-job-offer.eml` | Fake Amazon job offer asking for bank details and passwords |

### 🟡 Suspicious
| File | What it is |
|------|-----------|
| `SUSPICIOUS-fake-invoice.txt` | Fake invoice demanding immediate payment with suspicious payment methods |

---

## How to Use

1. Open the app at `http://localhost:5173`
2. Click **[ Email Recon ]** tab
3. Click **📎 Analyze Files / Attachments**
4. Drag and drop one or more files from this folder
5. Click **▶ ANALYZE**
6. See the AI verdict — SAFE, SUSPICIOUS, or MALICIOUS

Try uploading a mix of legit and phishing files at the same time!
