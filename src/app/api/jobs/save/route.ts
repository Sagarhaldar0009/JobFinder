import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

// GET — fetch all saved jobs
export async function GET() {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const dbUser = await User.findById(user.userId).select("savedJobs")
    return NextResponse.json({ savedJobs: dbUser?.savedJobs || [] })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// POST — save a job
export async function POST(req: NextRequest) {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { jobId } = await req.json()
    if (!jobId) return NextResponse.json({ error: "Job ID required" }, { status: 400 })

    await connectDB()
    await User.findByIdAndUpdate(user.userId, {
      $addToSet: { savedJobs: jobId },
    })

    return NextResponse.json({ message: "Job saved" })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// DELETE — unsave a job
export async function DELETE(req: NextRequest) {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { jobId } = await req.json()
    if (!jobId) return NextResponse.json({ error: "Job ID required" }, { status: 400 })

    await connectDB()
    await User.findByIdAndUpdate(user.userId, {
      $pull: { savedJobs: jobId },
    })

    return NextResponse.json({ message: "Job unsaved" })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}