// Quick-reference table: shows class → compiled CSS output with pass/fail dot
export default function QR({ classes, cc }) {
  if (!cc) return null
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', marginBottom: '1.5rem' }}>
      <thead>
        <tr>
          {['Class', 'CSS Output'].map(h => (
            <th key={h} style={{
              textAlign: 'left', padding: '0.4rem 0.75rem',
              background: 'var(--bg2)', color: 'var(--text-2)',
              borderBottom: '1px solid var(--border)',
              fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.04em', textTransform: 'uppercase'
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {classes.map(cls => {
          const raw = cc(cls) || ''
          const ok = raw.length > 0
          // extract just the declarations from the rule
          const decl = ok ? raw.slice(raw.indexOf('{') + 1).replace(/}.*$/, '').trim() : null
          return (
            <tr key={cls} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '0.35rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'ui-monospace, monospace' }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: ok ? 'var(--pass)' : 'var(--fail)'
                  }} />
                  {cls}
                </div>
              </td>
              <td style={{ padding: '0.35rem 0.75rem', fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem', color: 'var(--text-2)', wordBreak: 'break-all' }}>
                {ok ? decl : <span style={{ color: 'var(--fail)' }}>— not compiled</span>}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
