import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import ShopVariantCard from '@/components/ShopVariantCard'
import TestimonialCarousel from '@/components/TestimonialCarousel'
import ScrollingBanner from '@/components/ScrollingBanner'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

function parseProductSpecs(specsRaw: string | null) {
  if (!specsRaw) return []
  try {
    const data = JSON.parse(specsRaw)
    if (Array.isArray(data)) {
      return data
        .filter((item: any) => item && typeof item === 'object' && item.key && String(item.key).trim() !== '')
        .map((item: any) => ({ key: String(item.key).trim(), value: String(item.value || '').trim() }))
    }
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data)
        .filter(([k]) => k && String(k).trim() !== '' && !/^\d+$/.test(String(k).trim()))
        .map(([k, v]) => ({ key: String(k).trim(), value: String(v || '').trim() }))
    }
  } catch (e) { }
  return []
}

export default async function Home() {
  let products: any[] = []
  try {
    products = await prisma.product.findMany({
      where: { published: true },
      include: { variants: true }
    })
  } catch (error) {
    console.error('Database fetch error on Home page:', error)
  }

  // Collect all on sale variants across products
  const saleItems: { product: any; variant: any }[] = []
  products.forEach((product: any) => {
    (product.variants || []).forEach((variant: any) => {
      if (variant.isOnSale) {
        saleItems.push({ product, variant })
      }
    })
  })

  return (
    <div className={styles.pageContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          {/* Left Text Block */}
          <div className={styles.heroContent}>
            <div className={styles.heroSubHeader}>
              <span>NEW RELEASE</span>
            </div>
            <h1 className={styles.heroTitle}>
              Introducing the <br />
              <span className={styles.heroTitleBold}>HOI-G Series</span> <br />
              <span className={styles.heroTitleBold}>Google TV</span>
            </h1>
            <p className={styles.heroSubtitle}>
              4K Ultra HD Display | Google TV Ecosystem | DOLBY Audio
            </p>
            <div className={styles.heroActions}>
              <Link href="#catalog" className={styles.btnExploreNow}>
                EXPLORE NOW
              </Link>
              <Link href="/shop" className={styles.btnShopLineup}>
                SHOP LINEUP
              </Link>
            </div>
          </div>

          {/* Right Visual TV Showcase */}
          <div className={styles.heroVisualWrapper}>
            <div className={styles.heroBannerContainer}>
              <img
                src="/images/hoi_hero_right_tv.png"
                alt="HAUS OF INDIA HOI-G Series Google TV Setup"
                className={styles.heroBannerImage}
                width={614}
                height={572}
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Trust Bar */}
      <section className={styles.trustBarSection}>
        <div className={`container ${styles.trustBarGrid}`}>
          <div className={styles.trustBarItem}>
            <span className={styles.trustBarIcon}>🛡️</span>
            <div>
              <strong>2-Year Full Warranty</strong>
              <p>Manufacturing defects & hardware</p>
            </div>
          </div>
          <div className={styles.trustBarItem}>
            <span className={styles.trustBarIcon}>🔧</span>
            <div>
              <strong>3rd Year Free Labour</strong>
              <p>Labour fee waived off (parts at cost)</p>
            </div>
          </div>
          <div className={styles.trustBarItem}>
            <span className={styles.trustBarIcon}>🔄</span>
            <div>
              <strong>15-Day Return Policy</strong>
              <p>100% replacement & return assurance</p>
            </div>
          </div>
          <div className={styles.trustBarItem}>
            <span className={styles.trustBarIcon}>🚚</span>
            <div>
              <strong>Direct Support</strong>
              <p>Service direct from our engineers</p>
            </div>
          </div>
        </div>
      </section>

      {/* ON SALE PRODUCTS SECTION (Rendered when 2 or more variants are on sale) */}
      {saleItems.length >= 2 && (
        <section className={`container ${styles.saleSection}`}>
          <div className={styles.saleSectionBanner}>
            <div className={styles.saleBannerHeader}>
              <span className={styles.saleFlashBadge}>LIMITED TIME DEALS</span>
              <h2 className={styles.saleTitle}>
                ON SALE <span className={styles.saleTitleHighlight}>PRODUCTS</span>
              </h2>
              <p className={styles.saleSubtitle}>
                Special promotional pricing on select smart TV models.
              </p>
            </div>

            <div className={styles.saleGrid}>
              {saleItems.map(({ product, variant }) => {
                let seriesTheme: 'c-class' | 'a-class' | 'g-class' = 'c-class'
                const s = (product.series || '').toUpperCase()
                if (s.includes('A')) seriesTheme = 'a-class'
                else if (s.includes('G')) seriesTheme = 'g-class'

                return (
                  <ShopVariantCard
                    key={variant.id}
                    product={product}
                    variant={variant}
                    seriesTheme={seriesTheme}
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose HAUS OF INDIA Section */}
      <section className={`container ${styles.whyChooseSection}`}>
        <div className={styles.whyChooseHeader}>
          <h2 className={styles.whyChooseTitle}>
            WHY CHOOSE <span className={styles.titleHighlight}>US?</span>
          </h2>
          <p className={styles.whyChooseSubtitle}>
            With years of deep hardware expertise, we meticulously select every part of our televisions to guarantee maximum durability, lasting value, and breathtaking cinematic performance.
          </p>
        </div>

        <div className={styles.whyChooseGrid}>
          {/* Card 1 */}
          <div className={styles.whyChooseCard}>
            <div className={styles.whyChooseIconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </div>
            <h3 className={styles.whyChooseCardTitle}>Decades of Engineering Mastery</h3>
            <p className={styles.whyChooseCardDesc}>
              Rooted in over three decades of hands-on technical experience, our strict selection process guarantees only the most reliable components make it into your display.
            </p>
          </div>

          {/* Card 2 */}
          <div className={styles.whyChooseCard}>
            <div className={styles.whyChooseIconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
            </div>
            <h3 className={styles.whyChooseCardTitle}>Uncompromising Craftsmanship</h3>
            <p className={styles.whyChooseCardDesc}>
              Every television is assembled with absolute precision, utilizing A+ grade panels and robust architecture to deliver flawless, long-lasting visual excellence.
            </p>
          </div>

          {/* Card 3 */}
          <div className={styles.whyChooseCard}>
            <div className={styles.whyChooseIconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <h3 className={styles.whyChooseCardTitle}>Built for Indian Homes</h3>
            <p className={styles.whyChooseCardDesc}>
              Engineered with advanced thermal resilience and built-in surge protection to perform flawlessly through local voltage fluctuations and climate variations.
            </p>
          </div>

          {/* Card 4 */}
          <div className={styles.whyChooseCard}>
            <div className={styles.whyChooseIconWrapper}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <path d="M8 10h8"></path>
                <path d="M8 14h4"></path>
              </svg>
            </div>
            <h3 className={styles.whyChooseCardTitle}>Seamless Direct Assistance</h3>
            <p className={styles.whyChooseCardDesc}>
              Skip the middlemen. Enjoy total peace of mind with dedicated warranty and technical support straight from the engineers who crafted your screen.
            </p>
          </div>
        </div>
      </section>

      {/* Infinite Marquee Scrolling Banner (Fills gap between Why Choose & Catalog Lineup) */}
      <ScrollingBanner />

      {/* Catalog Section */}
      <section id="catalog" className={`container ${styles.catalogSection}`}>
        <div className={styles.catalogHeader}>
          <h2 className={styles.sectionTitle}>OUR PREMIUM LINEUP</h2>
          <p className={styles.sectionSubtitle}>Choose the ideal display for your entertainment space across our signature series.</p>
        </div>

        <div className={styles.grid}>
          {products.map((product: any) => {
            const parsedSpecs = parseProductSpecs(product.specs).slice(0, 3)
            const variants: any[] = product.variants || []
            const prices = variants.map((v: any) => v.price)
            const minPrice = prices.length > 0 ? Math.round(Math.min(...prices)) : 0
            const hasSale = variants.some((v: any) => v.isOnSale)
            const firstSaleVariant = variants.find((v: any) => v.isOnSale)

            const targetHref = firstSaleVariant
              ? `/product/${product.id}?variantId=${firstSaleVariant.id}`
              : `/product/${product.id}`

            return (
              <div key={product.id} className={`premium-card ${styles.productCard} ${hasSale ? styles.productCardSale : ''}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.productBadge}>{product.series}</span>
                  {hasSale ? (
                    <span className={styles.catalogSaleBadge}>FLASH DEAL</span>
                  ) : (
                    <span className={styles.ratingBadge}>★ 4.9</span>
                  )}
                </div>

                {/* Card Image Preview with subtle ambient glow */}
                <div className={styles.cardImageContainer}>
                  <div className={styles.cardGlowBg}></div>
                  <img
                    src={product.imageUrl || '/images/hero_tv_setup.png'}
                    alt={product.title}
                    className={styles.cardImage}
                  />
                </div>

                <h3 className={styles.productTitle}>
                  {product.title}
                </h3>
                <p className={styles.productDesc}>{product.description}</p>

                <div className={styles.features}>
                  {(() => {
                    try {
                      const list = JSON.parse(product.features)
                      if (!Array.isArray(list)) return []
                      return list
                        .map((f: any) => (typeof f === 'string' ? f : f?.title || ''))
                        .filter((f: string) => f && f.trim() !== '')
                        .slice(0, 3)
                    } catch (e) { return [] }
                  })().map((feat: string, i: number) => (
                    <span key={i} className={styles.featureTag}>{feat}</span>
                  ))}
                </div>

                {parsedSpecs.length > 0 && (
                  <div className={styles.catalogSpecs}>
                    {parsedSpecs.map((spec, i) => (
                      <div key={i} className={styles.catalogSpecItem}>
                        <span className={styles.specKey}>{spec.key}</span>
                        <span className={styles.specValue}>{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.bottomAlignSection}>
                  <div className={styles.priceSection}>
                    <p className={styles.startingAt}>
                      {hasSale ? 'SPECIAL OFFER FROM' : 'STARTING AT'}
                    </p>
                    <p className={`${styles.price} ${hasSale ? styles.salePriceHighlight : ''}`}>
                      ₹{minPrice.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <Link href={targetHref} className={`btn-pill-outline ${styles.fullWidthBtn}`}>
                    VIEW DETAILS
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Verified Customer Testimonials / Reviews Carousel */}
      <TestimonialCarousel />
    </div>
  )
}
