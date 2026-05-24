import { JobsSection } from "../../../components/jobs/jobs-section"
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
          Live jobs from Adzuna, Remotive & The Muse — updated every 6 hours.
        </p>
      </div>
      <JobsSection />
    </div>
  )
}











// export default function JobsPage() {
//   return (
//     <div className="flex flex-col gap-4">
//       <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
//       <p className="text-gray-500">Browse and search for jobs — coming soon.</p>
//     </div>
//   )
// }