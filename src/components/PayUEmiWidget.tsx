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
    <div style={{ margin: '16px 0', minHeight: isEmpty ? 'auto' : '40px' }}>
      {/* Official PayU Widget Container (ID must be 'payuWidget') */}
      <div id="payuWidget" style={{ width: '100%' }}></div>

      {/* Sleek customer-facing financing badge if PayU iframe is pending or not injected */}
      {isEmpty && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '12px',
          padding: '10px 14px',
          fontSize: '0.84rem',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '1.1rem' }}>💳</span>
          <div>
            <strong>Easy EMI from ₹{Math.round(price / 12).toLocaleString('en-IN')}/mo</strong>
            <span style={{ color: 'var(--text-secondary)', marginLeft: '6px', fontSize: '0.78rem' }}>
              • No Cost & Standard EMI options at checkout
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
