import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useScenarios } from '../hooks/useScenarios'
import { CreateScenarioModal } from '../components/CreateScenarioModal'

export function ScenarioList() {
  const { scenarios, loading, create, archive, restore } = useScenarios()
  const [showCreate, setShowCreate] = useState(false)

  const active = useMemo(() => scenarios.filter(s => s.status === 'active'), [scenarios])
  const archived = useMemo(() => scenarios.filter(s => s.status === 'archived'), [scenarios])

  const handleCreate = async (name: string, description: string) => {
    await create(name, description)
    setShowCreate(false)
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">ARG 捜査ボード</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors"
        >
          + 新規シナリオ
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : (
        <>
          {active.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-300 mb-3">
                進行中 ({active.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map(s => (
                  <div
                    key={s.id}
                    className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg p-4 transition-colors"
                  >
                    <Link to={`/${s.id}`} className="block mb-2">
                      <h3 className="font-bold text-lg hover:text-blue-400 transition-colors">
                        {s.name}
                      </h3>
                    </Link>
                    {s.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{s.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(s.created_at).toLocaleDateString('ja-JP')}
                      </span>
                      <button
                        onClick={() => archive(s.id)}
                        className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
                      >
                        アーカイブ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {archived.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-500 mb-3">
                アーカイブ済み ({archived.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {archived.map(s => (
                  <div
                    key={s.id}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-4 opacity-60"
                  >
                    <Link to={`/${s.id}`} className="block mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-400 hover:text-gray-300 transition-colors">
                          {s.name}
                        </h3>
                        <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-gray-400">
                          archived
                        </span>
                      </div>
                    </Link>
                    {s.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{s.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {new Date(s.created_at).toLocaleDateString('ja-JP')}
                      </span>
                      <button
                        onClick={() => restore(s.id)}
                        className="text-xs text-gray-600 hover:text-green-400 transition-colors"
                      >
                        復元
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {scenarios.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">シナリオがありません</p>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors"
              >
                最初のシナリオを作成
              </button>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <CreateScenarioModal onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      )}
    </div>
  )
}
