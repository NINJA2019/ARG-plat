import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
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

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    if (!cardId) return

    const channel = supabase
      .channel(`comments-${cardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `card_id=eq.${cardId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newComment = payload.new as Comment
            setComments(prev =>
              prev.some(c => c.id === newComment.id) ? prev : [...prev, newComment],
            )
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Comment
            setComments(prev =>
              prev.map(c => (c.id === updated.id ? updated : c)),
            )
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string }
            setComments(prev => prev.filter(c => c.id !== deleted.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [cardId])

  const create = async (body: string, author: string) => {
    if (!cardId) return
    await supabase
      .from('comments')
      .insert({ card_id: cardId, author, body })
  }

  return { comments, loading, create, refetch: fetch }
}
