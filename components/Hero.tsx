'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-6"
        >
          Монголын шилдэг<br />онлайн дэлгүүр
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-blue-100 text-lg md:text-xl mb-8"
        >
          Техник, электроник бүтээгдэхүүнийг хамгийн хямд үнээр
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/products"
            className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-blue-50 transition shadow-lg">
            Бүтээгдэхүүн үзэх →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}