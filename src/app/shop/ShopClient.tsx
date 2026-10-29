"use client"

import { useState, useMemo } from 'react'
import ShopVariantCard from '@/components/ShopVariantCard'
import styles from './page.module.css'

type ShopClientProps = {
  initialProducts: any[]
}

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const [selectedSeries, setSelectedSeries] = useState<string>('ALL')
  const [selectedResolution, setSelectedResolution] = useState<string>('ALL')
  const [selectedSize, setSelectedSize] = useState<string>('ALL')

  // Map products by series
  const wClassProduct = useMemo(
    () => initialProducts.find(p => {
      const s = (p.series || '').toUpperCase()
      const t = (p.title || '').toLowerCase()
      return s.includes('W') || s.includes('WEBOS') || t.includes('webos')
    }),
    [initialProducts]
  )
  const aClassProduct = useMemo(
    () => initialProducts.find(p => {
      const s = (p.series || '').toUpperCase().trim()
      const t = (p.title || '').toLowerCase()
      return s.startsWith('A') || t.includes('android')
    }),
    [initialProducts]
  )

  // Dynamically extract all available screen sizes across variants
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>()
    initialProducts.forEach((product: any) => {
      product.variants.forEach((variant: any) => {
        const match = variant.name.match(/^(\d{2}["”'])/)
        if (match) {
          sizeSet.add(match[1])
        } else if (variant.name.startsWith('32"')) sizeSet.add('32"')
        else if (variant.name.startsWith('43"')) sizeSet.add('43"')
        else if (variant.name.startsWith('50"')) sizeSet.add('50"')
        else if (variant.name.startsWith('55"')) sizeSet.add('55"')
        else if (variant.name.startsWith('65"')) sizeSet.add('65"')
      })
    })
    return Array.from(sizeSet).sort((a, b) => parseInt(a) - parseInt(b))
  }, [initialProducts])

  // Filter matching logic
  const isVariantMatching = (product: any, variant: any) => {
    // 1. Series Filter
    if (selectedSeries !== 'ALL' && product.series.toUpperCase() !== selectedSeries) {
      return false
    }

    // 2. Resolution Filter (4K vs HD/FHD)
    const nameUpper = variant.name.toUpperCase()
    if (selectedResolution === '4K') {
      if (!nameUpper.includes('4K')) return false
    } else if (selectedResolution === 'HD') {
      if (nameUpper.includes('4K')) return false
      if (!nameUpper.includes('HD') && !nameUpper.includes('FHD')) return false
    }

    // 3. Size Filter
    if (selectedSize !== 'ALL') {
      if (!nameUpper.includes(selectedSize.toUpperCase())) return false
    }

    return true
  }

  // Filter variants per series
  const wClassVariants = useMemo(() => {
    if (!wClassProduct) return []
    return wClassProduct.variants.filter((v: any) => isVariantMatching(wClassProduct, v))
  }, [wClassProduct, selectedSeries, selectedResolution, selectedSize])

  const aClassVariants = useMemo(() => {
    if (!aClassProduct) return []
    return aClassProduct.variants.filter((v: any) => isVariantMatching(aClassProduct, v))
  }, [aClassProduct, selectedSeries, selectedResolution, selectedSize])

  const totalMatchingVariants = wClassVariants.length + aClassVariants.length

  // Smooth scroll handler for Series Shortcut Buttons
  const scrollToSeries = (seriesId: string, seriesKey: string) => {
    // If series filter was isolated, reset or set to target series
    if (selectedSeries !== 'ALL' && selectedSeries !== seriesKey) {
      setSelectedSeries('ALL')
    }

    setTimeout(() => {
      const element = document.getElementById(seriesId)
      if (element) {
        const yOffset = -140 // Offset for sticky sub-header navbar
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }, 50)
  }

  const resetFilters = () => {
    setSelectedSeries('ALL')
    setSelectedResolution('ALL')
    setSelectedSize('ALL')
  }

  return (
    <div className={styles.shopPage}>
      {/* Top Shop Hero Banner */}
      <section className={styles.shopHero}>
        <div className="container">
          <div className={styles.heroTag}>
            <span>✦ THE COMPLETE HAUS SHOWCASE</span>
          </div>
          <h1 className={styles.heroTitle}>
            EXPLORE ALL <span className={styles.heroTitleHighlight}>MODELS & VARIANTS</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Compare variants across our signature WebOS TV and Android TV series. Engineered with premium BOE panels, immersive Dolby Audio, and smart connectivity.
          </p>
        </div>
      </section>

      {/* ELEGANT & COMPACT STICKY FILTER BAR */}
      <div className={styles.stickyFilterBar}>
        <div className={`container ${styles.filterBarContainer}`}>
          
          {/* Left Group: Series Segmented Tabs + Dropdowns */}
          <div className={styles.filterControlsGroup}>
            
            {/* Series Segmented Selector */}
            <div className={styles.seriesTabs}>
              <button
                onClick={() => setSelectedSeries('ALL')}
                className={`${styles.seriesTab} ${selectedSeries === 'ALL' ? styles.activeTabAll : ''}`}
              >
                All Series
              </button>
              <button
                onClick={() => setSelectedSeries('W-CLASS')}
                className={`${styles.seriesTab} ${styles.tabW} ${selectedSeries === 'W-CLASS' ? styles.activeTabW : ''}`}
                title="W-Class Series (WebOS TV)"
              >
                <span className={styles.tabBadgeW}>W</span>
                <span>WebOS TV</span>
              </button>
              <button
                onClick={() => setSelectedSeries('A-CLASS')}
                className={`${styles.seriesTab} ${styles.tabA} ${selectedSeries === 'A-CLASS' ? styles.activeTabA : ''}`}
                title="A-Class Series (Android TV)"
              >
                <span className={styles.tabBadgeA}>A</span>
                <span>Android TV</span>
              </button>
            </div>

            <div className={styles.filterDivider} />

            {/* Resolution Select Dropdown */}
            <div className={styles.selectWrapper}>
              <select
                value={selectedResolution}
                onChange={(e) => setSelectedResolution(e.target.value)}
                className={`${styles.filterSelect} ${selectedResolution !== 'ALL' ? styles.activeSelect : ''}`}
                aria-label="Filter by Resolution"
              >
                <option value="ALL">All Resolutions</option>
                <option value="4K">✦ 4K Ultra HD</option>
                <option value="HD">HD / Full HD</option>
              </select>
            </div>

            {/* Size Select Dropdown */}
            {availableSizes.length > 0 && (
              <div className={styles.selectWrapper}>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className={`${styles.filterSelect} ${selectedSize !== 'ALL' ? styles.activeSelect : ''}`}
                  aria-label="Filter by Display Size"
                >
                  <option value="ALL">All Sizes</option>
                  {availableSizes.map((size: string) => (
                    <option key={size} value={size}>
                      {size} Display
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>

          {/* Right Group: Count & Reset */}
          <div className={styles.filterMetaGroup}>
            {(selectedSeries !== 'ALL' || selectedResolution !== 'ALL' || selectedSize !== 'ALL') && (
              <button onClick={resetFilters} className={styles.resetBtn} title="Reset all filters">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span>Reset</span>
              </button>
            )}

            <span className={styles.variantCountBadge}>
              {totalMatchingVariants} {totalMatchingVariants === 1 ? 'Variant' : 'Variants'}
            </span>
          </div>

        </div>
      </div>

      <div className="container">
        {/* NO RESULTS FOUND STATE */}
        {totalMatchingVariants === 0 && (
          <div className={styles.noResultsCard}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3>No TV variants match your selected filter criteria</h3>
            <p>Try adjusting your series, resolution (4K / HD), or screen size selection.</p>
            <button onClick={resetFilters} className="btn-pill-blue">
              CLEAR ALL FILTERS
            </button>
          </div>
        )}

        {/* SECTION 1: HOI-W SERIES WEBOS TV */}
        {wClassProduct && wClassVariants.length > 0 && (
          <section id="w-class-section" className={styles.seriesSection}>
            <div className={`${styles.seriesBanner} ${styles.wSeriesBanner}`}>
              <div className={styles.seriesBannerHeader}>
                <span className={`${styles.seriesBadge} ${styles.wSeriesBadge}`}>W-CLASS SERIES</span>
                <span className={styles.seriesVariantCount}>{wClassVariants.length} Models Available (43&quot;, 55&quot;)</span>
              </div>
              <h2 className={styles.seriesHeaderTitle}>{wClassProduct.title}</h2>
              <p className={styles.seriesHeaderDesc}>{wClassProduct.description}</p>
            </div>

            <div className={styles.variantGrid}>
              {wClassVariants.map((variant: any) => (
                <ShopVariantCard 
                  key={variant.id}
                  product={wClassProduct}
                  variant={variant}
                  seriesTheme="w-class"
                />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: HOI-A SERIES ANDROID TV */}
        {aClassProduct && aClassVariants.length > 0 && (
          <section id="a-class-section" className={styles.seriesSection}>
            <div className={`${styles.seriesBanner} ${styles.aSeriesBanner}`}>
              <div className={styles.seriesBannerHeader}>
                <span className={`${styles.seriesBadge} ${styles.aSeriesBadge}`}>A-CLASS SERIES</span>
                <span className={styles.seriesVariantCount}>{aClassVariants.length} Models Available (32&quot;, 43&quot;, 50&quot;, 55&quot;)</span>
              </div>
              <h2 className={styles.seriesHeaderTitle}>{aClassProduct.title}</h2>
              <p className={styles.seriesHeaderDesc}>{aClassProduct.description}</p>
            </div>

            <div className={styles.variantGrid}>
              {aClassVariants.map((variant: any) => (
                <ShopVariantCard 
                  key={variant.id}
                  product={aClassProduct}
                  variant={variant}
                  seriesTheme="a-class"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
