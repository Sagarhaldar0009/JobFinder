export interface ParsedResume {
  skills: string[]
  jobTitles: string[]
  experience: { company: string; role: string; duration: string }[]
  education: { institution: string; degree: string; year: string }[]
  email: string
  phone: string
  totalExperienceYears: number
}

// ── Skill keywords to scan for ──────────────────────────────
const SKILL_KEYWORDS = [
  "javascript","typescript","python","java","c++","c#","php","ruby","swift","kotlin","go","rust",
  "react","next.js","vue","angular","svelte","node.js","express","fastapi","django","flask","spring",
  "mongodb","postgresql","mysql","sqlite","redis","firebase","supabase","prisma","mongoose",
  "html","css","tailwind","sass","bootstrap","material ui","shadcn",
  "git","github","docker","kubernetes","aws","azure","gcp","vercel","netlify","linux",
  "rest api","graphql","websocket","grpc","microservices",
  "machine learning","deep learning","tensorflow","pytorch","pandas","numpy","scikit-learn",
  "figma","photoshop","illustrator","canva",
  "agile","scrum","jira","confluence","notion",
]

// ── Job title keywords ───────────────────────────────────────
const JOB_TITLE_KEYWORDS = [
  "software engineer","frontend developer","backend developer","full stack developer",
  "web developer","mobile developer","react developer","node developer",
  "data scientist","data analyst","data engineer","ml engineer","ai engineer",
  "devops engineer","cloud engineer","site reliability engineer",
  "product manager","project manager","scrum master",
  "ui designer","ux designer","graphic designer",
  "qa engineer","test engineer","security engineer",
  "team lead","tech lead","engineering manager","cto","vp engineering",
  "intern","trainee","associate","senior","junior","lead","principal","staff",
]

// ── Degree keywords ──────────────────────────────────────────
const DEGREE_KEYWORDS = [
  "b.tech","m.tech","b.e","m.e","bca","mca","b.sc","m.sc",
  "bachelor","master","phd","doctorate","diploma","associate",
  "b.com","m.com","mba","bba",
]

export function parseResumeText(text: string): ParsedResume {
  const lower = text.toLowerCase()
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)

  // ── Extract Email ────────────────────────────────────────
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  const email = emailMatch ? emailMatch[0] : ""

  // ── Extract Phone ────────────────────────────────────────
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{8,15}\d)/)
  const phone = phoneMatch ? phoneMatch[0].trim() : ""

  // ── Extract Skills ───────────────────────────────────────
  const skills = SKILL_KEYWORDS.filter((skill) =>
    lower.includes(skill.toLowerCase())
  )

  // ── Extract Job Titles ───────────────────────────────────
  const jobTitles: string[] = []
  for (const line of lines) {
    const lineLower = line.toLowerCase()
    for (const title of JOB_TITLE_KEYWORDS) {
      if (lineLower.includes(title) && !jobTitles.includes(line)) {
        jobTitles.push(line.length < 60 ? line : title)
        break
      }
    }
  }

  // ── Extract Experience ───────────────────────────────────
  const experience: { company: string; role: string; duration: string }[] = []
  const durationRegex = /(\b\d{4}\b\s*[-–]\s*(\b\d{4}\b|present|current))/gi
  let expMatch
  let expIndex = 0
  while ((expMatch = durationRegex.exec(text)) !== null && expIndex < 6) {
    const pos = expMatch.index
    const surroundingLines = text.substring(Math.max(0, pos - 150), pos + 50)
      .split("\n").map((l) => l.trim()).filter((l) => l.length > 2)
    if (surroundingLines.length >= 2) {
      experience.push({
        role: surroundingLines[0] || "Role",
        company: surroundingLines[1] || "Company",
        duration: expMatch[0],
      })
      expIndex++
    }
  }

  // ── Extract Education ────────────────────────────────────
  const education: { institution: string; degree: string; year: string }[] = []
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase()
    const hasDegree = DEGREE_KEYWORDS.some((d) => lineLower.includes(d))
    if (hasDegree) {
      const yearMatch = lines[i].match(/\b(19|20)\d{2}\b/)
      education.push({
        degree: lines[i].length < 80 ? lines[i] : "Degree",
        institution: lines[i + 1]?.length < 80 ? lines[i + 1] || "" : "",
        year: yearMatch ? yearMatch[0] : "",
      })
    }
  }

  // ── Estimate Total Experience ────────────────────────────
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g) || []
  const years = yearMatches.map(Number).filter((y) => y >= 1990 && y <= new Date().getFullYear())
  const totalExperienceYears =
    years.length >= 2 ? Math.max(...years) - Math.min(...years) : 0

  return {
    skills: [...new Set(skills)],
    jobTitles: [...new Set(jobTitles)].slice(0, 5),
    experience: experience.slice(0, 5),
    education: education.slice(0, 3),
    email,
    phone,
    totalExperienceYears,
  }
}