export type ScenarioStatus = 'active' | 'archived'
export type CardStatus = 'unknown' | 'hypothesis' | 'confirmed'

export interface Scenario {
  id: string
  name: string
  description: string
  status: ScenarioStatus
  created_at: string
}

export interface Card {
  id: string
  scenario_id: string
  title: string
  note: string
  url: string
  tag: string
  status: CardStatus
  confirmed_by: string | null
  image_urls: string[]
  pos_x: number
  pos_y: number
  created_at: string
  updated_at: string
}

export interface CardLink {
  id: string
  scenario_id: string
  card_a: string
  card_b: string
  created_at: string
}

export interface Comment {
  id: string
  card_id: string
  author: string
  body: string
  created_at: string
}
