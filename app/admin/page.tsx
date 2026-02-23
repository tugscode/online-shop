'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminPage() {
  const [form, setForm] = useState({
    name: '', description: '', price: '',
    original_price: '', stock: '', image_url: '', is_featured: false
  })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('products').insert({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      stock: Number(form.stock),
      image_url: form.image_url || null,
      is_featured: form.is_featured
    })

    setLoading(false)
    setMsg(error ? '❌ Алдаа гарлаа' : '✅ Амжилттай нэмэгдлээ')
    if (!error) setForm({ name: '', description: '', price: '', original_price: '', stock: '', image_url: '', is_featured: false })
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Admin — Бүтээгдэхүүн нэмэх</h1>
      {msg && <p className="mb-4 p-3 bg-blue-50 rounded-xl text-sm">{msg}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'name', label: 'Нэр', placeholder: 'Бүтээгдэхүүний нэр' },
          { key: 'price', label: 'Үнэ (₮)', placeholder: '150000', type: 'number' },
          { key: 'original_price', label: 'Эх үнэ (₮)', placeholder: '200000', type: 'number' },
          { key: 'stock', label: 'Нөөц', placeholder: '10', type: 'number' },
          { key: 'image_url', label: 'Зургийн URL', placeholder: 'https://...' },
        ].map(({ key, label, placeholder, type = 'text' }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              value={(form as any)[key]}
              onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={key === 'name' || key === 'price'}
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
          <textarea
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="featured"
            checked={form.is_featured}
            onChange={e => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
            className="w-4 h-4" />
          <label htmlFor="featured" className="text-sm text-gray-700">Онцлох бүтээгдэхүүн</label>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
          {loading ? 'Нэмж байна...' : 'Нэмэх'}
        </button>
      </form>
    </div>
  )
}