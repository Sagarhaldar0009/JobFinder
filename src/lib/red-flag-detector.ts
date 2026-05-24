export interface RedFlag {
  type: string
  message: string
  severity: "high" | "medium" | "low"
}

const RED_FLAG_PATTERNS: {
  pattern: RegExp
  type: string
  message: string
  severity: "high" | "medium" | "low"
}[] = [
  {
    pattern: /unpaid|no (salary|compensation|pay)|volunteer/i,
    type: "Compensation",
    message: "Job may be unpaid or compensation is unclear",
    severity: "high",
  },
  {
    pattern: /must (have|own|bring|provide) (your own )?(laptop|computer|equipment|device)/i,
    type: "Equipment",
    message: "Requires you to provide your own equipment",
    severity: "medium",
  },
  {
    pattern: /\b(60|70|80|90)\+?\s*hours?\s*(per week|\/week|a week)/i,
    type: "Work Hours",
    message: "Mentions unusually long working hours",
    severity: "high",
  },
  {
    pattern: /we are (like a )?family|work hard play hard|hustle culture|grind/i,
    type: "Culture",
    message: "\"Family culture\" or hustle language detected — common burnout indicator",
    severity: "medium",
  },
  {
    pattern: /fast.?paced|high.?pressure|deadline.?driven|always.?on/i,
    type: "Work Environment",
    message: "High-pressure environment mentioned",
    severity: "low",
  },
  {
    pattern: /rockstar|ninja|guru|wizard|superhero developer/i,
    type: "Job Description",
    message: "\"Rockstar/Ninja\" language — often signals unrealistic expectations",
    severity: "low",
  },
  {
    pattern: /no (remote|work from home)|must (be|work) (in|on).?site|relocation required/i,
    type: "Remote Policy",
    message: "No remote work allowed or relocation required",
    severity: "low",
  },
  {
    pattern: /equity|stock options|esop/i,
    type: "Compensation Structure",
    message: "Equity-heavy compensation — verify vesting schedule",
    severity: "low",
  },
  {
    pattern: /series [abc]|seed stage|early stage startup|pre.?revenue/i,
    type: "Company Stage",
    message: "Early-stage startup — higher risk, verify funding stability",
    severity: "medium",
  },
  {
    pattern: /immediate (joiner|joining)|join (immediately|asap|urgently)|notice period.*(\b0\b|zero|immediate)/i,
    type: "Urgency",
    message: "Requires immediate joining — may indicate poor planning",
    severity: "low",
  },
]

export function detectRedFlags(description: string): RedFlag[] {
  const flags: RedFlag[] = []

  for (const { pattern, type, message, severity } of RED_FLAG_PATTERNS) {
    if (pattern.test(description)) {
      flags.push({ type, message, severity })
    }
  }

  return flags
}