import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { redirect } from "next/navigation"
import { OnboardingFlow } from "../../../components/onboarding/onboarding-flow"

export default async function OnboardingPage() {
  const token = cookies().get("token")?.value
  if (!token) redirect("/login")

  const user = await verifyToken(token)
  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Let's personalise your experience
          </h1>
          <p className="text-gray-500 mt-2">
            Tell us about your job preferences — takes less than 2 minutes.
          </p>
        </div>
        <OnboardingFlow userName={user.name} />
      </div>
    </div>
  )
}