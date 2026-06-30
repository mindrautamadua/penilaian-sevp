import { cookies } from "next/headers"
import { Header, Aurora } from "@/components/Header"
import { ChangePasswordForm } from "@/components/ChangePasswordForm"
import { findUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function AkunPage() {
  const user = await findUser((await cookies()).get("sevp_auth")?.value)

  return (
    <>
      <Aurora />
      <Header active="/akun" />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="anim-rise">
          <span className="eyebrow bg-grad-teal text-white shadow-soft">Akun</span>
          <h1 className="h-display mt-3 text-3xl sm:text-4xl">Pengaturan Akun</h1>
          {user && (
            <p className="mt-2 text-sm text-slate-500">
              Masuk sebagai <span className="font-semibold text-navy">{user.name}</span>
              <span className="data"> · {user.username}</span> · {user.role}
            </p>
          )}
        </div>

        <div className="anim-rise-1 mt-7">
          <ChangePasswordForm />
        </div>
      </main>
    </>
  )
}
