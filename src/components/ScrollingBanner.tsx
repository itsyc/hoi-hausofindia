"use client"

import styles from './ScrollingBanner.module.css'

const BANNER_ITEMS = [
  { icon: '💳', title: 'NO-COST EMI AVAILABLE', desc: 'Flexible 3, 6, 9 & 12 Month EMI Options' },
  { icon: '🏷️', title: 'COUPON & PROMO CODES', desc: 'Apply Promo Code at Checkout for Extra Discount' },
  { icon: '💳', title: 'ALL CARDS ACCEPTED', desc: 'Visa, Mastercard, RuPay, Amex & NetBanking' },
  { icon: '⚡', title: 'PAY LATER OPTIONS', desc: 'Buy Now Pay Later Available at Checkout' },
  { icon: '🧾', title: 'GST INVOICE AVAILABLE', desc: 'Claim Input Tax Credit with Business GSTIN' },
  { icon: '🚚', title: 'EXPRESS DISPATCH', desc: 'Free Safe Express Shipping Across India' }
]

export default function ScrollingBanner() {
  // Triple array duplicate for continuous infinite marquee loop
  const marqueeItems = [...BANNER_ITEMS, ...BANNER_ITEMS, ...BANNER_ITEMS]

  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.marqueeTrack}>
        {marqueeItems.map((item, idx) => (
          <div key={idx} className={styles.bannerItem}>
            <span className={styles.itemIcon}>{item.icon}</span>
            <div className={styles.itemContent}>
              <strong className={styles.itemTitle}>{item.title}</strong>
              <span className={styles.itemDesc}>{item.desc}</span>
            </div>
            <span className={styles.separator}>✦</span>
          </div>
        ))}
      </div>
    </div>
  )
}
