import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { fetchHeroes } from './services/heroesApi'
import type { HeroSummary } from './types/hero'

// Cuántos héroes queremos mostrar por página (lo podemos ajustar más adelante).
const PAGE_SIZE = 20

function App() {
  const [count, setCount] = useState(0)
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
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      {isLoading ? <p>Cargando…</p> : null}
      {error ? <p style={{ color: 'crimson' }}>Error al cargar: {error}</p> : null}
      {!isLoading && !error ? (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {paginatedHeroes.map((h) => (
              <li
                key={h.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: '8px 0',
                }}
              >
                {h.image.url ? (
                  <img
                    src={h.image.url}
                    alt={h.name}
                    width={40}
                    height={40}
                    style={{ borderRadius: 8, objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : null}
                <span>{h.name}</span>
              </li>
            ))}
          </ul>

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
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
