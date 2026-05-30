import type { Card, CardStatus } from '../types'

interface Props {
  card: Card
  participantName: string
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: CardStatus) => void
  onOpenComments: () => void
  onClose: () => void
}

const statusConfig: Record<CardStatus, { label: string; color: string }> = {
  unknown: { label: '未調査', color: 'bg-gray-600' },
  hypothesis: { label: '仮説', color: 'bg-amber-600' },
  confirmed: { label: '確定', color: 'bg-green-600' },
}

export function CardDetail({
  card,
  onEdit,
  onDelete,
  onStatusChange,
  onOpenComments,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
        >
          &times;
        </button>

        <div className="flex items-start gap-3 mb-4">
          <h3 className="text-xl font-bold flex-1">{card.title}</h3>
          <span className={`${statusConfig[card.status].color} text-xs px-2 py-1 rounded font-medium`}>
            {statusConfig[card.status].label}
          </span>
        </div>

        {card.tag && (
          <span className="inline-block bg-gray-700 text-xs px-2 py-0.5 rounded mb-3">
            {card.tag}
          </span>
        )}

        {card.note && <p className="text-sm text-gray-300 whitespace-pre-wrap mb-3">{card.note}</p>}

        {card.url && (
          <a
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:underline block mb-3 truncate"
          >
            {card.url}
          </a>
        )}

        {card.image_urls.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {card.image_urls.map((url, i) => (
              <img key={i} src={url} alt="" className="w-24 h-24 object-cover rounded" />
            ))}
          </div>
        )}

        {card.confirmed_by && (
          <p className="text-xs text-green-400 mb-3">
            確定者: {card.confirmed_by}
          </p>
        )}

        <p className="text-xs text-gray-500 mb-4">
          更新: {new Date(card.updated_at).toLocaleString('ja-JP')}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-400 mr-1">ステータス:</span>
          {(['unknown', 'hypothesis', 'confirmed'] as CardStatus[]).map(s => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                card.status === s
                  ? statusConfig[s].color + ' text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {statusConfig[s].label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onOpenComments}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            コメント
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            編集
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 bg-red-900 hover:bg-red-800 rounded text-sm transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}
