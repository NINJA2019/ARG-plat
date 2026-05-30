import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Scenario } from '../types'

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('scenarios')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setScenarios(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (name: string, description: string) => {
    const { data } = await supabase
      .from('scenarios')
      .insert({ name, description, status: 'active' })
      .select()
      .single()
    if (data) setScenarios(prev => [data, ...prev])
    return data
  }

  const archive = async (id: string) => {
    await supabase.from('scenarios').update({ status: 'archived' }).eq('id', id)
    setScenarios(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'archived' as const } : s)),
    )
  }

  const restore = async (id: string) => {
    await supabase.from('scenarios').update({ status: 'active' }).eq('id', id)
    setScenarios(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'active' as const } : s)),
    )
  }

  return { scenarios, loading, create, archive, restore, refetch: fetch }
}
