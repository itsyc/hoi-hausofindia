const fs = require('fs')
const path = require('path')

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      )
    })
  } else if (exists) {
    const destDir = path.dirname(dest)
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }
    fs.copyFileSync(src, dest)
  }
}

const projectRoot = path.resolve(__dirname, '..')
const standaloneDir = path.join(projectRoot, '.next', 'standalone')

if (!fs.existsSync(standaloneDir)) {
  console.log('No .next/standalone folder found. Skipping asset copy.')
  process.exit(0)
}

console.log('Copying static assets for Hostinger standalone deployment...')

// 1. Copy public directory -> .next/standalone/public
const publicSrc = path.join(projectRoot, 'public')
const publicDest = path.join(standaloneDir, 'public')
if (fs.existsSync(publicSrc)) {
  copyRecursiveSync(publicSrc, publicDest)
  console.log('✓ Copied public/ to .next/standalone/public')
}

// 2. Copy .next/static directory -> .next/standalone/.next/static
const staticSrc = path.join(projectRoot, '.next', 'static')
const staticDest = path.join(standaloneDir, '.next', 'static')
if (fs.existsSync(staticSrc)) {
  copyRecursiveSync(staticSrc, staticDest)
  console.log('✓ Copied .next/static/ to .next/standalone/.next/static')
}

// 3. Copy prisma folder -> .next/standalone/prisma (so SQLite DB and schema exist in standalone)
const prismaSrc = path.join(projectRoot, 'prisma')
const prismaDest = path.join(standaloneDir, 'prisma')
if (fs.existsSync(prismaSrc)) {
  copyRecursiveSync(prismaSrc, prismaDest)
  console.log('✓ Copied prisma/ to .next/standalone/prisma')
}

console.log('Successfully prepared .next/standalone bundle for deployment!')
