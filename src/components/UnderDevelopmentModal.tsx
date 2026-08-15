'use client'

import { useState, useEffect } from 'react'
import styles from './UnderDevelopmentModal.module.css'

export default function UnderDevelopmentModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Check if dismissed during current session
    const dismissed = sessionStorage.getItem('hoi_under_dev_dismissed')
    if (!dismissed) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    sessionStorage.setItem('hoi_under_dev_dismissed', 'true')
    setIsOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    if (!email.trim() && !phone.trim()) {
      setErrorMsg('Please enter your email or phone number.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/notify-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim() }),
      })
      const data = await res.json()

      if (res.ok) {
        setSuccessMsg(data.message || "Thank you! We'll keep you updated.")
        setEmail('')
        setPhone('')
        setTimeout(() => {
          handleClose()
        }, 2200)
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setErrorMsg('Failed to submit. Please check your network connection.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const whatsappMessage = encodeURIComponent(
    'Hi HAUS OF INDIA! I am visiting your website and would like to get details/prices for your TV lineup.'
  )
  const whatsappUrl = `https://wa.me/917339941812?text=${whatsappMessage}`

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.topGlowHalo}></div>

        {/* Top Close Icon */}
        <button className={styles.closeBtn} onClick={handleClose} title="Close & Browse Site">
          ✕
        </button>

        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <span className={styles.pulseDot}></span>
            Under Development
          </div>

          <h2 className={styles.title}>We’re Fine-Tuning Our Lineup!</h2>
          <p className={styles.description}>
            Our website is currently under active development as we update prices, variants, and product images.{' '}
            <span className={styles.highlightLineup}>You can still explore our full TV lineup below!</span>
          </p>
        </div>

        {/* WhatsApp Direct Action Button */}
        <div className={styles.whatsappSection}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappBtn}
          >
            <svg className={styles.whatsappIcon} viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            Chat on WhatsApp for Enquiries
          </a>
        </div>

        {/* Optional Lead Form */}
        <form onSubmit={handleSubmit} className={styles.formBox}>
          <div className={styles.formTitle}>
            <span>📩</span> Get Launch & Price Updates
          </div>

          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email address (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
            />
            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.inputField}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'SUBMITTING...' : 'NOTIFY ME ON LAUNCH'}
          </button>

          {successMsg && <div className={styles.successMessage}>{successMsg}</div>}
          {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
        </form>

        {/* Secondary Action: Close and Explore Lineup */}
        <button className={styles.exploreBtn} onClick={handleClose}>
          <span>Explore TV Lineup</span>
          <span>→</span>
        </button>
      </div>
    </div>
  )
}
