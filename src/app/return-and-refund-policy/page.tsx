import Link from 'next/link'
import styles from '../policy.module.css'

export const metadata = {
  title: 'Return and Refund Policy | HAUS OF INDIA',
  description: 'Return and Refund Policy of HAUS OF INDIA. Details on returns, refunds, and exchanges.'
}

export default function ReturnAndRefundPolicyPage() {
  return (
    <div className={styles.policyContainer}>
      <div className={styles.policyCard}>
        <Link href="/" className={styles.backBtn}>
          ← Back to Home
        </Link>
        
        <h1 className={styles.policyTitle}>Return & Refund Policy</h1>
        <p className={styles.policySubtitle}>Last Updated: July 2026</p>

        <div className={styles.policyContent}>
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>1. Returns</h2>
            <ul className={styles.bulletList}>
              <li>Products can be returned within <strong>15 days</strong> of delivery.</li>
              <li>Items must be unused, undamaged, and in their original packaging.</li>
              <li>Certain items (such as electronic accessories, consumables, or clearance products) may not be eligible for return. Please check product details before purchase.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>2. Refunds</h2>
            <ul className={styles.bulletList}>
              <li>Refunds are issued once the returned item is inspected and approved.</li>
              <li>Refunds will be processed to the original payment method within 5-7 business days.</li>
              <li>Shipping charges are non-refundable unless the return is due to a defective or incorrect product.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>3. Exchanges</h2>
            <ul className={styles.bulletList}>
              <li>If you receive a defective or wrong item, we will replace it at no extra cost.</li>
              <li>Exchanges are subject to product availability.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>4. Process</h2>
            <p className={styles.sectionBody}>To initiate a return or refund:</p>
            <ul className={styles.bulletList}>
              <li>Contact us at 📧 support@hausofindia.com or 📞 +91 7339941812 / +91 9929247772.</li>
              <li>Provide your order number and reason for return.</li>
              <li>Our team will guide you through the return process.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>5. Policy Updates</h2>
            <p className={styles.sectionBody}>
              We may update this Return & Refund Policy from time to time. The latest version will always be available on our website.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
