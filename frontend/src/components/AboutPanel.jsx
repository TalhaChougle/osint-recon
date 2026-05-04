import React from 'react'
import { Card, CardTitle, ResultBlock, Row } from './UI.jsx'

export default function AboutPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <CardTitle>Project Info</CardTitle>
        <ResultBlock>
          <Row label="Project" value="OSINT Recon" cls="accent" />
          <Row label="Developer" value="Talha Chougle" />
          <Row label="GitHub" value='<a href="https://github.com/TalhaChougle" style="color:var(--accent)">github.com/TalhaChougle</a>' />
          <Row label="Email" value="tchougle60@gmail.com" cls="accent" />
          <Row label="Stack" value="React 18, Vite, Express.js, Anthropic AI" />
          <Row label="Real APIs" value="ip-api.com · dns.google · ipwho.is" />
          <Row label="AI Model" value="Gemini 1.5 Flash (Google — free)" cls="accent" />
          <Row label="Version" value="1.0.0" />
        </ResultBlock>
      </Card>

      <Card>
        <CardTitle>Features</CardTitle>
        <ResultBlock>
          <div style={{ color: 'var(--muted2)', fontSize: 12, lineHeight: 2.2 }}>
            {[
              'Real-time IP Geolocation (ip-api.com)',
              'AI-powered threat analysis via Claude API',
              'DNS record lookup — A, AAAA, MX, NS, TXT, CNAME',
              'WHOIS registration data estimation',
              'Port exposure analysis for common services',
              'Email recon — format, MX, SPF, breach likelihood',
              'Persistent scan history (localStorage)',
              'Risk scoring with automated threat meters',
              'Rate limiting & CORS security on backend',
              'Deployable to Vercel (frontend) + Render (backend)'
            ].map((f, i) => <div key={i}>✦ {f}</div>)}
          </div>
        </ResultBlock>
      </Card>

      <Card>
        <CardTitle>Tech Stack</CardTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { layer: 'Frontend', tech: 'React 18 + Vite', color: 'var(--accent)' },
            { layer: 'Backend', tech: 'Express.js (Node 18)', color: 'var(--accent3)' },
            { layer: 'AI Layer', tech: 'Google Generative AI SDK', color: 'var(--accent2)' },
            { layer: 'Security', tech: 'Helmet + Rate Limiter', color: 'var(--warning)' },
            { layer: 'Geo API', tech: 'ip-api.com', color: 'var(--accent)' },
            { layer: 'DNS API', tech: 'dns.google DoH', color: 'var(--accent3)' },
          ].map(s => (
            <div key={s.layer} style={{ background: 'var(--bg3)', borderRadius: 6, padding: '10px 14px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.layer}</div>
              <div style={{ color: s.color, fontSize: 13, fontWeight: 500, marginTop: 4 }}>{s.tech}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Disclaimer</CardTitle>
        <div style={{ color: 'var(--muted2)', fontSize: 12, lineHeight: 1.8, background: 'var(--bg3)', borderRadius: 6, padding: 14, border: '1px solid var(--border)' }}>
          This tool is built for educational and ethical security research purposes only.
          Only scan IP addresses, domains, and emails you own or have explicit permission to analyze.
          Unauthorized OSINT on third-party targets may violate laws in your jurisdiction.
          The AI threat analysis is heuristic and should not be used as sole evidence of malicious activity.
        </div>
      </Card>
    </div>
  )
}
