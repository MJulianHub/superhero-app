import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Grid,
  Image,
  Row,
  Spin,
  Typography,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { HeroDescriptionsSection } from '../components/heroDetail/HeroDescriptionsSection'
import { HeroPowerstatsSection } from '../components/heroDetail/HeroPowerstatsSection'
import { fetchHeroById } from '../services/heroesApi'
import type { Hero } from '../types/hero'

export function HeroDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  // Esto nos dice si estamos en una pantalla chica o grande (para adaptar el layout).
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.sm

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

  return (
    <div style={{ marginTop: 16 }}>
      {/* Botón para volver al listado con un estilo consistente (Ant Design) */}
      <Button type="default" onClick={() => navigate('/')} style={{ marginBottom: 8 }}>
        ← Volver al listado
      </Button>

      <h2>Detalle del héroe</h2>

      {isLoading ? (
        <>
          {/* En Ant Design, `tip` solo funciona si el Spin envuelve contenido.
              Para evitar warnings en consola, mostramos el spinner sin `tip`. */}
          <Spin size="large" />
        </>
      ) : null}

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
          {/* Usamos un Card para que todo el detalle quede dentro de una “tarjeta” limpia */}
          <Card style={{ marginTop: 16 }}>
            {/* En pantallas chicas queremos que la imagen quede arriba y el texto abajo.
                En pantallas grandes, se ven lado a lado. */}
            <Row gutter={[16, 16]} align="top">
              <Col xs={24} sm={10} md={8}>
                {/* Imagen principal del héroe (si existe) */}
                {hero.image.url ? (
                  <Image
                    src={hero.image.url}
                    alt={hero.name}
                    // En móvil ocupamos todo el ancho disponible. En desktop lo dejamos más “cuadrado”.
                    width={isMobile ? '100%' : 220}
                    height={isMobile ? 260 : 220}
                    style={{ borderRadius: 12, objectFit: 'cover' }}
                  />
                ) : null}
              </Col>

              <Col xs={24} sm={14} md={16}>
                <div style={{ textAlign: 'left' }}>
                  <Typography.Title level={3} style={{ marginTop: 0 }}>
                    {hero.name}
                  </Typography.Title>
                  <Typography.Paragraph style={{ margin: 0, opacity: 0.75 }}>
                    Id: <strong>{hero.id}</strong>
                  </Typography.Paragraph>
                </div>
              </Col>
            </Row>

            {/* En estas secciones mostramos información “ordenada” en formato de ficha.
                Solo se ve lo que realmente trae la API (si un dato no viene, no se muestra). */}
            <HeroPowerstatsSection data={hero.powerstats} />

            <HeroDescriptionsSection
              title="Biografía"
              data={hero.biography}
              fields={[
                { label: 'Nombre completo', key: 'full-name' },
                { label: 'Alter egos', key: 'alter-egos' },
                { label: 'Aliases', key: 'aliases' },
                { label: 'Lugar de nacimiento', key: 'place-of-birth' },
                { label: 'Primera aparición', key: 'first-appearance' },
                { label: 'Publisher', key: 'publisher' },
                { label: 'Alignment', key: 'alignment' },
              ]}
            />

            <HeroDescriptionsSection
              title="Apariencia"
              data={hero.appearance}
              fields={[
                { label: 'Género', key: 'gender' },
                { label: 'Raza', key: 'race' },
                { label: 'Altura', key: 'height' },
                { label: 'Peso', key: 'weight' },
                { label: 'Color de ojos', key: 'eye-color' },
                { label: 'Color de cabello', key: 'hair-color' },
              ]}
            />

            <HeroDescriptionsSection
              title="Trabajo"
              data={hero.work}
              fields={[
                { label: 'Ocupación', key: 'occupation' },
                { label: 'Base', key: 'base' },
              ]}
            />

            <HeroDescriptionsSection
              title="Conexiones"
              data={hero.connections}
              fields={[
                { label: 'Grupo afiliado', key: 'group-affiliation' },
                { label: 'Parientes', key: 'relatives' },
              ]}
            />
          </Card>
        </>
      ) : null}
    </div>
  )
}

