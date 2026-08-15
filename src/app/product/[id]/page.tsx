import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductViewer from './ProductViewer'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ variantId?: string; variant?: string }>
}) {
  const { id } = await params
  const { variantId, variant } = await searchParams
  const initialVariantId = variantId || variant

  const [product, allProducts] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: true }
    }),
    prisma.product.findMany({
      where: { published: true },
      include: { variants: true }
    })
  ])

  if (!product) {
    notFound()
  }

  return (
    <ProductViewer 
      product={product} 
      initialVariantId={initialVariantId} 
      allProducts={allProducts} 
    />
  )
}
