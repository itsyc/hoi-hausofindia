import Link from 'next/link'
import styles from './layout.module.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>Admin Panel</h3>
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.link}>📊 Overview Dashboard</Link>
          <Link href="/admin/products" className={styles.link}>📦 Products & Series</Link>
          <Link href="/admin/inventory" className={styles.link}>🏷️ Inventory & Barcodes</Link>
          <Link href="/admin/orders" className={styles.link}>🚚 Orders & Shipping</Link>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  )
}
