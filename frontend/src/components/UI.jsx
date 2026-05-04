import React from 'react'

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 16, ...style
    }}>
      {children}
    </div>
  )
}

export function CardTitle({ children }) {
  return (
    <div style={{
      fontSize: 10, color: 'var(--muted)', letterSpacing: 2,
      textTransform: 'uppercase', marginBottom: 12,
      display: 'flex', alignItems: 'center', gap: 8
    }}>
      <span style={{ display: 'block', width: 3, height: 12, background: 'var(--accent)', borderRadius: 2 }} />
      {children}
    </div>
  )
}

export function ResultBlock({ children }) {
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border)',
      borderRadius: 6, padding: 14, marginTop: 12
    }}>
      {children}
    </div>
  )
}

export function Row({ label, value, cls = '' }) {
  const colors = { accent: 'var(--accent)', danger: 'var(--danger)', success: 'var(--accent3)', warning: 'var(--warning)', '': 'var(--text)' }
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)'
    }}>
      <span style={{ color: 'var(--muted)', fontSize: 12, flexShrink: 0 }}>{label}</span>
      <span style={{ color: colors[cls] || 'var(--text)', fontSize: 12, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}
        dangerouslySetInnerHTML={{ __html: value ?? 'Unknown' }} />
    </div>
  )
}

export function Badge({ children, variant = 'info' }) {
  const styles = {
    ok:   { bg: 'rgba(52,211,153,0.15)', color: 'var(--accent3)',  border: 'rgba(52,211,153,0.3)' },
    warn: { bg: 'rgba(251,191,36,0.15)',  color: 'var(--warning)',  border: 'rgba(251,191,36,0.3)' },
    risk: { bg: 'rgba(248,113,113,0.15)', color: 'var(--danger)',   border: 'rgba(248,113,113,0.3)' },
    info: { bg: 'rgba(56,189,248,0.10)',  color: 'var(--accent)',   border: 'rgba(56,189,248,0.2)' },
  }
  const s = styles[variant] || styles.info
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      fontSize: 10, fontWeight: 500, letterSpacing: '0.5px',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`
    }}>
      {children}
    </span>
  )
}

export function Btn({ children, onClick, disabled, variant = 'default', style = {} }) {
  const base = {
    padding: '10px 20px', borderRadius: 6, fontSize: 12, letterSpacing: 1,
    transition: 'all .2s', border: '1px solid', fontFamily: 'var(--mono)', ...style
  }
  if (variant === 'danger') {
    return <button onClick={onClick} disabled={disabled} style={{ ...base, background: 'rgba(248,113,113,0.1)', borderColor: 'var(--danger)', color: 'var(--danger)', opacity: disabled ? 0.4 : 1 }}>{children}</button>
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, background: 'rgba(56,189,248,0.1)', borderColor: 'var(--accent)', color: 'var(--accent)', opacity: disabled ? 0.4 : 1 }}>
      {children}
    </button>
  )
}

export function Terminal({ logs = [] }) {
  const ref = React.useRef()
  React.useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [logs])
  const color = { info: 'var(--accent)', ok: 'var(--accent3)', warn: 'var(--warning)', err: 'var(--danger)' }
  return (
    <div ref={ref} style={{
      background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6,
      padding: 12, maxHeight: 160, overflowY: 'auto', marginTop: 12, fontFamily: 'var(--mono)', fontSize: 11
    }}>
      {logs.map(l => (
        <div key={l.id} style={{ display: 'flex', gap: 8, padding: '2px 0' }}>
          <span style={{ color: 'var(--muted)', minWidth: 72 }}>[{l.time}]</span>
          <span style={{ color: color[l.type] || 'var(--accent)' }}>{l.msg}</span>
        </div>
      ))}
    </div>
  )
}

export function Spinner() {
  return (
    <>
      <div style={{
        width: 20, height: 20, border: '2px solid var(--border2)', borderTopColor: 'var(--accent)',
        borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block'
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}

export function MeterBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>
        <span>{label}</span><span>{value}%</span>
      </div>
      <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3, transition: 'width .8s ease' }} />
      </div>
    </div>
  )
}
