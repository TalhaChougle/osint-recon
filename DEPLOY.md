# Deploying OSINT Recon

## Architecture
- **Frontend** → Netlify (free)
- **Backend** → Render (free)

---

## Step 1 — Push to GitHub

```bash
cd osint-recon-gemini-final
git init
git add .
git commit -m "initial commit: OSINT Recon"
git branch -M main
# Create repo on github.com first, then:
git remote add origin https://github.com/TalhaChougle/osint-recon.git
git push -u origin main
```

---

## Step 2 — Deploy Backend → Render (free)

1. Go to **render.com** → Sign up → **New → Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Name:** `osint-recon-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `GEMINI_API_KEY` | `AIzaSy...your key` |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | *(fill after step 3)* |
5. Click **Deploy**
6. Copy your backend URL: `https://osint-recon-backend.onrender.com`

---

## Step 3 — Deploy Frontend → Netlify (free)

1. Go to **netlify.com** → Sign up → **Add new site → Import from Git**
2. Connect GitHub → select your repo
3. Settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
4. Add Environment Variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://osint-recon-backend.onrender.com/api` |
5. Click **Deploy site**
6. Copy your Netlify URL: `https://osint-recon.netlify.app`

---

## Step 4 — Connect them

1. Go back to **Render** → your backend → **Environment**
2. Set `FRONTEND_URL` = `https://osint-recon.netlify.app`
3. Click **Save** → Render redeploys automatically
4. On **Netlify** → **Deploys** → **Trigger deploy**

---

## Step 5 — Verify

Open your Netlify URL and run a scan. Should work perfectly.

Health check: `https://osint-recon-backend.onrender.com/api/health`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Scan returns 500 | Check Render logs — usually bad API key |
| CORS error | Make sure FRONTEND_URL in Render matches Netlify URL exactly (no trailing slash) |
| Blank page on Netlify | Check build logs — missing VITE_API_URL env var |
| Render sleeps | First request after idle ~30s — expected on free tier |
