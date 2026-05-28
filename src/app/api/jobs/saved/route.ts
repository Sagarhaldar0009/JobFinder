import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import Job from "@/models/Job"

export async function GET(req: NextRequest) {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ids = searchParams.getAll("ids")

    if (!ids.length) return NextResponse.json({ jobs: [] })

    await connectDB()

    const jobs = await Job.find({ _id: { $in: ids } }).lean()

    return NextResponse.json({ jobs })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}