import Link from 'next/link'
import styles from '../policy.module.css'

export const metadata = {
  title: 'Product Disclaimer | HAUS OF INDIA',
  description: 'Product Disclaimer for HAUS OF INDIA televisions and electronic accessories.'
}

export default function ProductDisclaimerPage() {
  return (
    <div className={styles.policyContainer}>
      <div className={styles.policyCard}>
        <Link href="/" className={styles.backBtn}>
          ← Back to Home
        </Link>
        
        <h1 className={styles.policyTitle}>Product Disclaimer</h1>
        <p className={styles.policySubtitle}>Last Updated: July 2026</p>

        <div className={styles.policyContent}>
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Product Representation & Accuracy</h2>
            <ul className={styles.bulletList}>
              <li>Images shown on our website are for illustrative purposes only.</li>
              <li>Actual products may vary slightly in color, design, or appearance due to manufacturing updates, lighting, or screen display differences.</li>
              <li>These variations do not affect the functionality, performance, or warranty of the product.</li>
              <li>We strive to ensure product descriptions and specifications are accurate, but minor differences may occur.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
