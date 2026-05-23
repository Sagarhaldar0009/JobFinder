import { ResumeUploadSection } from "../../../components/resume/resume-upload-section"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { redirect } from "next/navigation"

export default async function ResumePage() {
  const token = cookies().get("token")?.value
  if (!token) redirect("/login")
  const user = await verifyToken(token)
  if (!user) redirect("/login")

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resume</h1>
        <p className="text-gray-500 mt-1">
          Upload your resume to auto-fill your profile and get personalised job matches.
        </p>
      </div>

      <ResumeUploadSection />
    </div>
  )
}