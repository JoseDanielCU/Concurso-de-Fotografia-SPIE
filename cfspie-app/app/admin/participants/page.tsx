'use client'
import { useEffect, useState } from 'react'
import type { Category, Participant } from '../../types'

const EMPTY_FORM = { name: '', photo_url: '', category_id: '' }

export default function AdminParticipants() {
  const [categories, setCategories] = useState<Category[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({})
  const [filterCat, setFilterCat] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
  const [catsRes, partsRes, votesRes] = await Promise.all([
    fetch('/api/categories'),
    fetch('/api/participants'),
    fetch('/api/votes'),
  ])

  setCategories(await catsRes.json())
  setParticipants(await partsRes.json())
  const votes = await votesRes.json()

  const grouped = votes.reduce((acc: any, v: any) => {
    acc[v.participant_id] = (acc[v.participant_id] || 0) + 1
    return acc
  }, {})

  setVoteCounts(grouped)
  setLoading(false)
}

  useEffect(() => { load() }, [])

  function openNew() {
    setForm({ ...EMPTY_FORM, category_id: filterCat !== 'all' ? filterCat : '' })
    setEditingId(null)
    setShowForm(true)
    setError(null)
  }

  function openEdit(p: Participant) {
    setForm({ name: p.name, photo_url: p.photo_url, category_id: p.category_id })
    setEditingId(p.id)
    setShowForm(true)
    setError(null)
  }
const getVotes = (participantId: string) =>
  voteCounts[participantId] ?? 0

  async function handleSave() {
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.photo_url.trim()) { setError('Debes subir una imagen'); return }
    if (!form.category_id) { setError('Selecciona una categoría'); return }

    setSaving(true)
    setError(null)

    try {
      const url = editingId ? `/api/participants/${editingId}` : '/api/participants'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      let data = null

        try {
          data = await res.json()
        } catch {
          throw new Error('Respuesta inválida del servidor')
        }

        if (!res.ok) {
          throw new Error(data?.error || 'Error desconocido')
        }

      setShowForm(false)
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSaving(true)

    try {
      const fileName = `${crypto.randomUUID()}-${file.name}`

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName, fileType: file.type }),
      })

      const { uploadUrl, publicUrl } = await res.json()

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      setForm(f => ({ ...f, photo_url: publicUrl }))

    } catch (err) {
      console.error(err)
      setError('Error subiendo imagen')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar a "${name}"?`)) return
    await fetch(`/api/participants/${id}`, { method: 'DELETE' })
    load()
  }

  const filtered = filterCat === 'all'
    ? participants
    : participants.filter(p => p.category_id === filterCat)

  const getCatName = (id: string) =>
    categories.find(c => c.id === id)?.name ?? '—'

  return (
    <div className="p-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Participantes</h1>
          <p className="text-gray-400 text-sm">Gestiona las fotos por categoría</p>
        </div>
        <button
          onClick={openNew}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm"
        >
          + Añadir participante
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterCat('all')}
          className={`px-3 py-1 rounded-full text-sm border ${
            filterCat === 'all'
              ? 'bg-indigo-600 border-indigo-600'
              : 'border-gray-700 text-gray-400'
          }`}
        >
          Todas ({participants.length})
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCat(cat.id)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filterCat === cat.id
                ? 'bg-indigo-600 border-indigo-600'
                : 'border-gray-700 text-gray-400'
            }`}
          >
            {cat.name} ({participants.filter(p => p.category_id === cat.id).length})
          </button>
        ))}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar participante' : 'Nuevo participante'}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              className="bg-[#0a0a0f] border border-gray-700 rounded-lg px-3 py-2"
              placeholder="Nombre"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />

            <select
              className="bg-[#0a0a0f] border border-gray-700 rounded-lg px-3 py-2"
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* UPLOAD */}
            <div className="md:col-span-2">
              <label className="text-sm text-gray-400">Imagen *</label>

              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="mt-2 block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:bg-indigo-600 file:text-white
                  hover:file:bg-indigo-700
                  cursor-pointer"
              />

              {saving && (
                <p className="text-xs text-gray-500 mt-1">Subiendo imagen...</p>
              )}
            </div>

            {/* PREVIEW */}
            {form.photo_url && (
              <img
                src={form.photo_url}
                className="md:col-span-2 h-40 object-cover rounded-lg border border-gray-700"
              />
            )}
          </div>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.photo_url}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* GRID */}
      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No hay participantes</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {filtered.map(p => (
            <div
              key={p.id}
              className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden group"
            >
              <div className="relative">
                <img src={p.photo_url} className="w-full h-40 object-cover" />

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition">
                  <button
                    onClick={() => openEdit(p)}
                    className="bg-indigo-600 px-3 py-1 text-sm rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="bg-red-600 px-3 py-1 text-sm rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-1">
                <span className="font-semibold">{p.name}</span>
                <span className="text-gray-400 text-sm">{getCatName(p.category_id)}</span>
                <span className="text-indigo-400 text-xs">{getVotes(p.id)} votos</span>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  )
}