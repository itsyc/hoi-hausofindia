import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "public/uploads")
    
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      // ignore if exists
    }

    const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const filepath = path.join(uploadDir, uniqueFilename)

    await writeFile(filepath, buffer)

    return NextResponse.json({ url: `/uploads/${uniqueFilename}` }, { status: 200 })
  } catch (error) {
    console.error("Upload Error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
