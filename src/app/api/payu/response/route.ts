import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPayUResponseHash, getPayUConfig } from '@/lib/payu'

export async function POST(req: Request) {
  const { baseUrl } = getPayUConfig()

  try {
    const formData = await req.formData()
    const responseData: Record<string, string> = {}

    formData.forEach((value, key) => {
      responseData[key] = String(value)
    })

    const { status, txnid, udf1: orderId, mihpayid, error_Message } = responseData

    // Find target order by ID (udf1) or orderNumber (txnid)
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(orderId ? [{ id: orderId }] : []),
          ...(txnid ? [{ orderNumber: txnid }] : [])
        ]
      }
    })

    // Verify PayU Hash Signature for security
    const isHashValid = verifyPayUResponseHash(responseData)

    if (isHashValid && status === 'success') {
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            paymentId: mihpayid || txnid || 'PAYU_PAID'
          }
        })
      }

      const redirectUrl = new URL('/cart', baseUrl)
      redirectUrl.searchParams.set('status', 'success')
      if (order) {
        redirectUrl.searchParams.set('orderId', order.id)
        redirectUrl.searchParams.set('orderNumber', order.orderNumber)
      }

      return NextResponse.redirect(redirectUrl.toString(), 303)
    } else {
      // Payment Failed or Tampered Hash
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'FAILED'
          }
        })
      }

      const redirectUrl = new URL('/cart', baseUrl)
      redirectUrl.searchParams.set('status', 'failed')
      redirectUrl.searchParams.set(
        'reason',
        !isHashValid ? 'Invalid signature hash' : error_Message || status || 'Payment verification failed'
      )

      return NextResponse.redirect(redirectUrl.toString(), 303)
    }
  } catch (error: any) {
    console.error('PayU Callback Response Error:', error)
    const redirectUrl = new URL('/cart', baseUrl)
    redirectUrl.searchParams.set('status', 'failed')
    redirectUrl.searchParams.set('reason', 'Callback processing error')
    return NextResponse.redirect(redirectUrl.toString(), 303)
  }
}
