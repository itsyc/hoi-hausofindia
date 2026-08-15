import Link from 'next/link'
import styles from '../policy.module.css'

export const metadata = {
  title: 'Warranty Policy | HAUS OF INDIA',
  description: 'Warranty Policy for HAUS OF INDIA products. Coverage, claims, and resolution guidelines.'
}

export default function WarrantyPolicyPage() {
  return (
    <div className={styles.policyContainer}>
      <div className={styles.policyCard}>
        <Link href="/" className={styles.backBtn}>
          ← Back to Home
        </Link>
        
        <h1 className={styles.policyTitle}>Warranty Policy</h1>
        <p className={styles.policySubtitle}>Last Updated: July 2026</p>

        <div className={styles.policyContent}>
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>1. Coverage & Duration</h2>
            <ul className={styles.bulletList}>
              <li><strong>2-Year Comprehensive Warranty:</strong> All products sold by HAUS OF INDIA come with a 2-year full warranty covering manufacturing defects, panel issues, and hardware malfunctions under normal usage conditions.</li>
              <li><strong>Additional 3rd Year Labour-Free Warranty:</strong> We offer an additional 3rd-year extended warranty where all labour & service charges are completely waived off — you are only charged for the cost of replacement parts if required.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>2. Exclusions</h2>
            <p className={styles.sectionBody}>The warranty does not cover:</p>
            <ul className={styles.bulletList}>
              <li>Damage caused by misuse, accidents, or unauthorized repairs.</li>
              <li>Normal wear and tear, cosmetic damage, or consumable parts (e.g., batteries, cables).</li>
              <li>Issues arising from software, viruses, or third-party applications.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>3. Claim Process</h2>
            <p className={styles.sectionBody}>To make a warranty claim:</p>
            <ul className={styles.bulletList}>
              <li>Contact our support team at 📧 support@hausofindia.com or 📞 +91 7339941812 / +91 9929247772.</li>
              <li>Provide your order number, product details, and a description of the issue.</li>
              <li>Our team will guide you through inspection and repair/replacement steps.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>4. Resolution</h2>
            <ul className={styles.bulletList}>
              <li>If the product is found defective under warranty, we will repair or replace it at no extra cost.</li>
              <li>If the product cannot be repaired or replaced, a refund or store credit may be offered.</li>
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>5. Warranty Transfer</h2>
            <p className={styles.sectionBody}>
              Warranty is valid only for the original purchaser and is non-transferable.
            </p>
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>6. Policy Updates</h2>
            <p className={styles.sectionBody}>
              We may update this Warranty Policy from time to time. The latest version will always be available on our website.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
