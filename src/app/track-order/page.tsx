"use client"

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

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

export default function TrackOrderPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[] | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOrders(null)
    if (!query || query.trim().length === 0) return

    setLoading(true)
    try {
      const res = await fetch(`/api/track-order?query=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders || [])
        if (!data.orders || data.orders.length === 0) {
          setError('No orders found for this Order Number or Mobile Number.')
        }
      } else {
        setError(data.message || 'Could not find order.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`container ${styles.trackPage}`}>
      <div className={styles.headerBox}>
        <span className={styles.badge}>HAUS TRACKING PORTAL</span>
        <h1 className={styles.title}>TRACK YOUR DELIVERY</h1>
        <p className={styles.subtitle}>Enter your Order ID (e.g. HOI-849201) or 10-digit Mobile Number to check live status.</p>
      </div>

      <div className={`premium-card ${styles.searchCard}`}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Enter Order ID (HOI-849201) or Mobile Number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="btn-pill-blue" style={{ padding: '12px 28px', flexShrink: 0 }}>
            {loading ? 'Searching...' : 'TRACK ORDER'}
          </button>
        </form>

        {error && <p className={styles.errorBox}>{error}</p>}
      </div>

      {/* Search Results List */}
      {orders && orders.length > 0 && (
        <div className={styles.resultsList}>
          {orders.map(order => {
            const currentStageIdx = getStageIndex(order.deliveryStatus)

            return (
              <div key={order.id} className={`premium-card ${styles.orderCard}`}>
                <div className={styles.orderHeader}>
                  <div>
                    <span className={styles.orderNumber}>Order #{order.orderNumber}</span>
                    <span className={styles.orderDate}>
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <span className={order.paymentMethod === 'COD' ? styles.codBadge : styles.paidBadge}>
                    {order.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'PREPAID'}
                  </span>
                </div>

                {/* Timeline Stepper */}
                <div className={styles.trackerContainer}>
                  <p className={styles.trackerHeading}>
                    <span>LIVE STATUS TIMELINE</span>
                    {order.estimatedDelivery && (
                      <span className={styles.estimatedText}>Estimated Arrival: <strong>{order.estimatedDelivery}</strong></span>
                    )}
                  </p>

                  <div className={styles.timelineStepper}>
                    {DELIVERY_STAGES.map((stage, idx) => {
                      const isDone = idx <= currentStageIdx
                      const isCurrent = idx === currentStageIdx

                      return (
                        <div key={stage.key} className={`${styles.stepItem} ${isDone ? styles.stepDone : ''} ${isCurrent ? styles.stepCurrent : ''}`}>
                          <div className={styles.stepDot}>{isDone ? '✓' : idx + 1}</div>
                          <span className={styles.stepLabel}>{stage.label}</span>
                        </div>
                      )
                    })}
                  </div>

                  {order.trackingNumber && (
                    <div className={styles.courierInfoBox}>
                      <span>Courier: <strong>{order.courierPartner || 'Delhivery / Bluedart'}</strong></span>
                      <span>AWB Tracking: <strong>{order.trackingNumber}</strong></span>
                    </div>
                  )}
                </div>

                {/* Items & Shipping Summary */}
                <div className={styles.cardDetailsGrid}>
                  <div>
                    <h4 className={styles.subHeading}>DELIVERY TO</h4>
                    <p className={styles.detailText}><strong>{order.customerName}</strong></p>
                    <p className={styles.detailText}>{order.shippingAddress}, {order.city}, {order.state} - {order.pincode}</p>
                  </div>
                  <div>
                    <h4 className={styles.subHeading}>ITEMS</h4>
                    {order.orderItems.map((item: any, idx: number) => (
                      <p key={idx} className={styles.detailText}>• {item.title} ({item.size}) x {item.quantity}</p>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
