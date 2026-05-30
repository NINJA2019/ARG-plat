import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useParticipant } from '../hooks/useParticipant'

export function JoinPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()
  const { joined, join } = useParticipant(scenarioId!)
  const [name, setName] = useState('')

  if (joined) {
    navigate(`/${scenarioId}`, { replace: true })
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    join(name.trim())
    navigate(`/${scenarioId}`, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 border border-gray-700 rounded-lg p-8 w-full max-w-sm space-y-4"
      >
        <h2 className="text-xl font-bold text-center">捜査に参加</h2>
        <p className="text-sm text-gray-400 text-center">
          表示名を入力してください
        </p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="あなたの名前"
          className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          autoFocus
          required
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors"
        >
          参加する
        </button>
      </form>
    </div>
  )
}
