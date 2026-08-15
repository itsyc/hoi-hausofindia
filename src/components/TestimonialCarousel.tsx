"use client"

import { useState, useRef, useEffect } from 'react'
import styles from './TestimonialCarousel.module.css'

interface Testimonial {
  id: number
  name: string
  location: string
  model: string
  rating: number
  title: string
  quote: string
  date: string
  verified: boolean
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Rajesh Sharma',
    location: 'Jaipur, Rajasthan',
    model: '55" QLED 4K - G-Class Series',
    rating: 5,
    title: 'Unbelievable Picture Quality & Sound!',
    quote: 'The quantum panel contrast is as crisp as international luxury brands costing twice as much. The soundbar speakers built into the G-Class fill my entire hall without needing extra soundbars.',
    date: '2 weeks ago',
    verified: true
  },
  {
    id: 2,
    name: 'Vikram Malhotra',
    location: 'Mumbai, Maharashtra',
    model: '43" Smart Cloud TV - C-Class Series',
    rating: 5,
    title: 'Super Fast Cloud OS & Solid Voltage Guard',
    quote: 'In Mumbai we face sudden voltage fluctuations, but the built-in surge protection handles it smoothly without stabilizer. The Cloud OS boots instantly and 5000+ free movies are a huge bonus!',
    date: '1 month ago',
    verified: true
  },
  {
    id: 3,
    name: 'Ananya Deshmukh',
    location: 'Pune, Maharashtra',
    model: '65" Ultra 4K Quantum - G-Class Series',
    rating: 5,
    title: 'Direct Manufacturer Support Saved My Day',
    quote: 'Ordered directly from the site and it arrived in 3 days with transit insurance packaging. When I asked about wall installation, their engineer guided me over video call within minutes!',
    date: '3 weeks ago',
    verified: true
  },
  {
    id: 4,
    name: 'Sunil Kumar',
    location: 'Bengaluru, Karnataka',
    model: '50" Frameless 4K - A-Class Series',
    rating: 5,
    title: 'Ultra-Thin Bezels & Crystal Clear Viewing',
    quote: 'The zero-bezel design looks breathtaking on my living room wall. Movie nights with the family feel like a real theatre screen. Highly recommend HAUS OF INDIA!',
    date: '1 month ago',
    verified: true
  },
  {
    id: 5,
    name: 'Dr. Amit Verma',
    location: 'New Delhi',
    model: '32" HD Smart Voice Remote - C-Class',
    rating: 5,
    title: 'Perfect Bedroom TV & Voice Remote Works Great',
    quote: 'Bought the 32-inch model for my bedroom. Voice remote picks up Hindi and English search queries effortlessly. Unbeatable value for money.',
    date: '2 months ago',
    verified: true
  }
]

export default function TestimonialCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const container = scrollRef.current
    const cardWidth = container.firstElementChild?.clientWidth || 340
    const gap = 24
    const index = Math.round(container.scrollLeft / (cardWidth + gap))
    setActiveIndex(index)
  }

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return
    const container = scrollRef.current
    const cardWidth = container.firstElementChild?.clientWidth || 340
    const gap = 24
    container.scrollTo({
      left: index * (cardWidth + gap),
      behavior: 'smooth'
    })
    setActiveIndex(index)
  }

  const handlePrev = () => {
    const nextIndex = activeIndex > 0 ? activeIndex - 1 : TESTIMONIALS.length - 1
    scrollToIndex(nextIndex)
  }

  const handleNext = () => {
    const nextIndex = activeIndex < TESTIMONIALS.length - 1 ? activeIndex + 1 : 0
    scrollToIndex(nextIndex)
  }

  // Auto-scroll effect every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext()
    }, 5500)
    return () => clearInterval(timer)
  }, [activeIndex])

  return (
    <section className={styles.testimonialSection}>
      <div className={`container ${styles.sectionContainer}`}>
        
        {/* Section Header */}
        <div className={styles.headerRow}>
          <div>
            <div className={styles.badge}>
              <span>✦ VERIFIED CUSTOMER REVIEWS</span>
            </div>
            <h2 className={styles.sectionTitle}>
              WHAT OUR <span className={styles.titleHighlight}>BUYERS SAY</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Over 15,000+ happy homes across India enjoying HAUS OF INDIA cinematic displays.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className={styles.navControls}>
            <button 
              type="button" 
              onClick={handlePrev} 
              className={styles.arrowBtn}
              aria-label="Previous review"
            >
              ←
            </button>
            <button 
              type="button" 
              onClick={handleNext} 
              className={styles.arrowBtn}
              aria-label="Next review"
            >
              →
            </button>
          </div>
        </div>

        {/* Scrollable Carousel Track */}
        <div 
          ref={scrollRef} 
          onScroll={handleScroll} 
          className={styles.carouselTrack}
        >
          {TESTIMONIALS.map((item) => (
            <div key={item.id} className={`premium-card ${styles.testimonialCard}`}>
              
              {/* Card Top: Rating Stars & Verified Badge */}
              <div className={styles.cardHeader}>
                <div className={styles.starsRow}>
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <span key={i} className={styles.starIcon}>★</span>
                  ))}
                </div>
                {item.verified && (
                  <span className={styles.verifiedBadge}>✓ Verified Purchase</span>
                )}
              </div>

              {/* Review Headline & Body Quote */}
              <h3 className={styles.quoteTitle}>{item.title}</h3>
              <p className={styles.quoteBody}>"{item.quote}"</p>

              {/* Card Footer: User Avatar, Name & Purchased Model */}
              <div className={styles.cardFooter}>
                <div className={styles.userAvatar}>
                  {item.name.charAt(0)}
                </div>
                <div className={styles.userInfo}>
                  <strong className={styles.userName}>{item.name}</strong>
                  <span className={styles.userLocation}>{item.location}</span>
                  <span className={styles.modelTag}>{item.model}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Carousel Pagination Dots */}
        <div className={styles.dotsPagination}>
          {TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.dotBtn} ${activeIndex === idx ? styles.activeDot : ''}`}
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to review ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
