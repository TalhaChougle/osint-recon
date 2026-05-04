import React, { useState, useRef } from 'react'
import { Card, CardTitle, ResultBlock, Row, Btn, Terminal, Spinner, Badge, MeterBar } from './UI.jsx'

// ── File type helper ─────────────────────────────────────────
function fileInfo(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (['eml','msg'].includes(ext))      return { label:'Email File', icon:'📧', color:'var(--accent2)' }
  if (ext === 'pdf')                    return { label:'PDF',        icon:'📄', color:'var(--danger)'  }
  if (['png','jpg','jpeg','gif','webp','bmp'].includes(ext))
                                        return { label:'Image',      icon:'🖼️', color:'var(--accent3)' }
  if (['txt','log','csv','json','xml','html','htm','md'].includes(ext))
                                        return { label:'Text/Log',   icon:'📝', color:'var(--warning)' }
  if (['doc','docx','xls','xlsx','ppt','pptx'].includes(ext))
                                        return { label:'Office Doc', icon:'📊', color:'var(--accent)'  }
  if (['zip','rar','7z','tar','gz'].includes(ext))
                                        return { label:'Archive',    icon:'📦', color:'var(--muted2)'  }
  return                                       { label:'File',       icon:'📁', color:'var(--muted2)'  }
}
function fmtSize(b) {
  if (b < 1024)    return b + ' B'
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB'
  return (b/1048576).toFixed(1) + ' MB'
}

const sIcon  = { info:'ℹ️', warning:'⚠️', danger:'🚨' }
const sColor = { info:'var(--accent)', warning:'var(--warning)', danger:'var(--danger)' }

// ── Main component ───────────────────────────────────────────
export default function EmailPanel({ loading, result, logs, error, onEmailScan, onFileScan }) {
  const [mode,         setMode]         = useState('address')   // 'address' | 'file'
  const [email,        setEmail]        = useState('')
  const [queuedFiles,  setQueuedFiles]  = useState([])
  const [dragOver,     setDragOver]     = useState(false)
  const fileInputRef = useRef()

  const emailData    = result?._type === 'email'     ? result        : null
  const forensicData = result?._type === 'forensics' ? result        : null

  // ── Drag & drop ────────────────────────────────────────────
  function onDrop(e) {
    e.preventDefault(); setDragOver(false)
    addToQueue(Array.from(e.dataTransfer.files))
  }
  function addToQueue(files) {
    const filtered = files.filter(f => {
      if (f.size > 10 * 1024 * 1024) { alert(`${f.name} exceeds 10 MB — skipped`); return false }
      return true
    })
    setQueuedFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size))
      return [...prev, ...filtered.filter(f => !existing.has(f.name + f.size))]
    })
  }

  // ── Verdict helpers ────────────────────────────────────────
  function verdictClass(v) { return v === 'MALICIOUS' ? 'danger' : v === 'SUSPICIOUS' ? 'warning' : 'safe' }
  function verdictColor(v) { return v === 'MALICIOUS' ? 'var(--danger)' : v === 'SUSPICIOUS' ? 'var(--warning)' : 'var(--accent3)' }
  function verdictBadge(v) { return v === 'MALICIOUS' ? 'risk' : v === 'SUSPICIOUS' ? 'warn' : 'ok' }
  function verdictIcon(v)  { return v === 'MALICIOUS' ? '🚨' : v === 'SUSPICIOUS' ? '⚠️' : '✓' }

  const btn = (label, active, onClick) => (
    <button onClick={onClick} style={{
      flex:1, padding:'12px 16px', borderRadius:8, cursor:'pointer',
      background: active ? 'rgba(56,189,248,0.1)' : 'transparent',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      color: active ? 'var(--accent)' : 'var(--muted2)',
      fontFamily:'var(--mono)', fontSize:12, transition:'all .2s',
    }}>{label}</button>
  )

  return (
    <div>
      {/* Mode switcher */}
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {btn('@ Analyze Email Address', mode==='address', () => setMode('address'))}
        {btn('📎 Analyze Files / Attachments', mode==='file', () => setMode('file'))}
      </div>

      {/* ── ADDRESS MODE ── */}
      {mode === 'address' && (
        <>
          <Card style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, color:'var(--muted)', letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>
              Email Address Investigation
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && email.trim() && onEmailScan(email.trim())}
                placeholder="e.g. someone@gmail.com"
                style={{ flex:1, padding:'10px 14px', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:6, color:'var(--text)', outline:'none', fontSize:13 }}
              />
              <Btn onClick={() => email.trim() && onEmailScan(email.trim())} disabled={loading || !email.trim()}>
                {loading ? '...' : '▶ ANALYZE'}
              </Btn>
            </div>
            <div style={{ marginTop:10, fontSize:11, color:'var(--muted)' }}>
              Try:{' '}
              {['admin@google.com','test@tempmail.com','info@github.com'].map(e => (
                <span key={e} onClick={() => { setEmail(e); onEmailScan(e) }}
                  style={{ color:'var(--accent)', cursor:'pointer', marginRight:12, textDecoration:'underline', textUnderlineOffset:2 }}>{e}</span>
              ))}
            </div>
          </Card>

          {loading && (
            <Card style={{ marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--muted2)', justifyContent:'center', padding:'12px 0' }}>
                <Spinner /> <span>Analyzing email...</span>
              </div>
              <Terminal logs={logs} />
            </Card>
          )}

          {error && !loading && (
            <Card style={{ marginBottom:14, borderColor:'rgba(248,113,113,0.3)' }}>
              <div style={{ color:'var(--danger)' }}>⚠ {error}</div>
            </Card>
          )}

          {emailData && !loading && (
            <>
              {/* Summary */}
              <Card style={{ marginBottom:14 }}>
                <CardTitle>Plain English Summary</CardTitle>
                <div style={{
                  borderRadius:8, padding:14,
                  background: emailData.ai?.isDisposable ? 'rgba(248,113,113,0.08)' : emailData.ai?.riskScore < 25 ? 'rgba(52,211,153,0.07)' : 'rgba(251,191,36,0.07)',
                  border: `1px solid ${emailData.ai?.isDisposable ? 'rgba(248,113,113,0.25)' : emailData.ai?.riskScore < 25 ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`,
                }}>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:6,
                    color: emailData.ai?.isDisposable ? 'var(--danger)' : emailData.ai?.riskScore < 25 ? 'var(--accent3)' : 'var(--warning)' }}>
                    {emailData.ai?.isDisposable ? '⚠ Throwaway / fake email detected' : emailData.ai?.riskScore < 25 ? '✓ This email looks legitimate' : '⚡ Proceed with caution'}
                  </div>
                  <div style={{ color:'var(--muted2)', fontSize:12, lineHeight:1.7 }}>{emailData.ai?.notes}</div>
                </div>
              </Card>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <Card>
                  <CardTitle>What We Found</CardTitle>
                  <ResultBlock>
                    <Row label="Email" value={emailData.email} cls="accent" />
                    <Row label="Format" value={emailData.isValidFormat ? '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(52,211,153,0.15);color:var(--accent3)">VALID</span>' : '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(248,113,113,0.15);color:var(--danger)">INVALID</span>'} />
                    <Row label="Domain" value={emailData.domain} cls="accent" />
                    <Row label="Provider" value={emailData.ai?.estimatedProvider} />
                    <Row label="Disposable?" value={emailData.ai?.isDisposable ? '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(248,113,113,0.15);color:var(--danger)">YES — throwaway</span>' : '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(52,211,153,0.15);color:var(--accent3)">No</span>'} />
                    <Row label="Role Account?" value={emailData.ai?.isRoleAccount ? '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(251,191,36,0.15);color:var(--warning)">YES (admin/info/noreply)</span>' : '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(52,211,153,0.15);color:var(--accent3)">No — personal</span>'} />
                    <Row label="Deliverable?" value={emailData.ai?.deliverability === 'valid' ? '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(52,211,153,0.15);color:var(--accent3)">Yes</span>' : '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(251,191,36,0.15);color:var(--warning)">Risky</span>'} />
                  </ResultBlock>
                </Card>
                <Card>
                  <CardTitle>Risk Breakdown</CardTitle>
                  <ResultBlock>
                    <Row label="Risk Score" value={`${emailData.ai?.riskScore ?? 0}/100`} cls={emailData.ai?.riskScore > 60 ? 'danger' : 'success'} />
                    <Row label="Breach Likelihood" value={`<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:${emailData.ai?.breachLikelihood==='HIGH'?'rgba(248,113,113,0.15)':emailData.ai?.breachLikelihood==='MEDIUM'?'rgba(251,191,36,0.15)':'rgba(52,211,153,0.15)'};color:${emailData.ai?.breachLikelihood==='HIGH'?'var(--danger)':emailData.ai?.breachLikelihood==='MEDIUM'?'var(--warning)':'var(--accent3)'}">${emailData.ai?.breachLikelihood}</span>`} />
                    <Row label="Domain Reputation" value={emailData.ai?.domainReputation} cls={emailData.ai?.domainReputation==='good'?'success':emailData.ai?.domainReputation==='poor'?'danger':''} />
                  </ResultBlock>
                  {emailData.ai?.suspiciousPatterns?.length > 0 && (
                    <ResultBlock>
                      <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Red Flags</div>
                      {emailData.ai.suspiciousPatterns.map((p,i) => <div key={i} style={{ color:'var(--warning)', fontSize:12, padding:'2px 0' }}>⚠ {p}</div>)}
                    </ResultBlock>
                  )}
                  {emailData.ai?.recommendations?.length > 0 && (
                    <ResultBlock>
                      <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Recommendations</div>
                      {emailData.ai.recommendations.map((r,i) => <div key={i} style={{ color:'var(--accent3)', fontSize:12, padding:'2px 0' }}>→ {r}</div>)}
                    </ResultBlock>
                  )}
                </Card>
              </div>

              <Card style={{ marginBottom:14 }}>
                <CardTitle>Domain Verification (MX / SPF)</CardTitle>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <ResultBlock>
                    <Row label="MX Records" value={emailData.mx?.length ? `<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(52,211,153,0.15);color:var(--accent3)">Found (${emailData.mx.length})</span>` : '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(248,113,113,0.15);color:var(--danger)">None</span>'} />
                    {(emailData.mx||[]).slice(0,4).map((m,i) => <div key={i} style={{ fontSize:11, color:'var(--accent)', padding:'2px 0' }}>{m.data}</div>)}
                    <div style={{ fontSize:10, color:'var(--muted)', marginTop:8, lineHeight:1.6 }}>MX = Mail Exchange. If none found, the domain cannot receive email — likely fake.</div>
                  </ResultBlock>
                  <ResultBlock>
                    <Row label="SPF Record" value={emailData.spf?.length ? '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(52,211,153,0.15);color:var(--accent3)">Present</span>' : '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(251,191,36,0.15);color:var(--warning)">Missing</span>'} />
                    {(emailData.spf||[]).map((s,i) => <div key={i} style={{ fontSize:11, color:'var(--muted2)', padding:'2px 0', wordBreak:'break-all' }}>{s.data}</div>)}
                    <div style={{ fontSize:10, color:'var(--muted)', marginTop:8, lineHeight:1.6 }}>SPF missing = anyone can spoof email from this domain.</div>
                  </ResultBlock>
                </div>
              </Card>

              <Card><CardTitle>Recon Log</CardTitle><Terminal logs={logs} /></Card>
            </>
          )}

          {!emailData && !loading && !error && (
            <Card>
              <CardTitle>Try These Examples — Click Any to Analyze Instantly</CardTitle>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  { label:'Google Admin',     email:'admin@google.com',      tag:'ROLE ACCOUNT', color:'var(--warning)', desc:'Role-based address on a trusted domain — see how admin@ is flagged' },
                  { label:'Disposable Email', email:'test@tempmail.com',      tag:'DISPOSABLE',   color:'var(--danger)',  desc:'TempMail throwaway address — high risk, used to bypass verification' },
                  { label:'GitHub Info',      email:'info@github.com',        tag:'ROLE ACCOUNT', color:'var(--warning)', desc:"GitHub info address — role account on a reputable domain" },
                  { label:'Gmail Personal',   email:'someone@gmail.com',      tag:'PERSONAL',     color:'var(--accent3)', desc:"Standard Gmail personal address — Google consumer email" },
                  { label:'ProtonMail',       email:'user@protonmail.com',    tag:'PRIVATE',      color:'var(--accent2)', desc:'Privacy-focused encrypted email service based in Switzerland' },
                  { label:'Guerrilla Mail',   email:'spam@guerrillamail.com', tag:'SPAM TRAP',    color:'var(--danger)',  desc:'Known disposable spam trap — should always be blocked on signup' },
                ].map(u => (
                  <div key={u.email}
                    onClick={() => { setEmail(u.email); onEmailScan(u.email) }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = u.color; e.currentTarget.style.background = 'rgba(56,189,248,0.04)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)' }}
                    style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'12px 14px', cursor:'pointer', transition:'all .15s' }}
                  >
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ color:'var(--text)', fontSize:13, fontWeight:500 }}>{u.label}</span>
                      <span style={{ fontSize:9, padding:'2px 7px', borderRadius:4, background:`${u.color}22`, color:u.color, border:`1px solid ${u.color}44`, letterSpacing:1 }}>{u.tag}</span>
                    </div>
                    <div style={{ color:'var(--accent)', fontSize:11, marginBottom:4, fontFamily:'var(--mono)' }}>{u.email}</div>
                    <div style={{ color:'var(--muted)', fontSize:11, lineHeight:1.5 }}>{u.desc}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* ── FILE MODE ── */}
      {mode === 'file' && (
        <>
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border2)'}`,
              borderRadius:10, padding:'36px 20px', textAlign:'center', cursor:'pointer',
              background: dragOver ? 'rgba(56,189,248,0.06)' : 'transparent',
              marginBottom:14, transition:'all .2s',
            }}
          >
            <div style={{ fontSize:36, marginBottom:10 }}>📂</div>
            <div style={{ color:'var(--text)', fontSize:14, fontWeight:500, marginBottom:6 }}>Drop files here or click to browse</div>
            <div style={{ color:'var(--muted)', fontSize:11, lineHeight:1.8 }}>
              <span style={{ color:'var(--accent2)' }}>.eml .msg</span> (email files) &nbsp;·&nbsp;
              <span style={{ color:'var(--danger)' }}>.pdf</span> &nbsp;·&nbsp;
              <span style={{ color:'var(--accent3)' }}>images</span> &nbsp;·&nbsp;
              <span style={{ color:'var(--warning)' }}>.txt .log .csv .json .html</span> &nbsp;·&nbsp;
              <span style={{ color:'var(--accent)' }}>.doc .xls .ppt</span> &nbsp;·&nbsp;
              <span style={{ color:'var(--muted2)' }}>.zip</span><br/>
              Multiple files · Max 10 MB each
            </div>
            <input ref={fileInputRef} type="file" multiple accept="*/*" style={{ display:'none' }}
              onChange={e => addToQueue(Array.from(e.target.files))} />
          </div>

          {/* File queue */}
          {queuedFiles.length > 0 && (
            <Card style={{ marginBottom:14 }}>
              <CardTitle>Files Queued ({queuedFiles.length})</CardTitle>
              {queuedFiles.map((f, i) => {
                const fi = fileInfo(f.name)
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'var(--bg3)', borderRadius:6, marginBottom:6, border:'1px solid var(--border)' }}>
                    <div style={{ width:32, height:32, borderRadius:5, background:`${fi.color}22`, border:`1px solid ${fi.color}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14 }}>{fi.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:'var(--text)', fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</div>
                      <div style={{ color:'var(--muted)', fontSize:10, marginTop:2 }}>{fi.label} · {fmtSize(f.size)}</div>
                    </div>
                    <button onClick={() => setQueuedFiles(prev => prev.filter((_,j) => j !== i))}
                      style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:14, padding:4 }}>✕</button>
                  </div>
                )
              })}
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <Btn onClick={() => onFileScan(queuedFiles)} disabled={loading}>
                  {loading ? '...' : `▶ ANALYZE ${queuedFiles.length} FILE${queuedFiles.length > 1 ? 'S' : ''}`}
                </Btn>
                <button onClick={() => setQueuedFiles([])}
                  style={{ padding:'10px 16px', background:'transparent', border:'1px solid var(--border)', borderRadius:6, color:'var(--muted)', fontFamily:'var(--mono)', fontSize:12, cursor:'pointer' }}>
                  ✕ Clear
                </button>
              </div>
            </Card>
          )}

          {loading && (
            <Card style={{ marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--muted2)', justifyContent:'center', padding:'12px 0' }}>
                <Spinner /> <span>Uploading and analyzing files...</span>
              </div>
              <Terminal logs={logs} />
            </Card>
          )}

          {error && !loading && (
            <Card style={{ marginBottom:14, borderColor:'rgba(248,113,113,0.3)' }}>
              <div style={{ color:'var(--danger)' }}>⚠ {error}</div>
            </Card>
          )}

          {/* Forensic results */}
          {forensicData && !loading && (() => {
            const results   = forensicData.results || []
            const malN  = results.filter(r => r.analysis?.verdict === 'MALICIOUS').length
            const susN  = results.filter(r => r.analysis?.verdict === 'SUSPICIOUS').length
            const totalF = results.reduce((n,r) => n + (r.analysis?.findings?.length || 0), 0)
            const overall = malN ? 'HIGH' : susN ? 'MEDIUM' : 'LOW'
            const oColor  = overall === 'HIGH' ? 'var(--danger)' : overall === 'MEDIUM' ? 'var(--warning)' : 'var(--accent3)'

            return (
              <>
                {/* Summary bar */}
                <Card style={{ marginBottom:14 }}>
                  <CardTitle>Forensic Summary — {results.length} file{results.length > 1 ? 's' : ''}</CardTitle>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                    {[['Overall Risk', overall, oColor], ['Malicious', malN, 'var(--danger)'], ['Suspicious', susN, 'var(--warning)'], ['Findings', totalF, 'var(--accent)']].map(([l,v,c]) => (
                      <div key={l} style={{ textAlign:'center', background:'var(--bg3)', borderRadius:6, padding:12, border:'1px solid var(--border)' }}>
                        <div style={{ fontFamily:'var(--head)', fontSize: typeof v === 'number' ? 26 : 16, fontWeight:800, color:c, paddingTop: typeof v === 'string' ? 4 : 0 }}>{v}</div>
                        <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginTop:3 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Per-file results */}
                {results.map((r, i) => {
                  const fi  = fileInfo(r.filename)
                  const res = r.analysis
                  if (r.error || !res) return (
                    <Card key={i} style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                        <div style={{ fontSize:18 }}>{fi.icon}</div>
                        <div style={{ color:'var(--text)', fontSize:13, fontWeight:500 }}>{r.filename}</div>
                      </div>
                      <div style={{ background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:6, padding:14 }}>
                        <div style={{ color:'var(--warning)', fontSize:13, fontWeight:500, marginBottom:4 }}>⚠ Analysis failed</div>
                        <div style={{ color:'var(--muted2)', fontSize:12 }}>{r.error || 'Unknown error'}</div>
                      </div>
                    </Card>
                  )

                  const vc = verdictColor(res.verdict)
                  return (
                    <Card key={i} style={{ marginBottom:14 }}>
                      {/* File header */}
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                        <div style={{ width:36, height:36, borderRadius:5, background:`${fi.color}22`, border:`1px solid ${fi.color}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>{fi.icon}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ color:'var(--text)', fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.filename}</div>
                          <div style={{ color:'var(--muted)', fontSize:10, marginTop:2 }}>{fi.label} · {fmtSize(r.size)} · Score: <span style={{ color:vc, fontWeight:500 }}>{res.riskScore}/100</span></div>
                        </div>
                        <Badge variant={verdictBadge(res.verdict)}>{res.verdict}</Badge>
                      </div>

                      {/* Verdict */}
                      <div style={{ borderRadius:8, padding:14, marginBottom:12,
                        background: res.verdict==='MALICIOUS'?'rgba(248,113,113,0.08)':res.verdict==='SUSPICIOUS'?'rgba(251,191,36,0.07)':'rgba(52,211,153,0.07)',
                        border: `1px solid ${res.verdict==='MALICIOUS'?'rgba(248,113,113,0.25)':res.verdict==='SUSPICIOUS'?'rgba(251,191,36,0.2)':'rgba(52,211,153,0.2)'}`,
                      }}>
                        <div style={{ color:vc, fontSize:13, fontWeight:500, marginBottom:5 }}>{verdictIcon(res.verdict)} {res.verdict==='MALICIOUS'?'Malicious content detected':res.verdict==='SUSPICIOUS'?'Suspicious — review carefully':'No threats detected'}</div>
                        <div style={{ color:'var(--muted2)', fontSize:12, lineHeight:1.7 }}>{res.summary}</div>
                      </div>

                      {/* Findings */}
                      {res.findings?.length > 0 && (
                        <div style={{ marginBottom:12 }}>
                          <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Findings ({res.findings.length})</div>
                          <ResultBlock>
                            {res.findings.map((f, j) => (
                              <div key={j} style={{ display:'flex', gap:10, padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', alignItems:'flex-start' }}>
                                <span style={{ flexShrink:0, width:18, textAlign:'center', fontSize:12 }}>{sIcon[f.severity]||'ℹ️'}</span>
                                <div style={{ fontSize:12, color:'var(--muted2)', lineHeight:1.6 }}>
                                  <b style={{ color: sColor[f.severity]||'var(--accent)' }}>{f.title}</b> — {f.detail}
                                </div>
                              </div>
                            ))}
                          </ResultBlock>
                        </div>
                      )}

                      {/* Header analysis (for .eml) */}
                      {res.headerAnalysis?.fromAddress && res.headerAnalysis.fromAddress !== 'N/A' && (
                        <div style={{ marginBottom:12 }}>
                          <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Email Header Analysis</div>
                          <ResultBlock>
                            <Row label="From Address"  value={res.headerAnalysis.fromAddress}  cls="accent" />
                            <Row label="Reply-To"       value={res.headerAnalysis.replyTo} />
                            <Row label="Originating IP" value={res.headerAnalysis.originatingIP} cls="accent" />
                            <Row label="SPF"  value={res.headerAnalysis.spfResult}  cls={res.headerAnalysis.spfResult==='pass'?'success':res.headerAnalysis.spfResult==='fail'?'danger':''} />
                            <Row label="DKIM" value={res.headerAnalysis.dkimResult} cls={res.headerAnalysis.dkimResult==='pass'?'success':res.headerAnalysis.dkimResult==='fail'?'danger':''} />
                            <Row label="DMARC" value={res.headerAnalysis.dmarcResult} cls={res.headerAnalysis.dmarcResult==='pass'?'success':res.headerAnalysis.dmarcResult==='fail'?'danger':''} />
                            <Row label="Header Mismatch" value={res.headerAnalysis.mismatchDetected ? '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(248,113,113,0.15);color:var(--danger)">YES — suspicious</span>' : '<span style="padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(52,211,153,0.15);color:var(--accent3)">None</span>'} />
                          </ResultBlock>
                        </div>
                      )}

                      {/* Extracted artifacts */}
                      {(res.extractedUrls?.length > 0 || res.extractedEmails?.length > 0) && (
                        <div style={{ marginBottom:12 }}>
                          <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Extracted Artifacts</div>
                          <ResultBlock>
                            {res.extractedUrls?.length > 0 && <>
                              <div style={{ fontSize:10, color:'var(--muted)', marginBottom:5 }}>URLs:</div>
                              {res.extractedUrls.map((u,j) => <div key={j} style={{ color:'var(--warning)', fontSize:11, padding:'2px 0', wordBreak:'break-all' }}>🔗 {u}</div>)}
                            </>}
                            {res.extractedEmails?.length > 0 && <>
                              <div style={{ fontSize:10, color:'var(--muted)', margin:'8px 0 5px' }}>Emails:</div>
                              {res.extractedEmails.map((e,j) => <div key={j} style={{ color:'var(--accent)', fontSize:11, padding:'2px 0' }}>@ {e}</div>)}
                            </>}
                          </ResultBlock>
                        </div>
                      )}

                      {/* IOCs */}
                      {res.iocIndicators?.length > 0 && (
                        <div style={{ marginBottom:12 }}>
                          <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Indicators of Compromise</div>
                          <ResultBlock>
                            {res.iocIndicators.map((ioc,j) => <div key={j} style={{ color:'var(--danger)', fontSize:12, padding:'3px 0' }}>⚠ {ioc}</div>)}
                          </ResultBlock>
                        </div>
                      )}

                      {/* Recommendation */}
                      <ResultBlock>
                        <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>Recommendation</div>
                        <div style={{ color:vc, fontSize:12, lineHeight:1.6 }}>→ {res.recommendation}</div>
                      </ResultBlock>
                    </Card>
                  )
                })}

                <Card><CardTitle>Analysis Log</CardTitle><Terminal logs={logs} /></Card>
              </>
            )
          })()}

          {!forensicData && !loading && !error && queuedFiles.length === 0 && (
            <Card>
              <CardTitle>What Can You Upload?</CardTitle>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:4 }}>
                {[
                  ['📧', 'var(--accent2)', 'Raw Email Files (.eml / .msg)', 'Export directly from Outlook or Thunderbird. AI reads full headers, routing path, sender IP, Reply-To mismatches, and body for phishing indicators.'],
                  ['📄', 'var(--danger)',  'PDF Documents', 'PDFs can hide malicious links or embedded scripts. AI checks for suspicious URLs, urgency language, and impersonation patterns.'],
                  ['🖼️', 'var(--accent3)', 'Images & Screenshots', 'Screenshot of a suspicious email or QR code? AI reads text from images, extracts URLs, and identifies phishing attempts.'],
                  ['📝', 'var(--warning)', 'Text / Log / CSV / JSON', 'Raw email headers, server logs, HTML source. AI extracts IPs, domains, tracking pixels, and auth failures.'],
                  ['📊', 'var(--accent)',  'Office Documents', 'Word, Excel attachments. AI scans for social engineering text like fake invoice urgency or macro indicators.'],
                  ['📦', 'var(--muted2)',  'ZIP / Archives', 'Malware commonly arrives in ZIPs. AI analyzes metadata, filenames, and extractable content for threat indicators.'],
                ].map(([icon, color, title, desc]) => (
                  <div key={title} style={{ background:'rgba(56,189,248,0.04)', border:'1px solid var(--border)', borderRadius:6, padding:'12px 14px' }}>
                    <div style={{ fontSize:11, color, marginBottom:4, fontWeight:500 }}>{icon} {title}</div>
                    <div style={{ fontSize:11, color:'var(--muted2)', lineHeight:1.7 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
