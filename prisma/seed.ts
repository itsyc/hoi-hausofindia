import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.variant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // Create Admin
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hausofindia.com',
      name: 'Admin',
      password: hashedAdminPassword,
      role: 'ADMIN',
    },
  })
  
  console.log({ admin })

  // 1. C CLASS SERIES
  const cClass = await prisma.product.create({
    data: {
      title: 'HOI-C Series Smart Cloud TV',
      series: 'C-CLASS',
      description: 'Budget-friendly & massive free content. Official Cloud OS 9.0 (Built-in Cloud App Store).',
      features: JSON.stringify(['Cloud OS 9.0', '5000+ Free Movies & Games', 'Cloud Voice Remote', 'Dual Bluetooth']),
      specs: JSON.stringify({
        "Best For": "Budget-friendly & massive free content",
        "Available Sizes": "32\", 43\", 55\"",
        "Smart Software": "Cloud OS 9.0 (Cloud App Store)",
        "Picture Quality": "Standard HD / 4K on 43\"",
        "Speed & Memory": "Processor: 4-Core • 32\": 512MB or 1GB RAM • Others: 1GB RAM + 8GB Storage",
        "Sound System": "20W Soundbar Speakers + Dolby Audio",
        "Internet & Wi-Fi": "Standard Wi-Fi",
        "Bluetooth": "Dual Bluetooth (Connect 2 devices)",
        "Remote Control": "Cloud Voice Remote",
        "Bonus Features": "5000+ Free Movies & 500+ Games",
        "Ports": "2 HDMI / 2 USB"
      }),
      published: true,
      variants: {
        create: [
          { name: '32" HD (512MB RAM)', mrp: 15999, discountPct: 20, price: 12799.2 },
          { name: '32" HD (1GB RAM)', mrp: 16999, discountPct: 20, price: 13599.2 },
          { name: '43" FHD (1GB RAM)', mrp: 25999, discountPct: 25, price: 19499.25 },
          { name: '43" 4K (1GB RAM)', mrp: 29999, discountPct: 25, price: 22499.25 },
          { name: '55" FHD (1GB RAM)', mrp: 39999, discountPct: 30, price: 27999.3 },
        ]
      }
    }
  })

  // 2. A CLASS SERIES
  const aClass = await prisma.product.create({
    data: {
      title: 'HOI-A Series Android TV',
      series: 'A-CLASS',
      description: 'Reliable everyday apps (Netflix/YouTube) on Android TV (Google Play Store).',
      features: JSON.stringify(['Android TV OS', 'Google Play Store', 'Huge App Library', 'Standard Remote']),
      specs: JSON.stringify({
        "Best For": "Reliable everyday apps (Netflix/YouTube)",
        "Available Sizes": "32\", 43\", 50\", 55\"",
        "Smart Software": "Android TV (Google Play Store)",
        "Picture Quality": "BOE A+ Grade Panel • 4K available on 50\" & 55\"",
        "Speed & Memory": "Processor: 1.3GHz 4-Core • 32\"–50\": 1GB RAM + 8GB Storage • 55\": 2GB RAM + 16GB Storage available",
        "Sound System": "20W Soundbar Speakers",
        "Internet & Wi-Fi": "Standard Wi-Fi",
        "Bluetooth": "Bluetooth 4.0",
        "Remote Control": "Standard Remote",
        "Bonus Features": "Huge library of Android phone-style apps",
        "Ports": "2 HDMI / 1 USB"
      }),
      published: true,
      variants: {
        create: [
          { name: '32" FHD (1GB RAM)', mrp: 18999, discountPct: 20, price: 15199.2 },
          { name: '43" FHD (1GB RAM)', mrp: 28999, discountPct: 20, price: 23199.2 },
          { name: '50" 4K (1GB RAM)', mrp: 38999, discountPct: 25, price: 29249.25 },
          { name: '55" 4K (1GB/8GB)', mrp: 44999, discountPct: 25, price: 33749.25 },
          { name: '55" 4K Pro (2GB/16GB)', mrp: 49999, discountPct: 25, price: 37499.25 },
        ]
      }
    }
  })

  // 3. G CLASS SERIES
  const gClass = await prisma.product.create({
    data: {
      title: 'HOI-G Series Google TV',
      series: 'G-CLASS',
      description: 'Premium, cinematic experience & AI smarts with Certified Google TV (Android 11, Upgradable).',
      features: JSON.stringify(['Google TV (Android 11)', 'Gemini AI Assistant', 'OLED Display (55")', 'Theater Quality Dolby Audio']),
      specs: JSON.stringify({
        "Best For": "Premium, cinematic experience & AI smarts",
        "Available Sizes": "32\", 43\", 55\"",
        "Smart Software": "Certified Google TV (Android 11, Upgradable)",
        "Picture Quality": "BOE A+ Grade Premium Panel • 4K Ultra HD + HDR10 • OLED Display on 55\"",
        "Speed & Memory": "Processor: Fast 1.5GHz Mediatek 4-Core • 32\": 1.5GB RAM • Others: 2GB RAM + 16GB Storage",
        "Sound System": "20W Dolby Audio (Theater Quality)",
        "Internet & Wi-Fi": "Ultra-Fast 5GHz Dual-Band Wi-Fi",
        "Bluetooth": "Advanced Bluetooth 5.0",
        "Remote Control": "Bluetooth Remote with Gemini AI Assistant",
        "Bonus Features": "Personal show recommendations & Smart Home control",
        "Ports": "2 HDMI / 1 USB (Typical standard layout)"
      }),
      published: true,
      variants: {
        create: [
          { name: '32" HD (1.5GB/16GB)', mrp: 21999, discountPct: 15, price: 18699.15 },
          { name: '43" FHD (2GB/16GB)', mrp: 32999, discountPct: 20, price: 26399.2 },
          { name: '43" 4K (2GB/16GB)', mrp: 35999, discountPct: 20, price: 28799.2 },
          { name: '55" OLED 4K (2GB/16GB)', mrp: 69999, discountPct: 15, price: 59499.15 },
        ]
      }
    }
  })

  console.log('Seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
