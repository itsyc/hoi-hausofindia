"use client"

import { useCart } from '@/components/CartProvider'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function CartPage() {
  const { items, removeFromCart, total, clearCart } = useCart()
  const { data: session } = useSession()
  const router = useRouter()

  // Form states
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [pincode, setPincode] = useState('')
  const [landmark, setLandmark] = useState('')
  const [gstin, setGstin] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'COD'>('PREPAID')

  // Shipping & Pincode estimate states
  const [pincodeValid, setPincodeValid] = useState<boolean | null>(null)
  const [deliveryEstimate, setDeliveryEstimate] = useState<string>('')
  
  // Order completed state & PayU callback handler
  const [completedOrder, setCompletedOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Prefill phone/name if logged in & check URL for PayU callback status
  useEffect(() => {
    if (session?.user) {
      if ((session.user as any).phone) setCustomerPhone((session.user as any).phone)
      if (session.user.name) setCustomerName(session.user.name)
      if (session.user.email) setCustomerEmail(session.user.email)
    }

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const status = searchParams.get('status')
      const orderNumber = searchParams.get('orderNumber')
      const orderId = searchParams.get('orderId')
      const reason = searchParams.get('reason')

      if (status === 'success' && orderNumber) {
        setCompletedOrder({
          orderNumber,
          orderId,
          paymentMethod: 'PREPAID',
          estimatedDelivery: '4 Business Days (Express Delivery)',
          totalAmount: total || 0
        })
        clearCart()
      } else if (status === 'failed') {
        setError(`Payment process failed or was cancelled: ${reason || 'Transaction failed'}`)
      }
    }
  }, [session])

  // Handle live pincode calculation
  const handlePincodeChange = (val: string) => {
    const cleanPin = val.replace(/\D/g, '').slice(0, 6)
    setPincode(cleanPin)

    if (cleanPin.length === 6) {
      setPincodeValid(true)
      const deliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
      const dateStr = deliveryDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
      setDeliveryEstimate(`Express Delivery by ${dateStr} (Serviceable by Delhivery / Bluedart)`)
    } else {
      setPincodeValid(null)
      setDeliveryEstimate('')
    }
  }

  const codFee = paymentMethod === 'COD' ? 99 : 0
  const grandTotal = Math.round(total + codFee)

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (items.length === 0) return

    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    if (!pincode || pincode.length !== 6) {
      setError('Please enter a valid 6-digit Pincode')
      return
    }

    setLoading(true)
    try {
      if (paymentMethod === 'PREPAID') {
        // PayU Payment Gateway initiation
        const res = await fetch('/api/payu/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            customerName,
            customerEmail,
            customerPhone: cleanPhone,
            shippingAddress,
            city,
            state: stateName,
            pincode,
            landmark,
            gstin
          })
        })

        const data = await res.json()
        if (!res.ok) {
          setError(data.message || 'Failed to initiate PayU payment')
          setLoading(false)
          return
        }

        const { actionUrl, params } = data

        // Dynamically create and submit HTML form to launch PayU Hosted Checkout
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = actionUrl

        Object.entries(params).forEach(([key, value]) => {
          const hiddenInput = document.createElement('input')
          hiddenInput.type = 'hidden'
          hiddenInput.name = key
          hiddenInput.value = String(value)
          form.appendChild(hiddenInput)
        })

        document.body.appendChild(form)
        form.submit()
        return
      }

      // COD Payment Order Creation
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerName,
          customerEmail,
          customerPhone: cleanPhone,
          shippingAddress,
          city,
          state: stateName,
          pincode,
          landmark,
          gstin,
          paymentMethod
        })
      })

      const data = await res.json()
      if (res.ok) {
        setCompletedOrder(data)
        clearCart()
      } else {
        setError(data.message || 'Error processing order')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (completedOrder) {
    return (
      <div className={`container ${styles.cartPage}`}>
        <div className={`premium-card ${styles.successCard}`}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.successTitle}>ORDER CONFIRMED!</h1>
          <p className={styles.orderIdBadge}>ORDER ID: <strong>{completedOrder.orderNumber}</strong></p>
          
          <p className={styles.successDesc}>
            Thank you for your purchase! Your order has been placed successfully and is being processed for dispatch.
          </p>

          <div className={styles.orderDetailsGrid}>
            <div>
              <p className={styles.detailLabel}>Estimated Delivery</p>
              <p className={styles.detailValue}>{completedOrder.estimatedDelivery}</p>
            </div>
            <div>
              <p className={styles.detailLabel}>Payment Method</p>
              <p className={styles.detailValue}>{completedOrder.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid (Paid via PayU)'}</p>
            </div>
            <div>
              <p className={styles.detailLabel}>Total Amount</p>
              <p className={styles.detailValue}>₹{Math.round(completedOrder.totalAmount).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className={styles.successActions}>
            <Link href="/dashboard" className="btn-pill-blue">
              VIEW ORDER HISTORY & LIVE TRACKING
            </Link>
            <Link href="/#catalog" className="btn-pill-outline">
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`container ${styles.cartPage}`}>
      <h1 className="text-cyan mb-4" style={{ fontSize: '2.4rem', fontWeight: 900 }}>YOUR SHOPPING CART</h1>

      {items.length === 0 ? (
        <div className="premium-card text-center" style={{ padding: '60px 20px' }}>
          <p className="text-secondary mb-4" style={{ fontSize: '1.1rem' }}>Your cart is currently empty.</p>
          <Link href="/#catalog" className="btn-pill-blue">Browse Premium TVs</Link>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className={styles.cartLayout}>
          
          {/* Left Column: Items & Delivery Address Form */}
          <div className={styles.cartItems}>
            
            {/* Cart Items List */}
            <div className="premium-card mb-4">
              <h3 className={styles.sectionHeading}>1. REVIEW ITEMS ({items.length})</h3>
              {items.map(item => (
                <div key={item.variantId} className={styles.itemRow}>
                  <div>
                    <h4 className={styles.itemTitle}>{item.title}</h4>
                    <p className={styles.itemSpecs}>{item.size} Display • Qty: {item.quantity}</p>
                  </div>
                  <div className={styles.itemAction}>
                    <p className={styles.itemPrice}>₹{Math.round(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    <button type="button" onClick={() => removeFromCart(item.variantId)} className={styles.removeBtn}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Address Form (Google Form style) */}
            <div className="premium-card">
              <h3 className={styles.sectionHeading}>2. SHIPPING ADDRESS & CONTACT DETAILS</h3>
              
              {error && <p className={styles.errorBox}>{error}</p>}

              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">10-Digit Mobile Number *</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="9876543210"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Optional for Invoice & Updates)</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="yourname@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Flat / House No. / Building / Street Address *</label>
                <textarea 
                  className="form-input" 
                  rows={2}
                  placeholder="House No 123, Block B, Sunshine Apartments, Main Road"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">6-Digit Pincode *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="110001"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    required
                  />
                  {deliveryEstimate && (
                    <p className={styles.deliveryEstimateNotice}>✓ {deliveryEstimate}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="New Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Delhi"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Landmark (Optional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Near Metro Station"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group mt-2">
                <label className="form-label">Business GSTIN (Optional for Input Tax Credit)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="premium-card mt-4">
              <h3 className={styles.sectionHeading}>3. SELECT PAYMENT METHOD</h3>

              <div className={styles.paymentSelector}>
                <label className={`${styles.paymentOption} ${paymentMethod === 'PREPAID' ? styles.paymentOptionActive : ''}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    checked={paymentMethod === 'PREPAID'}
                    onChange={() => setPaymentMethod('PREPAID')}
                  />
                  <div>
                    <div className={styles.paymentOptionTitle}>
                      <span>Online Payment via PayU (UPI, Cards, NetBanking)</span>
                      <span className={styles.prepaidBadge}>FREE SHIPPING</span>
                    </div>
                    <p className={styles.paymentOptionDesc}>Pay securely via PayU with UPI QR, Google Pay, PhonePe, Cards or NetBanking.</p>
                  </div>
                </label>

                <label className={`${styles.paymentOption} ${paymentMethod === 'COD' ? styles.paymentOptionActive : ''}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div>
                    <div className={styles.paymentOptionTitle}>
                      <span>Cash on Delivery (COD)</span>
                      <span className={styles.codFeeBadge}>+₹99 COD FEE</span>
                    </div>
                    <p className={styles.paymentOptionDesc}>Pay in cash when your TV arrives at your doorstep.</p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className={styles.checkoutSummary}>
            <div className="premium-card">
              <h3 className="mb-4 text-cyan" style={{ fontSize: '1.3rem', fontWeight: 800 }}>ORDER SUMMARY</h3>

              <div className={styles.summaryRow}>
                <span>Items Subtotal</span>
                <span>₹{Math.round(total).toLocaleString('en-IN')}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Express Delivery</span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>FREE</span>
              </div>

              {paymentMethod === 'COD' && (
                <div className={styles.summaryRow}>
                  <span>COD Handling Fee</span>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>+₹99</span>
                </div>
              )}

              <div className={styles.summaryTotal}>
                <span>Total Amount</span>
                <span className="text-cyan">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="btn-pill-blue" 
                style={{ width: '100%', marginTop: '24px', padding: '16px 28px', fontSize: '1.05rem' }}
              >
                {loading ? 'PROCESSING...' : (paymentMethod === 'COD' ? 'PLACE COD ORDER' : 'PAY NOW VIA PAYU')}
              </button>
            </div>
          </div>

        </form>
      )}
    </div>
  )
}
