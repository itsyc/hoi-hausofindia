import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const exportCsv = searchParams.get('export') === 'csv'

    const orders = await prisma.order.findMany({
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' }
    })

    if (exportCsv) {
      // Build CSV content
      const headers = [
        "Order Number",
        "Order Date",
        "Customer Name",
        "Customer Phone",
        "Customer Email",
        "Shipping Address",
        "City",
        "State",
        "Pincode",
        "GSTIN",
        "Items",
        "Payment Method",
        "Payment Status",
        "Delivery Status",
        "Subtotal",
        "COD Fee",
        "Total Amount",
        "Courier Partner",
        "Tracking AWB"
      ]

      const rows = orders.map(order => {
        const itemsStr = order.orderItems.map(i => `${i.title} (${i.size || 'Default'}) x${i.quantity}`).join(" | ")
        const cleanAddress = `${order.shippingAddress}${order.landmark ? ' (Landmark: ' + order.landmark + ')' : ''}`

        return [
          `"${order.orderNumber}"`,
          `"${new Date(order.createdAt).toLocaleString('en-IN')}"`,
          `"${order.customerName.replace(/"/g, '""')}"`,
          `"${order.customerPhone}"`,
          `"${(order.customerEmail || '').replace(/"/g, '""')}"`,
          `"${cleanAddress.replace(/"/g, '""')}"`,
          `"${order.city.replace(/"/g, '""')}"`,
          `"${order.state.replace(/"/g, '""')}"`,
          `"${order.pincode}"`,
          `"${(order.gstin || '').replace(/"/g, '""')}"`,
          `"${itemsStr.replace(/"/g, '""')}"`,
          `"${order.paymentMethod}"`,
          `"${order.paymentStatus}"`,
          `"${order.deliveryStatus}"`,
          `"${Math.round(order.subtotal || order.totalAmount)}"`,
          `"${order.codFee}"`,
          `"${Math.round(order.totalAmount)}"`,
          `"${(order.courierPartner || '').replace(/"/g, '""')}"`,
          `"${(order.trackingNumber || '').replace(/"/g, '""')}"`
        ].join(",")
      })

      const csvContent = [headers.join(","), ...rows].join("\n")

      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=HAUS_Orders_Export_${new Date().toISOString().slice(0,10)}.csv`
        }
      })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Admin Orders Error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { orderId, deliveryStatus, courierPartner, trackingNumber, scannedBarcodes } = await req.json()
    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 })
    }

    // Process scanned barcode assignment and automatic stock deduction
    if (Array.isArray(scannedBarcodes) && scannedBarcodes.length > 0) {
      for (const item of scannedBarcodes) {
        if (item.orderItemId && item.barcode) {
          const cleanBarcode = String(item.barcode).trim()
          
          // 1. Update OrderItem with assigned unit barcode
          const updatedItem = await prisma.orderItem.update({
            where: { id: item.orderItemId },
            data: { scannedBarcode: cleanBarcode }
          })

          // 2. Automatically deduct 1 unit from Inventory stock
          const variant = updatedItem.variantId 
            ? await prisma.variant.findUnique({ where: { id: updatedItem.variantId } })
            : await prisma.variant.findFirst({ where: { barcode: cleanBarcode } })

          if (variant) {
            const newQty = Math.max(0, (variant.stockQuantity || 0) - (updatedItem.quantity || 1))
            const threshold = variant.lowStockThreshold || 5
            let stockStatus = 'In Stock'
            if (newQty === 0) stockStatus = 'Out of Stock'
            else if (newQty <= threshold) stockStatus = 'Low Stock'

            await prisma.variant.update({
              where: { id: variant.id },
              data: {
                stockQuantity: newQty,
                stockStatus,
                ...(cleanBarcode && !variant.barcode ? { barcode: cleanBarcode } : {})
              }
            })
          }
        }
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(deliveryStatus ? { deliveryStatus } : {}),
        ...(courierPartner !== undefined ? { courierPartner } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber } : {})
      },
      include: { orderItems: true }
    })

    // Dispatch WhatsApp Notification if status or tracking number updated
    if ((deliveryStatus || trackingNumber) && updatedOrder.customerPhone) {
      let statusMessage = "";

      switch (updatedOrder.deliveryStatus) {
        case "SHIPPED":
        case "DISPATCHED":
          statusMessage = 
            `🚚 *Order Dispatched - Haus of India*\n\n` +
            `Great news! Your order *#${updatedOrder.orderNumber}* has been dispatched.\n\n` +
            `• Courier Partner: ${updatedOrder.courierPartner || 'Delhivery'}\n` +
            `• Tracking Number (AWB): *${updatedOrder.trackingNumber || 'N/A'}*\n\n` +
            `Track your shipment live here:\n${process.env.NEXT_PUBLIC_BASE_URL || 'https://hausofindia.com'}/track-order?orderId=${updatedOrder.orderNumber}`;
          break;

        case "DELIVERED":
          statusMessage = 
            `✨ *Order Delivered - Haus of India*\n\n` +
            `Your order *#${updatedOrder.orderNumber}* has been successfully delivered!\n` +
            `We hope you love your items. Thank you for shopping with Haus of India! 🛍️`;
          break;

        case "CANCELLED":
          statusMessage = 
            `❌ *Order Cancelled - Haus of India*\n\n` +
            `Your order *#${updatedOrder.orderNumber}* has been cancelled. Please contact support if you need further assistance.`;
          break;

        default:
          if (trackingNumber) {
            statusMessage = 
              `📦 *Shipping Update - Haus of India*\n\n` +
              `Tracking details updated for order *#${updatedOrder.orderNumber}*:\n` +
              `• Courier: ${updatedOrder.courierPartner || 'Delhivery'}\n` +
              `• AWB: ${updatedOrder.trackingNumber}`;
          }
          break;
      }

      if (statusMessage) {
        sendWhatsAppMessage(updatedOrder.customerPhone, statusMessage).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error("Update Order Error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
