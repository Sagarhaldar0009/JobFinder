"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { z } from "zod"

// ─── Zod Schema ────────────────────────────────────────────
const onboardingSchema = z.object({
    targetRoles: z.array(z.string()).min(1, "Add at least one target role"),
    locations: z.array(z.string()).min(1, "Add at least one location"),
    workPreference: z.enum(["remote", "hybrid", "onsite"] as const, {
        message: "Please select a work preference",
    }),
    salaryMin: z.number().min(0),
    salaryMax: z.number().min(0),
    currency: z.string(),
    dealBreakerCompanies: z.array(z.string()),
    skills: z.array(z.string()),
})

type OnboardingData = z.infer<typeof onboardingSchema>

const STEPS = ["Target Roles", "Location", "Salary", "Deal Breakers", "Review"]

const WORK_PREFS = [
    { value: "remote", label: "🌍 Remote", desc: "Work from anywhere" },
    { value: "hybrid", label: "🏢 Hybrid", desc: "Mix of office & home" },
    { value: "onsite", label: "🏙️ On-site", desc: "Full time in office" },
]

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"]

interface Props {
    userName: string
}

export function FreeOnboarding({ userName }: Props) {
    const [step, setStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [inputValue, setInputValue] = useState("")

    const [data, setData] = useState<OnboardingData>({
        targetRoles: [],
        locations: [],
        workPreference: "remote",
        salaryMin: 0,
        salaryMax: 0,
        currency: "INR",
        dealBreakerCompanies: [],
        skills: [],
    })

    // ─── Tag Helpers ─────────────────────────────────────────
    const addTag = (field: keyof OnboardingData, value: string) => {
        const trimmed = value.trim()
        if (!trimmed) return
        const current = data[field] as string[]
        if (current.includes(trimmed)) return
        setData({ ...data, [field]: [...current, trimmed] })
        setInputValue("")
    }

    const removeTag = (field: keyof OnboardingData, value: string) => {
        const current = data[field] as string[]
        setData({ ...data, [field]: current.filter((v) => v !== value) })
    }

    const handleKeyDown = (e: React.KeyboardEvent, field: keyof OnboardingData) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addTag(field, inputValue)
        }
    }

    // ─── Validation per step ─────────────────────────────────
    const validateStep = (): string | null => {
        if (step === 0 && data.targetRoles.length === 0)
            return "Please add at least one target role"
        if (step === 1 && data.locations.length === 0)
            return "Please add at least one location"
        if (step === 2 && data.salaryMax <= data.salaryMin)
            return "Max salary must be greater than min salary"
        return null
    }

    const handleNext = () => {
        const error = validateStep()
        if (error) { toast.error(error); return }
        setInputValue("")
        setStep((s) => s + 1)
    }

    const handleBack = () => {
        setInputValue("")
        setStep((s) => s - 1)
    }

    // ─── Submit ───────────────────────────────────────────────
    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await res.json()

            if (!res.ok) {
                toast.error(result.error || "Failed to save")
                return
            }

            toast.success("Profile saved! Taking you to dashboard...")
            setTimeout(() => { window.location.href = "/dashboard" }, 1200)
        } catch {
            toast.error("Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    // ─── Progress Bar ─────────────────────────────────────────
    const progress = Math.round(((step) / (STEPS.length - 1)) * 100)

    return (
        <Card className="shadow-md">
            <CardHeader className="pb-2">
                {/* Step indicators */}
                <div className="flex items-center justify-between mb-3">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex items-center gap-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "bg-blue-600 text-white" :
                                    i === step ? "bg-blue-100 text-blue-700 border-2 border-blue-600" :
                                        "bg-gray-100 text-gray-400"
                                }`}>
                                {i < step ? "✓" : i + 1}
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`h-0.5 w-8 md:w-16 transition-all ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <CardTitle className="text-lg mt-3">
                    {step === 0 && `Hi ${userName}! What roles are you targeting? 🎯`}
                    {step === 1 && "Where do you want to work? 📍"}
                    {step === 2 && "What are your salary expectations? 💰"}
                    {step === 3 && "Any deal-breaker companies? 🚫"}
                    {step === 4 && "Review your preferences ✅"}
                </CardTitle>
            </CardHeader>

            <CardContent className="py-4 min-h-[220px]">

                {/* Step 0 — Target Roles */}
                {step === 0 && (
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-gray-500">
                            Add job titles you're looking for. Press Enter or comma to add.
                        </p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g. Frontend Developer"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, "targetRoles")}
                            />
                            <Button variant="outline" onClick={() => addTag("targetRoles", inputValue)}>
                                Add
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {data.targetRoles.map((role) => (
                                <Badge key={role} variant="secondary" className="gap-1 px-3 py-1">
                                    {role}
                                    <button onClick={() => removeTag("targetRoles", role)} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                                </Badge>
                            ))}
                        </div>
                        {/* Quick suggestions */}
                        <div className="flex flex-wrap gap-2 mt-1">
                            <p className="text-xs text-gray-400 w-full">Quick add:</p>
                            {["Frontend Developer", "Backend Developer", "Full Stack Developer", "React Developer", "Node.js Developer"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => addTag("targetRoles", s)}
                                    className="text-xs border rounded-full px-3 py-1 text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition-all"
                                >
                                    + {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 1 — Location + Work Preference */}
                {step === 1 && (
                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">
                                Add cities or countries. Press Enter to add.
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g. Bangalore, Mumbai, Remote"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, "locations")}
                                />
                                <Button variant="outline" onClick={() => addTag("locations", inputValue)}>
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {data.locations.map((loc) => (
                                    <Badge key={loc} variant="secondary" className="gap-1 px-3 py-1">
                                        {loc}
                                        <button onClick={() => removeTag("locations", loc)} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Work Preference</p>
                            <div className="grid grid-cols-3 gap-3">
                                {WORK_PREFS.map((pref) => (
                                    <button
                                        key={pref.value}
                                        onClick={() => setData({ ...data, workPreference: pref.value as "remote" | "hybrid" | "onsite" })}
                                        className={`border rounded-xl p-3 text-center transition-all ${data.workPreference === pref.value
                                                ? "border-blue-500 bg-blue-50"
                                                : "hover:border-gray-300"
                                            }`}
                                    >
                                        <p className="text-lg">{pref.label.split(" ")[0]}</p>
                                        <p className="text-xs font-medium mt-1">{pref.label.split(" ")[1]}</p>
                                        <p className="text-xs text-gray-400">{pref.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2 — Salary */}
                {step === 2 && (
                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Currency</p>
                            <div className="flex gap-2 flex-wrap">
                                {CURRENCIES.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setData({ ...data, currency: c })}
                                        className={`px-4 py-1.5 rounded-full text-sm border transition-all ${data.currency === c
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "text-gray-600 hover:border-gray-400"
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Minimum ({data.currency})
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 500000"
                                    value={data.salaryMin || ""}
                                    onChange={(e) => setData({ ...data, salaryMin: Number(e.target.value) })}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Maximum ({data.currency})
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 1200000"
                                    value={data.salaryMax || ""}
                                    onChange={(e) => setData({ ...data, salaryMax: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        {data.salaryMin > 0 && data.salaryMax > 0 && (
                            <p className="text-sm text-green-600 font-medium">
                                ✓ Range: {data.currency} {data.salaryMin.toLocaleString()} — {data.salaryMax.toLocaleString()}
                            </p>
                        )}
                    </div>
                )}

                {/* Step 3 — Deal Breakers */}
                {step === 3 && (
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-gray-500">
                            Add companies you don't want to work for. This is optional.
                        </p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g. CompanyName"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, "dealBreakerCompanies")}
                            />
                            <Button variant="outline" onClick={() => addTag("dealBreakerCompanies", inputValue)}>
                                Add
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {data.dealBreakerCompanies.map((c) => (
                                <Badge key={c} variant="destructive" className="gap-1 px-3 py-1">
                                    {c}
                                    <button onClick={() => removeTag("dealBreakerCompanies", c)} className="ml-1 hover:text-white">×</button>
                                </Badge>
                            ))}
                        </div>
                        {data.dealBreakerCompanies.length === 0 && (
                            <p className="text-sm text-gray-400 italic">No deal-breakers added — you can skip this step.</p>
                        )}
                    </div>
                )}

                {/* Step 4 — Review */}
                {step === 4 && (
                    <div className="flex flex-col gap-3 text-sm">
                        <ReviewRow label="Target Roles" value={data.targetRoles.join(", ")} />
                        <ReviewRow label="Locations" value={data.locations.join(", ")} />
                        <ReviewRow label="Work Preference" value={data.workPreference} />
                        <ReviewRow
                            label="Salary Range"
                            value={`${data.currency} ${data.salaryMin.toLocaleString()} — ${data.salaryMax.toLocaleString()}`}
                        />
                        <ReviewRow
                            label="Deal Breakers"
                            value={data.dealBreakerCompanies.length > 0 ? data.dealBreakerCompanies.join(", ") : "None"}
                        />
                    </div>
                )}

            </CardContent>

            <CardFooter className="flex justify-between pt-2">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === 0}
                >
                    Back
                </Button>

                {step < STEPS.length - 1 ? (
                    <Button onClick={handleNext}>
                        Next →
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Complete Setup 🎉"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

// ─── Review Row Helper ────────────────────────────────────
function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2 border-b pb-2">
            <span className="font-medium text-gray-600 w-36 shrink-0">{label}</span>
            <span className="text-gray-800 capitalize">{value}</span>
        </div>
    )
}