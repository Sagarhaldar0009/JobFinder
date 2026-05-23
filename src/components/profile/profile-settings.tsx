"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetRoles: z.array(z.string()),
  locations: z.array(z.string()),
  workPreference: z.string(),
  salaryMin: z.number(),
  salaryMax: z.number(),
  currency: z.string(),
  dealBreakerCompanies: z.array(z.string()),
  skills: z.array(z.string()),
})

type ProfileForm = z.infer<typeof profileSchema>

const WORK_PREFS = [
  { value: "remote", label: "🌍 Remote" },
  { value: "hybrid", label: "🏢 Hybrid" },
  { value: "onsite", label: "🏙️ On-site" },
]

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"]

const TABS = [
  { id: "account", label: "Account", icon: "👤" },
  { id: "jobdna", label: "Job DNA", icon: "🎯" },
  { id: "resume", label: "Resume", icon: "📄" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "danger", label: "Danger Zone", icon: "⚠️" },
]

interface Props {
  userId: string
  userName: string
  userEmail: string
}

export function ProfileSettings({ userId, userName, userEmail }: Props) {
  const [activeTab, setActiveTab] = useState("account")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({})

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userName,
      targetRoles: [],
      locations: [],
      workPreference: "remote",
      salaryMin: 0,
      salaryMax: 0,
      currency: "INR",
      dealBreakerCompanies: [],
      skills: [],
    },
  })

  const { watch, setValue, register, handleSubmit, formState: { errors } } = form
  const values = watch()

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.profile) {
          const p = data.user.profile
          setValue("name", data.user.name)
          setValue("targetRoles", p.targetRoles || [])
          setValue("locations", p.locations || [])
          setValue("workPreference", p.workPreference || "remote")
          setValue("salaryMin", p.salaryMin || 0)
          setValue("salaryMax", p.salaryMax || 0)
          setValue("currency", p.currency || "INR")
          setValue("dealBreakerCompanies", p.dealBreakerCompanies || [])
          setValue("skills", p.skills || [])
        }
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setIsLoading(false))
  }, [])

  const addTag = (field: keyof ProfileForm, value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const current = values[field] as string[]
    if (current.includes(trimmed)) return
    setValue(field, [...current, trimmed])
    setTagInputs((prev) => ({ ...prev, [field]: "" }))
  }

  const removeTag = (field: keyof ProfileForm, value: string) => {
    const current = values[field] as string[]
    setValue(field, current.filter((v) => v !== value))
  }

  const onSubmit = async (data: ProfileForm) => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) { toast.error(result.error); return }
      toast.success("Profile saved successfully!")
    } catch {
      toast.error("Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">

      {/* Sidebar */}
      <div className="md:w-56 shrink-0">
        <Card className="shadow-sm">
          <CardContent className="p-2">

            {/* Avatar */}
            <div className="flex flex-col items-center py-5 gap-2">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-xl bg-blue-100 text-blue-700 font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold text-gray-800 text-sm text-center">{userName}</p>
              <p className="text-xs text-gray-400 text-center">{userEmail}</p>
            </div>

            <Separator className="mb-2" />

            {/* Tabs */}
            <nav className="flex flex-col gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* ── Account Tab ─────────────────────────────── */}
          {activeTab === "account" && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your basic account details</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <Input {...register("name")} placeholder="Your full name" />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input value={userEmail} disabled className="bg-gray-50 text-gray-500" />
                  <p className="text-xs text-gray-400">Email cannot be changed</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Member Since</label>
                  <Input value={new Date().toLocaleDateString()} disabled className="bg-gray-50 text-gray-500" />
                </div>
                <SaveButton isSaving={isSaving} />
              </CardContent>
            </Card>
          )}

          {/* ── Job DNA Tab ──────────────────────────────── */}
          {activeTab === "jobdna" && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Job DNA Preferences</CardTitle>
                <CardDescription>Edit the preferences you set during onboarding</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">

                {/* Target Roles */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">🎯 Target Roles</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Frontend Developer"
                      value={tagInputs["targetRoles"] || ""}
                      onChange={(e) => setTagInputs((p) => ({ ...p, targetRoles: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addTag("targetRoles", tagInputs["targetRoles"] || "") }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => addTag("targetRoles", tagInputs["targetRoles"] || "")}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.targetRoles.map((r) => (
                      <Badge key={r} variant="secondary" className="gap-1 bg-blue-50 text-blue-700">
                        {r} <button type="button" onClick={() => removeTag("targetRoles", r)} className="ml-1 hover:text-red-500">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Locations */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">📍 Preferred Locations</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Bangalore, Remote"
                      value={tagInputs["locations"] || ""}
                      onChange={(e) => setTagInputs((p) => ({ ...p, locations: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addTag("locations", tagInputs["locations"] || "") }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => addTag("locations", tagInputs["locations"] || "")}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.locations.map((l) => (
                      <Badge key={l} variant="secondary" className="gap-1 bg-green-50 text-green-700">
                        {l} <button type="button" onClick={() => removeTag("locations", l)} className="ml-1 hover:text-red-500">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Work Preference */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">🏢 Work Preference</label>
                  <div className="grid grid-cols-3 gap-3">
                    {WORK_PREFS.map((pref) => (
                      <button
                        key={pref.value}
                        type="button"
                        onClick={() => setValue("workPreference", pref.value)}
                        className={`border rounded-xl p-3 text-sm font-medium transition-all ${
                          values.workPreference === pref.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "hover:border-gray-300 text-gray-600"
                        }`}
                      >
                        {pref.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Salary */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-gray-700">💰 Salary Range</label>
                  <div className="flex gap-2 flex-wrap">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setValue("currency", c)}
                        className={`px-3 py-1 rounded-full text-sm border transition-all ${
                          values.currency === c
                            ? "bg-blue-600 text-white border-blue-600"
                            : "text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">Minimum</label>
                      <Input
                        type="number"
                        placeholder="500000"
                        value={values.salaryMin || ""}
                        onChange={(e) => setValue("salaryMin", Number(e.target.value))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">Maximum</label>
                      <Input
                        type="number"
                        placeholder="1200000"
                        value={values.salaryMax || ""}
                        onChange={(e) => setValue("salaryMax", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Skills */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">⚡ Skills</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. React, Node.js"
                      value={tagInputs["skills"] || ""}
                      onChange={(e) => setTagInputs((p) => ({ ...p, skills: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addTag("skills", tagInputs["skills"] || "") }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => addTag("skills", tagInputs["skills"] || "")}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.skills.map((s) => (
                      <Badge key={s} variant="secondary" className="gap-1 bg-purple-50 text-purple-700">
                        {s} <button type="button" onClick={() => removeTag("skills", s)} className="ml-1 hover:text-red-500">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Deal Breakers */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">🚫 Deal-breaker Companies</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. CompanyName"
                      value={tagInputs["dealBreakerCompanies"] || ""}
                      onChange={(e) => setTagInputs((p) => ({ ...p, dealBreakerCompanies: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addTag("dealBreakerCompanies", tagInputs["dealBreakerCompanies"] || "") }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => addTag("dealBreakerCompanies", tagInputs["dealBreakerCompanies"] || "")}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.dealBreakerCompanies.map((c) => (
                      <Badge key={c} variant="destructive" className="gap-1">
                        {c} <button type="button" onClick={() => removeTag("dealBreakerCompanies", c)} className="ml-1">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <SaveButton isSaving={isSaving} />
              </CardContent>
            </Card>
          )}

          {/* ── Resume Tab ───────────────────────────────── */}
          {activeTab === "resume" && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Resume Management</CardTitle>
                <CardDescription>Update your resume — stored securely on Cloudinary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col gap-3">
                  <p className="text-sm font-medium text-blue-800">
                    📄 To update your resume, go to the Resume page
                  </p>
                  <p className="text-sm text-blue-600">
                    Your resume is stored on Cloudinary and persists across all deployments.
                  </p>
                  <a
                    href="/resume"
                    className="text-sm font-semibold text-blue-700 hover:underline w-fit"
                  >
                    Go to Resume Page →
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Notifications Tab ────────────────────────── */}
          {activeTab === "notifications" && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Control what alerts you receive</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {[
                  { label: "New job matches", desc: "Get notified when new jobs match your DNA" },
                  { label: "Application reminders", desc: "Follow-up reminders for pending applications" },
                  { label: "Interview alerts", desc: "Reminders before scheduled interviews" },
                  { label: "Weekly digest", desc: "Weekly summary of your job search progress" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-not-allowed opacity-50">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow" />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 italic mt-2">
                  Notification settings coming in a future sprint.
                </p>
              </CardContent>
            </Card>
          )}

          {/* ── Danger Zone Tab ──────────────────────────── */}
          {activeTab === "danger" && (
            <Card className="shadow-sm border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions — proceed with caution</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="border border-red-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Delete Account</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled
                    className="opacity-60 cursor-not-allowed"
                  >
                    Delete
                  </Button>
                </div>
                <p className="text-xs text-gray-400 italic">
                  Account deletion coming in a future sprint.
                </p>
              </CardContent>
            </Card>
          )}

        </form>
      </div>
    </div>
  )
}

// ── Reusable Save Button ──────────────────────────────────
function SaveButton({ isSaving }: { isSaving: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <Button type="submit" disabled={isSaving} className="px-8">
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}