"use client"

import { useActionState, useMemo, useState } from "react"
import { excludePejabat, includePejabat, type EditState } from "@/app/actions"
import { Avatar } from "@/components/Avatar"
import { fmt } from "@/lib/score"

type Row = {
  nama: string
  entitas: string | null
  jabatan: string | null
  status: "PKWT" | "PKWTT"
  skor: number | null
  foto: string | null
  excluded: boolean
  alasan: string | null
}

const initial: EditState = { ok: false }

function RowItem({ r }: { r: Row }) {
  const [state, formAction, pending] = useActionState(r.excluded ? includePejabat : excludePejabat, initial)
  return (
    <div className={`rounded-2xl p-4 shadow-card ring-1 backdrop-blur-sm ${r.excluded ? "bg-rose-50/60 ring-rose-200/70" : "bg-white/90 ring-slate-900/[0.05]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={r.foto} name={r.nama} size={44} className={r.excluded ? "opacity-60 grayscale" : ""} />
          <div className="min-w-0">
            <p className={`truncate font-bold ${r.excluded ? "text-slate-500" : "text-navy"}`}>
              {r.nama}
              {r.excluded && <span className="ml-2 inline-flex rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700">Dikecualikan</span>}
            </p>
            <p className="truncate text-xs text-slate-500">{r.jabatan} · {r.entitas}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {r.status} · skor {fmt(r.skor)}{r.excluded && r.alasan ? ` · alasan: ${r.alasan}` : ""}
            </p>
          </div>
        </div>

        <form action={formAction} className="flex shrink-0 items-center gap-2">
          <input type="hidden" name="nama" value={r.nama} />
          {!r.excluded && (
            <input name="alasan" type="text" placeholder="Alasan (opsional)"
              className="hidden w-44 rounded-full bg-paper px-3.5 py-2 text-xs text-ink shadow-inner ring-1 ring-slate-900/[0.06] outline-none focus:ring-2 focus:ring-steel sm:block" />
          )}
          <button type="submit" disabled={pending}
            className={`inline-flex min-h-[36px] cursor-pointer items-center rounded-full px-4 text-sm font-semibold shadow-soft transition-all active:scale-[0.98] disabled:opacity-60 ${
              r.excluded
                ? "bg-navy text-white hover:bg-primary"
                : "bg-white text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50"
            }`}>
            {pending ? "…" : r.excluded ? "Pulihkan" : "Kecualikan"}
          </button>
        </form>
      </div>
      {state.error && <p role="alert" className="mt-2 text-xs text-rose-700">{state.error}</p>}
    </div>
  )
}

export function PejabatKelola({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("")
  const [tab, setTab] = useState<"ALL" | "AKTIF" | "EX">("ALL")

  const excludedCount = rows.filter((r) => r.excluded).length
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return rows.filter((r) => {
      if (tab === "AKTIF" && r.excluded) return false
      if (tab === "EX" && !r.excluded) return false
      if (term && !(`${r.nama} ${r.jabatan ?? ""} ${r.entitas ?? ""}`.toLowerCase().includes(term))) return false
      return true
    })
  }, [rows, q, tab])

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-paper p-0.5 text-xs font-semibold shadow-inner ring-1 ring-slate-900/[0.06]">
          {([["ALL", `Semua (${rows.length})`], ["AKTIF", `Dinilai (${rows.length - excludedCount})`], ["EX", `Dikecualikan (${excludedCount})`]] as [typeof tab, string][]).map(([k, lbl]) => (
            <button key={k} type="button" onClick={() => setTab(k)}
              className={`rounded-lg px-3 py-1.5 transition ${tab === k ? "bg-white text-navy shadow-sm ring-1 ring-slate-900/[0.06]" : "text-slate-500 hover:text-navy"}`}>
              {lbl}
            </button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / jabatan…"
          className="w-full rounded-xl bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-steel sm:w-64" />
      </div>

      <div className="mt-4 grid gap-2.5">
        {filtered.map((r) => <RowItem key={r.nama} r={r} />)}
        {filtered.length === 0 && (
          <p className="rounded-2xl bg-white/70 px-4 py-10 text-center text-sm text-slate-400 ring-1 ring-slate-900/[0.05]">Tidak ada pejabat yang cocok.</p>
        )}
      </div>
    </section>
  )
}
