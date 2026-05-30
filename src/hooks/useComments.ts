import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useRealtime } from './useRealtime'
import type { Comment } from '../types'

export function useComments(cardId: string | null) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!cardId) { setComments([]); return }
    setLoading(true)
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: true })
    if (data) setComments(data)
    setLoading(false)
  }, [cardId])

  useRealtime('comments', cardId ? { column: 'card_id', value: cardId } : null, fetch)

  useState(() => { fetch() })

  const create = async (body: string, author: string) => {
    if (!cardId) return
    await supabase
      .from('comments')
      .insert({ card_id: cardId, author, body })
  }

  return { comments, loading, create, refetch: fetch }
}
