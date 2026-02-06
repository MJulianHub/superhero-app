import { Divider, Progress, Typography } from 'antd'

export function HeroPowerstatsSection(props: { data?: Record<string, unknown> }) {
  function formatValue(value: unknown) {
    if (Array.isArray(value)) return value.filter(Boolean).join(', ')
    if (value === null || value === undefined) return ''
    return String(value)
  }

  // Convertimos la stat a un número (0 a 100). Si no se puede convertir, la ocultamos.
  function toPercent(value: unknown): number | null {
    const raw = formatValue(value).trim()
    if (!raw) return null
    if (raw.toLowerCase() === 'null' || raw.toLowerCase() === 'unknown') return null
    const n = Number(raw)
    if (!Number.isFinite(n)) return null
    const clamped = Math.max(0, Math.min(100, n))
    return clamped
  }

  const stats = [
    { label: 'Intelligence', key: 'intelligence' },
    { label: 'Strength', key: 'strength' },
    { label: 'Speed', key: 'speed' },
    { label: 'Durability', key: 'durability' },
    { label: 'Power', key: 'power' },
    { label: 'Combat', key: 'combat' },
  ]
    .map((s) => ({
      label: s.label,
      percent: toPercent(props.data ? props.data[s.key] : undefined),
    }))
    .filter((s) => s.percent !== null)

  if (stats.length === 0) return null

  return (
    <section style={{ marginTop: 16 }}>
      <Divider style={{ margin: '16px 0' }} />
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Powerstats
      </Typography.Title>

      {/* Mostramos cada stat como una barra de progreso (más visual que una lista de texto). */}
      <div style={{ display: 'grid', gap: 10 }}>
        {stats.map((s) => (
          <div key={s.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{s.label}</span>
              <span style={{ opacity: 0.7 }}>{s.percent}%</span>
            </div>
            <Progress percent={s.percent!} showInfo={false} />
          </div>
        ))}
      </div>
    </section>
  )
}

