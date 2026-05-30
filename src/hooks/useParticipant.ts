import { useState, useEffect } from 'react'

const STORAGE_KEY = 'arg-board-participant'

export function useParticipant(scenarioId: string) {
  const key = `${STORAGE_KEY}-${scenarioId}`
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored) setName(stored)
  }, [key])

  const join = (participantName: string) => {
    localStorage.setItem(key, participantName)
    setName(participantName)
  }

  return { name, joined: !!name, join }
}
