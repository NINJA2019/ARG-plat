import type { Card, CardStatus } from '../types'

interface Props {
  cards: Card[]
  onCardClick: (card: Card) => void
}

const dotColor: Record<CardStatus, string> = {
  unknown: 'bg-gray-500',
  hypothesis: 'bg-amber-500',
  confirmed: 'bg-green-500',
}

const statusLabel: Record<CardStatus, string> = {
  unknown: '未調査',
  hypothesis: '仮説',
  confirmed: '確定',
}

export function TimelineView({ cards, onCardClick }: Props) {
  const sorted = [...cards].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )

  return (
    <div className="relative pl-6">
      <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-700" />
      <div className="space-y-4">
        {sorted.map(card => (
          <div key={card.id} className="relative flex items-start gap-4">
            <div
              className={`absolute left-[-14px] top-2 w-3 h-3 rounded-full border-2 border-gray-900 ${dotColor[card.status]}`}
            />
            <div
              onClick={() => onCardClick(card)}
              className="flex-1 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg p-3 cursor-pointer transition-colors"
            >
              <div className="flex items-baseline gap-2 mb-1">
                <h4 className="font-semibold text-sm">{card.title}</h4>
                <span className="text-[10px] text-gray-500">{statusLabel[card.status]}</span>
                {card.tag && (
                  <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded">{card.tag}</span>
                )}
              </div>
              {card.note && (
                <p className="text-xs text-gray-400 line-clamp-2 mb-1">{card.note}</p>
              )}
              <span className="text-[10px] text-gray-600">
                {new Date(card.updated_at).toLocaleString('ja-JP')}
              </span>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-sm text-gray-600 text-center py-8">カードがありません</p>
        )}
      </div>
    </div>
  )
}
