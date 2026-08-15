import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from 'next/link'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

const DELIVERY_STAGES = [
  { key: 'ORDER_PLACED', label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'SHIPPED', label: 'Dispatched' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' }
]

function getStageIndex(status: string) {
  const s = (status || 'ORDER_PLACED').toUpperCase()
  const idx = DELIVERY_STAGES.findIndex(stage => stage.key === s)
  return idx >= 0 ? idx : 0
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const user = session.user as any
  const userPhone = user.phone ? String(user.phone).replace(/\D/g, '').slice(-10) : ''

  // Fetch all orders matching userId or user phone
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: user.id },
        ...(userPhone ? [{ customerPhone: userPhone }] : [])
      ]
    },
    include: { orderItems: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className={`container ${styles.dashboard}`}>
      {/* Dashboard Top Header */}
      <div className={styles.topBar}>
        <div>
          <span className={styles.userRoleBadge}>CUSTOMER DASHBOARD</span>
          <h1 className={styles.welcomeTitle}>
            Welcome, {user.name || `Customer (${user.phone || user.email})`}
          </h1>
          <p className={styles.subtitleText}>Manage your active purchases and view live delivery tracking details.</p>
        </div>

        {user.role === 'ADMIN' && (
          <a href="/admin" className="btn-primary" style={{ backgroundColor: 'var(--accent-gold)', color: '#000000', fontWeight: 800 }}>
            ADMIN PORTAL
          </a>
        )}
      </div>

      {/* Orders Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeaderRow}>
          <h2 className={styles.sectionTitle}>YOUR PURCHASES & ORDER HISTORY ({orders.length})</h2>
          <Link href="/track-order" className={styles.trackLinkBtn}>
            🔍 Track Order by ID
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="premium-card text-center" style={{ padding: '60px 20px' }}>
            <p className="text-secondary mb-4" style={{ fontSize: '1.1rem' }}>You haven't placed any orders yet.</p>
            <Link href="/#catalog" className="btn-pill-blue">Explore TVs & Shop Now</Link>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map(order => {
              const currentStageIdx = getStageIndex(order.deliveryStatus)

              return (
                <div key={order.id} className={`premium-card ${styles.orderCard}`}>
                  {/* Top Order Card Header */}
                  <div className={styles.orderHeader}>
                    <div>
                      <div className={styles.orderIdRow}>
                        <span className={styles.orderIdText}>Order #{order.orderNumber}</span>
                        <span className={styles.orderDateText}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className={styles.headerRightBadges}>
                      <span className={`${styles.paymentStatusBadge} ${order.paymentMethod === 'COD' ? styles.codBadge : styles.paidBadge}`}>
                        {order.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'PREPAID (PAID)'}
                      </span>
                    </div>
                  </div>

                  {/* Live Delivery Progress Tracker Timeline */}
                  <div className={styles.trackerContainer}>
                    <p className={styles.trackerHeading}>
                      <span>LIVE DELIVERY TRACKING</span>
                      {order.estimatedDelivery && (
                        <span className={styles.estimatedText}>Estimated Arrival: <strong>{order.estimatedDelivery}</strong></span>
                      )}
                    </p>

                    <div className={styles.timelineStepper}>
                      {DELIVERY_STAGES.map((stage, idx) => {
                        const isDone = idx <= currentStageIdx
                        const isCurrent = idx === currentStageIdx

                        return (
                          <div 
                            key={stage.key} 
                            className={`${styles.stepItem} ${isDone ? styles.stepDone : ''} ${isCurrent ? styles.stepCurrent : ''}`}
                          >
                            <div className={styles.stepDot}>
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span className={styles.stepLabel}>{stage.label}</span>
                          </div>
                        )
                      })}
                    </div>

                    {order.trackingNumber && (
                      <div className={styles.courierTrackingBox}>
                        <span>Courier Partner: <strong>{order.courierPartner || 'Delhivery / Bluedart'}</strong></span>
                        <span>Tracking AWB: <strong>{order.trackingNumber}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div className={styles.itemsSection}>
                    <h4 className={styles.subHeading}>ITEMS PURCHASED</h4>
                    <div className={styles.itemsGrid}>
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className={styles.itemCardRow}>
                          <div className={styles.itemThumb}>
                            <img src={item.imageUrl || '/images/hero_tv_setup.png'} alt={item.title} />
                          </div>
                          <div className={styles.itemInfo}>
                            <p className={styles.itemTitleText}>{item.title}</p>
                            <p className={styles.itemMetaText}>{item.size ? `${item.size} Display` : ''} • Qty: {item.quantity}</p>
                          </div>
                          <p className={styles.itemPriceText}>
                            ₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Address & Amount Summary */}
                  <div className={styles.orderFooterGrid}>
                    <div className={styles.shippingSummaryBox}>
                      <h4 className={styles.subHeading}>DELIVERY ADDRESS</h4>
                      <p className={styles.addressName}><strong>{order.customerName}</strong> ({order.customerPhone})</p>
                      <p className={styles.addressText}>{order.shippingAddress}, {order.city}, {order.state} - {order.pincode}</p>
                      {order.landmark && <p className={styles.addressText}>Landmark: {order.landmark}</p>}
                      {order.gstin && <p className={styles.gstinText}>GSTIN: {order.gstin}</p>}
                    </div>

                    <div className={styles.amountSummaryBox}>
                      <h4 className={styles.subHeading}>PAYMENT SUMMARY</h4>
                      <div className={styles.summaryRow}>
                        <span>Subtotal:</span>
                        <span>₹{Math.round(order.subtotal || order.totalAmount).toLocaleString('en-IN')}</span>
                      </div>
                      {order.codFee > 0 && (
                        <div className={styles.summaryRow}>
                          <span>COD Fee:</span>
                          <span>+₹{order.codFee}</span>
                        </div>
                      )}
                      <div className={styles.summaryRow}>
                        <span>Shipping:</span>
                        <span style={{ color: '#34d399', fontWeight: 700 }}>FREE</span>
                      </div>
                      <div className={styles.summaryTotalRow}>
                        <span>Total Paid:</span>
                        <span className="text-cyan">₹{Math.round(order.totalAmount).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
