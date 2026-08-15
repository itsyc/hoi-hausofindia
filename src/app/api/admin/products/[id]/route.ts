import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const data = await req.json()
    const { title, series, description, features, specs, imageUrl, published, variants } = data

    const product = await prisma.product.update({
      where: { id },
      data: {
        title,
        series,
        description,
        features: JSON.stringify(features || []),
        specs: JSON.stringify(specs || {}),
        imageUrl: imageUrl || null,
        published: published,
      }
    })

    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        const mrpVal = isNaN(parseFloat(v.mrp)) ? 0 : parseFloat(v.mrp)
        const discountVal = isNaN(parseFloat(v.discountPct)) ? 0 : parseFloat(v.discountPct)
        const priceVal = (v.price !== undefined && !isNaN(parseFloat(v.price)))
          ? parseFloat(v.price)
          : mrpVal * (1 - discountVal / 100)

        const variantData = {
          name: String(v.name || 'Untitled'),
          mrp: mrpVal,
          discountPct: discountVal,
          price: priceVal,
          stockStatus: String(v.stockStatus || "In Stock"),
          isOnSale: Boolean(v.isOnSale),
          features: typeof v.features === 'string' ? v.features : JSON.stringify(v.features || []),
          images: typeof v.images === 'string' ? v.images : JSON.stringify(v.images || []),
          specs: typeof v.specs === 'string' ? v.specs : JSON.stringify(v.specs || {})
        }

        if (v.id) {
          const existing = await prisma.variant.findUnique({ where: { id: v.id } })
          if (existing) {
            await prisma.variant.update({
              where: { id: v.id },
              data: variantData
            })
          } else {
            await prisma.variant.create({
              data: {
                productId: id,
                ...variantData
              }
            })
          }
        } else {
          await prisma.variant.create({
            data: {
              productId: id,
              ...variantData
            }
          })
        }
      }
    }

    return NextResponse.json({ product }, { status: 200 })
  } catch (error: any) {
    console.error("Update Product Error:", error)
    return NextResponse.json({ message: error?.message || "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Delete Product Error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
