import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import Resume from "@/models/Resume"
import User from "@/models/User"
import { computeMatchScore } from "@/lib/match-scorer"

export async function POST(req: NextRequest) {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { jobs } = await req.json()

    if (!jobs || !Array.isArray(jobs)) {
      return NextResponse.json({ error: "Jobs array required" }, { status: 400 })
    }

    await connectDB()

    // Get user resume + profile
    const [resume, dbUser] = await Promise.all([
      Resume.findOne({ userId: user.userId }),
      User.findById(user.userId),
    ])

    const userSkills = resume?.parsed?.skills || []
    const userRoles  = dbUser?.profile?.targetRoles || []

    // Score each job
    const scores: Record<string, any> = {}

    for (const job of jobs) {
      if (!job._id) continue

      const result = computeMatchScore(
        userSkills,
        userRoles,
        job.title        || "",
        job.description  || "",
        job.tags         || []
      )

      scores[job._id] = result
    }

    return NextResponse.json({ scores }, { status: 200 })

  } catch (error) {
    console.error("Match score error:", error)
    return NextResponse.json({ error: "Failed to compute scores" }, { status: 500 })
  }
}