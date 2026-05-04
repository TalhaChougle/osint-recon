import React, { useState } from 'react'
import { Card, CardTitle, ResultBlock, Row, Badge, Btn, Terminal, Spinner, MeterBar } from './UI.jsx'

const USE_CASES = [
  { label: 'Google DNS',       value: '8.8.8.8',          type: 'ip',     tag: 'LOW RISK',    color: 'var(--accent3)', desc: "Google's public DNS resolver — trusted global infrastructure" },
  { label: 'Cloudflare DNS',   value: '1.1.1.1',          type: 'ip',     tag: 'LOW RISK',    color: 'var(--accent3)', desc: "Cloudflare's privacy-first DNS resolver" },
  { label: 'Cloudflare',       value: 'cloudflare.com',   type: 'domain', tag: 'CLEAN',       color: 'var(--accent3)', desc: 'Major CDN provider — see how a clean domain looks' },
  { label: 'GitHub',           value: 'github.com',       type: 'domain', tag: 'CLEAN',       color: 'var(--accent3)', desc: 'Microsoft-owned dev platform — AWS hosted in Virginia' },
  { label: 'Nmap Scan Target', value: 'scanme.nmap.org',  type: 'domain', tag: 'INTENTIONAL', color: 'var(--accent)',  desc: "Nmap's official test target — open ports by design" },
  { label: 'Tor Exit Node',    value: '185.220.101.1',    type: 'ip',     tag: 'HIGH RISK',   color: 'var(--danger)',  desc: 'Known Tor exit node — see how a suspicious IP is flagged' },
  { label: 'Spamhaus',         value: 'spamhaus.org',     type: 'domain', tag: 'SECURITY',    color: 'var(--accent2)', desc: 'Anti-spam organisation — interesting threat intel context' },
  { label: 'AbuseIPDB',        value: 'abuseipdb.com',    type: 'domain', tag: 'SECURITY',    color: 'var(--accent2)', desc: 'IP abuse tracking platform — security-focused domain' },
]

export default function ScanPanel({ loading, result, logs, error, onScan }) {
  const [target, setTarget] = useState('')
  const [type, setType] = useState('ip')

  const placeholders = { ip: 'e.g. 8.8.8.8 or 1.1.1.1', domain: 'e.g. google.com or github.com', url: 'e.g. https://example.com' }
  const handleScan = () => { if (target.trim()) onScan(target.trim(), type) }
  const riskBadge = (score) => score > 70 ? 'risk' : score > 40 ? 'warn' : 'ok'

  return (
    <div>
      {/* Search */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Target Input</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={type} onChange={e => setType(e.target.value)} style={{
            padding: '10px 12px', background: 'var(--bg3)', border: '1px solid var(--border2)',
            borderRadius: 6, color: 'var(--muted2)', outline: 'none', flexShrink: 0
          }}>
            <option value="ip">IP Address</option>
            <option value="domain">Domain</option>
            <option value="url">URL</option>
          </select>
          <input
            value={target} onChange={e => setTarget(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            placeholder={placeholders[type]}
            style={{ flex: 1, padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text)', outline: 'none', fontSize: 13 }}
          />
          <Btn onClick={handleScan} disabled={loading || !target.trim()}>
            {loading ? '...' : '▶ SCAN'}
          </Btn>
        </div>
      </Card>

      {/* Use cases */}
      {!result && !loading && !error && (
        <Card style={{ marginBottom: 14 }}>
          <CardTitle>Try These Examples — Click Any to Scan Instantly</CardTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {USE_CASES.map(u => (
              <div key={u.value}
                onClick={() => { setTarget(u.value); setType(u.type); onScan(u.value, u.type) }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = u.color; e.currentTarget.style.background = 'rgba(56,189,248,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)' }}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', cursor: 'pointer', transition: 'all .15s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>{u.label}</span>
                  <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: `${u.color}22`, color: u.color, border: `1px solid ${u.color}44`, letterSpacing: 1 }}>{u.tag}</span>
                </div>
                <div style={{ color: 'var(--accent)', fontSize: 11, marginBottom: 4, fontFamily: 'var(--mono)' }}>{u.value}</div>
                <div style={{ color: 'var(--muted)', fontSize: 11, lineHeight: 1.5 }}>{u.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted2)', justifyContent: 'center', padding: '12px 0' }}>
            <Spinner /> <span>Querying intelligence sources...</span>
          </div>
          <Terminal logs={logs} />
        </Card>
      )}

      {/* Error */}
      {error && !loading && (
        <Card style={{ marginBottom: 14, borderColor: 'rgba(248,113,113,0.3)' }}>
          <div style={{ color: 'var(--danger)', fontSize: 13 }}>⚠ Error: {error}</div>
        </Card>
      )}

      {/* Results */}
      {result && !loading && result._type !== 'email' && (
        <>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
            {[
              { label: 'Risk Score', val: result.ai?.riskScore ?? '--', color: result.ai?.riskScore > 70 ? 'var(--danger)' : result.ai?.riskScore > 40 ? 'var(--warning)' : 'var(--accent3)' },
              { label: 'Target Type', val: result.type?.toUpperCase() || '--', color: 'var(--accent)' },
              { label: 'Country', val: result.geo?.countryCode || '??', color: 'var(--text)' }
            ].map(s => (
              <Card key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--head)', fontSize: 30, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
              </Card>
            ))}
          </div>

          {/* Geo + Threat */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Card>
              <CardTitle>Geolocation & Network</CardTitle>
              {result.geo ? (
                <ResultBlock>
                  <Row label="IP / Host" value={result.geo.query} cls="accent" />
                  <Row label="Location" value={`${result.geo.city}, ${result.geo.regionName}`} />
                  <Row label="Country" value={`${result.geo.country} (${result.geo.countryCode})`} />
                  <Row label="ISP" value={result.geo.isp} cls="accent" />
                  <Row label="Organization" value={result.geo.org} />
                  <Row label="AS Number" value={result.geo.as} cls="accent" />
                  <Row label="Timezone" value={result.geo.timezone} />
                  <Row label="Proxy / VPN" value={result.geo.proxy ? '<span style="color:var(--warning)">Detected</span>' : 'None'} />
                  <Row label="Hosting/DC" value={result.geo.hosting ? 'Yes (Datacenter)' : 'No'} />
                  <Row label="Coordinates" value={`${result.geo.lat?.toFixed(4)}°, ${result.geo.lon?.toFixed(4)}°`} cls="accent" />
                </ResultBlock>
              ) : (
                <ResultBlock><div style={{ color: 'var(--muted)', padding: 8 }}>Private/reserved range or lookup failed</div></ResultBlock>
              )}
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6, marginTop: 12, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(56,189,248,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)', zIndex: 1, boxShadow: '0 0 12px var(--accent)' }} />
                <div style={{ fontSize: 12, color: 'var(--muted2)', zIndex: 1 }}>{result.geo?.city || 'Unknown'}, {result.geo?.country || '—'}</div>
                {result.geo && <div style={{ fontSize: 11, color: 'var(--accent)', zIndex: 1 }}>{result.geo.lat?.toFixed(4)}° N, {result.geo.lon?.toFixed(4)}° E</div>}
              </div>
            </Card>

            <Card>
              <CardTitle>Threat Intelligence</CardTitle>
              {result.ai && (
                <>
                  <ResultBlock>
                    <Row label="Risk Level" value={`<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;background:${result.ai.riskScore>70?'rgba(248,113,113,0.15)':result.ai.riskScore>40?'rgba(251,191,36,0.15)':'rgba(52,211,153,0.15)'};color:${result.ai.riskScore>70?'var(--danger)':result.ai.riskScore>40?'var(--warning)':'var(--accent3)'}">${result.ai.riskLevel}</span>`} />
                    <Row label="Status" value={`${result.ai.isMalicious?'<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(248,113,113,0.15);color:var(--danger)">MALICIOUS</span>':'<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(52,211,153,0.15);color:var(--accent3)">CLEAN</span>'} ${result.ai.isVPN?'<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;background:rgba(251,191,36,0.15);color:var(--warning);margin-left:4px">VPN</span>':''}`} />
                    <Row label="Abuse Confidence" value={`${result.ai.abuseConfidence || 0}%`} cls={result.ai.abuseConfidence > 50 ? 'danger' : ''} />
                    <div style={{ padding: '5px 0' }}>
                      <span style={{ color: 'var(--muted)', fontSize: 12 }}>Categories</span>
                      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(result.ai.threatCategories || []).map((c, i) => (
                          <span key={i} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, background: 'rgba(251,191,36,0.15)', color: 'var(--warning)', border: '1px solid rgba(251,191,36,0.3)' }}>{c}</span>
                        ))}
                        {!result.ai.threatCategories?.length && <span style={{ color: 'var(--muted)', fontSize: 12 }}>None detected</span>}
                      </div>
                    </div>
                  </ResultBlock>
                  <ResultBlock>
                    <div style={{ color: 'var(--muted2)', fontSize: 12, lineHeight: 1.7 }}>{result.ai.summary}</div>
                  </ResultBlock>
                  <div style={{ marginTop: 12 }}>
                    <MeterBar label="Reputation"       value={100 - (result.ai.riskScore || 0)} color="var(--accent3)" />
                    <MeterBar label="Threat Level"     value={result.ai.riskScore || 0}         color="var(--danger)"  />
                    <MeterBar label="Abuse Confidence" value={result.ai.abuseConfidence || 0}   color="var(--accent)"  />
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* WHOIS + DNS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Card>
              <CardTitle>WHOIS / Registration</CardTitle>
              {result.ai?.whois && (
                <ResultBlock>
                  <Row label="Registrar"       value={result.ai.whois.registrar}                          cls="accent"  />
                  <Row label="Created"          value={result.ai.whois.created}                                          />
                  <Row label="Expires"          value={result.ai.whois.expires}                                          />
                  <Row label="Nameservers"      value={(result.ai.whois.nameservers || []).join(', ')}    cls="accent"  />
                  <Row label="Recommendation"   value={result.ai.recommendation}                          cls="success" />
                </ResultBlock>
              )}
              {result.ai?.indicators?.length > 0 && (
                <ResultBlock>
                  <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Indicators of Compromise</div>
                  {result.ai.indicators.map((ioc, i) => (
                    <div key={i} style={{ color: 'var(--warning)', fontSize: 12, padding: '3px 0' }}>⚠ {ioc}</div>
                  ))}
                </ResultBlock>
              )}
            </Card>

            <Card>
              <CardTitle>DNS Records</CardTitle>
              <ResultBlock>
                {['a', 'mx', 'ns'].map(rtype => (
                  <div key={rtype} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>{rtype.toUpperCase()} Records</div>
                    {(result.dns?.[rtype] || []).slice(0, 4).map((rec, i) => (
                      <div key={i} style={{ fontSize: 12, padding: '2px 0', color: rtype === 'a' ? 'var(--accent)' : rtype === 'ns' ? 'var(--accent2)' : 'var(--muted2)', wordBreak: 'break-all' }}>{rec.data}</div>
                    ))}
                    {!(result.dns?.[rtype]?.length) && <div style={{ color: 'var(--muted)', fontSize: 12 }}>None</div>}
                  </div>
                ))}
              </ResultBlock>
            </Card>
          </div>

          {/* Ports */}
          <Card style={{ marginBottom: 14 }}>
            <CardTitle>Port Exposure Analysis</CardTitle>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>{['Port', 'Service', 'State', 'Risk'].map(h => (
                  <th key={h} style={{ color: 'var(--muted)', padding: '6px 8px', borderBottom: '1px solid var(--border)', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {(result.ai?.openPorts || []).map((p, i) => (
                  <tr key={i}>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'var(--accent)', fontWeight: 500 }}>{p.port}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'var(--muted2)' }}>{p.service}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: p.state === 'open' ? 'var(--danger)' : p.state === 'filtered' ? 'var(--warning)' : 'var(--muted)' }}>{p.state}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, background: p.risk === 'high' ? 'rgba(248,113,113,0.15)' : p.risk === 'medium' ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)', color: p.risk === 'high' ? 'var(--danger)' : p.risk === 'medium' ? 'var(--warning)' : 'var(--accent3)' }}>{p.risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Log */}
          <Card>
            <CardTitle>Recon Log</CardTitle>
            <Terminal logs={logs} />
          </Card>
        </>
      )}
    </div>
  )
}
