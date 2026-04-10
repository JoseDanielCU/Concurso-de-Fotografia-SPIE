'use client'
import { useEffect, useState } from 'react'
import type { Category } from '@/app/types'

const EMPTY_FORM = {
  name: '',
  description: '',
  cover_image_url: '',
  phase1_finalists_count: 3
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
    setError(null)
  }

  function openEdit(cat: Category) {
    setForm({
  name: cat.name,
  description: cat.description ?? '',
  cover_image_url: cat.cover_image_url ?? '',
  phase1_finalists_count: cat.phase1_finalists_count,
})
    setEditingId(cat.id)
    setShowForm(true)
    setError(null)
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return }
    setSaving(true)
    setError(null)
    try {
      const url = '/api/categories';
      const method = 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,   // 👈 CLAVE
          ...form
        }),
      });
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShowForm(false)
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    load()
  }
async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  setSaving(true);

  try {
    const fileName = `${Date.now()}-${file.name}`;

    // 1. pedir signed URL
    const res = await fetch('/api/uploadcategory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        fileType: file.type,
        bucket: 'categories',
      }),
    });

    const { uploadUrl, publicUrl } = await res.json();

    // 2. subir archivo
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    // 3. guardar en el campo correcto
    setForm(f => ({
      ...f,
      cover_image_url: publicUrl,
    }));

  } catch (err) {
    console.error(err);
  } finally {
    setSaving(false);
  }
}
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorías</h1>
          <p className="text-gray-400 text-sm">Crea y gestiona las categorías</p>
        </div>
        <button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white text-sm">
          + Nueva categoría
        </button>
      </header>

      {/* FORM */}
      {showForm && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">
            {editingId ? 'Editar categoría' : 'Nueva categoría'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-1">
              <label className="text-sm text-gray-400">Nombre *</label>
              <input
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-3 py-2 text-white"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-400">Finalistas Fase 2</label>
              <input
                type="number"
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-3 py-2 text-white"
                value={form.phase1_finalists_count}
                onChange={e => setForm(f => ({ ...f, phase1_finalists_count: Number(e.target.value) }))}
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-sm text-gray-400">Descripción</label>
              <input
                className="w-full bg-[#0a0a0f] border border-gray-700 rounded-lg px-3 py-2 text-white"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-sm text-gray-400">URL imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : categories.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No hay categorías aún
        </div>
      ) : (
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">

          {/* HEAD */}
          <div className="grid grid-cols-4 px-6 py-3 text-sm text-gray-400 border-b border-gray-800">
            <span>Nombre</span>
            <span>Finalistas</span>
            <span>Portada</span>
            <span></span>
          </div>

          {/* ROWS */}
          {categories.map(cat => (
            <div key={cat.id} className="grid grid-cols-4 px-6 py-4 items-center border-b border-gray-800">

              <div>
                <p className="text-white font-medium">{cat.name}</p>
                {cat.description && (
                  <p className="text-xs text-gray-400">{cat.description}</p>
                )}
              </div>


              <div>
                {cat.cover_image_url ? (
                  <img src={cat.cover_image_url} className="w-16 h-10 object-cover rounded" />
                ) : (
                  <span className="text-gray-500 text-sm">Sin imagen</span>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <button onClick={() => openEdit(cat)} className="text-sm text-indigo-400 hover:text-indigo-300">
                  Editar
                </button>
                <button onClick={() => handleDelete(cat.id, cat.name)} className="text-sm text-red-400 hover:text-red-300">
                  Eliminar
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}