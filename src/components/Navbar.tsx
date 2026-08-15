"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from './CartProvider'
import ThemeToggle from './ThemeToggle'
import styles from './Navbar.module.css'

const LOGO_IMAGE_URL = "/images/logo.png"

export default function Navbar() {
  const { data: session } = useSession()
  const { items } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const closeMobileMenu = () => setMobileOpen(false)

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo} onClick={closeMobileMenu}>
          {LOGO_IMAGE_URL ? (
            <img src={LOGO_IMAGE_URL} alt="HAUS OF INDIA Logo" className={styles.logoImage} />
          ) : (
            <span className={styles.logoText}>HAUS <span className={styles.logoAccent}>OF INDIA</span></span>
          )}
        </Link>

        {/* Right actions section on mobile & desktop */}
        <div className={styles.mobileActionGroup}>
          <Link href="/cart" className={styles.cartPillMobile} onClick={closeMobileMenu}>
            <span>CART</span>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>
          <ThemeToggle />
          <button 
            type="button"
            className={styles.hamburgerBtn}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileOpen}
          >
            <span className={`${styles.hamburgerBar} ${mobileOpen ? styles.bar1Open : ''}`}></span>
            <span className={`${styles.hamburgerBar} ${mobileOpen ? styles.bar2Open : ''}`}></span>
            <span className={`${styles.hamburgerBar} ${mobileOpen ? styles.bar3Open : ''}`}></span>
          </button>
        </div>

        {/* Desktop Nav Links */}
        <nav className={styles.navLinks}>
          <Link href="/shop" className={styles.link}>SHOP</Link>
          <Link href="/#catalog" className={styles.link}>TV LINEUP</Link>
          <Link href="/cart" className={styles.cartPill}>
            <span>CART</span>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>
          
          <ThemeToggle />

          <div className={styles.profileGroup}>
            {session ? (
              <>
                {(session.user as any)?.role === 'ADMIN' && (
                  <Link href="/admin" className={styles.link}>ADMIN</Link>
                )}
                <Link href="/dashboard" className={styles.link}>MY ORDERS</Link>
                <Link href="/track-order" className={styles.link}>TRACK ORDER</Link>
                <button onClick={() => { closeMobileMenu(); signOut(); }} className={styles.logoutBtn}>LOGOUT</button>
              </>
            ) : (
              <>
                <Link href="/track-order" className={styles.link}>TRACK ORDER</Link>
                <Link href="/login" className="btn-pill-blue">LOGIN</Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileOpen && (
        <div className={styles.mobileDrawerOverlay} onClick={closeMobileMenu}>
          <nav className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            <Link href="/shop" className={styles.mobileLink} onClick={closeMobileMenu}>
              🛍️ SHOP ALL TVS
            </Link>
            <Link href="/#catalog" className={styles.mobileLink} onClick={closeMobileMenu}>
              📺 TV LINEUP & SERIES
            </Link>
            <Link href="/cart" className={styles.mobileLink} onClick={closeMobileMenu}>
              🛒 MY CART {cartCount > 0 ? `(${cartCount})` : ''}
            </Link>
            <Link href="/track-order" className={styles.mobileLink} onClick={closeMobileMenu}>
              📍 TRACK ORDER
            </Link>

            {session ? (
              <>
                {(session.user as any)?.role === 'ADMIN' && (
                  <Link href="/admin" className={styles.mobileLink} onClick={closeMobileMenu}>
                    ⚙️ ADMIN PORTAL
                  </Link>
                )}
                <Link href="/dashboard" className={styles.mobileLink} onClick={closeMobileMenu}>
                  📦 MY ORDERS
                </Link>
                <button 
                  onClick={() => { closeMobileMenu(); signOut(); }} 
                  className={styles.mobileLogoutBtn}
                >
                  🚪 LOGOUT
                </button>
              </>
            ) : (
              <div className={styles.mobileAuthBox}>
                <Link href="/login" className="btn-pill-blue" style={{ width: '100%', textAlign: 'center' }} onClick={closeMobileMenu}>
                  LOGIN / REGISTER
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
