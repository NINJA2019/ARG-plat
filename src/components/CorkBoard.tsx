import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import type { Card, CardLink, CardStatus } from '../types'

interface Props {
  cards: Card[]
  links: CardLink[]
  onCardClick: (card: Card) => void
  onPositionUpdate: (id: string, x: number, y: number) => void
  onLinkCreate: (a: string, b: string) => void
}

const statusColor: Record<CardStatus, string> = {
  unknown: 'border-gray-500 bg-gray-800',
  hypothesis: 'border-amber-500 bg-amber-950',
  confirmed: 'border-green-500 bg-green-950',
}

const statusDot: Record<CardStatus, string> = {
  unknown: 'bg-gray-500',
  hypothesis: 'bg-amber-500',
  confirmed: 'bg-green-500',
}

export function CorkBoard({ cards, links, onCardClick, onPositionUpdate, onLinkCreate }: Props) {
  const boardRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [linkStart, setLinkStart] = useState<string | null>(null)

  const getCardCenter = useCallback(
    (card: Card) => ({ x: card.pos_x + 80, y: card.pos_y + 40 }),
    [],
  )

  const handlePointerDown = (e: React.PointerEvent, card: Card) => {
    if (linkStart) {
      if (linkStart !== card.id) {
        onLinkCreate(linkStart, card.id)
      }
      setLinkStart(null)
      return
    }

    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return
    setDragging({
      id: card.id,
      offsetX: e.clientX - rect.left - card.pos_x,
      offsetY: e.clientY - rect.top - card.pos_y,
    })
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !boardRef.current) return
    const rect = boardRef.current.getBoundingClientRect()
    const x = Math.max(0, e.clientX - rect.left - dragging.offsetX)
    const y = Math.max(0, e.clientY - rect.top - dragging.offsetY)
    const el = boardRef.current.querySelector(`[data-card-id="${dragging.id}"]`) as HTMLElement
    if (el) {
      el.style.left = `${x}px`
      el.style.top = `${y}px`
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragging || !boardRef.current) return
    const rect = boardRef.current.getBoundingClientRect()
    const x = Math.max(0, e.clientX - rect.left - dragging.offsetX)
    const y = Math.max(0, e.clientY - rect.top - dragging.offsetY)
    onPositionUpdate(dragging.id, Math.round(x), Math.round(y))
    setDragging(null)
  }

  const focusedLinks = useMemo(
    () => focusedId
      ? links.filter(l => l.card_a === focusedId || l.card_b === focusedId)
      : null,
    [focusedId, links],
  )

  const connectedCardIds = useMemo(
    () => focusedLinks
      ? new Set([
          focusedId!,
          ...focusedLinks.map(l => (l.card_a === focusedId ? l.card_b : l.card_a)),
        ])
      : null,
    [focusedId, focusedLinks],
  )

  // Close focus on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFocusedId(null)
        setLinkStart(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setLinkStart(prev => (prev ? null : '__waiting__'))}
          className={`px-3 py-1.5 text-sm rounded transition-colors ${
            linkStart ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {linkStart ? '関係線モード: カードを2つクリック (ESCで解除)' : '関係線を追加'}
        </button>
        {focusedId && (
          <button
            onClick={() => setFocusedId(null)}
            className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            フォーカス解除
          </button>
        )}
      </div>

      <div
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full h-[70vh] rounded-lg overflow-auto"
        style={{
          background: 'linear-gradient(135deg, #8B6914 0%, #A0784A 50%, #8B6914 100%)',
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23n)\' opacity=\'0.08\'/%3E%3C/svg%3E"), linear-gradient(135deg, #8B6914 0%, #A0784A 50%, #8B6914 100%)',
        }}
      >
        {/* SVG relationship lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: 1600, minHeight: 1200 }}>
          {links.map(link => {
            const a = cards.find(c => c.id === link.card_a)
            const b = cards.find(c => c.id === link.card_b)
            if (!a || !b) return null
            const pa = getCardCenter(a)
            const pb = getCardCenter(b)
            const isFocused = focusedLinks?.some(fl => fl.id === link.id)
            const isFaded = focusedId && !isFocused

            return (
              <line
                key={link.id}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={isFocused ? '#3b82f6' : '#ef4444'}
                strokeWidth={isFocused ? 3 : 2}
                strokeDasharray={isFocused ? 'none' : '8 4'}
                opacity={isFaded ? 0.15 : 1}
                className="transition-opacity duration-200"
              />
            )
          })}
        </svg>

        {/* Cards */}
        {cards.map(card => {
          const isFaded = connectedCardIds && !connectedCardIds.has(card.id)
          return (
            <div
              key={card.id}
              data-card-id={card.id}
              onPointerDown={e => {
                if (linkStart === '__waiting__') {
                  setLinkStart(card.id)
                  return
                }
                if (linkStart && linkStart !== '__waiting__') {
                  handlePointerDown(e, card)
                  return
                }
                handlePointerDown(e, card)
              }}
              onDoubleClick={() => {
                if (!linkStart) onCardClick(card)
              }}
              onClick={() => {
                if (!linkStart && !dragging) setFocusedId(prev => (prev === card.id ? null : card.id))
              }}
              className={`absolute w-40 select-none cursor-grab active:cursor-grabbing rounded border-2 p-2 shadow-lg transition-opacity duration-200 ${
                statusColor[card.status]
              } ${isFaded ? 'opacity-20' : 'opacity-100'}`}
              style={{ left: card.pos_x, top: card.pos_y }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[card.status]}`} />
                <span className="text-sm font-bold truncate">{card.title}</span>
              </div>
              {card.tag && (
                <span className="text-[10px] bg-black/30 px-1 rounded">{card.tag}</span>
              )}
              {card.note && (
                <p className="text-[11px] text-gray-300 mt-1 line-clamp-2">{card.note}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
