'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types'
import { useRouter } from 'next/navigation'

type FormState = {
  name: string
  description: string
  price: string
  original_price: string
  stock: string
  image_url: string
  is_featured: boolean
  category_id: string
}

type StringField = 'name' | 'price' | 'original_price' | 'stock' | 'image_url'

const initialForm: FormState = {
  name: '',
  description: '',
  price: '',
  original_price: '',
  stock: '',
  image_url: '',
  is_featured: false,
  category_id: '',
}

export default function AdminPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .then(({ data }) => {
        if (data) setCategories(data)
      })
  }, [])

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
      is_featured: form.is_featured,
      category_id: form.category_id || null,
    })

    setLoading(false)
    setMsg(error ? '❌ Алдаа гарлаа' : '✅ Амжилттай нэмэгдлээ')
    if (!error) setForm(initialForm)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const fields: { key: StringField; label: string; placeholder: string; type?: string }[] = [
    { key: 'name', label: 'Нэр', placeholder: 'Бүтээгдэхүүний нэр' },
    { key: 'price', label: 'Үнэ (₮)', placeholder: '150000', type: 'number' },
    { key: 'original_price', label: 'Эх үнэ (₮)', placeholder: '200000', type: 'number' },
    { key: 'stock', label: 'Нөөц', placeholder: '10', type: 'number' },
    { key: 'image_url', label: 'Зургийн URL', placeholder: 'https://...' },
  ]

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin — Бүтээгдэхүүн нэмэх</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-500 transition border border-gray-200 px-4 py-2 rounded-xl hover:border-red-200"
        >
          Гарах
        </button>
      </div>
      {msg && <p className="mb-4 p-3 bg-blue-50 rounded-xl text-sm">{msg}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ key, label, placeholder, type = 'text' }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={key === 'name' || key === 'price'}
            />
          </div>
        ))}

        {/* Категори сонгох */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Категори</label>
          <div className="relative">
            <select
              value={form.category_id}
              onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
              className="w-full appearance-none bg-white border-2 border-gray-100 hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-3 text-gray-700 font-medium transition-colors duration-200 cursor-pointer"
            >
              <option value="" disabled>
                — Категори сонгох —
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={form.is_featured}
            onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
            className="w-4 h-4"
          />
          <label htmlFor="featured" className="text-sm text-gray-700">
            Онцлох бүтээгдэхүүн
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Нэмж байна...' : 'Нэмэх'}
        </button>
      </form>
    </div>
  )
}
