"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Experience {
  company: string
  role: string
  duration: string
}

interface Education {
  institution: string
  degree: string
  year: string
}

interface ParsedResume {
  skills: string[]
  jobTitles: string[]
  experience: Experience[]
  education: Education[]
  email: string
  phone: string
  totalExperienceYears: number
}

interface Props {
  initial: ParsedResume
  onSave: (updated: ParsedResume) => void
  onCancel: () => void
}

export function ResumeEditor({ initial, onSave, onCancel }: Props) {
  const [data, setData] = useState<ParsedResume>(JSON.parse(JSON.stringify(initial)))
  const [isSaving, setIsSaving] = useState(false)
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({})

  // ── Tag helpers ──────────────────────────────────────────
  const addTag = (field: "skills" | "jobTitles", value: string) => {
    const trimmed = value.trim()
    if (!trimmed || data[field].includes(trimmed)) return
    setData({ ...data, [field]: [...data[field], trimmed] })
    setTagInputs((p) => ({ ...p, [field]: "" }))
  }

  const removeTag = (field: "skills" | "jobTitles", value: string) => {
    setData({ ...data, [field]: data[field].filter((v) => v !== value) })
  }

  // ── Experience helpers ───────────────────────────────────
  const addExperience = () => {
    setData({
      ...data,
      experience: [...data.experience, { company: "", role: "", duration: "" }],
    })
  }

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...data.experience]
    updated[index] = { ...updated[index], [field]: value }
    setData({ ...data, experience: updated })
  }

  const removeExperience = (index: number) => {
    setData({ ...data, experience: data.experience.filter((_, i) => i !== index) })
  }

  // ── Education helpers ────────────────────────────────────
  const addEducation = () => {
    setData({
      ...data,
      education: [...data.education, { institution: "", degree: "", year: "" }],
    })
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...data.education]
    updated[index] = { ...updated[index], [field]: value }
    setData({ ...data, education: updated })
  }

  const removeEducation = (index: number) => {
    setData({ ...data, education: data.education.filter((_, i) => i !== index) })
  }

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/resume/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Failed to save")
        return
      }

      toast.success("Resume updated successfully!")
      onSave(data)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Edit Resume Details</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Correct any information the parser got wrong
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            📬 Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Email</label>
            <Input
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Phone</label>
            <Input
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Total Experience (years)
            </label>
            <Input
              type="number"
              step="0.1"
              value={data.totalExperienceYears}
              onChange={(e) =>
                setData({ ...data, totalExperienceYears: parseFloat(e.target.value) || 0 })
              }
              placeholder="e.g. 1.1"
            />
            <p className="text-xs text-gray-400">
              e.g. 1.1 means 1 year 1 month
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            ⚡ Skills
            <span className="text-xs font-normal text-gray-400">
              (remove wrong ones, add missing ones)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={tagInputs["skills"] || ""}
              onChange={(e) => setTagInputs((p) => ({ ...p, skills: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag("skills", tagInputs["skills"] || "")
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addTag("skills", tagInputs["skills"] || "")}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="gap-1 px-3 py-1 bg-blue-50 text-blue-700 border-blue-100"
              >
                {skill}
                <button
                  onClick={() => removeTag("skills", skill)}
                  className="ml-1 text-blue-400 hover:text-red-500 font-bold"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job Titles */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            💼 Job Titles
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              placeholder="Add a job title..."
              value={tagInputs["jobTitles"] || ""}
              onChange={(e) => setTagInputs((p) => ({ ...p, jobTitles: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag("jobTitles", tagInputs["jobTitles"] || "")
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addTag("jobTitles", tagInputs["jobTitles"] || "")}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.jobTitles.map((title) => (
              <Badge
                key={title}
                variant="secondary"
                className="gap-1 px-3 py-1 bg-purple-50 text-purple-700"
              >
                {title}
                <button
                  onClick={() => removeTag("jobTitles", title)}
                  className="ml-1 hover:text-red-500 font-bold"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              🏢 Work Experience
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addExperience}>
              + Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {data.experience.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed rounded-xl">
              <p className="text-gray-400 text-sm">No experience added yet</p>
              <button
                type="button"
                onClick={addExperience}
                className="text-blue-600 text-sm hover:underline mt-1"
              >
                + Add your first experience
              </button>
            </div>
          )}
          {data.experience.map((exp, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 flex flex-col gap-3 bg-gray-50 relative"
            >
              <button
                type="button"
                onClick={() => removeExperience(i)}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 text-lg font-bold"
              >
                ×
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Role / Job Title</label>
                  <Input
                    value={exp.role}
                    onChange={(e) => updateExperience(i, "role", e.target.value)}
                    placeholder="e.g. Frontend Developer"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Company</label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(i, "company", e.target.value)}
                    placeholder="e.g. Google"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Duration</label>
                  <Input
                    value={exp.duration}
                    onChange={(e) => updateExperience(i, "duration", e.target.value)}
                    placeholder="e.g. Jan 2023 - Present"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              🎓 Education
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addEducation}>
              + Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {data.education.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed rounded-xl">
              <p className="text-gray-400 text-sm">No education added yet</p>
              <button
                type="button"
                onClick={addEducation}
                className="text-blue-600 text-sm hover:underline mt-1"
              >
                + Add your education
              </button>
            </div>
          )}
          {data.education.map((edu, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 flex flex-col gap-3 bg-gray-50 relative"
            >
              <button
                type="button"
                onClick={() => removeEducation(i)}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 text-lg font-bold"
              >
                ×
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Degree</label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(i, "degree", e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Institution</label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(i, "institution", e.target.value)}
                    placeholder="e.g. IIT Delhi"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Year</label>
                  <Input
                    value={edu.year}
                    onChange={(e) => updateEducation(i, "year", e.target.value)}
                    placeholder="e.g. 2024"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bottom Save */}
      <div className="flex justify-end gap-2 pb-4">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="px-8">
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

    </div>
  )
}