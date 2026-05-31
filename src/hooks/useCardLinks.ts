import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { showToast } from '../lib/toast'
import type { CardLink } from '../types'

export function useCardLinks(scenarioId: string) {
  const [links, setLinks] = useState<CardLink[]>([])

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('card_links')
      .select('*')
      .eq('scenario_id', scenarioId)
    if (error) {
      showToast('関係線の取得に失敗しました')
      return
    }
    setLinks(data)
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
    const { error } = await supabase
      .from('card_links')
      .insert({ scenario_id: scenarioId, card_a: cardA, card_b: cardB })
    if (error) {
      if (error.code === '23505') return // unique constraint — already linked
      showToast('関係線の作成に失敗しました')
    }
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('card_links').delete().eq('id', id)
    if (error) showToast('関係線の削除に失敗しました')
  }

  return { links, create, remove, refetch: fetch }
}
