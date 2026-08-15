import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()
    if (!phone) {
      return NextResponse.json({ message: "Phone number is required" }, { status: 400 })
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10)
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ message: "Please enter a valid 10-digit mobile number" }, { status: 400 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // Expires in 5 minutes

    // Delete older OTPs for this phone number
    await prisma.otpToken.deleteMany({ where: { phone: cleanPhone } })

    // Store new OTP
    await prisma.otpToken.create({
      data: { phone: cleanPhone, otp, expiresAt }
    })

    // Prepare WhatsApp Message
    const otpMessage = `🔒 *Haus of India - Verification Code*\n\nYour OTP is: *${otp}*\n\nThis code is valid for 5 minutes. Please do not share it with anyone.`;

    // Send via OpenWA
    await sendWhatsAppMessage(cleanPhone, otpMessage)

    return NextResponse.json({
      success: true,
      message: "OTP sent via WhatsApp successfully",
      phone: cleanPhone
    })
  } catch (error) {
    console.error("Send OTP Error:", error)
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 })
  }
}
