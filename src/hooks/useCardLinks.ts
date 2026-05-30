import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useRealtime } from './useRealtime'
import type { CardLink } from '../types'

export function useCardLinks(scenarioId: string) {
  const [links, setLinks] = useState<CardLink[]>([])

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('card_links')
      .select('*')
      .eq('scenario_id', scenarioId)
    if (data) setLinks(data)
  }, [scenarioId])

  useRealtime('card_links', { column: 'scenario_id', value: scenarioId }, fetch)

  useState(() => { fetch() })

  const create = async (cardA: string, cardB: string) => {
    const exists = links.some(
      l =>
        (l.card_a === cardA && l.card_b === cardB) ||
        (l.card_a === cardB && l.card_b === cardA),
    )
    if (exists) return
    await supabase
      .from('card_links')
      .insert({ scenario_id: scenarioId, card_a: cardA, card_b: cardB })
  }

  const remove = async (id: string) => {
    await supabase.from('card_links').delete().eq('id', id)
  }

  return { links, create, remove, refetch: fetch }
}
