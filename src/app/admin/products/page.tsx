import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminProductsCatalogPage() {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', margin: 0 }}>Products & Series Catalog</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0 0', fontSize: '0.92rem' }}>Manage all HAUS OF INDIA models, series, and price variants</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary" style={{ padding: '12px 24px' }}>
          + Add New Product
        </Link>
      </div>

      <div className="premium-card">
        <div className="table-responsive">
          <table style={{ width: '100%', minWidth: '600px', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>Model Title</th>
              <th style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>Series</th>
              <th style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>Variants</th>
              <th style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>Stock Units</th>
              <th style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const totalStock = product.variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0)
              return (
                <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>{product.title}</td>
                  <td style={{ padding: '16px 12px' }} className="text-gold">{product.series}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '50px', 
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: product.published ? 'rgba(0, 210, 255, 0.12)' : 'rgba(255, 255, 255, 0.1)',
                      color: product.published ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      border: product.published ? '1px solid rgba(0, 210, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                      {product.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{product.variants.length} Sizes</td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-primary)', fontWeight: 700 }}>
                    {totalStock} units
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <Link href={`/admin/products/${product.id}`} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                      Edit / Manage
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
