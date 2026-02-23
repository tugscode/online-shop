'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, CheckCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useState } from 'react'
import Image from 'next/image'

interface Props {
  open: boolean
  onClose: () => void
}

type Step = 'cart' | 'qr' | 'success'

export default function CartSidebar({ open, onClose }: Props) {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart()
  const [step, setStep] = useState<Step>('cart')
  const [checking, setChecking] = useState(false)

  const handleCheckPayment = () => {
    setChecking(true)
    // Энд бодит төлбөр шалгах API дуудаж болно
    // Одоохондоо 2 секундын дараа амжилттай гэж үзье
    setTimeout(() => {
      setChecking(false)
      setStep('success')
      clearCart()
    }, 2000)
  }

  const handleClose = () => {
    onClose()
    // Sidebar хаагдсаны дараа step reset хийх
    setTimeout(() => setStep('cart'), 300)
  }

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
                {step === 'qr' && 'Төлбөр төлөх'}
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
                          <img src={product.image_url} alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">📦</div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-blue-600 font-bold">
                            {product.price.toLocaleString()}₮
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <button onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="p-1 bg-gray-100 rounded hover:bg-gray-200">
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-sm">{quantity}</span>
                            <button onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="p-1 bg-gray-100 rounded hover:bg-gray-200">
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeItem(product.id)}
                          className="text-red-400 hover:text-red-600 p-1">
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
                      onClick={() => setStep('qr')}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                    >
                      Захиалах
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ─── QR STEP ─── */}
            {step === 'qr' && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
                <p className="text-gray-500 text-sm text-center">
                  Дараах QR кодыг уншуулж төлбөрөө төлнө үү
                </p>

                {/* QR зураг */}
                <div className="border-4 border-blue-600 rounded-2xl p-2 shadow-lg">
                  <img
                    src="/payment-qr.png"
                    alt="Payment QR"
                    className="w-56 h-56 object-contain"
                  />
                </div>

                {/* Дүн */}
                <div className="bg-blue-50 rounded-xl px-6 py-3 text-center">
                  <p className="text-sm text-gray-500">Төлөх дүн</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalPrice.toLocaleString()}₮
                  </p>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Гүйлгээ хийсний дараа доорх товчийг дарна уу
                </p>

                {/* Гүйлгээ шалгах товч */}
                <button
                  onClick={handleCheckPayment}
                  disabled={checking}
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {checking ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Шалгаж байна...
                    </>
                  ) : (
                    'Гүйлгээ шалгах ✓'
                  )}
                </button>

                <button
                  onClick={() => setStep('cart')}
                  className="text-sm text-gray-400 hover:text-gray-600 underline"
                >
                  ← Буцах
                </button>
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
                <p className="text-gray-500">
                  Таны захиалга амжилттай бүртгэгдлээ.<br />
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
