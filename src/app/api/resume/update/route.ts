import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import Resume from "@/models/Resume"

export async function PATCH(req: NextRequest) {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()

    await connectDB()

    const resume = await Resume.findOneAndUpdate(
      { userId: user.userId },
      {
        "parsed.skills": body.skills || [],
        "parsed.jobTitles": body.jobTitles || [],
        "parsed.experience": body.experience || [],
        "parsed.education": body.education || [],
        "parsed.email": body.email || "",
        "parsed.phone": body.phone || "",
        "parsed.totalExperienceYears": body.totalExperienceYears || 0,
      },
      { new: true }
    )

    if (!resume)
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })

    return NextResponse.json({
      message: "Resume updated successfully",
      parsed: resume.parsed,
    }, { status: 200 })

  } catch (error) {
    console.error("Resume update error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}