'use client'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100"
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square bg-gray-50">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">
              📦
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              -{discount}%
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-end gap-2 mb-3">
          <span className="text-blue-600 font-bold text-lg">
            {product.price.toLocaleString()}₮
          </span>
          {product.original_price && (
            <span className="text-gray-400 text-sm line-through">
              {product.original_price.toLocaleString()}₮
            </span>
          )}
        </div>

        <button
          onClick={() => addItem(product)}
          disabled={product.stock === 0}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} />
          {product.stock === 0 ? 'Дууссан' : 'Сагсанд нэмэх'}
        </button>
      </div>
    </motion.div>
  )
}