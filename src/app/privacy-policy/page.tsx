import Link from 'next/link'
import styles from '../policy.module.css'

export const metadata = {
  title: 'Privacy Policy | HAUS OF INDIA',
  description: 'Privacy Policy of HAUS OF INDIA. Learn how we handle your personal data securely.'
}

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.policyContainer}>
      <div className={styles.policyCard}>
        <Link href="/" className={styles.backBtn}>
          ← Back to Home
        </Link>
        
        <h1 className={styles.policyTitle}>Privacy Policy</h1>
        <p className={styles.policySubtitle}>Last Updated: July 2026</p>

        <div className={styles.policyContent}>
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>1. Information We Collect</h2>
            <p className={styles.sectionBody}>
              We may collect personal information such as your name, email address, phone number, shipping address, and order details. If you make a purchase, payment information is processed securely through trusted payment gateways.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>2. How We Use Your Information</h2>
            <ul className={styles.bulletList}>
              <li>To process and deliver your orders</li>
              <li>To provide customer support and respond to inquiries</li>
              <li>To improve our products and services</li>
              <li>To send promotional offers or newsletters (you may opt out anytime)</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>3. Sharing of Information</h2>
            <p className={styles.sectionBody}>
              We do not sell or rent your personal information to third parties. We only share data with trusted partners (such as courier services or payment providers) when necessary to complete your order.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>4. Cookies & Tracking</h2>
            <p className={styles.sectionBody}>
              Our website uses cookies and analytics tools to enhance your shopping experience. You can disable cookies in your browser settings if you prefer.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>5. Data Security</h2>
            <p className={styles.sectionBody}>
              We use SSL encryption and secure servers to protect your information. However, please note that no method of online transmission is 100% secure.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>6. Your Rights</h2>
            <p className={styles.sectionBody}>
              You have the right to access, update, or request deletion of your personal information. Please contact us to exercise these rights.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>7. Policy Updates</h2>
            <p className={styles.sectionBody}>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>8. Contact Us</h2>
            <p className={styles.sectionBody}>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className={styles.contactBox}>
              <p style={{ margin: 0 }}>📧 Email: support@hausofindia.com</p>
              <p style={{ margin: '6px 0 0' }}>📞 Phone: +91 7339941812 / +91 9929247772</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
