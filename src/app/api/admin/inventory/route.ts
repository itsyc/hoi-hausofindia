import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
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

    return NextResponse.json({ success: true, variants })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { variantId, barcode, sku, stockQuantity, lowStockThreshold } = body

    if (!variantId) {
      return NextResponse.json({ success: false, error: 'variantId is required' }, { status: 400 })
    }

    const qty = typeof stockQuantity === 'number' ? Math.max(0, stockQuantity) : 0
    const threshold = typeof lowStockThreshold === 'number' ? lowStockThreshold : 5

    let stockStatus = 'In Stock'
    if (qty === 0) {
      stockStatus = 'Out of Stock'
    } else if (qty <= threshold) {
      stockStatus = 'Low Stock'
    }

    const updated = await prisma.variant.update({
      where: { id: variantId },
      data: {
        barcode: barcode ? String(barcode).trim() : null,
        sku: sku ? String(sku).trim() : null,
        stockQuantity: qty,
        lowStockThreshold: threshold,
        stockStatus
      },
      include: { product: true }
    })

    return NextResponse.json({ success: true, variant: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Bulk Inventory Update Route (from CSV or Barcode Software Sync)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items } = body // Array of { barcode?, sku?, variantId?, stockQuantity }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'No items provided' }, { status: 400 })
    }

    let updatedCount = 0
    const errors: string[] = []

    for (const item of items) {
      try {
        const qty = typeof item.stockQuantity === 'number' ? Math.max(0, item.stockQuantity) : Number(item.stockQuantity || 0)
        let variantToUpdate = null

        if (item.variantId) {
          variantToUpdate = await prisma.variant.findUnique({ where: { id: String(item.variantId) } })
        } else if (item.barcode) {
          variantToUpdate = await prisma.variant.findFirst({ where: { barcode: String(item.barcode).trim() } })
        } else if (item.sku) {
          variantToUpdate = await prisma.variant.findFirst({ where: { sku: String(item.sku).trim() } })
        }

        if (variantToUpdate) {
          const threshold = variantToUpdate.lowStockThreshold || 5
          let stockStatus = 'In Stock'
          if (qty === 0) stockStatus = 'Out of Stock'
          else if (qty <= threshold) stockStatus = 'Low Stock'

          await prisma.variant.update({
            where: { id: variantToUpdate.id },
            data: {
              stockQuantity: qty,
              stockStatus,
              ...(item.barcode ? { barcode: String(item.barcode).trim() } : {}),
              ...(item.sku ? { sku: String(item.sku).trim() } : {})
            }
          })
          updatedCount++
        } else {
          errors.push(`No matching product found for Barcode: ${item.barcode || 'N/A'} / SKU: ${item.sku || 'N/A'}`)
        }
      } catch (err: any) {
        errors.push(`Error updating item ${item.barcode || item.sku}: ${err.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      totalReceived: items.length,
      errors
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
