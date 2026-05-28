"use client"

import { useBlacklist } from "@/hooks/useBlacklist"
import { useState } from "react"

interface Props {
  company: string
}

export function BlockCompanyButton({ company }: Props) {
  const { isBlocked, blockCompany, unblockCompany } = useBlacklist()
  const [showConfirm, setShowConfirm] = useState(false)
  const blocked = isBlocked(company)

  if (blocked) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          unblockCompany(company)
        }}
        className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-500
          hover:bg-red-200 transition-all font-medium flex items-center gap-1"
        title="Click to unblock"
      >
        🚫 Blocked
      </button>
    )
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <span className="text-[10px] text-gray-500">Block {company}?</span>
        <button
          onClick={() => { blockCompany(company); setShowConfirm(false) }}
          className="text-[10px] px-2 py-0.5 rounded bg-red-500 text-white hover:bg-red-600"
        >
          Yes
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-[10px] px-2 py-0.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        setShowConfirm(true)
      }}
      className="text-[10px] px-2 py-1 rounded-full text-gray-400 hover:bg-red-50
        hover:text-red-500 transition-all font-medium flex items-center gap-1
        dark:hover:bg-red-900/20"
      title={`Block ${company}`}
    >
      🚫 Block
    </button>
  )
}