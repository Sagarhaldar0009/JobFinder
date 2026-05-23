// export default function ProfilePage() {
//   return (
//     <div className="flex flex-col gap-4">
//       <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
//       <p className="text-gray-500">Manage your profile — coming soon.</p>
//     </div>
//   )
// }


import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { redirect } from "next/navigation"
import { ProfileSettings } from "../../../components/profile/profile-settings"

export default async function ProfilePage() {
  const token = cookies().get("token")?.value
  if (!token) redirect("/login")
  const user = await verifyToken(token)
  if (!user) redirect("/login")

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your preferences, resume, and account settings.
        </p>
      </div>
      <ProfileSettings userId={user.userId} userName={user.name} userEmail={user.email} />
    </div>
  )
}