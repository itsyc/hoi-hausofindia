import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        {/* Brand & Contact Information */}
        <div className={styles.brandColumn}>
          <h2 className={styles.brandTitle}>HAUS OF INDIA</h2>
          <p className={styles.brandDesc}>
            Our 35-year journey from repair technician to manufacturer ensures every component is hand-selected for reliability and performance.
          </p>
          <div className={styles.contactDetails}>
            <p>📧 support@hausofindia.com</p>
            <p>📞 +91 7339941812 / +91 9929247772</p>
            <p>📍 Commercial Space Operations, Kota City Mall, Rajasthan, India</p>
          </div>
        </div>

        {/* Column 1: TERMS AND POLICIES */}
        <div className={styles.navColumn}>
          <h3 className={styles.columnTitle}>TERMS AND POLICIES</h3>
          <ul className={styles.linkList}>
            <li>
              <Link href="/terms-of-service">Terms of Service</Link>
            </li>
            <li>
              <Link href="/return-and-refund-policy">Return and Refund Policy</Link>
            </li>
            <li>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/shipping-policy">Shipping Policy</Link>
            </li>
            <li>
              <Link href="/terms-and-conditions">Terms and Conditions</Link>
            </li>
            <li>
              <Link href="/warranty-policy">Warranty Policy</Link>
            </li>
          </ul>
        </div>

        {/* Column 2: KNOW US */}
        <div className={styles.navColumn}>
          <h3 className={styles.columnTitle}>KNOW US</h3>
          <ul className={styles.linkList}>
            <li>
              <Link href="/about-us">Our Story</Link>
            </li>
            <li>
              <Link href="/product-disclaimer">Product Disclaimer</Link></li>
            <li>
              <Link href="/track-order">Track Order</Link>
            </li>
            <li>
              <Link href="/#catalog">Explore Lineup</Link>
            </li>
            <li>
              <Link href="/about-us#contact">Contact Us</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} HAUS OF INDIA. All rights reserved. Designed & Engineered for Indian Conditions.</p>
        </div>
      </div>
    </footer>
  )
}
