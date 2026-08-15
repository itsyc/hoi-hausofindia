import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewDashboard() {
  const [productsCount, variants, orders, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.variant.findMany({
      include: { product: true }
    }),
    prisma.order.findMany({
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { orderItems: true }
    })
  ])

  // Analytics Metrics
  const totalStockUnits = variants.reduce((acc: number, v) => acc + (v.stockQuantity || 0), 0)
  const lowStockItems = variants.filter(v => (v.stockQuantity || 0) <= (v.lowStockThreshold || 5))
  const outOfStockItems = variants.filter(v => (v.stockQuantity || 0) === 0)
  const pendingOrders = orders.filter(o => o.deliveryStatus !== 'DELIVERED')
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID' || o.paymentMethod === 'PREPAID')
    .reduce((acc: number, o) => acc + o.totalAmount, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', margin: 0, fontWeight: 800 }}>
            Executive Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0 0', fontSize: '0.95rem' }}>
            HAUS OF INDIA • Real-time Business Analytics, Barcode Engine & Inventory Overview
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/inventory" className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
            🏷️ Barcode & Inventory
          </Link>
          <Link href="/admin/products/new" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
            + Add New Product
          </Link>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Metric 1: Total Revenue */}
        <div className="premium-card" style={{ padding: '20px', borderLeft: '4px solid #38bdf8' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px' }}>
            TOTAL REVENUE
          </span>
          <h2 style={{ fontSize: '1.8rem', color: '#38bdf8', margin: '8px 0 4px 0', fontWeight: 900 }}>
            ₹{Math.round(totalRevenue).toLocaleString('en-IN')}
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>From paid orders</span>
        </div>

        {/* Metric 2: Active Orders */}
        <div className="premium-card" style={{ padding: '20px', borderLeft: '4px solid #a855f7' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px' }}>
            PENDING ORDERS
          </span>
          <h2 style={{ fontSize: '1.8rem', color: '#c084fc', margin: '8px 0 4px 0', fontWeight: 900 }}>
            {pendingOrders.length}
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{orders.length} total lifetime orders</span>
        </div>

        {/* Metric 3: Total Stock Units */}
        <div className="premium-card" style={{ padding: '20px', borderLeft: '4px solid #22c55e' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px' }}>
            INVENTORY STOCK
          </span>
          <h2 style={{ fontSize: '1.8rem', color: '#4ade80', margin: '8px 0 4px 0', fontWeight: 900 }}>
            {totalStockUnits} Units
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Across {variants.length} size variants</span>
        </div>

        {/* Metric 4: Low Stock Alerts */}
        <div className="premium-card" style={{ 
          padding: '20px', 
          borderLeft: lowStockItems.length > 0 ? '4px solid #ff4d4d' : '4px solid var(--accent-cyan)' 
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px' }}>
            STOCK ALERTS
          </span>
          <h2 style={{ fontSize: '1.8rem', color: lowStockItems.length > 0 ? '#ff4d4d' : '#38bdf8', margin: '8px 0 4px 0', fontWeight: 900 }}>
            {lowStockItems.length} Low / Out
          </h2>
          <span style={{ fontSize: '0.78rem', color: lowStockItems.length > 0 ? '#ff4d4d' : 'var(--text-secondary)' }}>
            {outOfStockItems.length} items out of stock
          </span>
        </div>

      </div>

      {/* TWO COLUMN CONTENT: LOW STOCK ALERTS & RECENT ORDERS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* LEFT: Low Stock & Barcode Warnings */}
        <div className="premium-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="text-gold" style={{ margin: 0, fontSize: '1.1rem' }}>⚠️ Stock Alerts & Barcode Status</h3>
            <Link href="/admin/inventory" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textDecoration: 'underline' }}>
              Open Inventory Manager &rarr;
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '15px 0' }}>
              ✓ All products are fully stocked above safety threshold.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lowStockItems.slice(0, 5).map(v => (
                <div key={v.id} style={{ 
                  background: 'rgba(255, 77, 77, 0.08)', 
                  border: '1px solid rgba(255, 77, 77, 0.2)', 
                  borderRadius: '8px', 
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {v.product?.title} ({v.name})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Barcode: {v.barcode || 'Not assigned'} | SKU: {v.sku || 'N/A'}
                    </div>
                  </div>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '50px', 
                    fontSize: '0.75rem', 
                    fontWeight: 800,
                    background: v.stockQuantity === 0 ? 'rgba(255,77,77,0.2)' : 'rgba(234,179,8,0.2)',
                    color: v.stockQuantity === 0 ? '#ff4d4d' : '#facc15'
                  }}>
                    {v.stockQuantity === 0 ? 'OUT OF STOCK' : `${v.stockQuantity} Left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Recent Customer Orders */}
        <div className="premium-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>📦 Recent Orders</h3>
            <Link href="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textDecoration: 'underline' }}>
              View All Orders &rarr;
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '15px 0' }}>
              No orders placed yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentOrders.map(order => (
                <div key={order.id} style={{ 
                  background: 'rgba(0,0,0,0.25)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  borderRadius: '8px', 
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      #{order.orderNumber} • {order.customerName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {order.city}, {order.state} | {order.orderItems.length} item(s)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
                      ₹{Math.round(order.totalAmount).toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {order.deliveryStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
