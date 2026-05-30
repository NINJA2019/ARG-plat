import { useState } from 'react'
import { ImageUploader } from './ImageUploader'
import type { Card, CardStatus } from '../types'

interface Props {
  scenarioId: string
  card?: Card
  onSubmit: (data: Partial<Card>) => void
  onCancel: () => void
}

const STATUS_OPTIONS: { value: CardStatus; label: string }[] = [
  { value: 'unknown', label: '未調査' },
  { value: 'hypothesis', label: '仮説' },
  { value: 'confirmed', label: '確定' },
]

export function CardForm({ scenarioId, card, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(card?.title ?? '')
  const [note, setNote] = useState(card?.note ?? '')
  const [url, setUrl] = useState(card?.url ?? '')
  const [tag, setTag] = useState(card?.tag ?? '')
  const [status, setStatus] = useState<CardStatus>(card?.status ?? 'unknown')
  const [imageUrls, setImageUrls] = useState<string[]>(card?.image_urls ?? [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title: title.trim(), note, url, tag, status, image_urls: imageUrls })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4"
      >
        <h3 className="text-lg font-bold">{card ? 'カード編集' : '新規カード'}</h3>

        <div>
          <label className="block text-sm text-gray-400 mb-1">タイトル *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">メモ</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 resize-y"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">URL</label>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">タグ</label>
            <input
              value={tag}
              onChange={e => setTag(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">ステータス</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as CardStatus)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {card && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">画像</label>
            <ImageUploader
              scenarioId={scenarioId}
              cardId={card.id}
              imageUrls={imageUrls}
              onUploaded={setImageUrls}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
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
            {card ? '更新' : '作成'}
          </button>
        </div>
      </form>
    </div>
  )
}
