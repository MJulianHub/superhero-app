import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Spin } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchHeroById } from '../services/heroesApi'
import type { Hero } from '../types/hero'

export function HeroDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  // Guardamos aquí el héroe que nos devuelve la API.
  const [hero, setHero] = useState<Hero | null>(null)
  // Esto nos sirve para mostrar un “Cargando…” mientras llega la respuesta.
  const [isLoading, setIsLoading] = useState(false)
  // Si algo falla (id inválido, token inválido, red, etc.), guardamos el mensaje aquí.
  const [error, setError] = useState<string | null>(null)

  // Nos quedamos con un id “limpio” para la llamada.
  const heroId = useMemo(() => (id ? String(id) : null), [id])

  useEffect(() => {
    // Si entramos sin id en la URL, mostramos el error y no hacemos fetch.
    if (!heroId) {
      setHero(null)
      setError('Falta el id del héroe en la URL.')
      setIsLoading(false)
      return
    }

    // Si el usuario se va de esta pantalla antes de que termine el fetch,
    // evitamos intentar actualizar el estado.
    let cancelled = false

    async function load(idToFetch: string) {
      setIsLoading(true)
      setError(null)

      try {
        // Pedimos el detalle del héroe usando el id de la URL.
        const data = await fetchHeroById(idToFetch)
        if (cancelled) return
        setHero(data)
      } catch (e) {
        if (cancelled) return
        const message = e instanceof Error ? e.message : String(e)
        setError(message)
        setHero(null)
      } finally {
        // Pase lo que pase, dejamos de mostrar “Cargando…”.
        if (!cancelled) setIsLoading(false)
      }
    }

    void load(heroId)

    return () => {
      cancelled = true
    }
  }, [heroId])

  function formatValue(value: unknown) {
    if (Array.isArray(value)) return value.filter(Boolean).join(', ')
    if (value === null || value === undefined) return ''
    return String(value)
  }

  function Section(props: { title: string; data?: Record<string, unknown> }) {
    const entries = Object.entries(props.data || {}).filter(
      ([, v]) => formatValue(v),
    )
    if (entries.length === 0) return null

    return (
      <section style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 8 }}>{props.title}</h3>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {entries.map(([k, v]) => (
            <li key={k}>
              <strong>{k}:</strong> {formatValue(v)}
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <div style={{ marginTop: 16 }}>
      {/* Botón simple para volver al listado */}
      <Button type="link" onClick={() => navigate('/')}>
        Volver al listado
      </Button>

      <h2>Detalle del héroe</h2>

      {isLoading ? <Spin size="large" tip="Cargando detalle…" /> : null}

      {error ? (
        <Alert
          type="error"
          showIcon
          message="Error al cargar el detalle"
          description={error}
          style={{ marginTop: 16 }}
        />
      ) : null}

      {!isLoading && !error && hero ? (
        <>
          {/* Mostramos lo básico: nombre + imagen */}
          <Card style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {hero.image.url ? (
                <img
                  src={hero.image.url}
                  alt={hero.name}
                  width={220}
                  height={220}
                  style={{ borderRadius: 12, objectFit: 'cover' }}
                />
              ) : null}

              <div style={{ textAlign: 'left' }}>
                <h3 style={{ marginTop: 0 }}>{hero.name}</h3>
                <p style={{ margin: 0, opacity: 0.75 }}>
                  Id: <strong>{hero.id}</strong>
                </p>
              </div>
            </div>

            {/* Secciones opcionales (depende de la API) */}
            <Section title="Powerstats" data={hero.powerstats} />
            <Section title="Biography" data={hero.biography} />
            <Section title="Appearance" data={hero.appearance} />
            <Section title="Work" data={hero.work} />
            <Section title="Connections" data={hero.connections} />
          </Card>
        </>
      ) : null}
    </div>
  )
}

