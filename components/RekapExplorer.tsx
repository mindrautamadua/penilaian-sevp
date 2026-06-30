"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { RekapRow } from "@/lib/data"
import { band, fmt, barPct } from "@/lib/score"
import { Avatar } from "@/components/Avatar"
import { LhekLink } from "@/components/LhekLink"

type SortKey = "skor-desc" | "skor-asc" | "nama" | "entitas"
export type SkorStatus = "ALL" | "ADA" | "BELUM"

export function RekapExplorer({
  rows,
  entitasList,
  skorStatus = "ALL",
  setSkorStatus,
}: {
  rows: RekapRow[]
  entitasList: string[]
  skorStatus?: SkorStatus
  setSkorStatus?: (s: SkorStatus) => void
}) {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"ALL" | "PKWT" | "PKWTT">("ALL")
  const [entitas, setEntitas] = useState<string>("ALL")
  const [sort, setSort] = useState<SortKey>("skor-desc")

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    let out = rows.filter((r) => {
      if (skorStatus === "ADA" && r.skor == null) return false
      if (skorStatus === "BELUM" && r.skor != null) return false
      if (status !== "ALL" && r.status !== status) return false
      if (entitas !== "ALL" && r.entitas !== entitas) return false
      if (term && !(`${r.nama} ${r.jabatan ?? ""} ${r.entitas ?? ""}`.toLowerCase().includes(term))) return false
      return true
    })
    out = [...out].sort((a, b) => {
      switch (sort) {
        case "nama": return a.nama.localeCompare(b.nama, "id")
        case "entitas": return (a.entitas ?? "").localeCompare(b.entitas ?? "", "id") || a.nama.localeCompare(b.nama, "id")
        case "skor-asc": return (a.skor ?? Infinity) - (b.skor ?? Infinity)
        default: return (b.skor ?? -Infinity) - (a.skor ?? -Infinity)
      }
    })
    return out
  }, [rows, q, status, entitas, sort, skorStatus])

  return (
    <section className="rounded-3xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="eyebrow bg-primary/10 text-primary">Rekap Skor</span>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-navy">Daftar Penilaian — 1 Orang 1 Skor</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {setSkorStatus && (
            <div className="inline-flex rounded-xl bg-paper p-0.5 text-xs font-semibold shadow-inner ring-1 ring-slate-900/[0.06]">
              {([
                ["ALL", "Semua"],
                ["ADA", "Sudah ada"],
                ["BELUM", "Belum ada"],
              ] as [SkorStatus, string][]).map(([key, lbl]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSkorStatus(key)}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    skorStatus === key ? "bg-white text-navy shadow-sm ring-1 ring-slate-900/[0.06]" : "text-slate-500 hover:text-navy"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          )}
          <p className="text-sm text-slate-500">
            <span className="data font-semibold text-navy">{filtered.length}</span> dari {rows.length} pejabat
          </p>
        </div>
      </div>

      {/* Kontrol */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama / jabatan…"
          className="rounded-xl border-0 bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-steel"
        />
        <select value={entitas} onChange={(e) => setEntitas(e.target.value)} className="rounded-xl border-0 bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] focus:outline-none focus:ring-2 focus:ring-steel">
          <option value="ALL">Semua Entitas</option>
          {entitasList.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded-xl border-0 bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] focus:outline-none focus:ring-2 focus:ring-steel">
          <option value="ALL">Semua Status</option>
          <option value="PKWT">PKWT</option>
          <option value="PKWTT">PKWTT</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-xl border-0 bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] focus:outline-none focus:ring-2 focus:ring-steel">
          <option value="skor-desc">Skor tertinggi</option>
          <option value="skor-asc">Skor terendah</option>
          <option value="nama">Nama (A–Z)</option>
          <option value="entitas">Entitas</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-900/[0.08] text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <th className="py-2.5 pr-3 font-semibold">Nama & Jabatan</th>
              <th className="py-2.5 pr-3 font-semibold">Entitas</th>
              <th className="py-2.5 pr-3 font-semibold">Status</th>
              <th className="py-2.5 pr-3 text-right font-semibold">Bulan</th>
              <th className="py-2.5 pr-3 font-semibold">Skor</th>
              <th className="py-2.5 font-semibold">Kategori</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const b = band(r.skor)
              return (
                <tr key={`${r.status}-${r.no}-${i}`} className="border-b border-slate-900/[0.05] align-top transition-colors hover:bg-paper/70">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={r.foto} name={r.nama} size={40} />
                      <div className="min-w-0">
                        <Link href={`/pejabat/${encodeURIComponent(r.nama)}`} className="font-semibold text-navy hover:text-primary hover:underline">{r.nama}</Link>
                        <div className="text-xs text-slate-500">{r.jabatan}</div>
                        {r.catatan && <div className="mt-1 text-[11px] italic text-slate-400">{r.catatan}</div>}
                        <LhekLink lhek={r.lhek} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-slate-600">{r.entitas}</td>
                  <td className="py-3 pr-3">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${r.status === "PKWTT" ? "bg-primary/10 text-primary" : "bg-slate-900/[0.05] text-slate-500"}`}>{r.status}</span>
                  </td>
                  <td className="py-3 pr-3 text-right data text-slate-600">{r.bulan ?? "—"}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <span className="data w-14 shrink-0 text-right font-bold text-navy">{fmt(r.skor)}</span>
                      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-900/[0.06]">
                        <span className={`block h-full rounded-full ${b.bar}`} style={{ width: `${barPct(r.skor)}%` }} />
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${b.chip}`}>{b.label}</span>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-400">Tidak ada data yang cocok dengan filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
