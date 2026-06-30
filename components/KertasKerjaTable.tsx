"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { KertasRow } from "@/lib/data"
import { band, fmt } from "@/lib/score"
import { Avatar } from "@/components/Avatar"
import { LhekLink } from "@/components/LhekLink"

function tgl(s: string | null) {
  if (!s) return "—"
  const d = new Date(s + "T00:00:00")
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

export function KertasKerjaTable({ rows, entitasList }: { rows: KertasRow[]; entitasList: string[] }) {
  const [q, setQ] = useState("")
  const [entitas, setEntitas] = useState("ALL")

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return rows.filter((r) => {
      if (entitas !== "ALL" && r.entitas !== entitas) return false
      if (term && !(`${r.nama} ${r.jabatan ?? ""} ${r.entitas ?? ""}`.toLowerCase().includes(term))) return false
      return true
    })
  }, [rows, q, entitas])

  return (
    <section className="rounded-3xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="eyebrow bg-primary/10 text-primary">Kertas Kerja</span>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-navy">Rincian Per-Penugasan</h2>
          <p className="mt-1 text-sm text-slate-500">Skor sementara terbobot masa jabatan; satu orang bisa memiliki beberapa baris penugasan.</p>
        </div>
        <p className="text-sm text-slate-500"><span className="data font-semibold text-navy">{filtered.length}</span> dari {rows.length} baris</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / jabatan…" className="rounded-xl border-0 bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-steel" />
        <select value={entitas} onChange={(e) => setEntitas(e.target.value)} className="rounded-xl border-0 bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] focus:outline-none focus:ring-2 focus:ring-steel">
          <option value="ALL">Semua Entitas</option>
          {entitasList.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[940px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-900/[0.08] text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <th className="py-2.5 pr-3 font-semibold">No</th>
              <th className="py-2.5 pr-3 font-semibold">Nama & Jabatan</th>
              <th className="py-2.5 pr-3 font-semibold">Entitas</th>
              <th className="py-2.5 pr-3 font-semibold">Periode Menjabat</th>
              <th className="py-2.5 pr-3 text-right font-semibold">Hari</th>
              <th className="py-2.5 pr-3 text-right font-semibold">Bulan</th>
              <th className="py-2.5 font-semibold">Skor Sementara</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const b = band(r.skor)
              return (
                <tr key={`${r.no}-${i}`} className="border-b border-slate-900/[0.05] align-top transition-colors hover:bg-paper/70">
                  <td className="py-3 pr-3 data text-slate-400">{r.no ?? "—"}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={r.foto} name={r.nama} size={36} />
                      <div className="min-w-0">
                        <div className="font-semibold text-navy">
                          <Link href={`/pejabat/${encodeURIComponent(r.nama)}`} className="hover:text-primary hover:underline">{r.nama}</Link>
                        </div>
                        <div className="text-xs text-slate-500">{r.jabatan}</div>
                        {r.keterangan && <div className="mt-1 text-[11px] italic text-slate-400">{r.keterangan}</div>}
                        <LhekLink lhek={r.lhek} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-slate-600">{r.entitas}</td>
                  <td className="py-3 pr-3 data text-xs text-slate-600">{tgl(r.awal)} – {tgl(r.akhir)}</td>
                  <td className="py-3 pr-3 text-right data text-slate-600">{r.hari ?? "—"}</td>
                  <td className="py-3 pr-3 text-right data text-slate-600">{r.bulan ?? "—"}</td>
                  <td className="py-3">
                    {r.skor != null ? (
                      <span className="flex items-center gap-2">
                        <span className="data w-14 text-right font-bold text-navy">{fmt(r.skor)}</span>
                        <span className={`h-2 w-2 shrink-0 rounded-full ${b.dot}`} />
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">{r.keterangan ?? "—"}</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-10 text-center text-sm text-slate-400">Tidak ada data yang cocok dengan filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
