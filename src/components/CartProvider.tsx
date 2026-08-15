"use client"
import { createContext, useContext, useState, useEffect } from 'react'

type CartItem = {
  variantId: string
  productId: string
  title: string
  size: number
  price: number
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (variantId: string) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  total: 0
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  
  useEffect(() => {
    const saved = localStorage.getItem('hoi_cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('hoi_cart', JSON.stringify(items))
  }, [items])

  const addToCart = (newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.variantId === newItem.variantId)
      if (existing) {
        return prev.map(i => i.variantId === newItem.variantId ? { ...i, quantity: i.quantity + newItem.quantity } : i)
      }
      return [...prev, newItem]
    })
  }

  const removeFromCart = (variantId: string) => {
    setItems(prev => prev.filter(i => i.variantId !== variantId))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
