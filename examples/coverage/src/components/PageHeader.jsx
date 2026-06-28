export default function PageHeader({ title, desc }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em' }}>{title}</h1>
      {desc && <p style={{ color: 'var(--text-2)', marginTop: '0.4rem', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>}
    </div>
  )
}
