import type { Card, CardStatus } from '../types'

interface Props {
  cards: Card[]
  onCardClick: (card: Card) => void
}

const columns: { status: CardStatus; label: string; color: string; border: string }[] = [
  { status: 'unknown', label: '未調査', color: 'text-gray-400', border: 'border-gray-600' },
  { status: 'hypothesis', label: '仮説', color: 'text-amber-400', border: 'border-amber-600' },
  { status: 'confirmed', label: '確定', color: 'text-green-400', border: 'border-green-600' },
]

const statusBg: Record<CardStatus, string> = {
  unknown: 'bg-gray-800 border-gray-600 hover:border-gray-500',
  hypothesis: 'bg-amber-950 border-amber-700 hover:border-amber-500',
  confirmed: 'bg-green-950 border-green-700 hover:border-green-500',
}

export function CardView({ cards, onCardClick }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(col => {
        const colCards = cards.filter(c => c.status === col.status)
        return (
          <div key={col.status}>
            <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${col.border}`}>
              <h3 className={`font-bold ${col.color}`}>{col.label}</h3>
              <span className="text-xs text-gray-500">({colCards.length})</span>
            </div>
            <div className="space-y-2">
              {colCards.map(card => (
                <div
                  key={card.id}
                  onClick={() => onCardClick(card)}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${statusBg[card.status]}`}
                >
                  <h4 className="font-semibold text-sm mb-1">{card.title}</h4>
                  {card.tag && (
                    <span className="inline-block text-[10px] bg-black/30 px-1.5 py-0.5 rounded mb-1">
                      {card.tag}
                    </span>
                  )}
                  {card.note && (
                    <p className="text-xs text-gray-400 line-clamp-2">{card.note}</p>
                  )}
                  {card.confirmed_by && (
                    <p className="text-xs text-green-400 mt-1">
                      確定: {card.confirmed_by}
                    </p>
                  )}
                </div>
              ))}
              {colCards.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">カードなし</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
