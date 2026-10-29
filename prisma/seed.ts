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

  // 1. W-CLASS: WEBOS TV (Available in 43", 55")
  const wClass = await prisma.product.create({
    data: {
      title: 'HOI-W Series WebOS TV',
      series: 'W-CLASS',
      description: 'Flagship cinematic smart TV powered by LG WebOS TV with Magic Remote, 4K Ultra HD Display, and Dolby Audio.',
      features: JSON.stringify(['Official WebOS TV', 'Magic Remote with Pointer & Voice', '4K Ultra HD Display (HDR10)', 'Apple AirPlay 2 & HomeKit', 'Dolby Audio Surround Sound']),
      specs: JSON.stringify({
        "Best For": "Flagship cinematic streaming & effortless Magic Remote control",
        "Available Sizes": "43\", 55\"",
        "Smart Software": "Official WebOS TV (Content Store & ThinQ AI)",
        "Picture Quality": "BOE A+ Grade 4K Ultra HD Panel • HDR10 • Micro Dimming",
        "Speed & Memory": "Quad-Core High-Speed Processor • 1.5GB / 2GB RAM • 8GB High-Speed Storage",
        "Sound System": "24W Box Speakers with Dolby Audio",
        "Internet & Wi-Fi": "Dual-Band Wi-Fi (2.4GHz / 5GHz)",
        "Bluetooth": "Two-Way Bluetooth 5.0",
        "Remote Control": "Ergonomic Magic Remote with Air Mouse Pointer & Voice Assistant",
        "Ports": "3 HDMI (with ARC) / 2 USB"
      }),
      published: true,
      variants: {
        create: [
          { name: '43" 4K UHD (WebOS TV)', mrp: 32999, discountPct: 25, price: 24749.25 },
          { name: '55" 4K UHD (WebOS TV)', mrp: 49999, discountPct: 25, price: 37499.25 },
        ]
      }
    }
  })

  // 2. A-CLASS: ANDROID TV (Available in 32", 43", 50", 55")
  const aClass = await prisma.product.create({
    data: {
      title: 'HOI-A Series Android TV',
      series: 'A-CLASS',
      description: 'Reliable everyday streaming on certified Android TV with Google Play Store, Google Assistant Voice Remote, and built-in Chromecast.',
      features: JSON.stringify(['Android TV OS', 'Google Play Store (10,000+ Apps)', 'Google Assistant Voice Remote', 'Chromecast Built-in', 'Dolby Audio']),
      specs: JSON.stringify({
        "Best For": "Everyday streaming, huge app ecosystem & seamless smartphone casting",
        "Available Sizes": "32\", 43\", 50\", 55\"",
        "Smart Software": "Certified Android TV OS (Google Play Store)",
        "Picture Quality": "BOE A+ Grade Panel • HD (32\") / FHD (43\") / 4K on 50\" & 55\"",
        "Speed & Memory": "Processor: 1.3GHz 4-Core • 32\"–50\": 1GB RAM + 8GB Storage • 55\": 2GB RAM + 16GB Storage",
        "Sound System": "20W Soundbar Speakers with Dolby Audio",
        "Internet & Wi-Fi": "High-Speed Wi-Fi",
        "Bluetooth": "Bluetooth 5.0",
        "Remote Control": "Google Assistant Voice Remote",
        "Bonus Features": "Huge library of Android phone-style & TV apps",
        "Ports": "2 HDMI / 2 USB"
      }),
      published: true,
      variants: {
        create: [
          { name: '32" HD (Android TV)', mrp: 18999, discountPct: 20, price: 15199.2 },
          { name: '43" FHD (Android TV)', mrp: 28999, discountPct: 20, price: 23199.2 },
          { name: '50" 4K (Android TV)', mrp: 38999, discountPct: 25, price: 29249.25 },
          { name: '55" 4K (Android TV)', mrp: 44999, discountPct: 25, price: 33749.25 },
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
