import React, { useState } from 'react'
import Header from './components/Header.jsx'
import ScanPanel from './components/ScanPanel.jsx'
import EmailPanel from './components/EmailPanel.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import AboutPanel from './components/AboutPanel.jsx'
import { useOSINT } from './hooks/useOSINT.js'

const TABS = [
  { id: 'lookup',  label: '[ IP / Domain ]'  },
  { id: 'email',   label: '[ Email Recon ]'  },
  { id: 'history', label: '[ History ]'       },
  { id: 'about',   label: '[ About ]'         },
]

export default function App() {
  const [tab, setTab] = useState('lookup')
  const { loading, error, result, logs, history, runScan, runEmailScan, runFileScan } = useOSINT()

  const handleReplay = (query, type, kind) => {
    if (kind === 'email') {
      setTab('email')
      runEmailScan(query)
    } else if (kind === 'file') {
      setTab('email')   // file mode lives inside email tab
    } else {
      setTab('lookup')
      runScan(query, type)
    }
  }

  return (
    <>
      <div className="scanline" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px' }}>
        <Header />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 16px',
              background: tab === t.id ? 'rgba(56,189,248,0.1)' : 'transparent',
              border: `1px solid ${tab === t.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 6,
              color: tab === t.id ? 'var(--accent)' : 'var(--muted)',
              fontFamily: 'var(--mono)', fontSize: 12, cursor: 'pointer',
              transition: 'all .2s', letterSpacing: '0.5px',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Panels */}
        {tab === 'lookup'  && <ScanPanel  loading={loading} result={result} logs={logs} error={error} onScan={runScan} />}
        {tab === 'email'   && <EmailPanel loading={loading} result={result} logs={logs} error={error} onEmailScan={runEmailScan} onFileScan={runFileScan} />}
        {tab === 'history' && <HistoryPanel history={history} onReplay={handleReplay} />}
        {tab === 'about'   && <AboutPanel />}
      </div>
    </>
  )
}
