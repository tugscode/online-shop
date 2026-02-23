import ProductCard from '@/components/ProductCard'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Product } from '@/types'

export default async function ProductsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(*)')
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Бүтээгдэхүүн
      </h1>

      {/* Категори шүүлтүүр */}
      <div className="flex gap-2 flex-wrap mb-8">
        <a href="/products"
          className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium">
          Бүгд
        </a>
        {categories?.map(cat => (
          <a key={cat.id} href={`/products?category=${cat.slug}`}
            className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-blue-100 hover:text-blue-600 transition">
            {cat.name}
          </a>
        ))}
      </div>

      {/* Бүтээгдэхүүний grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products?.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}