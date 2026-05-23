"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResumeEditor } from "./resume-editor"

interface ParsedResume {
  skills: string[]
  jobTitles: string[]
  experience: { company: string; role: string; duration: string }[]
  education: { institution: string; degree: string; year: string }[]
  email: string
  phone: string
  totalExperienceYears: number
}

interface ResumeData {
  id: string
  fileName: string
  fileSize: number
  fileUrl?: string
  parsed: ParsedResume
  uploadedAt: string
}

export function FreeResumeUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [resume, setResume] = useState<ResumeData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/resume")
      .then((r) => r.json())
      .then((data) => { if (data.resume) setResume(data.resume) })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const handleUpload = async (file: File) => {
    if (file.type !== "application/pdf") { toast.error("Only PDF files are allowed"); return }
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return }

    setIsUploading(true)
    const toastId = toast.loading("Uploading and parsing your resume...")

    try {
      const formData = new FormData()
      formData.append("resume", file)

      const res = await fetch("/api/resume/upload", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) { toast.error(data.error || "Upload failed", { id: toastId }); return }

      setResume(data.resume)
      setIsEditing(false)
      toast.success("Resume parsed! Review the details below and edit if needed.", { id: toastId })
    } catch {
      toast.error("Upload failed. Please try again.", { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading resume...</p>
        </div>
      </div>
    )
  }

  // ── Edit Mode ──────────────────────────────────────────
  if (isEditing && resume) {
    return (
      <ResumeEditor
        initial={resume.parsed}
        onSave={(updated) => {
          setResume({ ...resume, parsed: updated })
          setIsEditing(false)
        }}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200 group
          ${isDragging ? "border-blue-500 bg-blue-50 scale-[1.01]" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"}
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={onFileChange} className="hidden" />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <div>
              <p className="font-semibold text-gray-700">Processing your resume...</p>
              <p className="text-sm text-gray-400 mt-1">Extracting skills, experience & education</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all
              ${isDragging ? "bg-blue-100" : "bg-gray-100 group-hover:bg-blue-50"}`}>
              <svg className={`w-8 h-8 transition-all ${isDragging ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-700 text-lg">
                {resume ? "Upload a new resume" : "Drop your resume here"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Drag & drop or <span className="text-blue-600 font-medium">browse files</span>
              </p>
              <p className="text-xs text-gray-300 mt-2">PDF only · Max 5MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Parsed Results */}
      {resume && (
        <div className="flex flex-col gap-5">

          {/* File Info Banner */}
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-800 text-sm">{resume.fileName}</p>
                <p className="text-xs text-green-600">
                  {(resume.fileSize / 1024).toFixed(1)} KB ·
                  Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {resume.fileUrl && (
                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-all"
                >
                  View PDF
                </a>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-green-300 text-green-700 hover:bg-green-100"
                onClick={() => fileInputRef.current?.click()}
              >
                Replace
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Skills Found", value: resume.parsed.skills.length, icon: "⚡", color: "blue" },
              { label: "Job Titles", value: resume.parsed.jobTitles.length, icon: "💼", color: "purple" },
              { label: "Experience", value: `${resume.parsed.totalExperienceYears} yrs`, icon: "📅", color: "green" },
              { label: "Education", value: resume.parsed.education.length, icon: "🎓", color: "amber" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Parsed Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Skills */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span>⚡</span> Skills
                  </CardTitle>
                  <button onClick={() => setIsEditing(true)} className="text-xs text-blue-500 hover:underline">Edit</button>
                </div>
              </CardHeader>
              <CardContent>
                {resume.parsed.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {resume.parsed.skills.map((skill) => (
                      <Badge key={skill} variant="secondary"
                        className="text-xs capitalize bg-blue-50 text-blue-700 border-blue-100">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="text-sm text-blue-500 hover:underline">
                    + Add skills manually
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span>📬</span> Contact Info
                  </CardTitle>
                  <button onClick={() => setIsEditing(true)} className="text-xs text-blue-500 hover:underline">Edit</button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-12">Email</span>
                  <span className="text-sm text-gray-700 font-medium">
                    {resume.parsed.email || <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:underline text-xs">+ Add</button>}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-12">Phone</span>
                  <span className="text-sm text-gray-700 font-medium">
                    {resume.parsed.phone || <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:underline text-xs">+ Add</button>}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-12">Exp.</span>
                  <span className="text-sm text-gray-700 font-medium">
                    {resume.parsed.totalExperienceYears} years
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span>💼</span> Work Experience
                  </CardTitle>
                  <button onClick={() => setIsEditing(true)} className="text-xs text-blue-500 hover:underline">Edit</button>
                </div>
              </CardHeader>
              <CardContent>
                {resume.parsed.experience.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {resume.parsed.experience.map((exp, i) => (
                      <div key={i} className="border-l-2 border-blue-200 pl-3">
                        <p className="text-sm font-semibold text-gray-800">{exp.role}</p>
                        <p className="text-xs text-gray-500">{exp.company}</p>
                        <p className="text-xs text-blue-500 mt-0.5">{exp.duration}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="text-sm text-blue-500 hover:underline">
                    + Add experience manually
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span>🎓</span> Education
                  </CardTitle>
                  <button onClick={() => setIsEditing(true)} className="text-xs text-blue-500 hover:underline">Edit</button>
                </div>
              </CardHeader>
              <CardContent>
                {resume.parsed.education.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {resume.parsed.education.map((edu, i) => (
                      <div key={i} className="border-l-2 border-purple-200 pl-3">
                        <p className="text-sm font-semibold text-gray-800">{edu.degree}</p>
                        <p className="text-xs text-gray-500">{edu.institution}</p>
                        {edu.year && <p className="text-xs text-purple-500 mt-0.5">{edu.year}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="text-sm text-blue-500 hover:underline">
                    + Add education manually
                  </button>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Edit Prompt Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-800">
                🤖 Parser not 100% accurate?
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Click "Edit Details" to manually correct any information
              </p>
            </div>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit Details
            </Button>
          </div>

        </div>
      )}
    </div>
  )
}