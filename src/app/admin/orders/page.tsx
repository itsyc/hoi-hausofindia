import { prisma } from '@/lib/prisma'
import OrderAdminClient from './OrderAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { 
      orderItems: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return <OrderAdminClient initialOrders={orders} />
}
