import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { redirect, notFound } from "next/navigation"
import connectDB from "@/lib/mongodb"
import Job from "@/models/Job"
import Resume from "@/models/Resume"
import User from "@/models/User"
import { computeMatchScore } from "@/lib/match-scorer"
import { JobDetailView } from "../../../../components/jobs/job-detail-view"

interface Props {
  params: { id: string }
}

export default async function JobDetailPage({ params }: Props) {
  const token = cookies().get("token")?.value
  if (!token) redirect("/login")

  const user = await verifyToken(token)
  if (!user) redirect("/login")

  await connectDB()

  const job = await Job.findById(params.id).lean() as any
  if (!job) notFound()

  // Get user data for match score
  const [resume, dbUser] = await Promise.all([
    Resume.findOne({ userId: user.userId }).lean() as any,
    User.findById(user.userId).lean() as any,
  ])

  const userSkills = resume?.parsed?.skills || []
  const userRoles  = dbUser?.profile?.targetRoles || []

  const matchResult = computeMatchScore(
    userSkills,
    userRoles,
    job.title       || "",
    job.description || "",
    job.tags        || []
  )

  // Serialize
  const serializedJob = JSON.parse(JSON.stringify(job))

  return (
    <JobDetailView
      job={serializedJob}
      matchResult={matchResult}
      userName={user.name}
    />
  )
}