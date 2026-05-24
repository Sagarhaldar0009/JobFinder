import { Suspense } from "react"
import { JobsSection } from "@/components/jobs/jobs-section"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { redirect } from "next/navigation"

export default async function JobsPage() {
  const token = cookies().get("token")?.value
  if (!token) redirect("/login")
  const user = await verifyToken(token)
  if (!user) redirect("/login")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Board</h1>
        <p className="text-gray-500 mt-1">
          Live jobs from multiple sources with fuzzy search — updated every 6 hours.
        </p>
      </div>
      <Suspense fallback={<div className="text-gray-400 text-sm">Loading job board...</div>}>
        <JobsSection />
      </Suspense>
    </div>
  )
}