"use client"

import { useState } from 'react'

const STAGES = [
  { key: 'ORDER_PLACED', label: 'ORDER PLACED' },
  { key: 'CONFIRMED', label: 'CONFIRMED' },
  { key: 'SHIPPED', label: 'DISPATCHED' },
  { key: 'OUT_FOR_DELIVERY', label: 'OUT FOR DELIVERY' },
  { key: 'DELIVERED', label: 'DELIVERED' }
]

export default function OrderAdminClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [courier, setCourier] = useState('')
  const [tracking, setTracking] = useState('')
  const [updating, setUpdating] = useState(false)

  // State for Barcode Replacement Modal
  const [replaceModal, setReplaceModal] = useState<{ orderId: string; item: any } | null>(null)
  const [newBarcodeVal, setNewBarcodeVal] = useState('')
  const [selectedReason, setSelectedReason] = useState('Defective Product')
  const [customReasonVal, setCustomReasonVal] = useState('')
  const [replacing, setReplacing] = useState(false)

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, deliveryStatus: newStatus })
      })

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryStatus: newStatus } : o))
      }
    } catch (e) {
      alert("Failed to update status")
    }
  }

  const handleSaveTracking = async (orderId: string) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, courierPartner: courier, trackingNumber: tracking })
      })

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, courierPartner: courier, trackingNumber: tracking } : o))
        setEditingId(null)
      }
    } catch (e) {
      alert("Failed to save tracking details")
    } finally {
      setUpdating(false)
    }
  }

  const handleExecuteBarcodeReplace = async (includeReason: boolean) => {
    if (!replaceModal) return
    const val = newBarcodeVal.trim()
    if (!val) {
      alert('Please scan or enter the new barcode number')
      return
    }

    const finalReason = includeReason
      ? (selectedReason === 'Other' ? (customReasonVal.trim() || 'Other') : selectedReason)
      : undefined

    setReplacing(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: replaceModal.orderId,
          scannedBarcodes: [{ 
            orderItemId: replaceModal.item.id, 
            barcode: val,
            reason: finalReason 
          }]
        })
      })

      const data = await res.json()
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === replaceModal.orderId ? data.order : o))
        setReplaceModal(null)
      } else {
        alert(data.error || data.message || 'Failed to replace barcode')
      }
    } catch (e) {
      alert('Failed to replace barcode')
    } finally {
      setReplacing(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '4px' }}>CUSTOMER ORDERS MANAGEMENT</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Track, manage shipping status, and export customer order records.</p>
        </div>

        <a 
          href="/api/admin/orders?export=csv" 
          download
          className="btn-primary"
          style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: '#ffffff', fontWeight: 800, padding: '12px 24px', borderRadius: '50px' }}
        >
          📥 EXPORT ORDERS TO CSV (EXCEL)
        </a>
      </div>

      <div className="premium-card" style={{ overflowX: 'auto', padding: '16px' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px 12px' }}>ORDER ID</th>
              <th style={{ padding: '14px 12px' }}>CUSTOMER DETAILS</th>
              <th style={{ padding: '14px 12px' }}>SHIPPING ADDRESS</th>
              <th style={{ padding: '14px 12px' }}>PAYMENT</th>
              <th style={{ padding: '14px 12px' }}>TOTAL</th>
              <th style={{ padding: '14px 12px' }}>DELIVERY STATUS</th>
              <th style={{ padding: '14px 12px' }}>COURIER / AWB TRACKING</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.9rem' }}>
                
                {/* Order ID & Date */}
                <td style={{ padding: '16px 12px', verticalAlign: 'top' }}>
                  <strong style={{ color: 'var(--accent-cyan-light)', fontSize: '1rem', display: 'block' }}>
                    #{order.orderNumber}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </td>

                {/* Customer Details & Order Items */}
                <td style={{ padding: '16px 12px', verticalAlign: 'top', color: 'var(--text-primary)', maxWidth: '280px' }}>
                  <strong>{order.customerName}</strong><br/>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📞 {order.customerPhone}</span><br/>
                  {order.customerEmail && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>✉️ {order.customerEmail}</span>}
                  
                  {/* Order Items Breakdown & Barcode Scanner Assignment */}
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan-light)', marginBottom: '6px' }}>
                      ORDER ITEMS ({order.orderItems?.length || 0}):
                    </div>
                    {order.orderItems?.map((item: any) => (
                      <div key={item.id} style={{ 
                        marginBottom: '8px', 
                        background: 'rgba(0,0,0,0.3)', 
                        padding: '8px', 
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                          • {item.title} ({item.size || 'Default'}) x{item.quantity}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                          ₹{Math.round(item.price).toLocaleString('en-IN')}
                        </div>

                        {/* Unit Barcode Assignment & Replace Button */}
                        <div style={{ marginTop: '6px' }}>
                          {item.scannedBarcode ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                ✓ Barcode: {item.scannedBarcode}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setReplaceModal({ orderId: order.id, item })
                                  setNewBarcodeVal('')
                                  setSelectedReason('Defective Product')
                                  setCustomReasonVal('')
                                }}
                                style={{ 
                                  fontSize: '0.7rem', 
                                  color: '#38bdf8', 
                                  background: 'rgba(56,189,248,0.12)', 
                                  border: '1px solid rgba(56,189,248,0.3)',
                                  padding: '2px 8px', 
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                                title="Change or replace barcode"
                              >
                                ✎ Change
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                              <input 
                                type="text"
                                className="form-input"
                                placeholder="Scan Box Barcode..."
                                id={`barcode-input-${item.id}`}
                                style={{ fontSize: '0.75rem', padding: '4px 8px', width: '130px' }}
                              />
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ fontSize: '0.72rem', padding: '4px 8px', whiteSpace: 'nowrap' }}
                                onClick={async () => {
                                  const inputEl = document.getElementById(`barcode-input-${item.id}`) as HTMLInputElement
                                  const val = inputEl?.value?.trim()
                                  if (!val) { alert('Please scan or type a barcode'); return; }

                                  try {
                                    const res = await fetch('/api/admin/orders', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        orderId: order.id,
                                        scannedBarcodes: [{ orderItemId: item.id, barcode: val }]
                                      })
                                    })
                                    const data = await res.json()
                                    if (data.success) {
                                      setOrders(prev => prev.map(o => o.id === order.id ? data.order : o))
                                    } else {
                                      alert(data.error || 'Failed to attach barcode')
                                    }
                                  } catch(e) { alert('Failed to attach barcode') }
                                }}
                              >
                                Attach
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>

                {/* Shipping Address */}
                <td style={{ padding: '16px 12px', verticalAlign: 'top', color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '240px' }}>
                  {order.shippingAddress}, {order.city}, {order.state} - <strong>{order.pincode}</strong>
                  {order.gstin && <div style={{ color: '#fbbf24', marginTop: '4px', fontWeight: 600 }}>GSTIN: {order.gstin}</div>}
                </td>

                {/* Payment */}
                <td style={{ padding: '16px 12px', verticalAlign: 'top' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '50px', 
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: order.paymentMethod === 'COD' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                    color: order.paymentMethod === 'COD' ? '#f59e0b' : '#34d399',
                    border: `1px solid ${order.paymentMethod === 'COD' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(52, 211, 153, 0.3)'}`
                  }}>
                    {order.paymentMethod === 'COD' ? 'COD' : 'PREPAID'}
                  </span>
                </td>

                {/* Total Amount */}
                <td style={{ padding: '16px 12px', verticalAlign: 'top', fontWeight: 800, color: 'var(--accent-cyan-light)' }}>
                  ₹{Math.round(order.totalAmount).toLocaleString('en-IN')}
                </td>

                {/* Delivery Status Selector */}
                <td style={{ padding: '16px 12px', verticalAlign: 'top' }}>
                  <select
                    value={order.deliveryStatus || 'ORDER_PLACED'}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {STAGES.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </td>

                {/* Courier Partner & AWB */}
                <td style={{ padding: '16px 12px', verticalAlign: 'top' }}>
                  {editingId === order.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input 
                        type="text"
                        placeholder="Courier Partner"
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        value={courier}
                        onChange={(e) => setCourier(e.target.value)}
                      />
                      <input 
                        type="text"
                        placeholder="AWB Tracking Number"
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        value={tracking}
                        onChange={(e) => setTracking(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <button 
                          onClick={() => handleSaveTracking(order.id)}
                          disabled={updating}
                          style={{ background: '#2563eb', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {order.trackingNumber ? (
                        <div style={{ fontSize: '0.82rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{order.courierPartner || 'Courier'}</span><br/>
                          <strong style={{ color: '#34d399' }}>{order.trackingNumber}</strong>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No tracking AWB</span>
                      )}
                      <button 
                        onClick={() => {
                          setEditingId(order.id)
                          setCourier(order.courierPartner || 'Delhivery')
                          setTracking(order.trackingNumber || '')
                        }}
                        style={{ display: 'block', marginTop: '6px', color: 'var(--accent-cyan-light)', fontSize: '0.75rem', textDecoration: 'underline' }}
                      >
                        {order.trackingNumber ? 'Edit AWB' : '+ Add AWB Tracking'}
                      </button>
                    </div>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Small Ignorable Barcode Replacement Modal */}
      {replaceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border-hover)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Change Unit Barcode
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {replaceModal.item.title} ({replaceModal.item.size || 'Default'})
                </span>
              </div>
              <button
                onClick={() => setReplaceModal(null)}
                style={{ fontSize: '1.2rem', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            {/* Current Barcode Box */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.82rem', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Current Barcode: </span>
              <strong style={{ color: '#f59e0b' }}>{replaceModal.item.scannedBarcode}</strong>
            </div>

            {/* New Barcode Input */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                New Barcode Number *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Scan or type new barcode..."
                value={newBarcodeVal}
                onChange={(e) => setNewBarcodeVal(e.target.value)}
                autoFocus
                style={{ fontSize: '0.9rem', padding: '10px 14px' }}
              />
            </div>

            {/* Ignorable Reason Selection */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Reason for Change:</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Optional / Ignorable)</span>
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                {[
                  { id: 'Defective Product', label: '🛠️ Defective Product' },
                  { id: 'Different Variant', label: '🔄 Different Variant' },
                  { id: 'Wrong Barcode', label: '✏️ Entry Error' },
                  { id: 'Other', label: '❓ Other Reason' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedReason(r.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      border: `1px solid ${selectedReason === r.id ? 'var(--accent-cyan-light)' : 'var(--border-subtle)'}`,
                      background: selectedReason === r.id ? 'var(--accent-cyan-glow)' : 'var(--input-bg)',
                      color: selectedReason === r.id ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {selectedReason === 'Other' && (
                <input
                  type="text"
                  className="form-input"
                  placeholder="Specify reason..."
                  value={customReasonVal}
                  onChange={(e) => setCustomReasonVal(e.target.value)}
                  style={{ fontSize: '0.82rem', padding: '8px 12px', marginTop: '6px' }}
                />
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setReplaceModal(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '50px',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  background: 'transparent',
                  border: '1px solid var(--border-pill)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={replacing}
                onClick={() => handleExecuteBarcodeReplace(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '50px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-strong)',
                  cursor: 'pointer'
                }}
              >
                Skip Reason & Update
              </button>

              <button
                type="button"
                disabled={replacing}
                onClick={() => handleExecuteBarcodeReplace(true)}
                className="btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}
              >
                {replacing ? 'Updating...' : 'Update Barcode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

