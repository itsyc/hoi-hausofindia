import { prisma } from '@/lib/prisma'
import InventoryManager from './InventoryManager'

export const dynamic = 'force-dynamic'

export default async function AdminInventoryPage() {
  const variants = await prisma.variant.findMany({
    include: {
      product: {
        select: { id: true, title: true, series: true, imageUrl: true }
      }
    },
    orderBy: [
      { product: { series: 'asc' } },
      { createdAt: 'desc' }
    ]
  })

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
          🏷️ Inventory & Barcode Management System
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0 0', fontSize: '0.92rem' }}>
          Assign barcodes, manage stock counts, scan items with barcode software, and bulk import/export CSV spreadsheets
        </p>
      </div>

      <InventoryManager initialVariants={variants} />
    </div>
  )
}
