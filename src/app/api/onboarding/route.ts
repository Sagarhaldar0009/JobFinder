import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()

    await connectDB()

    await User.findByIdAndUpdate(user.userId, {
      isOnboarded: true,
      profile: {
        targetRoles: body.targetRoles || [],
        locations: body.locations || [],
        workPreference: body.workPreference || "",
        salaryMin: body.salaryMin || 0,
        salaryMax: body.salaryMax || 0,
        currency: body.currency || "INR",
        dealBreakerCompanies: body.dealBreakerCompanies || [],
        skills: body.skills || [],
      },
    })

    return NextResponse.json({ message: "Onboarding complete" }, { status: 200 })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}