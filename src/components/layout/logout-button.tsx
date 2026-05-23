"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" })

    if (res.ok) {
      toast.success("Logged out successfully")
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Logout
    </Button>
  )
}