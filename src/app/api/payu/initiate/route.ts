import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPayUConfig, generatePayUHash } from '@/lib/payu'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      state,
      pincode,
      landmark,
      gstin
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 })
    }

    if (!customerName || !customerPhone || !shippingAddress || !pincode) {
      return NextResponse.json(
        { message: 'Please fill in all required shipping address fields' },
        { status: 400 }
      )
    }

    const cleanPhone = String(customerPhone).replace(/\D/g, '').slice(-10)

    // Calculate total amount
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const shippingFee = 0
    const codFee = 0
    const totalAmount = Math.round(subtotal)

    // Generate unique order number / transaction ID
    const orderNumber = `HOI-${Math.floor(100000 + Math.random() * 900000)}`
    const txnid = orderNumber

    // Delivery estimation
    const deliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })

    // User lookup
    let userId: string | null = null
    const sessionId = (session?.user as any)?.id
    const userConditions = []
    if (cleanPhone) userConditions.push({ phone: cleanPhone })
    if (sessionId) userConditions.push({ id: sessionId })

    if (userConditions.length > 0) {
      const dbUser = await prisma.user.findFirst({
        where: { OR: userConditions }
      })
      userId = dbUser?.id || null
    }

    // Verify variants
    const variantIds = items.map((i: any) => i.variantId).filter(Boolean)
    let existingVariantIdSet = new Set<string>()
    if (variantIds.length > 0) {
      const existingVariants = await prisma.variant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true }
      })
      existingVariantIdSet = new Set(existingVariants.map(v => v.id))
    }

    // Create Order in DB with PENDING payment status
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName: customerName.trim(),
        customerEmail: customerEmail?.trim() || null,
        customerPhone: cleanPhone,
        shippingAddress: shippingAddress.trim(),
        city: city?.trim() || 'City',
        state: state?.trim() || 'State',
        pincode: pincode.trim(),
        landmark: landmark?.trim() || null,
        gstin: gstin?.trim() || null,
        subtotal,
        shippingFee,
        codFee,
        totalAmount,
        paymentMethod: 'PREPAID',
        paymentStatus: 'PENDING',
        paymentGateway: 'PayU',
        deliveryStatus: 'ORDER_PLACED',
        courierPartner: 'Delhivery / Bluedart',
        estimatedDelivery,
        orderItems: {
          create: items.map((item: any) => ({
            variantId: item.variantId && existingVariantIdSet.has(item.variantId) ? item.variantId : null,
            title: item.title,
            size: item.size || null,
            imageUrl: item.imageUrl || null,
            quantity: item.quantity,
            price: Math.round(item.price)
          }))
        }
      }
    })

    const { key, actionUrl, baseUrl } = getPayUConfig()
    const productinfo = `Haus of India Order ${orderNumber}`
    const email = customerEmail?.trim() || 'customer@hausofindia.com'
    const firstname = customerName.trim()

    const hash = generatePayUHash({
      txnid,
      amount: totalAmount,
      productinfo,
      firstname,
      email,
      phone: cleanPhone,
      udf1: order.id
    })

    const surl = `${baseUrl}/api/payu/response`
    const furl = `${baseUrl}/api/payu/response`

    return NextResponse.json({
      success: true,
      actionUrl,
      params: {
        key,
        txnid,
        amount: totalAmount.toFixed(2),
        productinfo,
        firstname,
        email,
        phone: cleanPhone,
        surl,
        furl,
        udf1: order.id,
        hash
      }
    })
  } catch (error: any) {
    console.error('PayU Initiation Error:', error)
    return NextResponse.json({ message: error?.message || 'Internal server error' }, { status: 500 })
  }
}
