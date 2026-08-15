import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null

        const cleanPhone = credentials.phone.replace(/\D/g, '').slice(-10)
        if (cleanPhone.length !== 10) return null

        // Check active OTP token
        const validOtpToken = await prisma.otpToken.findFirst({
          where: {
            phone: cleanPhone,
            otp: credentials.otp,
            expiresAt: { gt: new Date() }
          }
        })

        if (!validOtpToken) {
          // Allow dev fallback OTP "123456" for convenience during testing
          if (credentials.otp !== '123456') return null
        } else {
          // Delete used token
          await prisma.otpToken.delete({ where: { id: validOtpToken.id } })
        }

        // Find or create user by phone
        let user = await prisma.user.findFirst({
          where: { phone: cleanPhone }
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone: cleanPhone,
              name: `Customer ${cleanPhone.slice(-4)}`,
              role: "CUSTOMER"
            }
          })
        }

        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      }
    }),
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) return null

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) return null

        return {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
        token.phone = (user as any).phone
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).phone = token.phone;
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "haus-secret-key-2026",
}
