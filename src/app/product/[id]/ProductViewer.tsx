"use client"
import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import AddToCartButton from '@/components/AddToCartButton'
import ShopVariantCard from '@/components/ShopVariantCard'

// Smart Spec Explanation Dictionary
const SPEC_EXPLANATIONS: Record<string, { title: string; desc: string }> = {
  'resolution': {
    title: 'Display Resolution',
    desc: 'The total number of pixels on the screen. 4K Ultra HD (3840x2160) provides 4 times higher clarity and detail than standard Full HD displays.'
  },
  'display panel': {
    title: 'Panel Technology',
    desc: 'Grade A+ Quantum Dot / BOE panel delivering rich contrast, wide viewing angles, and vibrant 100% color volume.'
  },
  'panel': {
    title: 'Panel Technology',
    desc: 'Grade A+ Quantum Dot / BOE panel delivering rich contrast, wide viewing angles, and vibrant 100% color volume.'
  },
  'operating system': {
    title: 'Smart TV Operating System',
    desc: 'Cloud-based smart OS offering instant app launching, cloud streaming, voice remote compatibility, and zero-lag performance.'
  },
  'os': {
    title: 'Smart TV Operating System',
    desc: 'Cloud-based smart OS offering instant app launching, cloud streaming, voice remote compatibility, and zero-lag performance.'
  },
  'refresh rate': {
    title: 'Refresh Rate',
    desc: 'The frequency at which the display updates per second (60Hz / 120Hz). Ensures smooth motion blur-free sports and gaming action.'
  },
  'sound output': {
    title: 'Audio Output & Speakers',
    desc: 'High-fidelity acoustic speakers with Dolby Audio tuning, delivering crisp dialogue and immersive room-filling bass.'
  },
  'audio': {
    title: 'Audio Output & Speakers',
    desc: 'High-fidelity acoustic speakers with Dolby Audio tuning, delivering crisp dialogue and immersive room-filling bass.'
  },
  'speakers': {
    title: 'Audio Output & Speakers',
    desc: 'High-fidelity acoustic speakers with Dolby Audio tuning, delivering crisp dialogue and immersive room-filling bass.'
  },
  'hdmi ports': {
    title: 'HDMI Connectivity',
    desc: 'High-speed HDMI 2.1 ports for connecting set-top boxes, gaming consoles (PlayStation/Xbox), and ARC soundbars.'
  },
  'hdmi': {
    title: 'HDMI Connectivity',
    desc: 'High-speed HDMI 2.1 ports for connecting set-top boxes, gaming consoles (PlayStation/Xbox), and ARC soundbars.'
  },
  'connectivity': {
    title: 'Wireless & Wired Ports',
    desc: 'Dual-band Wi-Fi, Dual Bluetooth, HDMI, and USB connectivity for effortless pairing with all home audio & devices.'
  },
  'bluetooth': {
    title: 'Dual Bluetooth Technology',
    desc: 'Allows two Bluetooth audio devices to be connected simultaneously — e.g. wireless headphones and a Bluetooth soundbar.'
  },
  'voltage': {
    title: 'Indian Voltage Protection',
    desc: 'Built-in wide-range voltage surge protection (90V - 290V) specifically engineered for Indian power fluctuation conditions without requiring an external stabilizer.'
  },
  'power': {
    title: 'Indian Voltage Protection',
    desc: 'Built-in wide-range voltage surge protection (90V - 290V) specifically engineered for Indian power fluctuation conditions without requiring an external stabilizer.'
  },
  'ram': {
    title: 'RAM & Memory',
    desc: 'High-speed system memory for fluid app switching, fast buffering, and rapid menu response.'
  },
  'storage': {
    title: 'Internal Storage',
    desc: 'Onboard flash memory for installing apps, games, and system software updates.'
  },
  'cloud os': {
    title: 'Cloud OS Operating System',
    desc: 'Advanced cloud-based operating system providing instant app streaming, cloud gaming, and lag-free TV navigation.'
  },
  'cloud': {
    title: 'Cloud OS Operating System',
    desc: 'Advanced cloud-based operating system providing instant app streaming, cloud gaming, and lag-free TV navigation.'
  },
  'movies': {
    title: '5000+ Free Content Hub',
    desc: 'Access 5000+ free movies, TV shows, and cloud games pre-loaded directly on your TV without extra subscriptions.'
  },
  'games': {
    title: '5000+ Free Content Hub',
    desc: 'Access 5000+ free movies, TV shows, and cloud games pre-loaded directly on your TV without extra subscriptions.'
  },
  'voice remote': {
    title: 'Cloud Voice Remote',
    desc: 'Smart remote control featuring instant voice search microphone, dedicated app keys, and Bluetooth connectivity.'
  },
  'remote': {
    title: 'Cloud Voice Remote',
    desc: 'Smart remote control featuring instant voice search microphone, dedicated app keys, and Bluetooth connectivity.'
  },
  'quantum dot': {
    title: 'Quantum Dot Display',
    desc: 'Nano-crystal display technology producing 100% color volume, deeper blacks, and ultra-high brightness for Indian living rooms.'
  },
  'play store': {
    title: 'Google Play Store',
    desc: 'Access 10,000+ TV apps, games, and streaming services directly on your HAUS OF INDIA smart display.'
  },
  'google play': {
    title: 'Google Play Store',
    desc: 'Access 10,000+ TV apps, games, and streaming services directly on your HAUS OF INDIA smart display.'
  },
  'google': {
    title: 'Google Smart TV Ecosystem',
    desc: 'Official Google TV system providing personalized content recommendations, Google Assistant voice search, and Play Store app access.'
  },
  'android': {
    title: 'Official Android TV OS',
    desc: 'Powered by official Android TV OS ensuring smooth performance, regular security updates, and full Google ecosystem compatibility.'
  },
  'chromecast': {
    title: 'Chromecast Built-In',
    desc: 'Cast photos, videos, movies, and music instantly from your smartphone or tablet onto the big screen with zero setup.'
  },
  'wifi': {
    title: 'High-Speed Wi-Fi',
    desc: 'High-speed wireless connectivity ensuring smooth, buffer-free 4K video streaming and instant app downloads.'
  },
  'wi-fi': {
    title: 'High-Speed Wi-Fi',
    desc: 'High-speed wireless connectivity ensuring smooth, buffer-free 4K video streaming and instant app downloads.'
  },
  'apps': {
    title: 'Smart TV Apps',
    desc: 'Preloaded and downloadable apps including YouTube, Prime Video, Netflix, Disney+ Hotstar, and 5000+ free cloud games.'
  },
  'warranty': {
    title: 'HAUS Guarantee & Warranty',
    desc: '2 Years comprehensive warranty on manufacturing defects & panel + 3rd Year free labour warranty service.'
  }
}

interface ParsedFeature {
  title: string
  image?: string
  description?: string
}

function parseFeaturesList(rawFeatures: any): ParsedFeature[] {
  if (!rawFeatures) return []
  let list = rawFeatures
  if (typeof rawFeatures === 'string') {
    try { list = JSON.parse(rawFeatures) } catch (e) { list = [] }
  }
  if (!Array.isArray(list)) return []

  const result: ParsedFeature[] = []
  for (const item of list) {
    if (typeof item === 'string' && item.trim() !== '') {
      result.push({ title: item.trim(), image: '', description: '' })
    } else if (item && typeof item === 'object' && item.title && String(item.title).trim() !== '') {
      result.push({
        title: String(item.title).trim(),
        image: item.image ? String(item.image).trim() : '',
        description: item.description ? String(item.description).trim() : ''
      })
    }
  }
  return result
}

export default function ProductViewer({ 
  product, 
  initialVariantId,
  allProducts = [] 
}: { 
  product: any; 
  initialVariantId?: string;
  allProducts?: any[];
}) {
  const [selectedVariantId, setSelectedVariantId] = useState(() => {
    return product.variants.find((v: any) => v.id === initialVariantId)?.id || product.variants[0]?.id
  })
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Active Info Modal State
  const [activeModal, setActiveModal] = useState<{ title: string; description: string } | null>(null)

  const selectedVariant = product.variants.find((v: any) => v.id === selectedVariantId) || product.variants[0]

  // Extract size string from selected variant name (e.g. "43" from "43 Inches" or "43\"")
  const sizeMatch = selectedVariant?.name ? selectedVariant.name.match(/\d+/) : null
  const targetSizeNumber = sizeMatch ? sizeMatch[0] : ''

  // Collect all variant cards across all products for recommendations
  const allVariantItems: Array<{ product: any; variant: any; seriesTheme: 'c-class' | 'a-class' | 'g-class' }> = []
  allProducts.forEach((p: any) => {
    const seriesTheme = (p.series || '').toUpperCase().includes('A') 
      ? 'a-class' 
      : (p.series || '').toUpperCase().includes('G') ? 'g-class' : 'c-class'
    p.variants?.forEach((v: any) => {
      allVariantItems.push({ product: p, variant: v, seriesTheme })
    })
  })

  // 1. Relatable Products (Same Screen Size or Similar Series)
  const sameSizeItems = allVariantItems.filter(item => {
    if (item.variant.id === selectedVariant?.id) return false
    if (targetSizeNumber && item.variant.name.includes(targetSizeNumber)) return true
    return false
  })

  // Fallback if not enough same-size items
  const relatableItems = sameSizeItems.length >= 2 
    ? sameSizeItems 
    : allVariantItems.filter(item => item.variant.id !== selectedVariant?.id)

  const displayRelatableItems = relatableItems.slice(0, 4)

  // 2. On-Sale Products (Flash Sale Deals)
  const onSaleItems = allVariantItems.filter(item => item.variant.isOnSale && item.variant.id !== selectedVariant?.id).slice(0, 4)

  // Parse feature lists
  const productFeatures = parseFeaturesList(product.features)
  const variantFeatures = parseFeaturesList(selectedVariant?.features)
  const displayFeatures = variantFeatures.length > 0 ? variantFeatures : productFeatures

  // Parse specs
  let productSpecs = []
  try { productSpecs = product.specs ? JSON.parse(product.specs) : [] } catch (e) {}
  if (!Array.isArray(productSpecs)) productSpecs = []

  let variantSpecs = []
  try { variantSpecs = selectedVariant?.specs ? JSON.parse(selectedVariant.specs) : [] } catch (e) {}
  if (!Array.isArray(variantSpecs)) variantSpecs = []

  let variantImages = []
  try { variantImages = selectedVariant?.images ? JSON.parse(selectedVariant.images) : [] } catch (e) {}
  if (!Array.isArray(variantImages)) variantImages = []

  // Merge specs
  const specsMap = new Map()
  productSpecs.forEach((s: any) => {
    if (s.key && s.key.trim() !== '') specsMap.set(s.key.toLowerCase().trim(), { key: s.key, value: s.value, description: s.description })
  })
  variantSpecs.forEach((s: any) => {
    if (s.key && s.key.trim() !== '') {
      if (s.value === '__REMOVED__') {
        specsMap.delete(s.key.toLowerCase().trim())
      } else {
        specsMap.set(s.key.toLowerCase().trim(), { key: s.key, value: s.value, description: s.description })
      }
    }
  })
  const displaySpecsArray = Array.from(specsMap.values())

  // Images
  const images = variantImages.length > 0 ? variantImages : (product.imageUrl ? [product.imageUrl] : [])
  const mainImage = images[currentImageIndex] || ''

  // Function to get info for a spec key
  const getSpecExplanation = (key: string, value: string) => {
    const k = key.toLowerCase().trim()
    for (const dictKey in SPEC_EXPLANATIONS) {
      if (k.includes(dictKey)) {
        return SPEC_EXPLANATIONS[dictKey]
      }
    }
    const valText = value && value.trim() !== '' ? ` (${value})` : ''
    return {
      title: key,
      desc: `${key}${valText} is engineered specifically for HAUS OF INDIA displays to optimize performance, clarity, and long-term durability.`
    }
  }

  return (
    <div className={`container ${styles.productPage}`}>
      <Link href="/#catalog" className={styles.backLink}>&larr; Back to Catalog</Link>

      {/* TOP SECTION: Buy Box Split */}
      <div className={styles.productGrid}>
        
        {/* Left Side: TV Showcase Image */}
        <div className={styles.imageSection}>
          <div className={styles.showcaseWrapper}>
            <div className={selectedVariant?.isOnSale ? `${styles.ambientGlowHalo} ${styles.saleHalo}` : styles.ambientGlowHalo}></div>
            
            <div className={`${styles.imageCard} ${selectedVariant?.isOnSale ? styles.saleImageCard : ''}`}>
              <div className={styles.imagePlaceholder} style={{ 
                backgroundImage: mainImage ? `url(${mainImage})` : 'none',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}>
                {!mainImage && <h2 className="text-cyan">{product.series}</h2>}
              </div>
            </div>
          </div>
          
          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className={styles.thumbnailList}>
              {images.map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`${styles.thumbnailCard} ${currentImageIndex === idx ? styles.thumbnailActive : ''}`}
                  style={{ 
                    backgroundImage: `url(${img})`
                  }} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Buy Box */}
        <div className={styles.detailsSection}>
          <div className={styles.badgeContainer}>
            <div className={styles.badge}>{product.series} SERIES</div>
            {selectedVariant?.isOnSale && (
              <span className={styles.flashSaleBannerBadge}>FLASH SALE ACTIVE</span>
            )}
          </div>

          <h1 className={styles.title}>
            {product.title} - {selectedVariant?.name}
          </h1>
          <p className={styles.description}>{product.description}</p>
          
          <div className={`${styles.priceContainer} ${selectedVariant?.isOnSale ? styles.salePriceContainer : ''}`}>
            <p className={styles.priceLabel}>
              {selectedVariant?.isOnSale ? 'FLASH SALE PRICE' : 'PRICE'}
            </p>
            <div className={styles.priceFlex}>
              <p className={`${styles.price} ${selectedVariant?.isOnSale ? styles.salePriceText : ''}`}>
                ₹{Math.round(selectedVariant?.price || 0).toLocaleString('en-IN')}
              </p>
              {selectedVariant?.discountPct > 0 && (
                <p className={styles.mrpCrossed}>
                  ₹{Math.round(selectedVariant?.mrp || 0).toLocaleString('en-IN')}
                </p>
              )}
            </div>
            {selectedVariant?.discountPct > 0 && (
              <p className={selectedVariant?.isOnSale ? styles.saleNoticeHighlight : styles.saveNotice}>
                You save {selectedVariant.discountPct}% (₹{Math.round((selectedVariant?.mrp || 0) - (selectedVariant?.price || 0)).toLocaleString('en-IN')})
              </p>
            )}
          </div>

          {/* Model Size Selection Pills */}
          <div className={styles.variantsSection}>
            <h3 className={styles.sectionTitle}>SELECT MODEL SIZE</h3>
            <div className={styles.variantsPillGrid}>
              {product.variants.map((variant: any) => {
                const isSelected = selectedVariantId === variant.id
                return (
                  <button 
                    key={variant.id} 
                    type="button"
                    className={`${styles.variantPill} ${isSelected ? styles.variantPillActive : ''} ${variant.isOnSale ? styles.variantPillOnSale : ''}`}
                    onClick={() => {
                      setSelectedVariantId(variant.id)
                      setCurrentImageIndex(0)
                      if (typeof window !== 'undefined') {
                        const url = new URL(window.location.href)
                        url.searchParams.set('variantId', variant.id)
                        window.history.replaceState(null, '', url.pathname + url.search)
                      }
                    }}
                  >
                    <span className={styles.variantSizeText}>{variant.name}</span>
                    <span className={`${styles.variantPriceText} ${variant.isOnSale ? styles.variantPriceSale : ''}`}>
                      ₹{Math.round(variant.price).toLocaleString('en-IN')}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          
          <div style={{ margin: '32px 0 20px 0' }}>
            <AddToCartButton 
              variantId={selectedVariant?.id} 
              productId={product.id} 
              title={product.title} 
              size={selectedVariant?.name} 
              price={selectedVariant?.price} 
            />
          </div>

          {/* Warranty & 15-Day Return Guarantee Badges */}
          <div className={styles.trustBadgesBox}>
            <div className={styles.trustBadgeItem}>
              <div className={styles.trustBadgeIcon}>🛡️</div>
              <div className={styles.trustBadgeText}>
                <strong>2 Years Warranty + 3rd Year Labour Free</strong>
                <span>2-Year comprehensive warranty on manufacturing defects + 3rd-year free labour service (parts charged at cost).</span>
              </div>
            </div>
            <div className={styles.trustBadgeItem}>
              <div className={styles.trustBadgeIcon}>🔄</div>
              <div className={styles.trustBadgeText}>
                <strong>15 Days Return Guarantee</strong>
                <span>15-day return window for complete peace of mind.</span>
              </div>
            </div>
            <div className={styles.trustBadgeItem}>
              <div className={styles.trustBadgeIcon}>🚚</div>
              <div className={styles.trustBadgeText}>
                <strong>Direct Manufacturer Support</strong>
                <span>Direct service assistance & fast dispatch across India.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH SHOWCASE SECTION: Features (Left) & Technical Specifications (Right) */}
      <div className={styles.showcaseSection}>
        <div className={styles.showcaseGrid}>
          
          {/* LEFT COLUMN: Key Features & Highlights */}
          <div className={styles.showcaseBlock}>
            <div className={styles.blockHeader}>
              <h2 className={styles.blockTitle}>KEY FEATURES & HIGHLIGHTS</h2>
              <span className={styles.blockSubtitle}>Engineered for performance & durability</span>
            </div>

            <div className={styles.featureCardsGrid}>
              {displayFeatures.map((feat, i) => (
                <div key={i} className={styles.featureCard}>
                  {feat.image ? (
                    <div className={styles.featureImageContainer}>
                      <img src={feat.image} alt={feat.title} className={styles.featureCardImage} />
                    </div>
                  ) : (
                    <div className={styles.featureIconBadge}>✦</div>
                  )}
                  
                  <div className={styles.featureCardBody}>
                    <div className={styles.featureCardTitleRow}>
                      <h4 className={styles.featureCardTitle}>{feat.title}</h4>
                      <button 
                        type="button"
                        className={styles.infoBtn}
                        title="Click for feature details"
                        onClick={() => {
                          const info = getSpecExplanation(feat.title, '')
                          setActiveModal({
                            title: info.title || feat.title,
                            description: feat.description || info.desc
                          })
                        }}
                      >
                        i
                      </button>
                    </div>
                    {feat.description && (
                      <p className={styles.featureCardDesc}>{feat.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Technical Specifications */}
          <div className={styles.showcaseBlock}>
            <div className={styles.blockHeader}>
              <h2 className={styles.blockTitle}>TECHNICAL SPECIFICATIONS</h2>
              <span className={styles.blockSubtitle}>Complete hardware & software breakdown</span>
            </div>

            <div className={styles.specsTableCard}>
              {displaySpecsArray.map((spec: any, idx: number) => {
                const info = getSpecExplanation(spec.key, spec.value)
                return (
                  <div key={idx} className={styles.specRow}>
                    <div className={styles.specKeyCell}>
                      <span className={styles.specKeyName}>{spec.key}</span>
                      <button 
                        type="button"
                        className={styles.infoBtnSmall}
                        title="Click to learn about this spec"
                        onClick={() => setActiveModal({
                          title: info.title || spec.key,
                          description: info.desc
                        })}
                      >
                        i
                      </button>
                    </div>
                    <div className={styles.specValCell}>
                      {spec.value}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 1: RELATABLE PRODUCTS (SAME SCREEN SIZE / ALTERNATIVE SERIES) */}
      {displayRelatableItems.length > 0 && (
        <div className={styles.recommendationsSection}>
          <div className={styles.recommendationsHeader}>
            <h3 className={styles.recommendationsTitle}>
              <span>⚡ MORE {targetSizeNumber ? `${targetSizeNumber}"` : ''} INCH MODELS & ALTERNATIVES</span>
            </h3>
            <p className={styles.recommendationsSubtitle}>
              Compare other {targetSizeNumber ? `${targetSizeNumber}"` : ''} screen sizes and series side-by-side to find your perfect fit
            </p>
          </div>
          <div className={styles.recommendationsGrid}>
            {displayRelatableItems.map(item => (
              <ShopVariantCard 
                key={`${item.product.id}-${item.variant.id}`}
                product={item.product}
                variant={item.variant}
                seriesTheme={item.seriesTheme}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: EXCLUSIVE ON-SALE DEALS */}
      {onSaleItems.length > 0 && (
        <div className={styles.recommendationsSection}>
          <div className={styles.recommendationsHeader}>
            <h3 className={styles.recommendationsTitle}>
              <span style={{ color: '#ff7700' }}>🔥 EXCLUSIVE ON-SALE DEALS</span>
            </h3>
            <p className={styles.recommendationsSubtitle}>
              Limited-time discounts and special manufacturer flash sale offers available right now
            </p>
          </div>
          <div className={styles.recommendationsGrid}>
            {onSaleItems.map(item => (
              <ShopVariantCard 
                key={`sale-${item.product.id}-${item.variant.id}`}
                product={item.product}
                variant={item.variant}
                seriesTheme={item.seriesTheme}
              />
            ))}
          </div>
        </div>
      )}

      {/* INTERACTIVE FEATURE & SPEC INFO EXPLANATION MODAL */}
      {activeModal && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button 
              type="button" 
              className={styles.modalCloseBtn}
              onClick={() => setActiveModal(null)}
            >
              ✕
            </button>
            <div className={styles.modalHeader}>
              <span className={styles.modalBadge}>FEATURE EXPLANATION</span>
              <h3 className={styles.modalTitle}>{activeModal.title}</h3>
            </div>
            <p className={styles.modalDesc}>{activeModal.description}</p>
            <div className={styles.modalFooter}>
              <button 
                type="button" 
                className="btn-pill-blue"
                style={{ fontSize: '0.85rem', padding: '10px 24px' }}
                onClick={() => setActiveModal(null)}
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
