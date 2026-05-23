import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import Resume from "@/models/Resume"

export async function GET() {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()

    const resume = await Resume.findOne({ userId: user.userId })

    if (!resume) return NextResponse.json({ resume: null }, { status: 200 })

    return NextResponse.json({ resume }, { status: 200 })
  } catch (error) {
    console.error("Resume fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 })
  }
}