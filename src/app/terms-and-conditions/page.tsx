import Link from 'next/link'
import styles from '../policy.module.css'

export const metadata = {
  title: 'Terms and Conditions | HAUS OF INDIA',
  description: 'Terms and Conditions for using HAUS OF INDIA services and purchasing products.'
}

export default function TermsAndConditionsPage() {
  return (
    <div className={styles.policyContainer}>
      <div className={styles.policyCard}>
        <Link href="/" className={styles.backBtn}>
          ← Back to Home
        </Link>
        
        <h1 className={styles.policyTitle}>Terms and Conditions</h1>
        <p className={styles.policySubtitle}>Last Updated: July 2026</p>

        <div className={styles.policyContent}>
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>1. Introduction</h2>
            <p className={styles.sectionBody}>
              Welcome to HAUS OF INDIA! By using our website, you agree to follow these Terms and Conditions. Please read them carefully before making any purchase or using our services.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>2. Use of Website</h2>
            <ul className={styles.bulletList}>
              <li>You must be at least 18 years old to make purchases.</li>
              <li>You agree not to misuse the website or attempt unauthorized access.</li>
              <li>All content, images, and materials on this site are owned by HAUS OF INDIA and cannot be copied or reused without permission.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>3. Products and Pricing</h2>
            <ul className={styles.bulletList}>
              <li>We strive to display accurate product information and prices.</li>
              <li>Prices may change without prior notice.</li>
              <li>In case of any error in pricing or description, we reserve the right to cancel or modify the order.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>4. Orders and Payments</h2>
            <ul className={styles.bulletList}>
              <li>Orders are confirmed only after successful payment.</li>
              <li>We use secure payment gateways to protect your financial information.</li>
              <li>HAUS OF INDIA is not responsible for delays caused by payment processing or third-party services.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>5. Shipping and Delivery</h2>
            <ul className={styles.bulletList}>
              <li>Delivery timelines depend on your location and courier availability.</li>
              <li>We are not liable for delays caused by courier companies or unforeseen circumstances.</li>
              <li>Please ensure your shipping address is correct; we are not responsible for lost packages due to incorrect details.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>6. Returns and Refunds</h2>
            <ul className={styles.bulletList}>
              <li>Returns are accepted within 15 days of delivery if the product is unused and in original packaging.</li>
              <li>Refunds will be processed after inspection of the returned item.</li>
              <li>Certain items (e.g., electronics accessories) may not be eligible for return — check product details before purchase.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>7. Limitation of Liability</h2>
            <p className={styles.sectionBody}>
              We are not responsible for any indirect, incidental, or consequential damages arising from the use of our website or products.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>8. Changes to Terms</h2>
            <p className={styles.sectionBody}>
              We may update these Terms and Conditions from time to time. Continued use of the website after changes means you accept the updated terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
