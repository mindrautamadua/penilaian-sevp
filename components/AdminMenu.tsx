"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

type Item = { href: string; label: string }

// Dropdown "Admin" — mengelompokkan menu administratif agar nav tidak penuh.
export function AdminMenu({ items, active }: { items: Item[]; active?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activeInMenu = items.some((i) => i.href === active)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm shadow-soft transition-all duration-300 " +
          (activeInMenu
            ? "bg-navy font-semibold text-white"
            : "bg-white font-medium text-slate-600 ring-1 ring-slate-900/[0.06] hover:text-navy hover:shadow-card")
        }
      >
        Admin
        <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-2xl bg-white p-1.5 shadow-card ring-1 ring-slate-900/[0.08]"
        >
          {items.map((item) => {
            const on = item.href === active
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={
                  "block rounded-xl px-3.5 py-2.5 text-sm transition-colors " +
                  (on ? "bg-navy font-semibold text-white" : "font-medium text-slate-600 hover:bg-paper hover:text-navy")
                }
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
