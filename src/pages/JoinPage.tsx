import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SESSION_KEY = 'arg-session-token'

export function JoinPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    setError('')

    const sessionToken = crypto.randomUUID()

    const { error: dbError } = await supabase
      .from('participants')
      .insert({
        scenario_id: scenarioId,
        name: name.trim(),
        session_token: sessionToken,
      })

    if (dbError) {
      setError('参加に失敗しました。もう一度お試しください。')
      setSubmitting(false)
      return
    }

    sessionStorage.setItem(SESSION_KEY, sessionToken)
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
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded font-medium transition-colors"
        >
          {submitting ? '参加中...' : '参加する'}
        </button>
      </form>
    </div>
  )
}
