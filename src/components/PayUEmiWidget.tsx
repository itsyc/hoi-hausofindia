"use client"
import { useEffect, useState } from 'react'

interface PayUEmiWidgetProps {
  price: number
}

export default function PayUEmiWidget({ price }: PayUEmiWidgetProps) {
  const [isEmpty, setIsEmpty] = useState(false)
  const merchantKey = process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY || 'FF1Xgs'

  useEffect(() => {
    if (typeof window === 'undefined' || !price) return

    const tryInitWidget = () => {
      // @ts-ignore
      const payuObj = window.payuAffordability
      const containerEl = document.getElementById('payuWidget')

      if (payuObj && typeof payuObj.init === 'function' && containerEl) {
        const config = {
          key: merchantKey,
          amount: String(Math.round(price)),
          env: process.env.NEXT_PUBLIC_PAYU_ENV || 'test'
        }
        console.log('✅ PayU Affordability SDK initializing with config:', config)
        try {
          payuObj.init(config)

          // Check if PayU SDK injected any content into container after 2 seconds
          setTimeout(() => {
            if (containerEl.children.length === 0 && !containerEl.innerText.trim()) {
              console.warn('⚠️ PayU Widget container #payuWidget remains empty after init. Verify KAM activation for Key:', merchantKey)
              setIsEmpty(true)
            } else {
              setIsEmpty(false)
            }
          }, 2000)
        } catch (err) {
          console.error('❌ PayU Affordability init failed:', err)
          setIsEmpty(true)
        }
        return true
      }
      return false
    }

    if (tryInitWidget()) return

    // Inject PayU SDK script
    const scriptId = 'payu-affordability-sdk-script'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://jssdk.payu.in/widget/affordability-widget.min.js'
      script.async = true
      script.onload = () => {
        console.log('✅ PayU SDK script loaded into DOM head')
        tryInitWidget()
      }
      script.onerror = (e) => {
        console.error('❌ Failed to load PayU SDK script from PayU servers', e)
        setIsEmpty(true)
      }
      document.head.appendChild(script)
    }

    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      if (tryInitWidget() || attempts >= 20) {
        clearInterval(interval)
      }
    }, 500)

    return () => {
      clearInterval(interval)
    }
  }, [price, merchantKey])

  if (!price || price <= 0) return null

  return (
    <div style={{ margin: '20px 0', minHeight: '60px' }}>
      {/* Official PayU Widget Container (ID must be 'payuWidget') */}
      <div id="payuWidget" style={{ width: '100%', minHeight: '60px' }}></div>

      {/* Notice shown ONLY if PayU SDK is empty due to unactivated Merchant Key */}
      {isEmpty && (
        <div style={{
          background: 'rgba(37, 99, 235, 0.06)',
          border: '1px border-dashed rgba(6, 182, 212, 0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary, #94a3b8)',
          marginTop: '8px'
        }}>
          💳 <strong>PayU EMI & Offers:</strong> PayU Affordability Widget is initialized for Merchant Key <code>{merchantKey}</code>. 
          <em>(If widget does not render, contact your PayU KAM to enable the Affordability feature on your PayU account).</em>
        </div>
      )}
    </div>
  )
}
