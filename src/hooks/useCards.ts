import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Card, CardStatus } from '../types'

export function useCards(scenarioId: string) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('cards')
      .select('*')
      .eq('scenario_id', scenarioId)
      .order('created_at', { ascending: true })
    if (data) setCards(data)
    setLoading(false)
  }, [scenarioId])

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    const channel = supabase
      .channel(`cards-${scenarioId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: `scenario_id=eq.${scenarioId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCard = payload.new as Card
            setCards(prev =>
              prev.some(c => c.id === newCard.id) ? prev : [...prev, newCard],
            )
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Card
            setCards(prev =>
              prev.map(c => (c.id === updated.id ? updated : c)),
            )
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string }
            setCards(prev => prev.filter(c => c.id !== deleted.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [scenarioId])

  const create = async (card: Partial<Card>) => {
    const { data } = await supabase
      .from('cards')
      .insert({
        scenario_id: scenarioId,
        title: card.title ?? '',
        note: card.note ?? '',
        url: card.url ?? '',
        tag: card.tag ?? '',
        status: card.status ?? 'unknown',
        confirmed_by: null,
        image_urls: [],
        pos_x: card.pos_x ?? Math.random() * 600 + 50,
        pos_y: card.pos_y ?? Math.random() * 400 + 50,
      })
      .select()
      .single()
    return data
  }

  const update = async (id: string, updates: Partial<Card>) => {
    await supabase.from('cards').update(updates).eq('id', id)
  }

  const updateStatus = async (id: string, status: CardStatus, confirmedBy?: string) => {
    const updates: Partial<Card> = { status }
    if (status === 'confirmed' && confirmedBy) {
      updates.confirmed_by = confirmedBy
    } else if (status !== 'confirmed') {
      updates.confirmed_by = null
    }
    await supabase.from('cards').update(updates).eq('id', id)
  }

  const updatePosition = async (id: string, pos_x: number, pos_y: number) => {
    await supabase.from('cards').update({ pos_x, pos_y }).eq('id', id)
  }

  const remove = async (id: string) => {
    await supabase.from('cards').delete().eq('id', id)
  }

  return { cards, loading, create, update, updateStatus, updatePosition, remove, refetch: fetch }
}
