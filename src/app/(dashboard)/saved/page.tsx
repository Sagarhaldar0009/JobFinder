import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { redirect } from "next/navigation"
import { SavedJobsView } from "@/components/jobs/saved-jobs-view"

export default async function SavedJobsPage() {
  const token = cookies().get("token")?.value
  if (!token) redirect("/login")
  const user = await verifyToken(token)
  if (!user) redirect("/login")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Saved Jobs
        </h1>
        <p className="text-gray-500 mt-1">
          Jobs you've bookmarked and companies you've blocked.
        </p>
      </div>
      <SavedJobsView />
    </div>
  )
}