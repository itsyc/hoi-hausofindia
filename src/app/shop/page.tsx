import { prisma } from '@/lib/prisma'
import ShopClient from './ShopClient'

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  let products: any[] = []
  try {
    products = await prisma.product.findMany({
      where: { published: true },
      include: { variants: true }
    })
  } catch (error) {
    console.error('Database fetch error on Shop page:', error)
  }

  return <ShopClient initialProducts={products} />
}
