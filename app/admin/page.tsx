'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category, Product } from '@/types'
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

type StringField = 'name' | 'price' | 'original_price' | 'stock'

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
  // Tabs state
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')

  // Products states
  const [form, setForm] = useState<FormState>(initialForm)
  const [products, setProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  // Categories states
  const [categories, setCategories] = useState<Category[]>([])
  const [catName, setCatName] = useState('')
  const [editingCatId, setEditingCatId] = useState<string | null>(null)

  // Global states
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')

  const supabase = createClient()
  const router = useRouter()

  const fetchData = async () => {
    // Категориудыг нэрээр нь эрэмбэлж татах
    const { data: catData } = await supabase.from('categories').select('*').order('name')
    if (catData) setCategories(catData)

    const { data: prodData } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })
    if (prodData) setProducts(prodData as any)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- CATEGORY FUNCTIONS ---
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) return
    setLoading(true)

    let error
    if (editingCatId) {
      const { error: err } = await supabase
        .from('categories')
        .update({ name: catName })
        .eq('id', editingCatId)
      error = err
    } else {
      const { error: err } = await supabase.from('categories').insert({ name: catName })
      error = err
    }

    setLoading(false)
    if (!error) {
      setMsg(editingCatId ? '✅ Категори шинэчлэгдлээ' : '✅ Категори нэмэгдлээ')
      setCatName('')
      setEditingCatId(null)
      fetchData()
    } else {
      setMsg('❌ Алдаа: ' + error.message)
    }
  }

  const startEditCategory = (cat: Category) => {
    setEditingCatId(cat.id)
    setCatName(cat.name)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteCategory = async (id: string) => {
    if (
      !confirm(
        'Энэ категорийг устгах уу? Тухайн категорид хамаарах бараанууд категоригүй болохыг анхаарна уу.'
      )
    )
      return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      setMsg('✅ Категори устлаа')
      fetchData()
    }
  }

  // --- PRODUCT FUNCTIONS ---
  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      original_price: String(product.original_price || ''),
      stock: String(product.stock),
      image_url: product.image_url || '',
      is_featured: product.is_featured || false,
      category_id: product.category_id || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(initialForm)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Та энэ барааг устгахдаа итгэлтэй байна уу?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) {
      setMsg('✅ Бараа амжилттай устлаа')
      fetchData()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'ml_default')

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dxqaj24ry/image/upload`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      setForm((prev) => ({ ...prev, image_url: data.secure_url }))
      setMsg('✅ Зураг амжилттай хуулагдлаа')
    } catch (err) {
      setMsg('❌ Зураг хуулахад алдаа гарлаа')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      stock: Number(form.stock),
      image_url: form.image_url,
      is_featured: form.is_featured,
      category_id: form.category_id || null,
    }

    const { error } = editingId
      ? await supabase.from('products').update(payload).eq('id', editingId)
      : await supabase.from('products').insert(payload)

    setLoading(false)
    if (!error) {
      setMsg(editingId ? '✅ Барааг амжилттай шинэчиллээ' : '✅ Барааг амжилттай нэмлээ')
      setForm(initialForm)
      setEditingId(null)
      fetchData()
    }
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
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-gray-900">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 border-b pb-6 gap-6">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-blue-600">
            COZINESS ADMIN
          </h1>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => {
                setActiveTab('products')
                setMsg('')
              }}
              className={`px-6 py-2 rounded-2xl font-bold transition-all ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              Бараанууд
            </button>
            <button
              onClick={() => {
                setActiveTab('categories')
                setMsg('')
              }}
              className={`px-6 py-2 rounded-2xl font-bold transition-all ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              Категориуд
            </button>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-bold bg-white border-2 border-gray-100 px-5 py-2.5 rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all self-start"
        >
          Системээс гарах
        </button>
      </div>

      {msg && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm font-bold text-blue-700 animate-in fade-in duration-500">
          {msg}
        </div>
      )}

      {/* PRODUCTS TAB CONTENT */}
      {activeTab === 'products' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div
              className={`bg-white p-6 rounded-3xl border-2 transition-all duration-300 ${editingId ? 'border-orange-400 shadow-2xl shadow-orange-50' : 'border-gray-100 shadow-xl shadow-gray-100/50'} sticky top-8`}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span
                  className={`w-2 h-6 rounded-full ${editingId ? 'bg-orange-500' : 'bg-blue-600'}`}
                ></span>
                {editingId ? 'Бараа засах' : 'Шинэ бараа нэмэх'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map(({ key, label, placeholder, type = 'text' }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-300 font-medium"
                      required={key === 'name' || key === 'price'}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                    Зураг
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center group-hover:border-blue-400 transition-colors bg-gray-50">
                      <p className="text-xs font-bold text-gray-400">Зураг солих бол дарна уу</p>
                    </div>
                  </div>
                  {uploading && (
                    <p className="text-[10px] text-blue-500 mt-2 font-bold animate-pulse">
                      Илгээж байна...
                    </p>
                  )}
                  {form.image_url && (
                    <div className="mt-3 relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                      <img
                        src={form.image_url}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                    Категори
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                    className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium cursor-pointer appearance-none"
                  >
                    <option value="">Сонгох</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                    Тайлбар
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium"
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.is_featured}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, is_featured: e.target.checked }))
                    }
                    className="w-5 h-5 rounded-lg border-2 border-gray-200 text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="featured" className="text-sm font-bold text-gray-600">
                    Онцлох бараа
                  </label>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className={`w-full py-4 rounded-2xl font-black transition-all shadow-lg text-white ${editingId ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'} disabled:opacity-50`}
                  >
                    {loading
                      ? 'УНШИЖ БАЙНА...'
                      : editingId
                        ? 'ӨӨРЧЛӨЛТИЙГ ХАДГАЛАХ'
                        : 'БАРААГ НИЙТЛЭХ'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-sm font-bold text-gray-400 hover:text-gray-600 py-2 transition-colors"
                    >
                      Засах үйлдлийг цуцлах
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          <div className="lg:col-span-8">
            <h2 className="text-xl font-bold mb-6">Бүх бараа ({products.length})</h2>
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`bg-white p-4 rounded-3xl border transition-all flex items-center gap-4 hover:shadow-md ${editingId === product.id ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-100'}`}
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-300 italic">
                        Зураггүй
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 leading-none">{product.name}</h3>
                      {product.is_featured && (
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          Онцлох
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1 mb-2 font-medium">
                      {product.description || 'Тайлбар байхгүй'}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-blue-600 font-black">
                        {product.price.toLocaleString()} ₮
                      </span>
                      <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                        Нөөц: {product.stock}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(product)}
                      className="p-3 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-2xl transition-all"
                      title="Засах"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      title="Устгах"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* CATEGORIES TAB CONTENT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div
              className={`bg-white p-6 rounded-3xl border-2 transition-all duration-300 ${editingCatId ? 'border-orange-400 shadow-2xl shadow-orange-50' : 'border-gray-100 shadow-xl shadow-gray-100/50'} sticky top-8`}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span
                  className={`w-2 h-6 rounded-full ${editingCatId ? 'bg-orange-500' : 'bg-blue-600'}`}
                ></span>
                {editingCatId ? 'Категори засах' : 'Шинэ категори нэмэх'}
              </h2>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                    Категорийн нэр
                  </label>
                  <input
                    placeholder="Жишээ нь: tote bag"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all ${editingCatId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {loading ? 'УНШИЖ БАЙНА...' : editingCatId ? 'ШИНЭЧЛЭХ' : 'ХАДГАЛАХ'}
                </button>
                {editingCatId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatId(null)
                      setCatName('')
                    }}
                    className="w-full text-sm font-bold text-gray-400 py-2"
                  >
                    Цуцлах
                  </button>
                )}
              </form>
            </div>
          </div>
          <div className="lg:col-span-8">
            <h2 className="text-xl font-bold mb-6">Бүх категори ({categories.length})</h2>
            <div className="grid grid-cols-1 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors italic">
                      #
                    </div>
                    <span className="font-bold text-lg text-gray-800">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditCategory(cat)}
                      className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                    >
                      Засах
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      Устгах
                    </button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-center py-10 text-gray-400 font-medium italic">
                  Одоогоор категори нэмэгдээгүй байна.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
