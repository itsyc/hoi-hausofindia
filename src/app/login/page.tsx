"use client"
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function LoginPage() {
  const [isAdminTab, setIsAdminTab] = useState(false)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [devOtpHint, setDevOtpHint] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      })

      const data = await res.json()
      if (res.ok) {
        setOtpSent(true)
        setDevOtpHint(data.devOtp || '123456')
      } else {
        setError(data.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10)
      const res = await signIn('phone-otp', {
        phone: cleanPhone,
        otp: otp.trim(),
        redirect: false
      })

      if (res?.error) {
        setError('Invalid OTP code. Please try again.')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await signIn('admin-credentials', {
        email,
        password,
        redirect: false
      })

      if (res?.error) {
        setError('Invalid Admin credentials')
      } else {
        router.push('/admin')
      }
    } catch (err) {
      setError('Admin login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`container ${styles.authContainer}`}>
      <div className={`premium-card ${styles.authCard}`}>
        {/* Top Tab Switcher */}
        <div className={styles.tabBar}>
          <button 
            type="button"
            className={`${styles.tabBtn} ${!isAdminTab ? styles.tabActive : ''}`}
            onClick={() => { setIsAdminTab(false); setError(''); }}
          >
            CUSTOMER LOGIN (OTP)
          </button>
          <button 
            type="button"
            className={`${styles.tabBtn} ${isAdminTab ? styles.tabActive : ''}`}
            onClick={() => { setIsAdminTab(true); setError(''); }}
          >
            ADMIN ACCESS
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {!isAdminTab ? (
          /* CUSTOMER OTP LOGIN */
          <div>
            <h2 className={styles.authTitle}>Quick Mobile Verification</h2>
            <p className={styles.authDesc}>No password required. Enter your 10-digit mobile number to log in.</p>

            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <div className={styles.phoneInputRow}>
                    <span className={styles.phoneCode}>+91</span>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="9876543210"
                      maxLength={10}
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                      required 
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  {loading ? 'Sending OTP...' : 'GET OTP VERIFICATION CODE'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className={styles.otpNoticeBox}>
                  <p>OTP sent to <strong>+91 {phone}</strong></p>
                  {devOtpHint && (
                    <p className={styles.devHint}>Dev Test OTP Code: <strong>{devOtpHint}</strong></p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Enter 6-Digit OTP</label>
                  <input 
                    type="text" 
                    className="form-input text-center" 
                    placeholder="1 2 3 4 5 6"
                    maxLength={6}
                    style={{ letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 800 }}
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                    required 
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  {loading ? 'Verifying...' : 'VERIFY & CONTINUE'}
                </button>

                <button 
                  type="button" 
                  onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                  className={styles.resendBtn}
                >
                  Change Mobile Number
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ADMIN LOGIN */
          <div>
            <h2 className={styles.authTitle}>Administrator Portal</h2>
            <p className={styles.authDesc}>Sign in with admin credentials to manage products and orders.</p>

            <form onSubmit={handleAdminLogin}>
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="admin@hausofindia.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Admin Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                {loading ? 'Authenticating...' : 'SIGN IN TO DASHBOARD'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
