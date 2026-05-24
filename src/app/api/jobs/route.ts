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
    const search    = searchParams.get("search") || ""
    const source    = searchParams.get("source") || ""
    const remote    = searchParams.get("remote") || ""
    const dateRange = searchParams.get("dateRange") || ""
    const sortBy    = searchParams.get("sortBy") || "recent"
    const page      = parseInt(searchParams.get("page") || "1")
    const limit     = 12

    await connectDB()

    let jobs: any[] = []
    let total = 0

    if (search.trim()) {
      // ── Atlas Search pipeline (fuzzy) ──────────────────
      const searchPipeline: any[] = [
        {
          $search: {
            index: "jobs_search",
            compound: {
              should: [
                {
                  text: {
                    query: search,
                    path: ["title", "company", "tags"],
                    fuzzy: { maxEdits: 1 },
                    score: { boost: { value: 3 } },
                  },
                },
                {
                  text: {
                    query: search,
                    path: ["description", "location"],
                    fuzzy: { maxEdits: 1 },
                  },
                },
              ],
            },
          },
        },
      ]

      // Post-search filters
      const matchStage: any = {}
      if (source) matchStage.source = source
      if (remote === "true") matchStage.isRemote = true
      if (dateRange) {
        const days = parseInt(dateRange)
        matchStage.postedAt = {
          $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        }
      }

      if (Object.keys(matchStage).length > 0) {
        searchPipeline.push({ $match: matchStage })
      }

      // Count total
      const countPipeline = [...searchPipeline, { $count: "total" }]
      const countResult = await Job.aggregate(countPipeline)
      total = countResult[0]?.total || 0

      // Sort + paginate
      if (sortBy === "recent") {
        searchPipeline.push({ $sort: { postedAt: -1 } })
      }

      searchPipeline.push({ $skip: (page - 1) * limit })
      searchPipeline.push({ $limit: limit })

      jobs = await Job.aggregate(searchPipeline)

    } else {
      // ── Regular MongoDB query (no search term) ─────────
      const query: any = {}
      if (source) query.source = source
      if (remote === "true") query.isRemote = true
      if (dateRange) {
        const days = parseInt(dateRange)
        query.postedAt = {
          $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        }
      }

      total = await Job.countDocuments(query)

      const sortOption: any =
        sortBy === "recent" ? { postedAt: -1 } : { fetchedAt: -1 }

      jobs = await Job.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
    }

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })

  } catch (error: any) {
    // Fallback if Atlas Search index not ready yet
    if (error?.message?.includes("$search") || error?.codeName === "CommandFailed") {
      console.warn("Atlas Search not ready, falling back to regex search")

      try {
        await connectDB()
        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search") || ""
        const source = searchParams.get("source") || ""
        const remote = searchParams.get("remote") || ""
        const page = parseInt(searchParams.get("page") || "1")
        const limit = 12

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
          pagination: { total, page, pages: Math.ceil(total / limit), limit },
          fallback: true,
        })
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError)
      }
    }

    console.error("Jobs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}