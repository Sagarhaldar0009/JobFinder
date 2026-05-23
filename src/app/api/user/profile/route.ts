import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()

    const dbUser = await User.findById(user.userId).select("-password")
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json({ user: dbUser }, { status: 200 })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()

    await connectDB()

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      {
        name: body.name,
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
      },
      { new: true }
    ).select("-password")

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    }, { status: 200 })

  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}