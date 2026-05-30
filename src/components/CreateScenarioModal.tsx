import { useState } from 'react'

interface Props {
  onSubmit: (name: string, description: string) => void
  onCancel: () => void
}

export function CreateScenarioModal({ onSubmit, onCancel }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), description.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md space-y-4"
      >
        <h3 className="text-lg font-bold">新規シナリオ</h3>
        <div>
          <label className="block text-sm text-gray-400 mb-1">シナリオ名 *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">説明</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 resize-y"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
          >
            作成
          </button>
        </div>
      </form>
    </div>
  )
}
