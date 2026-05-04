import React, { useState, useEffect } from 'react'

export default function Header() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toTimeString().split(' ')[0])
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', background: 'var(--panel)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 14
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 38, height: 38, border: '2px solid var(--accent)', borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--head)', fontWeight: 800, fontSize: 15, color: 'var(--accent)'
        }}>OL</div>
        <div>
          <div style={{ fontFamily: 'var(--head)', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>OSINT Recon</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase' }}>Open Source Intelligence Dashboard</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
          background: 'var(--accent3)', animation: 'pulse 2s infinite'
        }} />
        <span style={{ fontSize: 11, color: 'var(--muted2)' }}>Systems Operational</span>
        <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{time}</span>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </header>
  )
}
