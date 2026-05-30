import { useState } from 'react'
import { useComments } from '../hooks/useComments'

interface Props {
  cardId: string
  cardTitle: string
  participantName: string
  onClose: () => void
}

export function CommentDrawer({ cardId, cardTitle, participantName, onClose }: Props) {
  const { comments, loading, create } = useComments(cardId)
  const [body, setBody] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    await create(body.trim(), participantName)
    setBody('')
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gray-900 border-l border-gray-700 flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="font-bold text-lg truncate">{cardTitle} - コメント</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && <p className="text-gray-500">読み込み中...</p>}
          {!loading && comments.length === 0 && (
            <p className="text-gray-500 text-sm">コメントはまだありません</p>
          )}
          {comments.map(c => (
            <div key={c.id} className="bg-gray-800 rounded p-3">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-sm text-blue-400">{c.author}</span>
                <span className="text-xs text-gray-500">
                  {new Date(c.created_at).toLocaleString('ja-JP')}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{c.body}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 flex gap-2">
          <input
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="コメントを入力..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!body.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded text-sm font-medium transition-colors"
          >
            送信
          </button>
        </form>
      </div>
    </div>
  )
}
