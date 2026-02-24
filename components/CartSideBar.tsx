'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, CheckCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
}

type Step = 'cart' | 'contact' | 'success'

interface ContactForm {
  name: string
  phone: string
  locationType: 'ub' | 'regional' | ''
  // Улаанбаатар
  district: string
  khoroo: string
  building: string
  street: string
  door: string
  detail: string
  // Орон нутаг
  aimag: string
  sum: string
  regionalDetail: string
}

const emptyContact: ContactForm = {
  name: '',
  phone: '',
  locationType: '',
  district: '',
  khoroo: '',
  building: '',
  street: '',
  door: '',
  detail: '',
  aimag: '',
  sum: '',
  regionalDetail: '',
}

const UB_DISTRICTS = [
  'Баянзүрх',
  'Сүхбаатар',
  'Хан-Уул',
  'Баянгол',
  'Чингэлтэй',
  'Сонгинохайрхан',
  'Налайх',
  'Багануур',
  'Багахангай',
]

const AIMAGS = [
  'Архангай',
  'Баян-Өлгий',
  'Баянхонгор',
  'Булган',
  'Говь-Алтай',
  'Говьсүмбэр',
  'Дархан-Уул',
  'Дорноговь',
  'Дорнод',
  'Дундговь',
  'Завхан',
  'Орхон',
  'Өвөрхангай',
  'Өмнөговь',
  'Сүхбаатар',
  'Сэлэнгэ',
  'Төв',
  'Увс',
  'Ховд',
  'Хөвсгөл',
  'Хэнтий',
]

const DELIVERY_FEE = 5000

export default function CartSidebar({ open, onClose }: Props) {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart()
  const [step, setStep] = useState<Step>('cart')
  const [contact, setContact] = useState<ContactForm>(emptyContact)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (field: Partial<ContactForm>) => setContact((prev) => ({ ...prev, ...field }))

  const handleOrder = async () => {
    if (!contact.name.trim() || !contact.phone.trim()) {
      setError('Нэр болон утасны дугаараа оруулна уу')
      return
    }
    if (!contact.locationType) {
      setError('Хүргэлтийн байршил сонгоно уу')
      return
    }
    if (contact.locationType === 'ub' && (!contact.district || !contact.khoroo)) {
      setError('Дүүрэг болон хорооны мэдээллийг оруулна уу')
      return
    }
    if (contact.locationType === 'regional' && (!contact.aimag || !contact.sum)) {
      setError('Аймаг болон сумын мэдээллийг оруулна уу')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          })),
          totalPrice: totalPrice + DELIVERY_FEE, // ← хүргэлт нэмсэн
          deliveryFee: DELIVERY_FEE, // ← тусдаа илгээх
          contact,
        }),
      })

      if (!res.ok) throw new Error('Алдаа гарлаа')

      clearCart()
      setStep('success')
    } catch {
      setError('Захиалга илгээхэд алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep('cart')
      setContact(emptyContact)
      setError('')
    }, 300)
  }

  const inputClass =
    'w-full border-2 border-gray-100 hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-2.5 transition-colors'
  const selectClass =
    'w-full appearance-none border-2 border-gray-100 hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded-xl px-3 py-2.5 text-gray-700 transition-colors bg-white cursor-pointer'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">
                {step === 'cart' && 'Сагс'}
                {step === 'contact' && 'Захиалгын мэдээлэл'}
                {step === 'success' && 'Захиалга амжилттай'}
              </h2>
              <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            {/* ─── CART STEP ─── */}
            {step === 'cart' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {items.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">Сагс хоосон байна</p>
                  ) : (
                    items.map(({ product, quantity }) => (
                      <div key={product.id} className="flex gap-3 items-start">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                            📦
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-blue-600 font-bold">
                            {product.price.toLocaleString()}₮
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-sm">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {items.length > 0 && (
                  <div className="p-4 border-t">
                    <div className="flex justify-between font-bold text-lg mb-4">
                      <span>Нийт:</span>
                      <span className="text-blue-600">{totalPrice.toLocaleString()}₮</span>
                    </div>
                    <button
                      onClick={() => setStep('contact')}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                    >
                      Захиалах →
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ─── CONTACT STEP ─── */}
            {step === 'contact' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Захиалгын товч хураангуй */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                    Захиалга
                  </p>
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-sm py-1">
                      <span className="text-gray-700">
                        {product.name} x{quantity}
                      </span>
                      <span className="font-medium">
                        {(product.price * quantity).toLocaleString()}₮
                      </span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 space-y-1">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Хүргэлт</span>
                      <span>5,000₮</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Нийт</span>
                      <span className="text-blue-600">{(totalPrice + 5000).toLocaleString()}₮</span>
                    </div>
                  </div>
                </div>

                {/* Нэр */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Нэр</label>
                  <input
                    type="text"
                    placeholder="Таны нэр"
                    value={contact.name}
                    onChange={(e) => update({ name: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {/* Утас */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Утасны дугаар
                  </label>
                  <input
                    type="tel"
                    placeholder="99xxxxxx"
                    value={contact.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {/* Хүргэлтийн байршил */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Хүргэлтийн байршил
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'ub', label: '🏙️ Улаанбаатар' },
                      { value: 'regional', label: '🌄 Орон нутаг' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          update({
                            locationType: opt.value as 'ub' | 'regional',
                            district: '',
                            khoroo: '',
                            building: '',
                            street: '',
                            door: '',
                            detail: '',
                            aimag: '',
                            sum: '',
                            regionalDetail: '',
                          })
                        }
                        className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                          contact.locationType === opt.value
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-100 text-gray-600 hover:border-blue-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── УЛААНБААТАР ── */}
                {contact.locationType === 'ub' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Дүүрэг
                        </label>
                        <select
                          value={contact.district}
                          onChange={(e) => update({ district: e.target.value })}
                          className={selectClass}
                        >
                          <option value="" disabled>
                            Сонгох
                          </option>
                          {UB_DISTRICTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Хороо
                        </label>
                        <select
                          value={contact.khoroo}
                          onChange={(e) => update({ khoroo: e.target.value })}
                          className={selectClass}
                        >
                          <option value="" disabled>
                            Сонгох
                          </option>
                          {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={`${n}-р хороо`}>
                              {n}-р хороо
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Байр
                        </label>
                        <input
                          type="text"
                          placeholder="Байрны нэр/дугаар"
                          value={contact.building}
                          onChange={(e) => update({ building: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Гудамж
                        </label>
                        <input
                          type="text"
                          placeholder="Гудамжны нэр"
                          value={contact.street}
                          onChange={(e) => update({ street: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Тоот</label>
                      <input
                        type="text"
                        placeholder="Хаалганы дугаар"
                        value={contact.door}
                        onChange={(e) => update({ door: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Дэлгэрэнгүй хаяг
                      </label>
                      <textarea
                        placeholder="Жишээ: Орцны код эсвэл ойрхон олны танил барилга гэх мэт..."
                        value={contact.detail}
                        onChange={(e) => update({ detail: e.target.value })}
                        rows={2}
                        className="w-full border-2 border-gray-100 hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-2.5 transition-colors resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* ── ОРОН НУТАГ ── */}
                {contact.locationType === 'regional' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Аймаг
                        </label>
                        <select
                          value={contact.aimag}
                          onChange={(e) => update({ aimag: e.target.value })}
                          className={selectClass}
                        >
                          <option value="" disabled>
                            Сонгох
                          </option>
                          {AIMAGS.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Сум
                        </label>
                        <input
                          type="text"
                          placeholder="Сумын нэр"
                          value={contact.sum}
                          onChange={(e) => update({ sum: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Дэлгэрэнгүй хаяг
                      </label>
                      <textarea
                        placeholder="Гудамж, байр, тоот эсвэл бусад мэдээлэл..."
                        value={contact.regionalDetail}
                        onChange={(e) => update({ regionalDetail: e.target.value })}
                        rows={2}
                        className="w-full border-2 border-gray-100 hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-2.5 transition-colors resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Алдаа */}
                {error && (
                  <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{error}</p>
                )}

                {/* Товчнууд */}
                <div className="space-y-2 pb-4">
                  <button
                    onClick={handleOrder}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Илгээж байна...
                      </>
                    ) : (
                      'Захиалга баталгаажуулах ✓'
                    )}
                  </button>
                  <button
                    onClick={() => setStep('cart')}
                    className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 underline"
                  >
                    ← Буцах
                  </button>
                </div>
              </div>
            )}

            {/* ─── SUCCESS STEP ─── */}
            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-6 gap-5 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                >
                  <CheckCircle size={80} className="text-green-500" />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-800">Баярлалаа!</h3>
                <p className="text-gray-500 leading-relaxed">
                  Таны захиалга амжилттай бүртгэгдлээ.
                  <br />
                  Бид тантай удахгүй холбоо барих болно.
                </p>

                <button
                  onClick={handleClose}
                  className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  Хаах
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
