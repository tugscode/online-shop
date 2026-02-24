import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Product } from '@/types'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('products')
    .select('*, categories(*)')
    .order('created_at', { ascending: false })

  if (category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()

    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  const { data: products } = await query
  const { data: categories } = await supabase.from('categories').select('*')

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Бүтээгдэхүүн</h1>

      {/* Категори шүүлтүүр */}
      <div className="flex gap-2 flex-wrap mb-8">
        <Link
          href="/products"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            !category
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600'
          }`}
        >
          Бүгд
        </Link>
        {categories?.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              category === cat.slug
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products?.length === 0 && (
          <p className="col-span-4 text-center text-gray-400 py-20">Бүтээгдэхүүн олдсонгүй</p>
        )}
        {products?.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
