import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { title, series, description, features, specs, imageUrl, published, variants } = data

    const product = await prisma.product.create({
      data: {
        title,
        series,
        description,
        features: JSON.stringify(features || []),
        specs: JSON.stringify(specs || {}),
        imageUrl: imageUrl || null,
        published: published || false,
        variants: {
          create: variants.map((v: any) => {
            const mrpVal = isNaN(parseFloat(v.mrp)) ? 0 : parseFloat(v.mrp)
            const discountVal = isNaN(parseFloat(v.discountPct)) ? 0 : parseFloat(v.discountPct)
            const priceVal = (v.price !== undefined && !isNaN(parseFloat(v.price)))
              ? parseFloat(v.price)
              : mrpVal * (1 - discountVal / 100)

            return {
              name: String(v.name || 'Untitled'),
              mrp: mrpVal,
              discountPct: discountVal,
              price: priceVal,
              isOnSale: Boolean(v.isOnSale),
              features: JSON.stringify(v.features || []),
              images: JSON.stringify(v.images || []),
              specs: JSON.stringify(v.specs || {})
            }
          })
        }
      }
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    console.error("Create Product Error:", error)
    return NextResponse.json({ message: error?.message || "Internal server error" }, { status: 500 })
  }
}
