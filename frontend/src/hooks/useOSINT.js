import { useState, useCallback } from 'react'
import { scanTarget, scanEmail, analyzeFiles as apiAnalyzeFiles } from '../utils/api'

const LS_KEY = 'osint_recon_history'

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}

export function useOSINT() {
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [result,   setResult]   = useState(null)
  const [logs,     setLogs]     = useState([])
  const [history,  setHistory]  = useState(loadHistory)

  const addLog = useCallback((msg, type = 'info') => {
    const time = new Date().toTimeString().split(' ')[0]
    setLogs(prev => [...prev, { time, msg, type, id: Date.now() + Math.random() }])
  }, [])

  const saveHistory = useCallback((entry) => {
    setHistory(prev => {
      const deduped  = prev.filter(h => h.query.toLowerCase() !== entry.query.toLowerCase())
      const updated  = [entry, ...deduped].slice(0, 50)
      try { localStorage.setItem(LS_KEY, JSON.stringify(updated)) } catch {}
      return updated
    })
  }, [])

  // ── IP / Domain scan ───────────────────────────────────────
  const runScan = useCallback(async (target, type) => {
    setLoading(true); setError(null); setResult(null); setLogs([])
    addLog(`Initiating recon: ${target}`, 'info')
    addLog('Querying geolocation API (ip-api.com)...', 'info')
    try {
      const data = await scanTarget(target, type)
      addLog(`Geolocation: ${data.geo?.city || 'Private'}, ${data.geo?.country || 'Unknown'}`, data.geo ? 'ok' : 'warn')
      addLog(`ISP: ${data.geo?.isp || 'Unknown'}`, 'info')
      addLog(`DNS: ${data.dns?.a?.length || 0} A, ${data.dns?.mx?.length || 0} MX, ${data.dns?.ns?.length || 0} NS`, 'ok')
      addLog(`AI risk: ${data.ai?.riskLevel} (${data.ai?.riskScore}/100)`, data.ai?.riskScore > 60 ? 'warn' : 'ok')
      addLog(`Malicious: ${data.ai?.isMalicious ? '⚠ YES' : 'No'}`, data.ai?.isMalicious ? 'err' : 'ok')
      addLog('Report compiled ✓', 'ok')
      setResult(data)
      saveHistory({ query: target, type, kind: 'scan', risk: data.ai?.riskLevel || 'UNKNOWN', time: new Date().toLocaleTimeString() })
      return data
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Scan failed'
      setError(msg); addLog(`Error: ${msg}`, 'err')
    } finally { setLoading(false) }
  }, [addLog, saveHistory])

  // ── Email address recon ────────────────────────────────────
  const runEmailScan = useCallback(async (email) => {
    setLoading(true); setError(null); setResult(null); setLogs([])
    addLog(`Email recon: ${email}`, 'info')
    try {
      const data = await scanEmail(email)
      addLog(`MX records: ${data.mx?.length || 0} found`, data.mx?.length ? 'ok' : 'warn')
      addLog(`SPF: ${data.spf?.length ? 'Present' : 'Missing'}`, data.spf?.length ? 'ok' : 'warn')
      addLog(`Disposable: ${data.ai?.isDisposable ? 'YES ⚠' : 'No'}`, data.ai?.isDisposable ? 'warn' : 'ok')
      addLog(`Breach likelihood: ${data.ai?.breachLikelihood}`, 'info')
      addLog('Email analysis complete ✓', 'ok')
      setResult({ ...data, _type: 'email' })
      saveHistory({ query: email, type: 'email', kind: 'email', risk: data.ai?.breachLikelihood || 'UNKNOWN', time: new Date().toLocaleTimeString() })
      return data
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Email scan failed'
      setError(msg); addLog(`Error: ${msg}`, 'err')
    } finally { setLoading(false) }
  }, [addLog, saveHistory])

  // ── File forensics ─────────────────────────────────────────
  const runFileScan = useCallback(async (files) => {
    setLoading(true); setError(null); setResult(null); setLogs([])
    addLog(`Forensic scan: ${files.length} file(s)`, 'info')
    files.forEach(f => addLog(`  Queued: ${f.name} (${(f.size/1024).toFixed(1)} KB)`, 'info'))
    addLog('Uploading to backend for AI analysis...', 'info')
    try {
      const data = await apiAnalyzeFiles(files)
      const malN = data.results.filter(r => r.analysis?.verdict === 'MALICIOUS').length
      const susN = data.results.filter(r => r.analysis?.verdict === 'SUSPICIOUS').length
      addLog(`Analysis complete: ${data.results.length} file(s) processed`, 'ok')
      if (malN) addLog(`⚠ ${malN} MALICIOUS file(s) found!`, 'err')
      if (susN) addLog(`⚡ ${susN} SUSPICIOUS file(s) flagged`, 'warn')
      if (!malN && !susN) addLog('All files appear clean ✓', 'ok')
      setResult({ ...data, _type: 'forensics' })
      saveHistory({ query: `${files.length} file(s) analyzed`, type: 'file', kind: 'file', risk: malN ? 'HIGH' : susN ? 'MEDIUM' : 'LOW', time: new Date().toLocaleTimeString() })
      return data
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'File forensics failed'
      setError(msg); addLog(`Error: ${msg}`, 'err')
    } finally { setLoading(false) }
  }, [addLog, saveHistory])

  return { loading, error, result, logs, history, runScan, runEmailScan, runFileScan }
}
