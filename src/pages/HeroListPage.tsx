import { useEffect, useMemo, useState } from 'react'
import { Alert, Card, Col, Input, Row, Spin } from 'antd'
import { Link } from 'react-router-dom'
import { fetchHeroes, searchHeroes } from '../services/heroesApi'
import type { HeroSummary } from '../types/hero'

// Cuántos héroes queremos mostrar por página (lo podemos ajustar más adelante).
const PAGE_SIZE = 20

export function HeroListPage() {
  // Esta lista es lo que vamos a mostrar en pantalla.
  const [heroes, setHeroes] = useState<HeroSummary[]>([])
  // Guardamos una copia de la lista "inicial" para poder volver a ella cuando limpiamos la búsqueda.
  const [initialHeroes, setInitialHeroes] = useState<HeroSummary[]>([])
  // Esto nos sirve para mostrar un “Cargando…” mientras llega la respuesta.
  const [isLoading, setIsLoading] = useState(false)
  // Si algo falla (token inválido, red, etc.), guardamos el mensaje aquí.
  const [error, setError] = useState<string | null>(null)
  // Lo que el usuario escribe en el input de búsqueda.
  const [searchQuery, setSearchQuery] = useState('')
  // Nota sobre el comportamiento:
  // - Si sales de esta pantalla (por ejemplo, entras al detalle) y luego vuelves al listado,
  //   el input vuelve vacío porque este componente se vuelve a montar y su estado se reinicia.
  // - Si solo quieres limpiar la búsqueda manualmente, puedes usar la “x” del input (allowClear).
  // La página actual que está viendo el usuario (empezamos en 1).
  const [currentPage, setCurrentPage] = useState(1)

  // Si tenemos token, podemos buscar llamando a la API (`/search/{name}`).
  // Si no, vamos a filtrar en el navegador sobre la lista completa.
  const canSearchInApi = Boolean(import.meta.env.VITE_SUPERHERO_API_TOKEN)

  const normalizedQuery = searchQuery.trim().toLowerCase()

  // Esta es la lista final que vamos a paginar:
  // - si buscamos en API, `heroes` ya contiene los resultados
  // - si buscamos en navegador, filtramos por nombre
  const filteredHeroes = useMemo(() => {
    if (!normalizedQuery) return heroes
    if (canSearchInApi) return heroes
    return heroes.filter((h) => h.name.toLowerCase().includes(normalizedQuery))
  }, [heroes, normalizedQuery, canSearchInApi])

  // Cuando cambia la búsqueda, volvemos a la página 1 para que el usuario vea resultados.
  useEffect(() => {
    setCurrentPage(1)
  }, [normalizedQuery])

  // Esto calcula qué parte de la lista se muestra “en esta página”.
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const paginatedHeroes = filteredHeroes.slice(startIndex, endIndex)

  // Cuántas páginas existen en total según el tamaño de la lista.
  const totalPages = Math.max(1, Math.ceil(filteredHeroes.length / PAGE_SIZE))
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
        // Guardamos la lista inicial para poder volver a ella si el usuario limpia la búsqueda.
        setInitialHeroes(data)
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

  useEffect(() => {
    // Si no tenemos token, no hacemos búsqueda por API (filtramos en navegador).
    if (!canSearchInApi) return

    // Si el usuario limpia el input, volvemos a la lista inicial (sin pedir nada).
    if (!normalizedQuery) {
      setHeroes(initialHeroes)
      return
    }

    let cancelled = false

    // Pequeño delay para no llamar a la API por cada letra.
    const timer = window.setTimeout(() => {
      async function search() {
        setIsLoading(true)
        setError(null)

        try {
          const data = await searchHeroes(normalizedQuery)
          if (cancelled) return
          setHeroes(data)
        } catch (e) {
          if (cancelled) return
          const message = e instanceof Error ? e.message : String(e)
          setError(message)
          setHeroes([])
        } finally {
          if (!cancelled) setIsLoading(false)
        }
      }

      void search()
    }, 400)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [canSearchInApi, normalizedQuery, initialHeroes])

  return (
    <>
      {/* Input de búsqueda: aquí el usuario escribe el nombre del héroe. */}
      <div style={{ marginTop: 16 }}>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar héroe por nombre…"
          allowClear
        />
      </div>

      {/* Mientras cargamos, mostramos un spinner para que el usuario sepa que la app está trabajando. */}
      {isLoading ? (
        <div style={{ marginTop: 16 }}>
          {/* En Ant Design, `tip` solo funciona si el Spin envuelve contenido.
              Para evitar warnings en consola, mostramos el spinner sin `tip`. */}
          <Spin size="large" />
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
          {/* Si después de filtrar/buscar no hay resultados, lo avisamos claramente. */}
          {filteredHeroes.length === 0 ? (
            <div style={{ marginTop: 16 }}>
              <Alert
                type="info"
                showIcon
                message="No se encontraron héroes"
                description="Prueba con otro nombre."
              />
            </div>
          ) : null}

          {/* Esta es la misma lista de héroes, pero presentada como tarjetas (más agradable a la vista). */}
          {/* Le damos un margen arriba para que la primera fila no quede “pegada” al contenido superior. */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {paginatedHeroes.map((h) => (
              <Col key={h.id} xs={24} sm={12} md={8} lg={6}>
                {/* Hacemos la tarjeta clicable: al hacer clic vamos a /hero/:id */}
                <Link
                  to={`/hero/${h.id}`}
                  style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                >
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
                </Link>
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

