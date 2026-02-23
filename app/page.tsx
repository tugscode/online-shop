// app/page.tsx
import Hero from '@/components/Hero'
import ProductCard from '@/components/ProductCard'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Product } from '@/types'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: featured } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_featured', true)
    .limit(8)

  return (
    <>
      <Hero />
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Онцлох бүтээгдэхүүн
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured?.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  )
}