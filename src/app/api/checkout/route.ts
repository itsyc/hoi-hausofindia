import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

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
      gstin,
      paymentMethod
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 })
    }

    if (!customerName || !customerPhone || !shippingAddress || !pincode) {
      return NextResponse.json({ message: "Please fill in all required shipping address fields" }, { status: 400 })
    }

    const cleanPhone = String(customerPhone).replace(/\D/g, '').slice(-10)

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const codFee = paymentMethod === 'COD' ? 99 : 0
    const shippingFee = 0 // Free Express Shipping
    const totalAmount = Math.round(subtotal + codFee + shippingFee)

    // Generate unique human-readable order number
    const orderNumber = `HOI-${Math.floor(100000 + Math.random() * 900000)}`

    // Calculate estimated delivery date (4 days from today)
    const deliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })

    // Find linked user profile safely
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

    // Verify which variantIds actually exist in DB to prevent foreign key errors
    const variantIds = items.map((i: any) => i.variantId).filter(Boolean)
    let existingVariantIdSet = new Set<string>()
    if (variantIds.length > 0) {
      const existingVariants = await prisma.variant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true }
      })
      existingVariantIdSet = new Set(existingVariants.map(v => v.id))
    }

    // Create Order record
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
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'PREPAID',
        paymentStatus: paymentMethod === 'COD' ? 'COD_PENDING' : 'PAID',
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

    // Send WhatsApp Order Confirmation
    const orderConfirmationMessage = 
      `🎉 *Order Confirmed! - Haus of India*\n\n` +
      `Hi ${order.customerName},\n` +
      `Thank you for shopping with us! Your order *#${order.orderNumber}* has been placed successfully.\n\n` +
      `📦 *Order Summary*:\n` +
      `• Total Amount: ₹${order.totalAmount.toLocaleString('en-IN')}\n` +
      `• Payment Mode: ${order.paymentMethod}\n` +
      `• Estimated Delivery: ${order.estimatedDelivery}\n\n` +
      `🚚 *Shipping Address*:\n${order.shippingAddress}, ${order.city}, ${order.state} - ${order.pincode}\n\n` +
      `Track your order anytime here:\nhttps://hausofindia.in/track-order?orderId=${order.orderNumber}`;

    sendWhatsAppMessage(order.customerPhone, orderConfirmationMessage).catch(console.error);

    return NextResponse.json({ 
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      estimatedDelivery: order.estimatedDelivery
    }, { status: 200 })

  } catch (error: any) {
    console.error("Checkout Error:", error)
    return NextResponse.json({ message: error?.message || "Internal server error" }, { status: 500 })
  }
}
