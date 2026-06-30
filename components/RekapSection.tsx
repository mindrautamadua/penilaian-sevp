"use client"

import { useRef, useState, type ReactNode } from "react"
import type { RekapRow, Summary } from "@/lib/data"
import { RekapExplorer, type SkorStatus } from "./RekapExplorer"
import { fmt } from "@/lib/score"

function StatCard({
  label,
  value,
  sub,
  accent,
  active,
  onClick,
}: {
  label: string
  value: string
  sub?: ReactNode
  accent?: boolean
  active?: boolean
  onClick?: () => void
}) {
  const clickable = !!onClick
  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick!()
              }
            }
          : undefined
      }
      className={[
        "rounded-2xl p-5 shadow-card ring-1 transition",
        accent ? "bg-grad-grape-teal text-white" : "bg-white/90 backdrop-blur-sm",
        clickable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-steel" : "",
        active ? (accent ? "ring-2 ring-white/60" : "ring-2 ring-primary") : "ring-slate-900/[0.05]",
      ].join(" ")}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${accent ? "text-white/70" : "text-slate-400"}`}>{label}</p>
      <p className={`data mt-2 text-3xl font-extrabold tracking-tightest ${accent ? "text-white" : "text-navy"}`}>{value}</p>
      {sub && <div className={`mt-1 text-xs ${accent ? "text-white/75" : "text-slate-500"}`}>{sub}</div>}
    </div>
  )
}

export function RekapSection({
  rows,
  summary,
  entitasList,
  children,
}: {
  rows: RekapRow[]
  summary: Summary
  entitasList: string[]
  children?: ReactNode
}) {
  const [skorStatus, setSkorStatus] = useState<SkorStatus>("ALL")
  const rekapRef = useRef<HTMLDivElement>(null)

  const pick = (next: SkorStatus) => {
    setSkorStatus((cur) => (cur === next ? "ALL" : next))
    rekapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <>
      {/* Statistik */}
      <div className="anim-rise-1 mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          accent
          label="Total Pejabat"
          value={String(summary.total)}
          sub={`${summary.pkwt} PKWT · ${summary.pkwtt} PKWTT`}
          active={skorStatus === "ALL"}
          onClick={() => pick("ALL")}
        />
        <StatCard
          label="Sudah Ada Skor"
          value={String(summary.dinilai)}
          active={skorStatus === "ADA"}
          onClick={() => pick("ADA")}
          sub={
            summary.belum > 0 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  pick("BELUM")
                }}
                className={`-mx-1.5 rounded-md px-1.5 py-0.5 font-medium transition hover:bg-rose-50 hover:text-rose-600 ${
                  skorStatus === "BELUM" ? "bg-rose-50 text-rose-600" : ""
                }`}
              >
                {summary.belum} belum tersedia →
              </button>
            ) : (
              `${summary.belum} belum tersedia`
            )
          }
        />
        <StatCard label="Rata-rata Skor" value={fmt(summary.rataRata)} sub={`dari ${summary.dinilai} pejabat dinilai`} />
        <StatCard label="Jumlah Entitas" value={String(summary.entitas)} sub="penugasan PTPN Group" />
      </div>

      {children}

      {/* Rekap interaktif */}
      <div ref={rekapRef} className="anim-rise-2 mt-8 scroll-mt-6">
        <RekapExplorer rows={rows} entitasList={entitasList} skorStatus={skorStatus} setSkorStatus={setSkorStatus} />
      </div>
    </>
  )
}
