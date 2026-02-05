export type HeroId = string

export type HeroImage = {
  url: string
}

export type HeroSummary = {
  id: HeroId
  name: string
  image: HeroImage
}

export type HeroPowerstats = {
  intelligence?: string
  strength?: string
  speed?: string
  durability?: string
  power?: string
  combat?: string
} & Record<string, string | undefined>

export type HeroBiography = Record<string, string | string[] | undefined>
export type HeroAppearance = Record<string, string | string[] | undefined>
export type HeroWork = Record<string, string | undefined>
export type HeroConnections = Record<string, string | undefined>

export type Hero = HeroSummary & {
  powerstats?: HeroPowerstats
  biography?: HeroBiography
  appearance?: HeroAppearance
  work?: HeroWork
  connections?: HeroConnections
}

