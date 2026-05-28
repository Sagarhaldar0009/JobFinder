import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

// GET — fetch blacklisted companies
export async function GET() {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const dbUser = await User.findById(user.userId).select("blacklistedCompanies")
    return NextResponse.json({ blacklistedCompanies: dbUser?.blacklistedCompanies || [] })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// POST — block a company
export async function POST(req: NextRequest) {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { company } = await req.json()
    if (!company) return NextResponse.json({ error: "Company name required" }, { status: 400 })

    await connectDB()
    await User.findByIdAndUpdate(user.userId, {
      $addToSet: { blacklistedCompanies: company.toLowerCase().trim() },
    })

    return NextResponse.json({ message: "Company blocked" })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// DELETE — unblock a company
export async function DELETE(req: NextRequest) {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { company } = await req.json()
    if (!company) return NextResponse.json({ error: "Company name required" }, { status: 400 })

    await connectDB()
    await User.findByIdAndUpdate(user.userId, {
      $pull: { blacklistedCompanies: company.toLowerCase().trim() },
    })

    return NextResponse.json({ message: "Company unblocked" })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}