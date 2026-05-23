import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const token = cookies().get("token")?.value
  if (!token) redirect("/login")

  const user = await verifyToken(token)
  if (!user) redirect("/login")

  const stats = [
    { label: "Total Applications", value: "0", color: "text-blue-600" },
    { label: "Interviews Scheduled", value: "0", color: "text-green-600" },
    { label: "Offers Received", value: "0", color: "text-purple-600" },
    { label: "Rejected", value: "0", color: "text-red-500" },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's an overview of your job search progress.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">No applications yet</p>
            <p className="text-sm mt-1">
              Start tracking your job applications to see them here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}