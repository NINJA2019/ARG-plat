import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
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

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    const channel = supabase
      .channel(`card_links-${scenarioId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'card_links',
          filter: `scenario_id=eq.${scenarioId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newLink = payload.new as CardLink
            setLinks(prev =>
              prev.some(l => l.id === newLink.id) ? prev : [...prev, newLink],
            )
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as CardLink
            setLinks(prev =>
              prev.map(l => (l.id === updated.id ? updated : l)),
            )
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string }
            setLinks(prev => prev.filter(l => l.id !== deleted.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [scenarioId])

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
