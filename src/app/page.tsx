import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import ShopVariantCard from '@/components/ShopVariantCard'
import HomeLineupSection from '@/components/HomeLineupSection'
import TestimonialCarousel from '@/components/TestimonialCarousel'
import ScrollingBanner from '@/components/ScrollingBanner'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

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

  // Find products for WebOS & Android TV platforms & their starting pricing
  const webosProduct = products.find((p: any) => {
    const s = (p.series || '').toUpperCase()
    const t = (p.title || '').toLowerCase()
    return s.startsWith('W') || s.startsWith('G') || t.includes('webos')
  })
  const androidProduct = products.find((p: any) => {
    const s = (p.series || '').toUpperCase()
    const t = (p.title || '').toLowerCase()
    return s.startsWith('A') || t.includes('android')
  })

  const getStartingPricing = (product: any, fallbackMrp: number, fallbackPrice: number) => {
    if (!product || !product.variants || product.variants.length === 0) {
      return { mrp: fallbackMrp, price: fallbackPrice }
    }
    const lowest = product.variants.reduce((min: any, curr: any) => (curr.price < min.price ? curr : min), product.variants[0])
    return {
      mrp: Math.round(lowest.mrp),
      price: Math.round(lowest.price)
    }
  }

  const webosStarting = getStartingPricing(webosProduct, 32999, 24749)
  const androidStarting = getStartingPricing(androidProduct, 18999, 15199)

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
              <span className={styles.heroTitleBold}>HOI Led TV with</span> <br />
              <span className={styles.heroTitleHighlight}>WebOS TV &amp; Android TV</span>
            </h1>
            <p className={styles.heroSubtitle}>
              4K Ultra HD Display | DOLBY Audio | Voice Remote |
            </p>

            {/* 2 OS Platforms Cards */}
            <div className={styles.heroOsGrid}>
              {/* 1. webOS */}
              <Link
                href={webosProduct ? `/product/${webosProduct.id}` : '#catalog'}
                className={styles.heroOsCard}
                title="WebOS TV Series (43, 55 Inch)"
              >
                <div className={styles.heroOsLogoWrap}>
                  <img
                    src="/images/os/webos.png"
                    alt="WebOS TV"
                    className={styles.heroOsLogoWebos}
                  />
                </div>
                <div className={styles.heroOsTextGroup}>
                  <span className={styles.heroOsTitle}>WebOS TV</span>
                  <span className={styles.heroOsSubtitle}>43&quot; &amp; 55&quot; Sizes</span>
                </div>
                <div className={styles.heroOsPriceBlock}>
                  <span className={styles.heroOsPriceLabel}>Starting from</span>
                  <div className={styles.heroOsPriceRow}>
                    <span className={styles.heroOsOfferPrice}>
                      ₹{(webosStarting?.price ?? 24749).toLocaleString('en-IN')}
                    </span>
                    <span className={styles.heroOsMrpPrice}>
                      ₹{(webosStarting?.mrp ?? 32999).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </Link>

              {/* 2. Android TV */}
              <Link
                href={androidProduct ? `/product/${androidProduct.id}` : '#catalog'}
                className={styles.heroOsCard}
                title="Android TV Series (32, 43, 50, 55 Inch)"
              >
                <div className={styles.heroOsLogoWrap}>
                  <img
                    src="/images/os/androidtv.png"
                    alt="Android TV"
                    className={styles.heroOsLogoAndroid}
                  />
                </div>
                <div className={styles.heroOsTextGroup}>
                  <span className={styles.heroOsTitle}>Android TV</span>
                  <span className={styles.heroOsSubtitle}>32&quot;, 43&quot;, 50&quot;, 55&quot;</span>
                </div>
                <div className={styles.heroOsPriceBlock}>
                  <span className={styles.heroOsPriceLabel}>Starting from</span>
                  <div className={styles.heroOsPriceRow}>
                    <span className={styles.heroOsOfferPrice}>
                      ₹{(androidStarting?.price ?? 15199).toLocaleString('en-IN')}
                    </span>
                    <span className={styles.heroOsMrpPrice}>
                      ₹{(androidStarting?.mrp ?? 18999).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </Link>
            </div>

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
                alt="HAUS OF INDIA HOI Led TV Series with WebOS TV and Android TV"
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
              <strong>1-Year Full Warranty</strong>
              <p>Manufacturing defects & hardware</p>
            </div>
          </div>
          <div className={styles.trustBarItem}>
            <span className={styles.trustBarIcon}>🔧</span>
            <div>
              <strong>2nd Year Free Labour</strong>
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

      {/* 2 OS Showcase Section */}
      <section className={`container ${styles.osSection}`}>
        <div className={styles.osSectionHeader}>
          <span className={styles.osSectionBadge}>CHOOSE YOUR ENTERTAINMENT ECOSYSTEM</span>
          <h2 className={styles.osSectionTitle}>
            TWO SIGNATURE PLATFORMS. <br />
            <span className={styles.osSectionTitleGrad}>ONE CINEMATIC DISPLAY.</span>
          </h2>
          <p className={styles.osSectionSubtitle}>
            Engineered to give you total freedom of choice. Compare operating systems, remote control technologies, and app ecosystems to find your perfect living-room center.
          </p>
        </div>

        <div className={styles.osCardsGrid}>
          {/* OS Card 1: WebOS */}
          <div className={`${styles.osCard} ${styles.osCardWebos}`}>
            <div className={styles.osCardHeader}>
              <div className={styles.osCardLogoBox}>
                <img
                  src="/images/os/webos.png"
                  alt="WebOS TV"
                  className={styles.osCardLogoWebos}
                />
              </div>
              <div className={styles.osBadgeGroup}>
                <span className={styles.osCardPillWebos}>W-CLASS FLAGSHIP</span>
                <span className={styles.osTierPill}>43&quot;, 55&quot; 4K UHD</span>
              </div>
            </div>

            <div className={styles.osCardIntro}>
              <h3 className={styles.osCardHeading}>WebOS TV</h3>
              <p className={styles.osCardTagline}>The Ultra-Fluid Blade Experience</p>
              <p className={styles.osCardDescription}>
                Celebrated worldwide for its smooth, intuitive blade interface. Experience effortless browsing with Magic Remote point-and-click control, instant multitasking, zero bloatware, and certified 4K HDR streaming.
              </p>
            </div>

            {/* Real Hardware TV Visual Showcase */}
            <Link
              href={webosProduct ? `/product/${webosProduct.id}` : '/shop'}
              className={`${styles.osVisualStage} ${styles.osVisualStageWebos}`}
              title="Click to view HOI WebOS TV Series & Specifications"
            >
              <div className={styles.osVisualAmbientGlow} />
              <img
                src="/images/os/webos-tv-showcase.png"
                alt="HAUS OF INDIA WebOS Smart 4K LED TV Display"
                className={styles.osTvDisplayImage}
                loading="lazy"
              />
              <div className={styles.osVisualFeatureTags}>
                <span className={styles.osVisualTag}>✨ 4K Cinema Display</span>
                <span className={styles.osVisualTag}>🖱️ Magic Air-Mouse</span>
                <span className={styles.osVisualTag}>🔊 20W Dolby Audio</span>
                <span className={styles.osVisualTag}>🛡️ 1-Yr Full + 2nd-Yr Parts</span>
              </div>
            </Link>

            {/* Feature Matrix / Micro-Tiles */}
            <div className={styles.osFeatureGrid}>
              <div className={styles.osFeatureTile}>
                <span className={styles.osFeatureIcon}>🖱️</span>
                <div>
                  <h4 className={styles.osFeatureTileTitle}>Magic Remote Air-Mouse</h4>
                  <p className={styles.osFeatureTileDesc}>Point, click, and scroll effortlessly with gyro precision and dedicated app hotkeys.</p>
                </div>
              </div>

              <div className={styles.osFeatureTile}>
                <span className={styles.osFeatureIcon}>🍎</span>
                <div>
                  <h4 className={styles.osFeatureTileTitle}>Apple AirPlay 2 &amp; HomeKit</h4>
                  <p className={styles.osFeatureTileDesc}>Seamless wireless streaming from iPhone, iPad, and Mac with native Siri smart home support.</p>
                </div>
              </div>

              <div className={styles.osFeatureTile}>
                <span className={styles.osFeatureIcon}>🎬</span>
                <div>
                  <h4 className={styles.osFeatureTileTitle}>Licensed 4K Streaming</h4>
                  <p className={styles.osFeatureTileDesc}>Official Netflix, Disney+ Hotstar, Prime Video, and YouTube with HDR10 micro-dimming.</p>
                </div>
              </div>

              <div className={styles.osFeatureTile}>
                <span className={styles.osFeatureIcon}>⚡</span>
                <div>
                  <h4 className={styles.osFeatureTileTitle}>Instant Game Dashboard</h4>
                  <p className={styles.osFeatureTileDesc}>Auto Low Latency Mode (ALLM) with real-time frame rate display for stutter-free console play.</p>
                </div>
              </div>
            </div>

            {/* Available Sizes & Direct Pricing */}
            <div className={styles.osSizesContainer}>
              <span className={styles.osSizesLabel}>Available Sizes &amp; Direct Pricing:</span>
              <div className={styles.osSizesPillsRow}>
                {webosProduct?.variants?.map((v: any) => (
                  <Link
                    key={v.id}
                    href={`/product/${webosProduct.id}?variantId=${v.id}`}
                    className={styles.osSizePricePillWebos}
                  >
                    <span className={styles.osSizeName}>{v.name.split('(')[0].trim()}</span>
                    <span className={styles.osSizePrice}>₹{Math.round(v.price).toLocaleString('en-IN')}</span>
                  </Link>
                )) || (
                  <>
                    <span className={styles.osSizePricePillWebos}>43&quot; 4K UHD • ₹24,749</span>
                    <span className={styles.osSizePricePillWebos}>55&quot; 4K UHD • ₹37,499</span>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Card Action */}
            <div className={styles.osCardBottomBar}>
              <Link
                href={webosProduct ? `/product/${webosProduct.id}` : '/shop'}
                className={styles.osWebosCtaBtn}
              >
                <span>EXPLORE WEBOS TV SERIES</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* OS Card 2: Android TV */}
          <div className={`${styles.osCard} ${styles.osCardAndroid}`}>
            <div className={styles.osCardHeader}>
              <div className={styles.osCardLogoBox}>
                <img
                  src="/images/os/androidtv.png"
                  alt="Android TV"
                  className={styles.osCardLogoAndroid}
                />
              </div>
              <div className={styles.osBadgeGroup}>
                <span className={styles.osCardPillAndroid}>A-CLASS SIGNATURE</span>
                <span className={styles.osTierPill}>32&quot;, 43&quot;, 50&quot;, 55&quot;</span>
              </div>
            </div>

            <div className={styles.osCardIntro}>
              <h3 className={styles.osCardHeading}>Android TV</h3>
              <p className={styles.osCardTagline}>Infinite Apps &amp; Google Intelligence</p>
              <p className={styles.osCardDescription}>
                The ultimate connected entertainment hub. Certified Android TV OS with access to Google Play Store, Google Assistant voice search, built-in Chromecast, and expansive multi-size versatility.
              </p>
            </div>

            {/* Real Hardware TV Visual Showcase */}
            <Link
              href={androidProduct ? `/product/${androidProduct.id}` : '/shop'}
              className={`${styles.osVisualStage} ${styles.osVisualStageAndroid}`}
              title="Click to view HOI Android TV Series & Specifications"
            >
              <div className={styles.osVisualAmbientGlow} />
              <img
                src="/images/os/android-tv-showcase.png"
                alt="HAUS OF INDIA Android TV Smart LED TV Display"
                className={styles.osTvDisplayImage}
                loading="lazy"
              />
              <div className={styles.osVisualFeatureTags}>
                <span className={styles.osVisualTag}>🛍️ Google Play Store</span>
                <span className={styles.osVisualTag}>🎙️ Assistant Voice Remote</span>
                <span className={styles.osVisualTag}>⚡ QuadCore Processor</span>
                <span className={styles.osVisualTag}>🛡️ 1-Yr Full + 2nd-Yr Parts</span>
              </div>
            </Link>

            {/* Feature Matrix / Micro-Tiles */}
            <div className={styles.osFeatureGrid}>
              <div className={styles.osFeatureTile}>
                <span className={styles.osFeatureIcon}>🛍️</span>
                <div>
                  <h4 className={styles.osFeatureTileTitle}>10,000+ Verified Apps</h4>
                  <p className={styles.osFeatureTileDesc}>Google Play Store verified apps for endless movies, regional content, games, and music.</p>
                </div>
              </div>

              <div className={styles.osFeatureTile}>
                <span className={styles.osFeatureIcon}>🎙️</span>
                <div>
                  <h4 className={styles.osFeatureTileTitle}>Google Assistant Voice</h4>
                  <p className={styles.osFeatureTileDesc}>Press to speak on remote for lightning-fast content search, weather, and smart home control.</p>
                </div>
              </div>

              <div className={styles.osFeatureTile}>
                <span className={styles.osFeatureIcon}>📡</span>
                <div>
                  <h4 className={styles.osFeatureTileTitle}>Built-in Chromecast</h4>
                  <p className={styles.osFeatureTileDesc}>Cast 4K videos, family photos, and Chrome browser tabs instantly from Android and Windows.</p>
                </div>
              </div>

              <div className={styles.osFeatureTile}>
                <span className={styles.osFeatureIcon}>🎮</span>
                <div>
                  <h4 className={styles.osFeatureTileTitle}>Bluetooth &amp; Peripherals</h4>
                  <p className={styles.osFeatureTileDesc}>Pair wireless gaming controllers, high-end soundbars, and headphones with low latency.</p>
                </div>
              </div>
            </div>

            {/* Available Sizes & Direct Pricing */}
            <div className={styles.osSizesContainer}>
              <span className={styles.osSizesLabel}>Available Sizes &amp; Direct Pricing:</span>
              <div className={styles.osSizesPillsRow}>
                {androidProduct?.variants?.map((v: any) => (
                  <Link
                    key={v.id}
                    href={`/product/${androidProduct.id}?variantId=${v.id}`}
                    className={styles.osSizePricePillAndroid}
                  >
                    <span className={styles.osSizeName}>{v.name.split('(')[0].trim()}</span>
                    <span className={styles.osSizePrice}>₹{Math.round(v.price).toLocaleString('en-IN')}</span>
                  </Link>
                )) || (
                  <>
                    <span className={styles.osSizePricePillAndroid}>32&quot; HD • ₹15,199</span>
                    <span className={styles.osSizePricePillAndroid}>43&quot; FHD • ₹23,199</span>
                    <span className={styles.osSizePricePillAndroid}>50&quot; 4K • ₹29,249</span>
                    <span className={styles.osSizePricePillAndroid}>55&quot; 4K • ₹33,749</span>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Card Action */}
            <div className={styles.osCardBottomBar}>
              <Link
                href={androidProduct ? `/product/${androidProduct.id}` : '/shop'}
                className={styles.osAndroidCtaBtn}
              >
                <span>EXPLORE ANDROID TV SERIES</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Side-by-Side Ecosystem Comparison Matrix */}
        <div className={styles.osComparisonWrapper}>
          <div className={styles.osComparisonHeader}>
            <div>
              <h3 className={styles.osComparisonTitle}>Platform Comparison Matrix</h3>
              <p className={styles.osComparisonSubtitle}>Direct breakdown between WebOS TV and Android TV capabilities.</p>
            </div>
            <span className={styles.osComparisonBadge}>QUICK SPEC MATCH</span>
          </div>

          <div className={styles.osTableResponsive}>
            <table className={styles.osComparisonTable}>
              <thead>
                <tr>
                  <th>Capability / Feature</th>
                  <th>
                    <div className={styles.thPlatform}>
                      <span className={styles.thBadgeWebos}>W-CLASS</span>
                      <span>WebOS TV</span>
                    </div>
                  </th>
                  <th>
                    <div className={styles.thPlatform}>
                      <span className={styles.thBadgeAndroid}>A-CLASS</span>
                      <span>Android TV</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.tdFeatureName}>
                    <strong>Navigation &amp; UI</strong>
                    <span>Core user interface experience</span>
                  </td>
                  <td>
                    <span className={styles.tableCheckIcon}>✨</span>
                    <strong>Bottom Blade Ribbon Bar</strong>
                    <p>Minimalist dock navigation that never blocks what you are currently watching.</p>
                  </td>
                  <td>
                    <span className={styles.tableCheckIcon}>📺</span>
                    <strong>Google Discovery Feed</strong>
                    <p>Rich, content-forward home screen with algorithmic movie &amp; show suggestions.</p>
                  </td>
                </tr>

                <tr>
                  <td className={styles.tdFeatureName}>
                    <strong>Remote Control</strong>
                    <span>Hardware input method</span>
                  </td>
                  <td>
                    <span className={styles.tableCheckIcon}>🖱️</span>
                    <strong>Magic Air-Mouse Remote</strong>
                    <p>Gyro-powered point &amp; click cursor with mechanical scroll wheel.</p>
                  </td>
                  <td>
                    <span className={styles.tableCheckIcon}>🎙️</span>
                    <strong>Smart Voice Assistant Remote</strong>
                    <p>Ergonomic Bluetooth remote with one-touch Google Assistant voice control.</p>
                  </td>
                </tr>

                <tr>
                  <td className={styles.tdFeatureName}>
                    <strong>App Ecosystem</strong>
                    <span>Supported application stores</span>
                  </td>
                  <td>
                    <span className={styles.tableCheckIcon}>🎬</span>
                    <strong>Official Content Store</strong>
                    <p>Curated 4K apps: Netflix, Prime Video, Disney+ Hotstar, Apple TV, YouTube, Zee5.</p>
                  </td>
                  <td>
                    <span className={styles.tableCheckIcon}>🛍️</span>
                    <strong>Google Play Store</strong>
                    <p>Over 10,000+ certified television apps, utilities, streaming services, and games.</p>
                  </td>
                </tr>

                <tr>
                  <td className={styles.tdFeatureName}>
                    <strong>Wireless Casting</strong>
                    <span>Mobile &amp; PC screen mirroring</span>
                  </td>
                  <td>
                    <span className={styles.tableCheckIcon}>🍎</span>
                    <strong>Apple AirPlay 2 + Miracast</strong>
                    <p>Native high-bitrate streaming for iPhone, iPad, Mac &amp; Windows PCs.</p>
                  </td>
                  <td>
                    <span className={styles.tableCheckIcon}>📡</span>
                    <strong>Chromecast Built-In</strong>
                    <p>Instant 1-tap casting from Android phones, tablets, and Google Chrome tabs.</p>
                  </td>
                </tr>

                <tr>
                  <td className={styles.tdFeatureName}>
                    <strong>Available Screen Sizes</strong>
                    <span>Display options in this series</span>
                  </td>
                  <td>
                    <div className={styles.tableSizesList}>
                      <span className={styles.tableSizePillW}>43&quot; 4K Ultra HD</span>
                      <span className={styles.tableSizePillW}>55&quot; 4K Ultra HD</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.tableSizesList}>
                      <span className={styles.tableSizePillA}>32&quot; HD Ready</span>
                      <span className={styles.tableSizePillA}>43&quot; Full HD</span>
                      <span className={styles.tableSizePillA}>50&quot; 4K Ultra HD</span>
                      <span className={styles.tableSizePillA}>55&quot; 4K Ultra HD</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className={styles.tdFeatureName}>
                    <strong>Best Recommended For</strong>
                    <span>Ideal buyer profile</span>
                  </td>
                  <td>
                    <strong>Movie Enthusiasts &amp; Apple Users</strong>
                    <p>Anyone who wants snappy point-and-click speed, Apple AirPlay, and pristine 4K streaming.</p>
                  </td>
                  <td>
                    <strong>App Lovers, Gamers &amp; All Rooms</strong>
                    <p>Anyone wanting Google voice controls, massive app variety, and screen sizes from 32&quot; to 55&quot;.</p>
                  </td>
                </tr>
              </tbody>
            </table>
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
                const s = (product.series || '').toUpperCase().trim()
                const seriesTheme: 'a-class' | 'w-class' = s.startsWith('A') ? 'a-class' : 'w-class'

                return (
                  <ShopVariantCard
                    key={variant.id}
                    product={product}
                    variant={variant}
                    seriesTheme={seriesTheme as any}
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

      {/* Complete 6-Model Lineup + Room Viewing Distance Guide */}
      <HomeLineupSection products={products} />

      {/* Verified Customer Testimonials / Reviews Carousel */}
      <TestimonialCarousel />
    </div>
  )
}
