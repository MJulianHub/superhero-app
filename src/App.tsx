import { useEffect, useState } from 'react'
import { Alert, Card, Col, Row, Spin } from 'antd'
import './App.css'
import { fetchHeroes } from './services/heroesApi'
import type { HeroSummary } from './types/hero'

// Cuántos héroes queremos mostrar por página (lo podemos ajustar más adelante).
const PAGE_SIZE = 20

function App() {
  // Esta lista es lo que vamos a mostrar en pantalla.
  const [heroes, setHeroes] = useState<HeroSummary[]>([])
  // Esto nos sirve para mostrar un “Cargando…” mientras llega la respuesta.
  const [isLoading, setIsLoading] = useState(false)
  // Si algo falla (token inválido, red, etc.), guardamos el mensaje aquí.
  const [error, setError] = useState<string | null>(null)
  // La página actual que está viendo el usuario (empezamos en 1).
  const [currentPage, setCurrentPage] = useState(1)

  // Esto calcula qué parte de la lista se muestra “en esta página”.
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const paginatedHeroes = heroes.slice(startIndex, endIndex)
  // Cuántas páginas existen en total según el tamaño de la lista.
  const totalPages = Math.max(1, Math.ceil(heroes.length / PAGE_SIZE))
  // Estos booleanos se usan para deshabilitar botones cuando no hay más páginas.
  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= totalPages

  useEffect(() => {
    // Si el usuario se va de esta pantalla antes de que termine el fetch,
    // evitamos intentar actualizar el estado (para no ver warnings).
    let cancelled = false

    // Esta función hace la petición y actualiza los 3 estados: loading, data y error.
    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        // Pedimos los héroes al servicio (la lógica de API vive en heroesApi.ts).
        const data = await fetchHeroes()
        if (cancelled) return
        // Guardamos la lista para renderizarla.
        setHeroes(data)
        // Cada vez que llega una lista nueva, volvemos a la primera página.
        setCurrentPage(1)
      } catch (e) {
        if (cancelled) return
        // Si falla, dejamos la lista vacía y mostramos un mensaje amigable.
        const message = e instanceof Error ? e.message : String(e)
        setError(message)
        setHeroes([])
      } finally {
        // Pase lo que pase (éxito o error), dejamos de mostrar “Cargando…”.
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    // Ejecutamos la carga una sola vez al montar el componente.
    void load()

    // Cuando el componente se desmonta, marcamos cancelled = true.
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      {/* Mientras cargamos, mostramos un spinner para que el usuario sepa que la app está trabajando. */}
      {isLoading ? (
        <div style={{ marginTop: 16 }}>
          <Spin size="large" tip="Cargando héroes…" />
        </div>
      ) : null}

      {/* Si hubo un error, lo mostramos en un componente de alerta (más visible y consistente con Ant Design). */}
      {error ? (
        <div style={{ marginTop: 16 }}>
          <Alert
            type="error"
            showIcon
            message="Error al cargar"
            description={error}
          />
        </div>
      ) : null}
      {!isLoading && !error ? (
        <>
          {/* Esta es la misma lista de héroes, pero presentada como tarjetas (más agradable a la vista). */}
          {/* Le damos un margen arriba para que la primera fila no quede “cortada” o pegada al contenido superior. */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {paginatedHeroes.map((h) => (
              <Col key={h.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    h.image.url ? (
                      <img
                        src={h.image.url}
                        alt={h.name}
                        style={{ width: '100%', height: 180, objectFit: 'cover' }}
                        loading="lazy"
                      />
                    ) : undefined
                  }
                >
                  {/* Mostramos el nombre del héroe en la tarjeta */}
                  <Card.Meta title={h.name} />
                </Card>
              </Col>
            ))}
          </Row>

          {/* Controles simples de paginación (Anterior / Siguiente) */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={isFirstPage}
            >
              Anterior
            </button>

            {/* Texto opcional para que el usuario sepa dónde está parado */}
            <span>
              Página {currentPage} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={isLastPage}
            >
              Siguiente
            </button>
          </div>
        </>
      ) : null}
    </>
  )
}

export default App
