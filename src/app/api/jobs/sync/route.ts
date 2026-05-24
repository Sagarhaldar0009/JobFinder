import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Job from "@/models/Job"
import { fetchAdzunaJobs } from "../../../../lib/job-searches/adzuna"
import { fetchRemotiveJobs } from "../../../../lib/job-searches/remotive"
import { fetchTheMuseJobs } from "../../../../lib/job-searches/themuse"

export async function POST(req: NextRequest) {
  try {
    // Protect sync endpoint with a secret
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET || "dev-sync-secret"

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { query = "developer" } = await req.json().catch(() => ({}))

    await connectDB()

    console.log("Syncing jobs from all sources...")

    const [adzunaJobs, remotiveJobs, theMuseJobs] = await Promise.allSettled([
      fetchAdzunaJobs(query),
      fetchRemotiveJobs(query),
      fetchTheMuseJobs(query),
    ])

    const allJobs = [
      ...(adzunaJobs.status === "fulfilled" ? adzunaJobs.value : []),
      ...(remotiveJobs.status === "fulfilled" ? remotiveJobs.value : []),
      ...(theMuseJobs.status === "fulfilled" ? theMuseJobs.value : []),
    ]

    // Upsert all jobs
    let inserted = 0
    let updated = 0

    for (const job of allJobs) {
      const result = await Job.updateOne(
        { externalId: job.externalId },
        { $set: job },
        { upsert: true }
      )
      if (result.upsertedCount > 0) inserted++
      else updated++
    }

    return NextResponse.json({
      message: "Sync complete",
      total: allJobs.length,
      inserted,
      updated,
      sources: {
        adzuna: adzunaJobs.status === "fulfilled" ? adzunaJobs.value.length : 0,
        remotive: remotiveJobs.status === "fulfilled" ? remotiveJobs.value.length : 0,
        themuse: theMuseJobs.status === "fulfilled" ? theMuseJobs.value.length : 0,
      },
    })

  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}