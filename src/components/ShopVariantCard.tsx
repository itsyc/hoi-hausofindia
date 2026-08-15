"use client"

import { useCart } from './CartProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../app/shop/page.module.css'

type ShopVariantCardProps = {
  product: any
  variant: any
  seriesTheme: 'c-class' | 'a-class' | 'g-class'
}

export default function ShopVariantCard({ product, variant, seriesTheme }: ShopVariantCardProps) {
  const { addToCart } = useCart()
  const router = useRouter()

  // Parse features safely
  let productFeatures: string[] = []
  try {
    const raw = product.features ? JSON.parse(product.features) : []
    if (Array.isArray(raw)) {
      productFeatures = raw.map((f: any) => typeof f === 'string' ? f : f?.title || '')
    }
  } catch (e) {}

  let variantFeatures: string[] = []
  try {
    const raw = variant.features ? JSON.parse(variant.features) : []
    if (Array.isArray(raw)) {
      variantFeatures = raw.map((f: any) => typeof f === 'string' ? f : f?.title || '')
    }
  } catch (e) {}

  const displayFeatures = variantFeatures.filter(f => f && f.trim() !== '').length > 0
    ? variantFeatures.filter(f => f && f.trim() !== '')
    : productFeatures.filter(f => f && f.trim() !== '')

  // Images logic
  let variantImages: string[] = []
  try { variantImages = variant.images ? JSON.parse(variant.images) : [] } catch (e) {}
  const cardImage = (variantImages.length > 0 ? variantImages[0] : product.imageUrl) || '/images/hero_tv_setup.png'

  const roundedPrice = Math.round(variant.price)
  const roundedMrp = Math.round(variant.mrp)

  const handleBuyNow = () => {
    addToCart({
      variantId: variant.id,
      productId: product.id,
      title: product.title,
      size: variant.name,
      price: variant.price,
      quantity: 1
    })
    router.push('/cart')
  }

  const shortBadgeText = variant.name ? variant.name.split('(')[0].trim() : ''

  return (
    <div className={`${styles.variantCard} ${styles[seriesTheme]} ${variant.isOnSale ? styles.onSaleCard : ''}`}>
      {/* Top Header Badge */}
      <div className={styles.cardHeader}>
        <span className={styles.sizeBadge} title={variant.name}>{shortBadgeText || variant.name}</span>
        {variant.isOnSale ? (
          <span className={styles.saleRibbon}>FLASH DEAL</span>
        ) : variant.discountPct > 0 ? (
          <span className={styles.discountTag}>{variant.discountPct}% OFF</span>
        ) : null}
      </div>

      {/* Image Preview Container */}
      <div className={styles.imageContainer}>
        <div className={`${styles.imageGlow} ${variant.isOnSale ? styles.saleGlow : ''}`}></div>
        <img src={cardImage} alt={`${product.title} - ${variant.name}`} className={styles.productImg} />
      </div>

      {/* Title & Model Info */}
      <h4 className={styles.modelTitle}>
        {variant.name}
      </h4>
      <p className={styles.modelSeries}>{product.title}</p>

      {/* Feature Tags */}
      {displayFeatures.length > 0 && (
        <div className={styles.featureList}>
          {displayFeatures.slice(0, 3).map((feat, idx) => (
            <span key={idx} className={styles.featurePill}>{feat}</span>
          ))}
        </div>
      )}

      {/* Bottom Anchored Price & Action Buttons */}
      <div className={styles.bottomSection}>
        <div className={styles.priceRow}>
          <div>
            <p className={styles.priceLabel}>
              {variant.isOnSale ? 'SALE PRICE' : 'PRICE'}
            </p>
            <div className={styles.priceFlex}>
              <span className={`${styles.currentPrice} ${variant.isOnSale ? styles.salePriceGlow : ''}`}>
                ₹{roundedPrice.toLocaleString('en-IN')}
              </span>
              {variant.discountPct > 0 && (
                <span className={styles.mrpPrice}>₹{roundedMrp.toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.actionRow}>
          <button onClick={handleBuyNow} className={`${styles.buyNowBtn} ${variant.isOnSale ? styles.flashBuyBtn : ''}`}>
            {variant.isOnSale ? 'BUY NOW' : 'BUY NOW'}
          </button>
          <Link href={`/product/${product.id}?variantId=${variant.id}`} className={styles.detailsBtn}>
            DETAILS
          </Link>
        </div>
      </div>
    </div>
  )
}
