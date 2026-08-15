import Link from 'next/link'
import styles from '../policy.module.css'

export const metadata = {
  title: 'Shipping Policy | HAUS OF INDIA',
  description: 'Shipping Policy for HAUS OF INDIA. Details on dispatch, shipping timelines, and delivery.'
}

export default function ShippingPolicyPage() {
  return (
    <div className={styles.policyContainer}>
      <div className={styles.policyCard}>
        <Link href="/" className={styles.backBtn}>
          ← Back to Home
        </Link>
        
        <h1 className={styles.policyTitle}>Shipping Policy</h1>
        <p className={styles.policySubtitle}>Last Updated: July 2026</p>

        <div className={styles.policyContent}>
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>1. Order Processing</h2>
            <ul className={styles.bulletList}>
              <li>Orders are processed within 1-2 business days after payment confirmation.</li>
              <li>You will receive an email confirmation with tracking details once your order has been dispatched.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>2. Shipping Methods</h2>
            <ul className={styles.bulletList}>
              <li>We partner with trusted courier services to deliver your products safely.</li>
              <li>Standard and express shipping options may be available depending on your location.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>3. Delivery Time</h2>
            <ul className={styles.bulletList}>
              <li>Standard delivery usually takes 3-7 business days depending on your location.</li>
              <li>Remote or rural areas may take longer.</li>
              <li>Delivery timelines are estimates and may vary due to courier delays or unforeseen circumstances.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>4. Shipping Charges</h2>
            <ul className={styles.bulletList}>
              <li>Shipping fees are calculated at checkout based on your location and chosen delivery method.</li>
              <li>Free shipping may be offered on select orders above ₹10,000.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>5. International Shipping</h2>
            <p className={styles.sectionBody}>
              We currently do not ship internationally (India orders only). International orders may be subject to customs duties or taxes if expanded in the future.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>6. Incorrect Address</h2>
            <p className={styles.sectionBody}>
              Please ensure your shipping address is correct. We are not responsible for lost packages due to incorrect or incomplete addresses provided by customers.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>7. Damaged or Lost Packages</h2>
            <ul className={styles.bulletList}>
              <li>If your package arrives damaged, please contact us immediately with photos.</li>
              <li>If your package is lost in transit, we will work with the courier to resolve the issue.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
