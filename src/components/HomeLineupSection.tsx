"use client"

import { useState, useMemo } from 'react'
import ShopVariantCard from './ShopVariantCard'
import styles from './HomeLineupSection.module.css'

interface HomeLineupSectionProps {
  products: any[]
}

export default function HomeLineupSection({ products }: HomeLineupSectionProps) {
  const [selectedSeries, setSelectedSeries] = useState<'ALL' | 'W-CLASS' | 'A-CLASS'>('ALL')
  const [selectedSize, setSelectedSize] = useState<string>('ALL')

  const isAndroidProduct = (p: any) => {
    const s = (p.series || '').toUpperCase().trim()
    const t = (p.title || '').toLowerCase()
    return s.startsWith('A') || t.includes('android')
  }

  const isWebosProduct = (p: any) => {
    const s = (p.series || '').toUpperCase().trim()
    const t = (p.title || '').toLowerCase()
    return s.startsWith('W') || s.startsWith('G') || t.includes('webos')
  }

  // Flatten all variants across products with series themes
  const allVariants = useMemo(() => {
    const list: Array<{ product: any; variant: any; seriesTheme: 'w-class' | 'a-class' }> = []
    products.forEach((p: any) => {
      const isAndroid = isAndroidProduct(p)
      const seriesTheme: 'w-class' | 'a-class' = isAndroid ? 'a-class' : 'w-class'
      ;(p.variants || []).forEach((v: any) => {
        list.push({ product: p, variant: v, seriesTheme })
      })
    })
    return list
  }, [products])

  // Extract available sizes dynamically
  const availableSizes = useMemo(() => {
    const set = new Set<string>()
    allVariants.forEach(({ variant }) => {
      const match = variant.name.match(/\d{2}/)
      if (match) set.add(`${match[0]}"`)
    })
    return Array.from(set).sort((a, b) => parseInt(a) - parseInt(b))
  }, [allVariants])

  // Filtered variants
  const filteredVariants = useMemo(() => {
    return allVariants.filter(({ product, variant }) => {
      // 1. Series filter
      if (selectedSeries !== 'ALL') {
        if (selectedSeries === 'W-CLASS' && !isWebosProduct(product)) return false
        if (selectedSeries === 'A-CLASS' && !isAndroidProduct(product)) return false
      }

      // 2. Size filter
      if (selectedSize !== 'ALL') {
        const sizeNum = selectedSize.replace('"', '')
        if (!variant.name.includes(sizeNum)) return false
      }

      return true
    })
  }, [allVariants, selectedSeries, selectedSize])

  const webosCount = allVariants.filter(i => isWebosProduct(i.product)).length
  const androidCount = allVariants.filter(i => isAndroidProduct(i.product)).length

  return (
    <section id="catalog" className={`container ${styles.lineupSection}`}>
      <div className={styles.lineupHeader}>
        <span className={styles.lineupBadge}>✦ COMPLETE SIGNATURE LINEUP</span>
        <h2 className={styles.lineupTitle}>
          OUR PREMIUM <span className={styles.lineupTitleHighlight}>TELEVISIONS</span>
        </h2>
        <p className={styles.lineupSubtitle}>
          Choose your exact screen size and operating ecosystem. Every model engineered with high-precision BOE A+ panels, Dolby Audio, and built-in Indian voltage surge protection.
        </p>
      </div>

      {/* Interactive Filter Bar */}
      <div className={styles.filterBar}>
        {/* Left: Series Segmented Tabs */}
        <div className={styles.seriesTabGroup}>
          <button
            onClick={() => { setSelectedSeries('ALL'); setSelectedSize('ALL'); }}
            className={`${styles.tabBtn} ${selectedSeries === 'ALL' ? styles.activeTabAll : ''}`}
          >
            <span>All Models</span>
            <span className={styles.variantCounter}>({allVariants.length})</span>
          </button>

          <button
            onClick={() => setSelectedSeries('W-CLASS')}
            className={`${styles.tabBtn} ${selectedSeries === 'W-CLASS' ? styles.activeTabWebos : ''}`}
            title="WebOS TV Series (43, 55 Inch)"
          >
            <span className={`${styles.tabBadge} ${styles.badgeWebos}`}>W</span>
            <span>WebOS TV</span>
            <span className={styles.variantCounter}>({webosCount})</span>
          </button>

          <button
            onClick={() => setSelectedSeries('A-CLASS')}
            className={`${styles.tabBtn} ${selectedSeries === 'A-CLASS' ? styles.activeTabAndroid : ''}`}
            title="Android TV Series (32, 43, 50, 55 Inch)"
          >
            <span className={`${styles.tabBadge} ${styles.badgeAndroid}`}>A</span>
            <span>Android TV</span>
            <span className={styles.variantCounter}>({androidCount})</span>
          </button>
        </div>

        {/* Right: Quick Screen Size Chips */}
        <div className={styles.sizeFilterGroup}>
          <span className={styles.sizeFilterLabel}>Screen Size:</span>
          <button
            onClick={() => setSelectedSize('ALL')}
            className={`${styles.sizePill} ${selectedSize === 'ALL' ? styles.sizePillActive : ''}`}
          >
            All
          </button>
          {availableSizes.map(size => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`${styles.sizePill} ${selectedSize === size ? styles.sizePillActive : ''}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* 6-Model Balanced Lineup Grid */}
      {filteredVariants.length > 0 ? (
        <div className={`
          ${styles.modelsGrid}
          ${filteredVariants.length === 2 ? styles.modelsGridTwo : ''}
          ${filteredVariants.length === 4 ? styles.modelsGridFour : ''}
        `}>
          {filteredVariants.map(({ product, variant, seriesTheme }) => (
            <ShopVariantCard
              key={variant.id}
              product={product}
              variant={variant}
              seriesTheme={seriesTheme}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🔍</div>
          <h4 className={styles.emptyStateTitle}>No models match the selected filters</h4>
          <p className={styles.emptyStateDesc}>Try clearing your screen size selection or choose &apos;All Models&apos; to view the complete lineup.</p>
          <button onClick={() => { setSelectedSeries('ALL'); setSelectedSize('ALL'); }} className="btn-pill-blue">
            RESET FILTERS
          </button>
        </div>
      )}

      {/* Interactive Room Size & Viewing Distance Guide (Fills dead space with high-value buyer guidance) */}
      <div className={styles.guideSection}>
        <div className={styles.guideHeader}>
          <div className={styles.guideTitleBlock}>
            <h3>📐 Recommended Viewing Distance &amp; Screen Size Guide</h3>
            <p>Ensure the ultimate cinematic comfort and zero eye fatigue for your room dimensions.</p>
          </div>
          <span className={styles.guideHelpBadge}>ROOM FIT GUIDE</span>
        </div>

        <div className={styles.guideGrid}>
          {/* Card 1: 32" */}
          <div className={styles.guideCard}>
            <div className={styles.guideSizePill}>32 Inch</div>
            <div className={styles.guideRoomType}>
              <span>🛏️ Bedroom / Kitchen</span>
            </div>
            <div className={styles.guideDistance}>
              <span>Ideal Distance: 4 – 6 Feet</span>
            </div>
            <p className={styles.guideDetails}>
              Compact footprint tailored for personal viewing spaces, bedrooms, and studio apartments without dominating wall space.
            </p>
            <div className={styles.guidePlatformTag}>
              Available in: <strong>Android TV Series</strong>
            </div>
          </div>

          {/* Card 2: 43" */}
          <div className={styles.guideCard}>
            <div className={styles.guideSizePill}>43 Inch</div>
            <div className={styles.guideRoomType}>
              <span>🛋️ Master Bedroom / Living</span>
            </div>
            <div className={styles.guideDistance}>
              <span>Ideal Distance: 6 – 8 Feet</span>
            </div>
            <p className={styles.guideDetails}>
              Our most versatile sweet-spot size offering razor-sharp FHD and 4K Ultra HD clarity for standard Indian living rooms.
            </p>
            <div className={styles.guidePlatformTag}>
              Available in: <strong>WebOS 4K &amp; Android TV</strong>
            </div>
          </div>

          {/* Card 3: 50" */}
          <div className={styles.guideCard}>
            <div className={styles.guideSizePill}>50 Inch</div>
            <div className={styles.guideRoomType}>
              <span>🍿 Family Room / Media Hall</span>
            </div>
            <div className={styles.guideDistance}>
              <span>Ideal Distance: 8 – 10 Feet</span>
            </div>
            <p className={styles.guideDetails}>
              Expansive 4K canvas delivering wide viewing angles and cinema-grade contrast for family movie nights and sports.
            </p>
            <div className={styles.guidePlatformTag}>
              Available in: <strong>Android TV 4K Series</strong>
            </div>
          </div>

          {/* Card 4: 55" */}
          <div className={styles.guideCard}>
            <div className={styles.guideSizePill}>55 Inch</div>
            <div className={styles.guideRoomType}>
              <span>🎬 Home Cinema / Grand Hall</span>
            </div>
            <div className={styles.guideDistance}>
              <span>Ideal Distance: 10 – 14 Feet</span>
            </div>
            <p className={styles.guideDetails}>
              Flagship theatre display featuring HDR10 micro-dimming and high-volume acoustics for true living-room luxury.
            </p>
            <div className={styles.guidePlatformTag}>
              Available in: <strong>WebOS 4K &amp; Android TV 4K</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
