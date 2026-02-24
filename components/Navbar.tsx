'use client'
import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import CartSidebar from './CartSideBar'

export default function Navbar() {
  const { totalItems } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Coziness
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 text-gray-700 font-medium">
            <Link href="/" className="hover:text-blue-600 transition">
              Нүүр
            </Link>
            <Link href="/products" className="hover:text-blue-600 transition">
              Бүтээгдэхүүн
            </Link>
          </div>

          {/* Cart Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-white border-t"
            >
              <div className="flex flex-col p-4 gap-3">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Нүүр
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Бүтээгдэхүүн
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
