import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  scenarioId: string
  cardId: string
  imageUrls: string[]
  onUploaded: (urls: string[]) => void
}

export function ImageUploader({ scenarioId, cardId, imageUrls, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remaining = 10 - imageUrls.length
    if (remaining <= 0) return

    setUploading(true)
    const newUrls: string[] = []

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i]
      const idx = imageUrls.length + i
      const path = `${scenarioId}/${cardId}/${idx}.jpg`

      const { error } = await supabase.storage
        .from('card-images')
        .upload(path, file, { upsert: true })

      if (!error) {
        const { data } = supabase.storage.from('card-images').getPublicUrl(path)
        newUrls.push(data.publicUrl)
      }
    }

    const updated = [...imageUrls, ...newUrls]
    onUploaded(updated)
    setUploading(false)
    e.target.value = ''
  }

  const handleRemove = (idx: number) => {
    const updated = imageUrls.filter((_, i) => i !== idx)
    onUploaded(updated)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {imageUrls.map((url, i) => (
          <div key={i} className="relative group">
            <img src={url} alt="" className="w-20 h-20 object-cover rounded" />
            <button
              onClick={() => handleRemove(i)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              x
            </button>
          </div>
        ))}
      </div>
      {imageUrls.length < 10 && (
        <label className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded cursor-pointer transition-colors">
          {uploading ? 'アップロード中...' : `画像を追加 (${imageUrls.length}/10)`}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  )
}
