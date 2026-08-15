import Link from 'next/link'
import styles from '../policy.module.css'

export const metadata = {
  title: 'About Us - Our Story | HAUS OF INDIA',
  description: 'Our 35-year journey from a small electronics repair shop in Rawatbhata to manufacturing HAUS OF INDIA televisions.'
}

export default function AboutUsPage() {
  return (
    <div className={styles.policyContainer}>
      <div className={styles.policyCard}>
        <Link href="/" className={styles.backBtn}>
          ← Back to Home
        </Link>
        
        <h1 className={styles.policyTitle}>Our Story</h1>
        <p className={styles.policySubtitle}>35 Years of Practical Electronics Expertise</p>

        <div className={styles.policyContent}>
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>The HAUS OF INDIA Journey</h2>
            <p className={styles.sectionBody} style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
              In 1989, our journey began in a small electronics repair shop in Rawatbhata. For 35 years, we diagnosed, repaired, and understood every component that makes electronics work.
            </p>
            <br />
            <p className={styles.sectionBody} style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
              This hands-on experience gave us unique insight into what makes technology reliable, durable, and performant. We saw firsthand which components failed and which stood the test of time.
            </p>
            <br />
            <p className={styles.sectionBody} style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
              That deep, practical knowledge became the foundation for HAUS OF INDIA — not just another manufacturer, but a brand built on decades of real-world electronics expertise.
            </p>
          </div>

          <div id="contact" className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>Get In Touch</h2>
            <p className={styles.sectionBody}>
              Have questions, feedback, or need support? Our technical support team is always ready to assist you.
            </p>
            <div className={styles.contactBox} style={{ marginTop: '16px' }}>
              <p style={{ margin: 0 }}>📧 Email: support@hausofindia.com</p>
              <p style={{ margin: '6px 0 0' }}>📞 Phone: +91 7339941812 / +91 9929247772</p>
              <p style={{ margin: '6px 0 0' }}>📍 Commercial Space Operations, Kota City Mall, Rajasthan, India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
