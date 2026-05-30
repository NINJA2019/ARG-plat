import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCards } from '../hooks/useCards'
import { useCardLinks } from '../hooks/useCardLinks'
import { useParticipant } from '../hooks/useParticipant'
import { CorkBoard } from '../components/CorkBoard'
import { CardView } from '../components/CardView'
import { TimelineView } from '../components/TimelineView'
import { CardDetail } from '../components/CardDetail'
import { CardForm } from '../components/CardForm'
import { CommentDrawer } from '../components/CommentDrawer'
import type { Card, CardStatus, Scenario } from '../types'

type ViewMode = 'cork' | 'card' | 'timeline'

export function InvestigationBoard() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()
  const { name: participantName, joined } = useParticipant(scenarioId!)
  const { cards, create, update, updateStatus, updatePosition, remove } = useCards(scenarioId!)
  const { links, create: createLink, remove: removeLink } = useCardLinks(scenarioId!)

  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('cork')
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [commentCardId, setCommentCardId] = useState<string | null>(null)

  useEffect(() => {
    if (!joined) {
      navigate(`/${scenarioId}/join`, { replace: true })
    }
  }, [joined, navigate, scenarioId])

  useEffect(() => {
    supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single()
      .then(({ data }) => {
        if (data) setScenario(data)
      })
  }, [scenarioId])

  const handleCardClick = (card: Card) => {
    setSelectedCard(card)
  }

  const handleCreate = async (data: Partial<Card>) => {
    await create(data)
    setShowForm(false)
  }

  const handleEdit = async (data: Partial<Card>) => {
    if (!editingCard) return
    await update(editingCard.id, data)
    setEditingCard(null)
    setSelectedCard(null)
  }

  const handleDelete = async () => {
    if (!selectedCard) return
    if (!confirm('このカードを削除しますか？')) return
    // Remove related links
    const relatedLinks = links.filter(
      l => l.card_a === selectedCard.id || l.card_b === selectedCard.id,
    )
    for (const link of relatedLinks) {
      await removeLink(link.id)
    }
    await remove(selectedCard.id)
    setSelectedCard(null)
  }

  const handleStatusChange = async (status: CardStatus) => {
    if (!selectedCard) return
    await updateStatus(selectedCard.id, status, participantName ?? undefined)
    setSelectedCard(prev =>
      prev
        ? {
            ...prev,
            status,
            confirmed_by: status === 'confirmed' ? (participantName ?? null) : null,
          }
        : null,
    )
  }

  if (!joined) return null

  const viewTabs: { mode: ViewMode; label: string }[] = [
    { mode: 'cork', label: 'コルクボード' },
    { mode: 'card', label: 'カードビュー' },
    { mode: 'timeline', label: 'タイムライン' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
              &larr; 一覧
            </Link>
            <h1 className="text-lg font-bold">{scenario?.name ?? '...'}</h1>
            {scenario?.status === 'archived' && (
              <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-gray-400">
                archived
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{participantName}</span>
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
            >
              + カード追加
            </button>
          </div>
        </div>
      </header>

      {/* View tabs */}
      <div className="bg-gray-900 border-b border-gray-800 px-4">
        <div className="max-w-7xl mx-auto flex gap-1">
          {viewTabs.map(tab => (
            <button
              key={tab.mode}
              onClick={() => setViewMode(tab.mode)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                viewMode === tab.mode
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          {viewMode === 'cork' && (
            <CorkBoard
              cards={cards}
              links={links}
              onCardClick={handleCardClick}
              onPositionUpdate={updatePosition}
              onLinkCreate={createLink}
            />
          )}
          {viewMode === 'card' && <CardView cards={cards} onCardClick={handleCardClick} />}
          {viewMode === 'timeline' && (
            <TimelineView cards={cards} onCardClick={handleCardClick} />
          )}
        </div>
      </main>

      {/* Card detail modal */}
      {selectedCard && !editingCard && (
        <CardDetail
          card={selectedCard}
          participantName={participantName!}
          onEdit={() => setEditingCard(selectedCard)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onOpenComments={() => setCommentCardId(selectedCard.id)}
          onClose={() => setSelectedCard(null)}
        />
      )}

      {/* Card form modal (create) */}
      {showForm && (
        <CardForm
          scenarioId={scenarioId!}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Card form modal (edit) */}
      {editingCard && (
        <CardForm
          scenarioId={scenarioId!}
          card={editingCard}
          onSubmit={handleEdit}
          onCancel={() => setEditingCard(null)}
        />
      )}

      {/* Comment drawer */}
      {commentCardId && (
        <CommentDrawer
          cardId={commentCardId}
          cardTitle={cards.find(c => c.id === commentCardId)?.title ?? ''}
          participantName={participantName!}
          onClose={() => setCommentCardId(null)}
        />
      )}
    </div>
  )
}
