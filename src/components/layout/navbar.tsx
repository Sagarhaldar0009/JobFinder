import Link from "next/link"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { LogoutButton } from "./logout-button"

export async function Navbar() {
  const token = cookies().get("token")?.value
  const user = token ? await verifyToken(token) : null

  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          JobFinder
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/jobs" className="text-sm text-gray-600 hover:text-gray-900">
            Jobs
          </Link>
          <Link href="/applications" className="text-sm text-gray-600 hover:text-gray-900">
            Applications
          </Link>
          <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900">
            Profile
          </Link>
          <Link href="/resume" className="text-sm text-gray-600 hover:text-gray-900">
            Resume
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-gray-500 hidden md:block">
              {user.name}
            </span>
          )}
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}