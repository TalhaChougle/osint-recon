import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE,
  timeout: 60000,   // 60s — AI calls can take a while
})

// Auto-retry once on network errors
api.interceptors.response.use(null, async (err) => {
  const config = err.config
  if (!config._retried && err.code === 'ECONNABORTED') {
    config._retried = true
    return api(config)
  }
  throw err
})

export async function scanTarget(target, type) {
  const { data } = await api.post('/scan', { target, type })
  return data
}

export async function scanEmail(email) {
  const { data } = await api.post('/email', { email })
  return data
}

export async function analyzeFiles(files) {
  const form = new FormData()
  for (const file of files) form.append('files', file)
  const { data } = await api.post('/forensics', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,   // file analysis can take longer
  })
  return data
}

export async function healthCheck() {
  const { data } = await api.get('/health')
  return data
}
