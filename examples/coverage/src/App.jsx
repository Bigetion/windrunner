import { useState, useEffect, useMemo } from 'react'
import { NAV } from './nav.js'
import { createWindrunner, compileClass } from 'windrunner'
import { PAGES } from './pages/index.jsx'

// ── hash router ──────────────────────────────────────────────────────────────
function useHash() {
  const [hash, setHash] = useState(() => location.hash.slice(1) || 'display')
  useEffect(() => {
    const fn = () => setHash(location.hash.slice(1) || 'display')
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])
  return hash
}

export default function App() {
  const currentId  = useHash()
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const runtime = createWindrunner({
      autoStart: false,
      id: 'windrunner-coverage-runtime',
      preflight: true,
    })

    runtime.start()
    return () => runtime.disconnect()
  }, [])

  const stats = useMemo(() => {
    const result = {}
    for (const page of NAV.flatMap(g => g.items)) {
      const def = PAGES[page.id]
      if (!def?.classes) continue
      const pass  = def.classes.filter((c) => compileClass(c) !== '').length
      const total = def.classes.length
      result[page.id] = { pass, total }
    }
    return result
  }, [])

  const cc = compileClass
  const globalPass  = Object.values(stats).reduce((a, s) => a + s.pass,  0)
  const globalTotal = Object.values(stats).reduce((a, s) => a + s.total, 0)
  const globalPct   = globalTotal ? Math.round(globalPass / globalTotal * 100) : null

  const PageComponent = PAGES[currentId]?.component

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Header ── */}
      <header style={{
        height: 'var(--header-h)', background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 1.25rem', gap: '0.75rem', flexShrink: 0, zIndex: 10
      }}>
        <a href="#display" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
            <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
            <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
          </svg>
          Windrunner
        </a>
        <span style={{ fontSize: '0.68rem', fontWeight: 600, background: 'var(--bg3)', color: 'var(--text-2)', padding: '2px 8px', borderRadius: 999 }}>Coverage</span>
        <div style={{ flex: 1 }} />
        {globalTotal > 0 && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>
            <b style={{ color: 'var(--pass)' }}>{globalPass}</b>/{globalTotal} passing ({globalPct}%)
          </span>
        )}
        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          style={{ background: 'var(--bg3)', border: 'none', color: 'var(--text)', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Sidebar ── */}
        <nav style={{
          width: 'var(--sidebar-w)', background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          overflowY: 'auto', flexShrink: 0, paddingBottom: '2rem'
        }}>
          {NAV.map(({ group, items }) => (
            <div key={group}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '0.7rem 1rem 0.2rem' }}>
                {group}
              </div>
              {items.map(({ label, id }) => {
                const s    = stats[id]
                const pct  = s ? Math.round(s.pass / s.total * 100) : null
                const active = currentId === id
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.3rem 1rem', fontSize: '0.8rem', textDecoration: 'none',
                      color: active ? 'var(--accent)' : 'var(--text-2)',
                      background: active ? 'var(--bg3)' : 'transparent',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {label}
                    {pct !== null && (
                      <span style={{
                        fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px',
                        borderRadius: 999, background: 'var(--bg)',
                        color: pct === 100 ? 'var(--pass)' : pct >= 75 ? 'var(--warn)' : 'var(--fail)'
                      }}>
                        {pct}%
                      </span>
                    )}
                  </a>
                )
              })}
            </div>
          ))}
        </nav>

        {/* ── Content ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem 4rem' }}>
          {!cc && (
            <div style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Loading windrunner…</div>
          )}
          {cc && PageComponent && <PageComponent cc={cc} />}
          {cc && !PageComponent && (
            <div style={{ color: 'var(--text-3)' }}>Page not found: {currentId}</div>
          )}
        </main>
      </div>
    </div>
  )
}
