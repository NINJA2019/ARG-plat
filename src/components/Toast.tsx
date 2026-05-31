import { useState, useEffect, useCallback } from 'react'
import { onToast } from '../lib/toast'

export function Toast() {
  const [message, setMessage] = useState<string | null>(null)

  const handleToast = useCallback((msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 4000)
  }, [])

  useEffect(() => onToast(handleToast), [handleToast])

  if (!message) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-red-900 border border-red-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm max-w-md">
      {message}
    </div>
  )
}
