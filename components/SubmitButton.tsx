"use client"
import { useFormStatus } from "react-dom"
import { ShimmerButton } from "@/components/magicui/shimmer-button"

export function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <ShimmerButton
      type="submit"
      disabled={pending}
      background="#2A1A47"
      shimmerColor="#5EEAD4"
      borderRadius="9999px"
      className="group !flex min-h-[48px] w-full !items-center !justify-between !py-2 !pl-6 !pr-2 text-sm font-bold tracking-tight"
    >
      <span>{pending ? "Memproses…" : "Masuk"}</span>
      <span className="z-10 grid h-9 w-9 place-items-center rounded-full bg-white/15 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105">
        {pending ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </span>
    </ShimmerButton>
  )
}
