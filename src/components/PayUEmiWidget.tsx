"use client"
import { useEffect, useState, useMemo } from 'react'

interface PayUEmiWidgetProps {
  price: number
}

interface PayUPlan {
  code: string
  tenureMonths: number
  tenureLabel: string
  monthlyEmi: number
  annualInterestRate: number
  totalInterestPaid: number
  totalPayableAmount: number
  cardType: string
  isNoCost: boolean
}

interface BankEmiGroup {
  bankCode: string
  bankName: string
  minMonthlyEmi: number
  plans: PayUPlan[]
}

interface PayUEmiApiResponse {
  success: boolean
  source: string
  productAmount: number
  totalBanks: number
  minMonthlyEmi: number
  banks: BankEmiGroup[]
}

export default function PayUEmiWidget({ price }: PayUEmiWidgetProps) {
  const [isOfficialWidgetActive, setIsOfficialWidgetActive] = useState(false)
  const [showPlansModal, setShowPlansModal] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'credit' | 'debit' | 'cardless'>('credit')
  const [emiData, setEmiData] = useState<PayUEmiApiResponse | null>(null)
  const [selectedBankCode, setSelectedBankCode] = useState<string>('')
  const [loadingPlans, setLoadingPlans] = useState(false)

  const merchantKey = process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY || 'FF1Xgs'
  const roundedPrice = Math.round(price || 0)

  // 1. Fetch real live EMI data from PayU engine API
  useEffect(() => {
    if (!roundedPrice || roundedPrice < 500) return

    let isMounted = true
    setLoadingPlans(true)

    fetch(`/api/payu/emi-plans?amount=${roundedPrice}`)
      .then(res => res.json())
      .then((data: PayUEmiApiResponse) => {
        if (!isMounted) return
        if (data && data.success && Array.isArray(data.banks) && data.banks.length > 0) {
          setEmiData(data)
          setSelectedBankCode(prev => {
            // Keep selected if still valid, or default to first bank (e.g. HDFC/ICICI/SBI)
            if (prev && data.banks.some(b => b.bankCode === prev)) return prev
            return data.banks[0].bankCode
          })
        }
      })
      .catch(err => {
        console.warn('Failed to load PayU EMI plans:', err)
      })
      .finally(() => {
        if (isMounted) setLoadingPlans(false)
      })

    return () => {
      isMounted = false
    }
  }, [roundedPrice])

  // 2. Official PayU SDK iframe listener & initialiser
  useEffect(() => {
    if (typeof window === 'undefined' || !roundedPrice) return

    const handlePayuMessage = (event: MessageEvent) => {
      try {
        let data = event.data
        if (typeof data === 'string') {
          try { data = JSON.parse(data) } catch (e) {}
        }
        if (!data || typeof data !== 'object') return

        const evt = data.evt
        if (evt === 'UPDATE_LANDING_WIDGET') {
          const container = document.getElementById('payuWidget')
          const iframe = container?.querySelector('iframe')
          if (iframe && iframe.offsetHeight > 10) {
            setIsOfficialWidgetActive(true)
          }
        } else if (evt === 'CLOSE_LANDING_WIDGET') {
          setIsOfficialWidgetActive(false)
        }
      } catch (err) {}
    }

    window.addEventListener('message', handlePayuMessage)

    const tryInitPayUSDK = () => {
      // @ts-ignore
      const payuObj = window.payuAffordability
      const containerEl = document.getElementById('payuWidget')

      if (payuObj && typeof payuObj.init === 'function' && containerEl) {
        try {
          payuObj.init({
            key: merchantKey,
            amount: roundedPrice
          })

          setTimeout(() => {
            const iframe = containerEl.querySelector('iframe')
            if (iframe && iframe.offsetHeight > 20 && iframe.style.display !== 'none') {
              setIsOfficialWidgetActive(true)
            }
          }, 2000)
        } catch (err) {
          console.warn('PayU official SDK init failed:', err)
        }
        return true
      }
      return false
    }

    if (!tryInitPayUSDK()) {
      const scriptId = 'payu-affordability-sdk-script'
      let script = document.getElementById(scriptId) as HTMLScriptElement
      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.src = 'https://jssdk.payu.in/widget/affordability-widget.min.js'
        script.async = true
        script.onload = () => {
          tryInitPayUSDK()
        }
        document.head.appendChild(script)
      } else {
        tryInitPayUSDK()
      }
    }

    return () => {
      window.removeEventListener('message', handlePayuMessage)
    }
  }, [roundedPrice, merchantKey])

  // Get active bank details
  const activeBank = useMemo(() => {
    if (!emiData || !emiData.banks) return null
    return emiData.banks.find(b => b.bankCode === selectedBankCode) || emiData.banks[0] || null
  }, [emiData, selectedBankCode])

  // Lowest EMI calculation for badge
  const displayMinEmi = emiData?.minMonthlyEmi || Math.round(roundedPrice / 6)
  const totalBanksCount = emiData?.totalBanks || 18

  return (
    <div style={{ width: '100%', marginTop: '14px', marginBottom: '14px' }}>
      {/* Container for official PayU Affordability SDK iframe */}
      <div
        id="payuWidget"
        style={{
          width: '100%',
          display: isOfficialWidgetActive ? 'block' : 'none',
          minHeight: isOfficialWidgetActive ? '50px' : '0px'
        }}
      />

      {/* Real Live PayU EMI Bar */}
      {!isOfficialWidgetActive && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(56, 189, 248, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* PayU Badge */}
              <span
                style={{
                  background: '#0ea5e9',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.68rem',
                  letterSpacing: '0.6px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                PayU Verified EMI
              </span>

              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.18)',
                  color: '#10b981',
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  letterSpacing: '0.4px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}
              >
                No Cost EMI Available
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowPlansModal(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-cyan-light, #38bdf8)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 6px',
                borderRadius: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              View All {totalBanksCount} Banks →
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #94a3b8)' }}>EMI starting at</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.3px' }}>
                ₹{displayMinEmi.toLocaleString('en-IN')}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/month</span>
              </span>
            </div>

            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #64748b)' }}>
              HDFC, ICICI, SBI, Axis, Kotak &amp; {totalBanksCount - 5}+ major banks
            </span>
          </div>
        </div>
      )}

      {/* PayU Real EMI Plans Breakdown Modal */}
      {showPlansModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowPlansModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-secondary, #0f172a)',
              color: 'var(--text-primary, #ffffff)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
              borderRadius: '20px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      background: '#0ea5e9',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '0.65rem',
                      letterSpacing: '0.6px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}
                  >
                    PayU Affordability
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                    ● Live Bank Rates
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  EMI &amp; Financing Plans
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary, #94a3b8)' }}>
                  For product amount <strong style={{ color: 'var(--text-primary, #ffffff)' }}>₹{roundedPrice.toLocaleString('en-IN')}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPlansModal(false)}
                aria-label="Close"
                style={{
                  background: 'var(--bg-tertiary, rgba(255, 255, 255, 0.06))',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', paddingBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedTab('credit')}
                style={{
                  background: selectedTab === 'credit' ? 'var(--accent-cyan-light, #38bdf8)' : 'transparent',
                  color: selectedTab === 'credit' ? '#0f172a' : 'var(--text-secondary, #94a3b8)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Credit Card EMI ({totalBanksCount} Banks)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('debit')}
                style={{
                  background: selectedTab === 'debit' ? 'var(--accent-cyan-light, #38bdf8)' : 'transparent',
                  color: selectedTab === 'debit' ? '#0f172a' : 'var(--text-secondary, #94a3b8)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Debit Card EMI
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('cardless')}
                style={{
                  background: selectedTab === 'cardless' ? 'var(--accent-cyan-light, #38bdf8)' : 'transparent',
                  color: selectedTab === 'cardless' ? '#0f172a' : 'var(--text-secondary, #94a3b8)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cardless / PayLater
              </button>
            </div>

            {/* Tab 1: Credit Card EMI with Bank Selector and Real PayU Plans */}
            {selectedTab === 'credit' && (
              <div>
                {/* Bank Selector Horizontal Strip */}
                {emiData?.banks && emiData.banks.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted, #94a3b8)', marginBottom: '8px', fontWeight: 800 }}>
                      Select Your Bank:
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        overflowX: 'auto',
                        paddingBottom: '8px',
                        scrollbarWidth: 'thin'
                      }}
                    >
                      {emiData.banks.map((bank) => {
                        const isSelected = (activeBank?.bankCode === bank.bankCode)
                        return (
                          <button
                            key={bank.bankCode}
                            type="button"
                            onClick={() => setSelectedBankCode(bank.bankCode)}
                            style={{
                              whiteSpace: 'nowrap',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: isSelected ? 800 : 600,
                              background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-card, rgba(255, 255, 255, 0.04))',
                              border: isSelected ? '1px solid var(--accent-cyan-light, #38bdf8)' : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                              color: isSelected ? 'var(--accent-cyan-light, #38bdf8)' : 'var(--text-secondary, #cbd5e1)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {bank.bankName}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Plans Table for Selected Bank */}
                {activeBank && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {activeBank.bankName} EMI Rates
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700 }}>
                        Calculated directly via PayU Engine
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeBank.plans.map((p) => (
                        <div
                          key={p.code}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            background: p.isNoCost ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card, rgba(255, 255, 255, 0.04))',
                            border: p.isNoCost ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                            borderRadius: '12px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                                ₹{p.monthlyEmi.toLocaleString('en-IN')}/mo
                              </span>
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                for {p.tenureLabel}
                              </span>
                              {p.isNoCost && (
                                <span
                                  style={{
                                    background: '#10b981',
                                    color: '#ffffff',
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}
                                >
                                  NO COST
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                              {p.isNoCost
                                ? '0% Bank Interest • No extra charges'
                                : `Interest: ${p.annualInterestRate}% p.a. (+₹${p.totalInterestPaid.toLocaleString('en-IN')}) • Total: ₹${p.totalPayableAmount.toLocaleString('en-IN')}`}
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              color: p.isNoCost ? '#10b981' : 'var(--accent-cyan-light, #38bdf8)',
                              background: 'rgba(0, 0, 0, 0.25)',
                              padding: '4px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            {p.isNoCost ? 'Zero Interest' : `${p.annualInterestRate}% p.a.`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Debit Card EMI */}
            {selectedTab === 'debit' && (
              <div
                style={{
                  padding: '18px 16px',
                  background: 'var(--bg-card, rgba(255, 255, 255, 0.04))',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))'
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Eligible Debit Card EMI Providers
                </h4>
                <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Debit Card EMI is available for pre-approved customers holding accounts with <strong>HDFC Bank, ICICI Bank, Axis Bank, and Federal Bank</strong> via PayU.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', marginBottom: '14px' }}>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary, rgba(0,0,0,0.3))', borderRadius: '8px' }}>
                    <strong>HDFC Bank:</strong> SMS <code>MYHDFC</code> to <code>5676712</code> to check eligibility.
                  </div>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary, rgba(0,0,0,0.3))', borderRadius: '8px' }}>
                    <strong>ICICI Bank:</strong> SMS <code>DCEMI &lt;Last 4 digits of Debit Card&gt;</code> to <code>5676766</code>.
                  </div>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary, rgba(0,0,0,0.3))', borderRadius: '8px' }}>
                    <strong>Axis Bank:</strong> SMS <code>DCEMI &lt;Last 4 digits of Debit Card&gt;</code> to <code>56161600</code>.
                  </div>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary, rgba(0,0,0,0.3))', borderRadius: '8px' }}>
                    <strong>Federal Bank:</strong> SMS <code>DC &lt;Space&gt; EMI</code> to <code>9895088888</code>.
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Cardless / PayLater */}
            {selectedTab === 'cardless' && (
              <div
                style={{
                  padding: '18px 16px',
                  background: 'var(--bg-card, rgba(255, 255, 255, 0.04))',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))'
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  PayLater &amp; Cardless Credit via PayU
                </h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Instant digital credit lines with zero physical paperwork at checkout:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                    <strong>LazyPay (Official PayU Credit)</strong>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>Instant OTP Approval</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                    <strong>ZestMoney</strong>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>3 - 12 Month Flexible EMIs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <strong>Simpl / KreditBee</strong>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>3-part zero-interest split</span>
                  </div>
                </div>
              </div>
            )}

            {/* Supported Banks Strip */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
                marginBottom: '16px'
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: 'var(--text-muted, #94a3b8)',
                  marginBottom: '6px'
                }}
              >
                Supported Issuing Banks (PayU Gateway):
              </span>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
                HDFC Bank • ICICI Bank • State Bank of India • Axis Bank • Kotak Mahindra • OneCard • Federal Bank • Bank of Baroda • IndusInd Bank • IDFC FIRST • RBL Bank • YES Bank • HSBC • Standard Chartered • AU Small Finance Bank
              </p>
            </div>

            {/* Modal Bottom Action Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))'
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)' }}>
                👉 Select <strong>PayU</strong> at checkout to choose your bank and EMI tenure.
              </span>
              <button
                type="button"
                onClick={() => setShowPlansModal(false)}
                className="btn-primary"
                style={{
                  padding: '8px 20px',
                  fontSize: '0.82rem',
                  borderRadius: '50px'
                }}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
