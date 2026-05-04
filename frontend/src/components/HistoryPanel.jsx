import React from 'react'
import { Card, CardTitle } from './UI.jsx'

export default function HistoryPanel({ history, onReplay }) {
  if (!history.length) {
    return (
      <Card style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>◷</div>
        <div style={{ color: 'var(--muted2)' }}>No scans yet. Results will appear here.</div>
      </Card>
    )
  }

  const badge = (risk) => {
    const map = { HIGH: ['rgba(248,113,113,0.15)', 'var(--danger)'], CRITICAL: ['rgba(248,113,113,0.15)', 'var(--danger)'], MEDIUM: ['rgba(251,191,36,0.15)', 'var(--warning)'], LOW: ['rgba(52,211,153,0.15)', 'var(--accent3)'] }
    const [bg, color] = map[risk] || ['rgba(56,189,248,0.1)', 'var(--accent)']
    return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, background: bg, color }}>{risk}</span>
  }

  return (
    <Card>
      <CardTitle>Scan History ({history.length})</CardTitle>
      {history.map((h, i) => (
        <div key={i} onClick={() => onReplay(h.query, h.type)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 12px', background: 'var(--bg3)', borderRadius: 5,
          marginBottom: 6, cursor: 'pointer', transition: 'background .15s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(56,189,248,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}
        >
          <div>
            <div style={{ color: 'var(--muted2)', fontSize: 12 }}>{h.query}</div>
            <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>{h.type?.toUpperCase()} · {h.time}</div>
          </div>
          {badge(h.risk)}
        </div>
      ))}
    </Card>
  )
}
