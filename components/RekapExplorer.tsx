"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { RekapRow } from "@/lib/data"
import { band, fmt, barPct, DEFAULT_KATEGORI, type Kategori } from "@/lib/score"
import { Avatar } from "@/components/Avatar"
import { LhekLink } from "@/components/LhekLink"
import { BodKategoriCell } from "@/components/BodKategoriCell"
import { LinkPending } from "@/components/LinkPending"

type SortKey = "skor-desc" | "skor-asc" | "nama" | "entitas"
export type SkorStatus = "ALL" | "ADA" | "BELUM"

export function RekapExplorer({
  rows,
  entitasList,
  kategori = DEFAULT_KATEGORI,
  canEdit = false,
  skorStatus = "ALL",
  setSkorStatus,
}: {
  rows: RekapRow[]
  entitasList: string[]
  kategori?: Kategori[]
  canEdit?: boolean
  skorStatus?: SkorStatus
  setSkorStatus?: (s: SkorStatus) => void
}) {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"ALL" | "PKWT" | "PKWTT">("ALL")
  const [entitas, setEntitas] = useState<string>("ALL")
  const [masa, setMasa] = useState<"ALL" | "LT12" | "FULL">("ALL")
  const [verif, setVerif] = useState<"ALL" | "YES" | "NO">("ALL")
  const [riwayat, setRiwayat] = useState<"ALL" | "YES" | "NO">("ALL")
  const [sort, setSort] = useState<SortKey>("skor-desc")

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    let out = rows.filter((r) => {
      if (skorStatus === "ADA" && r.skor == null) return false
      if (skorStatus === "BELUM" && r.skor != null) return false
      if (status !== "ALL" && r.status !== status) return false
      if (entitas !== "ALL" && r.entitas !== entitas) return false
      if (masa === "LT12" && !(r.bulan != null && r.bulan < 12)) return false
      if (masa === "FULL" && !(r.bulan != null && r.bulan >= 12)) return false
      // Terverifikasi = ada Evident LHEK & masa jabatan genap 12 bulan.
      const verified = !!r.lhek && r.bulan === 12
      if (verif === "YES" && !verified) return false
      if (verif === "NO" && verified) return false
      if (riwayat === "YES" && !r.hasRiwayat) return false
      if (riwayat === "NO" && r.hasRiwayat) return false
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
  }, [rows, q, status, entitas, masa, verif, riwayat, sort, skorStatus])

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
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama / jabatan…"
          className="rounded-xl border-0 bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-steel"
        />
        <select value={entitas} onChange={(e) => setEntitas(e.target.value)} className="rounded-xl border-0 bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] focus:outline-none focus:ring-2 focus:ring-steel">
          <option value="ALL">Semua Unit Penilaian</option>
          {entitasList.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded-xl border-0 bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] focus:outline-none focus:ring-2 focus:ring-steel">
          <option value="ALL">Semua Status</option>
          <option value="PKWT">PKWT</option>
          <option value="PKWTT">PKWTT</option>
        </select>
        <select value={masa} onChange={(e) => setMasa(e.target.value as typeof masa)} className="rounded-xl border-0 bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] focus:outline-none focus:ring-2 focus:ring-steel">
          <option value="ALL">Semua Masa Jabatan</option>
          <option value="LT12">Masa jabatan &lt; 12 bln</option>
          <option value="FULL">Masa jabatan 12 bln penuh</option>
        </select>
        <select value={verif} onChange={(e) => setVerif(e.target.value as typeof verif)} className="rounded-xl border-0 bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] focus:outline-none focus:ring-2 focus:ring-steel">
          <option value="ALL">Semua Verifikasi</option>
          <option value="YES">Terverifikasi</option>
          <option value="NO">Belum terverifikasi</option>
        </select>
        <select value={riwayat} onChange={(e) => setRiwayat(e.target.value as typeof riwayat)} className="rounded-xl border-0 bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] focus:outline-none focus:ring-2 focus:ring-steel">
          <option value="ALL">Semua Riwayat</option>
          <option value="YES">Sudah ada riwayat</option>
          <option value="NO">Belum ada riwayat</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-xl border-0 bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] focus:outline-none focus:ring-2 focus:ring-steel">
          <option value="skor-desc">Skor tertinggi</option>
          <option value="skor-asc">Skor terendah</option>
          <option value="nama">Nama (A–Z)</option>
          <option value="entitas">Unit Penilaian</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-900/[0.08] text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <th className="py-2.5 pr-3 font-semibold">Nama & Jabatan</th>
              <th className="py-2.5 pr-3 font-semibold">Unit Penilaian</th>
              <th className="py-2.5 pr-3 font-semibold">Status</th>
              <th className="py-2.5 pr-3 text-right font-semibold">Bulan</th>
              <th className="py-2.5 pr-3 font-semibold">Skor</th>
              <th className="py-2.5 pr-3 font-semibold">Kategori (Sistem)</th>
              <th className="py-2.5 font-semibold">Kategori (BOD)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const b = band(r.skor, kategori)
              return (
                <tr key={`${r.status}-${r.no}-${i}`} className="border-b border-slate-900/[0.05] align-top transition-colors hover:bg-paper/70">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={r.foto} name={r.nama} size={40} />
                      <div className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          <Link href={`/pejabat/${encodeURIComponent(r.nama)}`} scroll={false} className="font-semibold text-navy hover:text-primary hover:underline">{r.nama}<LinkPending /></Link>
                          {r.lhek && r.bulan === 12 ? (
                            <span title={`Terverifikasi · LHEK ada & masa jabatan genap 12 bulan · ${r.lhek.judul}`} className="inline-flex shrink-0 text-emerald-600" aria-label="Terverifikasi: LHEK ada dan masa jabatan genap 12 bulan">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                                <path d="m9 12 2 2 4-4" />
                              </svg>
                            </span>
                          ) : (
                            <span title={`Belum terverifikasi · perlu Evident LHEK & masa jabatan genap 12 bulan${!r.lhek ? " · LHEK belum ada" : ""}${r.bulan !== 12 ? " · masa jabatan bukan 12 bulan" : ""}`} className="inline-flex shrink-0 text-rose-600" aria-label="Belum terverifikasi">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                                <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                            </span>
                          )}
                          {r.rangkap && (
                            <span title={`Jabatan rangkap (menjabat bersamaan): ${r.jabatan}`} className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200">Rangkap</span>
                          )}
                          {r.bulan != null && r.bulan < 12 && (
                            <span title={`Masa menjabat ${r.bulan} bulan (< 12) — skor mencerminkan periode parsial`} className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-orange-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-orange-700 ring-1 ring-orange-200" aria-label={`Masa menjabat ${r.bulan} bulan, kurang dari 12`}>
                              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                              </svg>
                              {r.bulan} bln
                            </span>
                          )}
                          {r.hasRiwayat ? (
                            <span title="Ada riwayat penilaian 2023–2024" className="inline-flex shrink-0 text-primary" aria-label="Ada riwayat penilaian">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
                              </svg>
                            </span>
                          ) : (
                            <span title="Belum ada riwayat penilaian" className="inline-flex shrink-0 text-slate-300" aria-label="Belum ada riwayat penilaian">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
                              </svg>
                            </span>
                          )}
                        </span>
                        <div className="text-xs text-slate-500">{r.jabatan}</div>
                        {r.catatan && !/^(rangkap|gabungan)/i.test(r.catatan.trim()) && (
                          <div className="mt-1 text-[11px] italic text-slate-400">{r.catatan}</div>
                        )}
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
                  <td className="py-3 pr-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${b.chip}`}>{b.label}</span>
                  </td>
                  <td className="py-3">
                    <BodKategoriCell id={r.id} skor={r.skor} kategoriBod={r.kategoriBod} kategori={kategori} canEdit={canEdit} />
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
