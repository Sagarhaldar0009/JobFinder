// Salary ranges by role keywords (INR per annum)
const SALARY_MAP: { keywords: string[]; min: number; max: number; currency: string }[] = [
  { keywords: ["intern", "trainee", "apprentice"],            min: 240000,   max: 600000,   currency: "INR" },
  { keywords: ["junior", "associate", "entry"],               min: 400000,   max: 900000,   currency: "INR" },
  { keywords: ["frontend", "react", "vue", "angular"],        min: 600000,   max: 2000000,  currency: "INR" },
  { keywords: ["backend", "node", "django", "spring"],        min: 700000,   max: 2200000,  currency: "INR" },
  { keywords: ["full stack", "fullstack"],                    min: 800000,   max: 2500000,  currency: "INR" },
  { keywords: ["devops", "cloud", "aws", "azure", "gcp"],     min: 1000000,  max: 3000000,  currency: "INR" },
  { keywords: ["data scientist", "machine learning", "ml"],   min: 1000000,  max: 3500000,  currency: "INR" },
  { keywords: ["data analyst"],                               min: 600000,   max: 1800000,  currency: "INR" },
  { keywords: ["mobile", "android", "ios", "flutter"],        min: 700000,   max: 2200000,  currency: "INR" },
  { keywords: ["senior", "lead", "principal", "staff"],       min: 1500000,  max: 4000000,  currency: "INR" },
  { keywords: ["manager", "engineering manager"],             min: 2000000,  max: 5000000,  currency: "INR" },
  { keywords: ["cto", "vp", "director"],                      min: 3000000,  max: 10000000, currency: "INR" },
  { keywords: ["designer", "ui", "ux"],                       min: 500000,   max: 1800000,  currency: "INR" },
  { keywords: ["product manager", "product owner"],           min: 1200000,  max: 4000000,  currency: "INR" },
  { keywords: ["security", "cybersecurity"],                  min: 800000,   max: 3000000,  currency: "INR" },
  { keywords: ["qa", "quality", "tester"],                    min: 400000,   max: 1500000,  currency: "INR" },
]

// Remote/global multipliers
const LOCATION_MULTIPLIERS: { keywords: string[]; multiplier: number; currency: string }[] = [
  { keywords: ["united states", "usa", "us", "san francisco", "new york"],  multiplier: 8,  currency: "USD" },
  { keywords: ["united kingdom", "uk", "london"],                            multiplier: 6,  currency: "GBP" },
  { keywords: ["europe", "germany", "netherlands", "berlin"],                multiplier: 6,  currency: "EUR" },
  { keywords: ["dubai", "uae", "abu dhabi"],                                 multiplier: 5,  currency: "AED" },
  { keywords: ["remote", "worldwide", "global", "anywhere"],                 multiplier: 1,  currency: "INR" },
  { keywords: ["bangalore", "mumbai", "delhi", "hyderabad", "pune", "india"],multiplier: 1,  currency: "INR" },
]

export interface SalaryEstimate {
  min: number
  max: number
  currency: string
  label: string
  isEstimate: boolean
}

export function estimateSalary(
  title: string,
  location: string,
  existingSalary?: string
): SalaryEstimate {
  // If job already has salary info, parse it
  if (existingSalary && existingSalary.trim()) {
    return {
      min: 0, max: 0,
      currency: "USD",
      label: existingSalary,
      isEstimate: false,
    }
  }

  const titleLower    = title.toLowerCase()
  const locationLower = location.toLowerCase()

  // Find matching salary range
  let baseMin = 600000
  let baseMax = 1500000

  for (const entry of SALARY_MAP) {
    if (entry.keywords.some((k) => titleLower.includes(k))) {
      baseMin = entry.min
      baseMax = entry.max
      break
    }
  }

  // Apply location multiplier
  let multiplier = 1
  let currency   = "INR"

  for (const loc of LOCATION_MULTIPLIERS) {
    if (loc.keywords.some((k) => locationLower.includes(k))) {
      multiplier = loc.multiplier
      currency   = loc.currency
      break
    }
  }

  const min = Math.round((baseMin * multiplier) / 100000) * 100000
  const max = Math.round((baseMax * multiplier) / 100000) * 100000

  const fmt = (n: number) =>
    currency === "INR"
      ? n >= 100000
        ? `${(n / 100000).toFixed(1)}L`
        : `${(n / 1000).toFixed(0)}K`
      : `${Math.round(n / 1000)}K`

  return {
    min,
    max,
    currency,
    label: `${currency} ${fmt(min)} – ${fmt(max)} / year`,
    isEstimate: true,
  }
}