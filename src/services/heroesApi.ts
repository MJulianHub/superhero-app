import type { Hero, HeroId, HeroSummary } from '../types/hero'

type SuperheroApiSuccess<T> = {
  response: 'success'
} & T

type SuperheroApiError = {
  response: 'error'
  error: string
}

type SuperheroApiSearchResponse =
  | SuperheroApiSuccess<{ 'results-for': string; results: SuperheroApiHero[] }>
  | SuperheroApiError

type SuperheroApiHero = {
  id: string
  name: string
  image?: { url?: string }
  powerstats?: Record<string, string>
  biography?: Record<string, string>
  appearance?: Record<string, string>
  work?: Record<string, string>
  connections?: Record<string, string>
}

type AkababHero = {
  id: number
  name: string
  images?: { sm?: string; md?: string; lg?: string }
  powerstats?: Record<string, string>
  biography?: Record<string, string>
  appearance?: Record<string, string>
  work?: Record<string, string>
  connections?: Record<string, string>
}

function isAkababHero(hero: SuperheroApiHero | AkababHero): hero is AkababHero {
  return typeof (hero as AkababHero).id === 'number'
}

function getEnv(name: 'VITE_API_BASE_URL' | 'VITE_SUPERHERO_API_TOKEN') {
  return (import.meta.env[name] as string | undefined) || undefined
}

function joinUrl(baseUrl: string, path: string) {
  const b = baseUrl.replace(/\/+$/, '')
  const p = path.replace(/^\/+/, '')
  return `${b}/${p}`
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} (${url})`)
  }
  return (await res.json()) as T
}

function mapToSummary(hero: SuperheroApiHero | AkababHero): HeroSummary {
  if (isAkababHero(hero)) {
    const url = hero.images?.sm || hero.images?.md || hero.images?.lg || ''
    return {
      id: String(hero.id),
      name: hero.name,
      image: { url },
    }
  }

  const url = hero.image?.url || ''
  return {
    id: hero.id,
    name: hero.name,
    image: { url },
  }
}

function mapToHero(hero: SuperheroApiHero | AkababHero): Hero {
  const summary = mapToSummary(hero)
  return {
    ...summary,
    powerstats: hero.powerstats,
    biography: hero.biography,
    appearance: hero.appearance,
    work: hero.work,
    connections: hero.connections,
  }
}

function getConfig() {
  let baseUrl = getEnv('VITE_API_BASE_URL')
  const token = getEnv('VITE_SUPERHERO_API_TOKEN')

  if (!baseUrl) {
    throw new Error(
      'Falta VITE_API_BASE_URL. Configúrala en tu .env (ver .env.example).',
    )
  }

  /**
   * SuperheroAPI no soporta CORS desde el browser.
   * En DEV forzamos a usar el proxy de Vite (`/api`) si detectamos que
   * se configuró la URL real `https://superheroapi.com/api`.
   */
  if (
    import.meta.env.DEV &&
    token &&
    /^https?:\/\/superheroapi\.com\/api\/?$/i.test(baseUrl)
  ) {
    baseUrl = '/api'
  }

  return { baseUrl, token }
}

/**
 * Devuelve un "listado" inicial.
 *
 * - Para akabab (`/all.json`) devuelve la lista completa.
 * - Para superheroapi.com NO hay un endpoint de "all", así que devolvemos el
 *   resultado de una búsqueda corta (por defecto, "a") para tener data de prueba.
 */
export async function fetchHeroes(
  opts?: { seedQuery?: string },
): Promise<HeroSummary[]> {
  const { baseUrl, token } = getConfig()

  if (token) {
    const q = opts?.seedQuery?.trim() || 'a'
    const url = joinUrl(baseUrl, `/${token}/search/${encodeURIComponent(q)}`)
    const data = await fetchJson<SuperheroApiSearchResponse>(url)

    if (data.response === 'error') {
      throw new Error(data.error)
    }

    return (data.results || []).map(mapToSummary)
  }

  const url = joinUrl(baseUrl, '/all.json')
  const data = await fetchJson<AkababHero[]>(url)
  return data.map(mapToSummary)
}

export async function fetchHeroById(id: HeroId | number): Promise<Hero> {
  const { baseUrl, token } = getConfig()
  const heroId = String(id)

  if (token) {
    const url = joinUrl(baseUrl, `/${token}/${encodeURIComponent(heroId)}`)
    const data = await fetchJson<SuperheroApiHero | SuperheroApiError>(url)
    if ('response' in data && data.response === 'error') {
      throw new Error(data.error)
    }
    return mapToHero(data as SuperheroApiHero)
  }

  const url = joinUrl(baseUrl, `/id/${encodeURIComponent(heroId)}.json`)
  const data = await fetchJson<AkababHero>(url)
  return mapToHero(data)
}

export async function searchHeroes(query: string): Promise<HeroSummary[]> {
  const { baseUrl, token } = getConfig()

  if (!token) {
    throw new Error(
      'searchHeroes() solo aplica para superheroapi.com (requiere VITE_SUPERHERO_API_TOKEN).',
    )
  }

  const q = query.trim()
  if (!q) return []

  const url = joinUrl(baseUrl, `/${token}/search/${encodeURIComponent(q)}`)
  const data = await fetchJson<SuperheroApiSearchResponse>(url)

  if (data.response === 'error') {
    // "character with given name not found"
    return []
  }

  return (data.results || []).map(mapToSummary)
}
