'use client'
import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { use } from 'react'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('products')
      .select('*, categories(*)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error(error)
        setProduct(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  )

  if (!product) return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
      Бүтээгдэхүүн олдсонгүй
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Зураг */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-50 rounded-2xl overflow-hidden aspect-square"
        >
          {product.image_url ? (
            <img src={product.image_url} alt={product.name}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
          )}
        </motion.div>

        {/* Мэдээлэл */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center gap-4"
        >
          <p className="text-blue-600 text-sm font-medium">
            {(product as any).categories?.name}
          </p>
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-gray-500">{product.description}</p>

          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-blue-600">
              {product.price.toLocaleString()}₮
            </span>
            {product.original_price && (
              <span className="text-gray-400 text-xl line-through">
                {product.original_price.toLocaleString()}₮
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500">
            Нөөц: <span className="font-medium text-gray-800">{product.stock} ширхэг</span>
          </p>

          <button
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            className="flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition disabled:bg-gray-300"
          >
            <ShoppingCart size={20} />
            Сагсанд нэмэх
          </button>
        </motion.div>
      </div>
    </div>
  )
}