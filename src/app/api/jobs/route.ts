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
    const search = searchParams.get("search") || ""
    const source = searchParams.get("source") || ""
    const remote = searchParams.get("remote") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 12

    await connectDB()

    const query: any = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    if (source) query.source = source
    if (remote === "true") query.isRemote = true

    const total = await Job.countDocuments(query)
    const jobs = await Job.find(query)
      .sort({ postedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  } catch (error) {
    console.error("Jobs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}