export interface MatchResult {
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  matchedKeywords: string[]
  level: "excellent" | "good" | "fair" | "low"
  summary: string
}

// ── Common words to ignore ───────────────────────────────
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "you", "we", "our",
  "your", "their", "this", "that", "these", "those", "it", "its",
  "experience", "work", "working", "years", "year", "strong", "good",
  "knowledge", "ability", "skills", "skill", "team", "using", "use",
  "must", "required", "requirements", "preferred", "plus", "bonus",
  "job", "role", "position", "opportunity", "looking", "candidate",
])

// ── Extract meaningful tokens from text ─────────────────
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.#+]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
}

// ── Build term frequency map ─────────────────────────────
function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>()
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1)
  }
  return tf
}

// ── Main scorer ──────────────────────────────────────────
export function computeMatchScore(
  userSkills: string[],
  userRoles: string[],
  jobTitle: string,
  jobDescription: string,
  jobTags: string[]
): MatchResult {

  // Combine job text
  const jobText = `${jobTitle} ${jobTitle} ${jobDescription} ${jobTags.join(" ")}`
  const jobTokens = tokenize(jobText)
  const jobTF = termFrequency(jobTokens)

  // Normalize user skills
  const normalizedSkills = userSkills.map((s) => s.toLowerCase().trim())
  const normalizedRoles  = userRoles.map((r) => r.toLowerCase().trim())

  // ── 1. Skill Match (50% weight) ──────────────────────
  const matchedSkills: string[] = []
  const missingSkills: string[] = []

  for (const skill of normalizedSkills) {
    const skillTokens = tokenize(skill)
    const found = skillTokens.some(
      (token) => jobTF.has(token) && (jobTF.get(token) || 0) > 0
    ) || jobText.toLowerCase().includes(skill)

    if (found) matchedSkills.push(skill)
    else missingSkills.push(skill)
  }

  const skillScore =
    normalizedSkills.length > 0
      ? (matchedSkills.length / normalizedSkills.length) * 50
      : 25

  // ── 2. Role/Title Match (30% weight) ─────────────────
  let roleScore = 0
  const titleLower = jobTitle.toLowerCase()

  for (const role of normalizedRoles) {
    const roleTokens = tokenize(role)
    const titleMatch = roleTokens.filter((t) => titleLower.includes(t)).length
    const descMatch  = roleTokens.filter((t) => jobTF.has(t)).length

    roleScore = Math.max(
      roleScore,
      (titleMatch / Math.max(roleTokens.length, 1)) * 30,
      (descMatch  / Math.max(roleTokens.length, 1)) * 15
    )
  }

  // ── 3. Keyword overlap bonus (20% weight) ────────────
  const userTokens = tokenize(
    [...normalizedSkills, ...normalizedRoles].join(" ")
  )
  const userTF = termFrequency(userTokens)

  const matchedKeywords: string[] = []
  let overlapScore = 0

  for (const [term, userCount] of userTF.entries()) {
    if (jobTF.has(term)) {
      const jobCount = jobTF.get(term) || 0
      const tfidf    = (userCount * jobCount) / (userTokens.length || 1)
      overlapScore  += tfidf
      matchedKeywords.push(term)
    }
  }

  const normalizedOverlap = Math.min(
    (overlapScore / Math.max(userTokens.length, 1)) * 500,
    20
  )

  // ── Final Score ───────────────────────────────────────
  const rawScore = skillScore + roleScore + normalizedOverlap
  const score    = Math.min(Math.round(rawScore), 100)

  // ── Level ─────────────────────────────────────────────
  const level =
    score >= 75 ? "excellent" :
    score >= 50 ? "good"      :
    score >= 25 ? "fair"      : "low"

  // ── Summary ───────────────────────────────────────────
  const summary =
    score >= 75
      ? `Strong match — ${matchedSkills.length} of your skills align with this role`
      : score >= 50
      ? `Good match — ${matchedSkills.length} skills match, ${missingSkills.slice(0, 2).join(", ")} could strengthen your profile`
      : score >= 25
      ? `Partial match — consider upskilling in ${missingSkills.slice(0, 3).join(", ")}`
      : `Low match — this role requires different skills than your current profile`

  return {
    score,
    matchedSkills,
    missingSkills: missingSkills.slice(0, 8),
    matchedKeywords: matchedKeywords.slice(0, 10),
    level,
    summary,
  }
}