"use client"

import { useState } from 'react'

export default function InventoryManager({ initialVariants }: { initialVariants: any[] }) {
  const [variants, setVariants] = useState(initialVariants)
  const [searchQuery, setSearchQuery] = useState('')
  const [scannedCode, setScannedCode] = useState('')
  const [scanMessage, setScanMessage] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [csvStatus, setCsvStatus] = useState<string | null>(null)

  // Filtered variants
  const filteredVariants = variants.filter(v => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const title = (v.product?.title || '').toLowerCase()
    const series = (v.product?.series || '').toLowerCase()
    const name = (v.name || '').toLowerCase()
    const barcode = (v.barcode || '').toLowerCase()
    const sku = (v.sku || '').toLowerCase()
    return title.includes(q) || series.includes(q) || name.includes(q) || barcode.includes(q) || sku.includes(q)
  })

  // Handle direct stock adjustment
  const handleQuantityChange = async (variantId: string, newQty: number, barcode?: string, sku?: string) => {
    setSavingId(variantId)
    const qty = Math.max(0, newQty)

    // Optimistic UI update
    setVariants(prev => prev.map(v => {
      if (v.id === variantId) {
        const threshold = v.lowStockThreshold || 5
        let stockStatus = 'In Stock'
        if (qty === 0) stockStatus = 'Out of Stock'
        else if (qty <= threshold) stockStatus = 'Low Stock'
        return {
          ...v,
          stockQuantity: qty,
          stockStatus,
          ...(barcode !== undefined ? { barcode } : {}),
          ...(sku !== undefined ? { sku } : {})
        }
      }
      return v
    }))

    try {
      const current = variants.find(v => v.id === variantId)
      await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          stockQuantity: qty,
          barcode: barcode !== undefined ? barcode : current?.barcode,
          sku: sku !== undefined ? sku : current?.sku,
          lowStockThreshold: current?.lowStockThreshold || 5
        })
      })
    } catch (e) {
      alert('Failed to save stock update')
    } finally {
      setSavingId(null)
    }
  }

  // Barcode Scanner Handler (software / hardware scanner submit)
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault()
    const code = scannedCode.trim()
    if (!code) return

    const match = variants.find(v => 
      (v.barcode && v.barcode.toLowerCase() === code.toLowerCase()) || 
      (v.sku && v.sku.toLowerCase() === code.toLowerCase())
    )

    if (match) {
      setSearchQuery(code)
      setScanMessage(`✓ Barcode Match Found: ${match.product?.title} (${match.name})`)
    } else {
      setScanMessage(`⚠️ No product found registered with Barcode / SKU: "${code}"`)
    }
    setScannedCode('')
  }

  // Handle CSV Bulk Upload
  const handleCsvImport = async () => {
    if (!csvText.trim()) {
      alert('Please paste CSV content or select a file')
      return
    }

    setCsvStatus('Processing bulk import...')
    const lines = csvText.split('\n')
    const items: Array<{ barcode?: string; sku?: string; stockQuantity: number }> = []

    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim())
      if (parts.length >= 2) {
        const code = parts[0]
        const qty = parseInt(parts[1], 10)
        if (code && !isNaN(qty)) {
          if (code.startsWith('HOI') || code.includes('-')) {
            items.push({ sku: code, stockQuantity: qty })
          } else {
            items.push({ barcode: code, stockQuantity: qty })
          }
        }
      }
    })

    if (items.length === 0) {
      setCsvStatus('⚠️ No valid rows found in CSV. Expected format: barcode,quantity (e.g. 8901234567890,25)')
      return
    }

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      const data = await res.json()
      if (data.success) {
        setCsvStatus(`✓ Successfully updated ${data.updatedCount} products out of ${data.totalReceived} items!`)
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setCsvStatus(`Error: ${data.error}`)
      }
    } catch (e) {
      setCsvStatus('Failed to upload CSV inventory')
    }
  }

  // Export Inventory to CSV
  const handleExportCsv = () => {
    const headers = ['Series', 'Model Title', 'Variant Size', 'SKU', 'Barcode', 'Stock Quantity', 'Stock Status', 'Price ₹']
    const rows = variants.map(v => [
      `"${v.product?.series || ''}"`,
      `"${v.product?.title || ''}"`,
      `"${v.name || ''}"`,
      `"${v.sku || ''}"`,
      `"${v.barcode || ''}"`,
      v.stockQuantity || 0,
      `"${v.stockStatus || ''}"`,
      v.price || 0
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `HAUS_Inventory_Export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* TOP ACTION BAR & BARCODE SCANNER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Hardware / Software Barcode Scanner Input */}
        <div className="premium-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent-cyan)' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'block', marginBottom: '8px' }}>
            ⚡ BARCODE SCANNER LOOKUP
          </label>
          <form onSubmit={handleBarcodeScan} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Scan Barcode or SKU with scanner software..."
              value={scannedCode}
              onChange={e => setScannedCode(e.target.value)}
              style={{ flex: 1, minWidth: '180px', borderColor: 'var(--accent-cyan)' }}
              autoFocus
            />
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Scan / Find
            </button>
          </form>
          {scanMessage && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.82rem', color: scanMessage.startsWith('✓') ? '#4ade80' : '#facc15' }}>
              {scanMessage}
            </p>
          )}
        </div>

        {/* Search & Bulk CSV Tools */}
        <div className="premium-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by Title, Series, Barcode, or SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => { setSearchQuery(''); setScanMessage(null); }}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '8px 12px' }}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => setIsCsvModalOpen(true)} 
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '8px 14px', flex: 1, minWidth: '140px' }}
            >
              📥 Import CSV / Excel Stock
            </button>
            <button 
              type="button" 
              onClick={handleExportCsv} 
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '8px 14px', flex: 1, minWidth: '140px' }}
            >
              📤 Export Inventory CSV
            </button>
          </div>
        </div>

      </div>

      {/* MAIN INVENTORY & BARCODE TABLE */}
      <div className="premium-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>
            Variant Inventory Stock & Barcode Matrix
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Showing {filteredVariants.length} of {variants.length} total variants
          </span>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', minWidth: '700px', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Series / Model</th>
              <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Variant Size</th>
              <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>SKU Code</th>
              <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Barcode / EAN</th>
              <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Stock Quantity</th>
              <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Stock Status</th>
              <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Price ₹</th>
            </tr>
          </thead>
          <tbody>
            {filteredVariants.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Series & Title */}
                <td style={{ padding: '14px 10px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {v.product?.title}
                  </div>
                  <span className="text-gold" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    {v.product?.series}
                  </span>
                </td>

                {/* Size */}
                <td style={{ padding: '14px 10px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                  {v.name}
                </td>

                {/* SKU */}
                <td style={{ padding: '14px 10px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. HOI-C-43"
                    value={v.sku || ''}
                    onChange={e => {
                      const val = e.target.value
                      setVariants(prev => prev.map(item => item.id === v.id ? { ...item, sku: val } : item))
                    }}
                    onBlur={e => handleQuantityChange(v.id, v.stockQuantity, v.barcode, e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '6px 10px', width: '130px' }}
                  />
                </td>

                {/* Barcode */}
                <td style={{ padding: '14px 10px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Scan / Type Barcode"
                    value={v.barcode || ''}
                    onChange={e => {
                      const val = e.target.value
                      setVariants(prev => prev.map(item => item.id === v.id ? { ...item, barcode: val } : item))
                    }}
                    onBlur={e => handleQuantityChange(v.id, v.stockQuantity, e.target.value, v.sku)}
                    style={{ fontSize: '0.82rem', padding: '6px 10px', width: '160px', borderColor: v.barcode ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255,255,255,0.1)' }}
                  />
                </td>

                {/* Stock Quantity Controls */}
                <td style={{ padding: '14px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button 
                      type="button" 
                      onClick={() => handleQuantityChange(v.id, (v.stockQuantity || 0) - 1)}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', fontWeight: 800 }}
                    >
                      -
                    </button>
                    
                    <input 
                      type="number" 
                      className="form-input"
                      value={v.stockQuantity ?? 0}
                      onChange={e => handleQuantityChange(v.id, Number(e.target.value))}
                      style={{ width: '65px', textAlign: 'center', fontWeight: 800, fontSize: '0.92rem', padding: '4px' }}
                    />

                    <button 
                      type="button" 
                      onClick={() => handleQuantityChange(v.id, (v.stockQuantity || 0) + 1)}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', fontWeight: 800 }}
                    >
                      +
                    </button>

                    <button 
                      type="button" 
                      onClick={() => handleQuantityChange(v.id, (v.stockQuantity || 0) + 10)}
                      className="btn-secondary"
                      style={{ padding: '4px 6px', fontSize: '0.72rem' }}
                      title="Add 10 Units"
                    >
                      +10
                    </button>
                  </div>
                </td>

                {/* Stock Status Badge */}
                <td style={{ padding: '14px 10px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '50px', 
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    background: v.stockStatus === 'Out of Stock' ? 'rgba(255, 77, 77, 0.15)' : v.stockStatus === 'Low Stock' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    color: v.stockStatus === 'Out of Stock' ? '#ff4d4d' : v.stockStatus === 'Low Stock' ? '#facc15' : '#4ade80',
                    border: v.stockStatus === 'Out of Stock' ? '1px solid rgba(255, 77, 77, 0.3)' : v.stockStatus === 'Low Stock' ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    {v.stockStatus || 'In Stock'}
                  </span>
                </td>

                {/* Price */}
                <td style={{ padding: '14px 10px', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.92rem' }}>
                  ₹{Math.round(v.price).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* CSV / EXCEL BULK IMPORT MODAL */}
      {isCsvModalOpen && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.85)', 
          backdropFilter: 'blur(8px)', 
          zIndex: 9999, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="premium-card" style={{ width: '100%', maxWidth: '650px', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.4rem' }}>
                📥 Bulk Import Inventory (CSV / Excel)
              </h3>
              <button 
                type="button" 
                onClick={() => setIsCsvModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Paste comma-separated rows in format: <code style={{ color: 'var(--accent-cyan)' }}>barcode,quantity</code> or <code style={{ color: 'var(--accent-cyan)' }}>sku,quantity</code>
            </p>

            <textarea 
              rows={8}
              className="form-input"
              placeholder={`Example:\n8901234567890,25\n8909876543210,12\nHOI-C-43-1GB,50`}
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '0.88rem', width: '100%', marginBottom: '16px' }}
            />

            {csvStatus && (
              <p style={{ 
                fontSize: '0.85rem', 
                marginBottom: '16px', 
                color: csvStatus.startsWith('✓') ? '#4ade80' : csvStatus.startsWith('Error') || csvStatus.startsWith('⚠️') ? '#ff4d4d' : 'var(--text-secondary)' 
              }}>
                {csvStatus}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setIsCsvModalOpen(false)} 
                className="btn-secondary"
                style={{ padding: '10px 20px' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleCsvImport} 
                className="btn-primary"
                style={{ padding: '10px 24px' }}
              >
                Apply Inventory Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
