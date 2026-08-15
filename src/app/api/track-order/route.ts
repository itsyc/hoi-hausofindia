import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ message: "Search query is required" }, { status: 400 })
    }

    const cleanQuery = query.trim()
    const cleanPhone = cleanQuery.replace(/\D/g, '').slice(-10)

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: cleanQuery } },
          { id: { contains: cleanQuery } },
          ...(cleanPhone.length === 10 ? [{ customerPhone: cleanPhone }] : [])
        ]
      },
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Track Order Error:", error)
    return NextResponse.json({ message: "Failed to fetch tracking data" }, { status: 500 })
  }
}
