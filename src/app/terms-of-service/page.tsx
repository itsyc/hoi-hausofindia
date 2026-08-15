import Link from 'next/link'
import styles from '../policy.module.css'

export const metadata = {
  title: 'Terms of Service | HAUS OF INDIA',
  description: 'Terms of Service governing the use of HAUS OF INDIA website and services.'
}

export default function TermsOfServicePage() {
  return (
    <div className={styles.policyContainer}>
      <div className={styles.policyCard}>
        <Link href="/" className={styles.backBtn}>
          ← Back to Home
        </Link>
        
        <h1 className={styles.policyTitle}>Terms of Service</h1>
        <p className={styles.policySubtitle}>Last Updated: July 2026</p>

        <div className={styles.policyContent}>
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
            <p className={styles.sectionBody}>
              By accessing or using HAUS OF INDIA’s website, you agree to comply with these Terms of Service. If you do not agree, please do not use our site.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>2. Use of Our Services</h2>
            <ul className={styles.bulletList}>
              <li>You must be at least 18 years old to make purchases.</li>
              <li>You agree not to misuse our website or interfere with its operation.</li>
              <li>All content, logos, and images are owned by HAUS OF INDIA and may not be copied or used without permission.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>3. Account Responsibility</h2>
            <p className={styles.sectionBody}>
              If you create an account, you are responsible for maintaining its confidentiality and for all activities under your account.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>4. Product Information</h2>
            <p className={styles.sectionBody}>
              We make every effort to display accurate product details, but errors may occur. We reserve the right to correct any mistakes and update information at any time.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>5. Payments</h2>
            <p className={styles.sectionBody}>
              All payments are processed securely through trusted gateways. We are not responsible for issues caused by third-party payment providers.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>6. Shipping and Delivery</h2>
            <p className={styles.sectionBody}>
              Delivery times may vary depending on your location. We are not liable for delays caused by courier services or incorrect shipping details provided by customers.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>7. Returns and Refunds</h2>
            <p className={styles.sectionBody}>
              Please refer to our Return & Refund Policy for detailed information on eligibility, timelines, and procedures.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>8. Limitation of Liability</h2>
            <p className={styles.sectionBody}>
              We are not liable for any indirect or consequential damages resulting from the use of our website or products.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>9. Changes to Service</h2>
            <p className={styles.sectionBody}>
              We may modify or discontinue any part of our website or services at any time without prior notice.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>10. Governing Law</h2>
            <p className={styles.sectionBody}>
              These Terms of Service are governed by the laws of India. Any disputes shall be resolved in the courts of Kota, Rajasthan.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
