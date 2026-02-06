import { Descriptions, Divider, Grid, Typography } from 'antd'

export type HeroDescriptionsSectionField = {
  label: string
  key: string
}

export function HeroDescriptionsSection(props: {
  title: string
  // Mapa: "Etiqueta bonita" -> "clave en el objeto"
  fields: HeroDescriptionsSectionField[]
  data?: Record<string, unknown>
  columns?: number
}) {
  // Esto nos dice si estamos en una pantalla chica o grande (para adaptar el layout).
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.sm

  function formatValue(value: unknown) {
    if (Array.isArray(value)) return value.filter(Boolean).join(', ')
    if (value === null || value === undefined) return ''
    return String(value)
  }

  function getField(obj: Record<string, unknown> | undefined, key: string) {
    // Tomamos un campo (si existe) y lo convertimos a texto para mostrarlo.
    return formatValue(obj ? obj[key] : undefined)
  }

  // Armamos solo los items que realmente tienen valor (para no mostrar campos vacíos).
  const items = props.fields
    .map((f) => ({ label: f.label, value: getField(props.data, f.key) }))
    .filter((x) => x.value)

  if (items.length === 0) return null

  return (
    <section style={{ marginTop: 16 }}>
      <Divider style={{ margin: '16px 0' }} />
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {props.title}
      </Typography.Title>

      {/* Usamos Descriptions para que la info quede ordenada como una “ficha”.
          En móvil, se lee mejor en una sola columna. */}
      <Descriptions
        bordered
        size="small"
        column={props.columns ?? (isMobile ? 1 : 2)}
        items={items.map((it) => ({
          label: it.label,
          children: it.value,
        }))}
      />
    </section>
  )
}

