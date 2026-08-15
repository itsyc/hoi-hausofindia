"use client"
import { useCart } from './CartProvider'

type AddToCartProps = {
  variantId: string
  productId: string
  title: string
  size: number
  price: number
}

export default function AddToCartButton({ variantId, productId, title, size, price }: AddToCartProps) {
  const { addToCart } = useCart()

  const handleAdd = () => {
    addToCart({
      variantId,
      productId,
      title,
      size,
      price,
      quantity: 1
    })
    alert("Added to cart!")
  }

  return (
    <button onClick={handleAdd} className="btn-pill-blue" style={{ width: '100%', padding: '14px 28px', fontSize: '1rem' }}>
      ADD TO CART
    </button>
  )
}

