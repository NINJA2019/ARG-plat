import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { showToast } from '../lib/toast'
import type { Card, CardStatus } from '../types'

export function useCards(scenarioId: string) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('scenario_id', scenarioId)
      .order('created_at', { ascending: true })
    if (error) {
      showToast('カードの取得に失敗しました')
      return
    }
    setCards(data)
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
    const { data, error } = await supabase
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
    if (error) {
      showToast('カードの作成に失敗しました')
      return null
    }
    return data
  }

  const update = async (id: string, updates: Partial<Card>) => {
    const { error } = await supabase.from('cards').update(updates).eq('id', id)
    if (error) showToast('カードの更新に失敗しました')
  }

  const updateStatus = async (id: string, status: CardStatus, confirmedBy?: string) => {
    const updates: Partial<Card> = { status }
    if (status === 'confirmed' && confirmedBy) {
      updates.confirmed_by = confirmedBy
    } else if (status !== 'confirmed') {
      updates.confirmed_by = null
    }
    const { error } = await supabase.from('cards').update(updates).eq('id', id)
    if (error) showToast('ステータスの変更に失敗しました')
  }

  const updatePosition = async (id: string, pos_x: number, pos_y: number) => {
    const { error } = await supabase.from('cards').update({ pos_x, pos_y }).eq('id', id)
    if (error) showToast('位置の更新に失敗しました')
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('cards').delete().eq('id', id)
    if (error) showToast('カードの削除に失敗しました')
  }

  return { cards, loading, create, update, updateStatus, updatePosition, remove, refetch: fetch }
}
