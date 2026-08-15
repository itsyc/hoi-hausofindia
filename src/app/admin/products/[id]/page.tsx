import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EditProductForm from './EditProductForm'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true }
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="text-gold" style={{ fontSize: '2rem', margin: 0 }}>Edit Product</h1>
        <Link href="/admin" style={{ color: 'var(--text-secondary)' }}>&larr; Back to Products</Link>
      </div>
      
      <div className="premium-card">
        <EditProductForm product={product} />
      </div>
    </div>
  )
}
