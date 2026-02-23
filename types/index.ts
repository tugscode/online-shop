export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price?: number
  image_url?: string
  category_id: string
  stock: number
  is_featured: boolean
  created_at: string
  categories?: Category
}

export interface CartItem {
  product: Product
  quantity: number
}