// Kredensial aplikasi (server-only). Jangan diimpor dari komponen client.
// Sumber kebenaran: tabel app_users (password di-hash). Selama baris user
// belum ada di DB, dipakai akun bawaan di bawah (bootstrap) sampai user
// mengganti passwordnya sendiri.

import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import { db } from "./supabase"

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>

export type Role = "admin"
export type User = { username: string; name: string; role: Role }

type Account = User & { password: string }

const ACCOUNTS: Account[] = [
  { username: "satrio", name: "Satrio", role: "admin", password: "3on3" },
  { username: "uut",    name: "Uut",    role: "admin", password: "3on3" },
]

const norm = (u: string) => u.trim().toLowerCase()

// ── Hashing password (scrypt + salt acak; format "saltHex:keyHex") ──
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scrypt(password, salt, 64)
  return `${salt.toString("hex")}:${key.toString("hex")}`
}

async function verifyHash(password: string, stored: string): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(":")
  if (!saltHex || !keyHex) return false
  const key = Buffer.from(keyHex, "hex")
  const test = await scrypt(password, Buffer.from(saltHex, "hex"), key.length)
  return key.length === test.length && timingSafeEqual(key, test)
}

type DbUser = { username: string; name: string; role: Role; password_hash: string }

async function dbUser(username: string): Promise<DbUser | null> {
  if (!db) return null
  try {
    const { data, error } = await db
      .from("app_users")
      .select("username, name, role, password_hash")
      .eq("username", username)
      .limit(1)
      .maybeSingle()
    if (error || !data) return null
    return data as DbUser
  } catch {
    return null // tabel belum ada / DB down → jatuh ke akun bawaan
  }
}

// Cocokkan username (case-insensitive) + password → data publik user atau null.
export async function verifyCredentials(username: string, password: string): Promise<User | null> {
  const u = norm(username)
  const row = await dbUser(u)
  if (row) {
    return (await verifyHash(password, row.password_hash))
      ? { username: row.username, name: row.name, role: row.role }
      : null
  }
  const acc = ACCOUNTS.find((a) => a.username === u)
  if (!acc || acc.password !== password) return null
  const { password: _pw, ...pub } = acc
  return pub
}

export async function findUser(username: string | undefined | null): Promise<User | null> {
  if (!username) return null
  const u = norm(username)
  const row = await dbUser(u)
  if (row) return { username: row.username, name: row.name, role: row.role }
  const acc = ACCOUNTS.find((a) => a.username === u)
  if (!acc) return null
  const { password: _pw, ...pub } = acc
  return pub
}

// Simpan password baru (upsert) — membuat baris app_users bila belum ada.
export async function setPassword(user: User, newPassword: string): Promise<void> {
  if (!db) throw new Error("Database tidak tersedia.")
  const hash = await hashPassword(newPassword)
  const { error } = await db.from("app_users").upsert(
    {
      username: user.username,
      name: user.name,
      role: user.role,
      password_hash: hash,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "username" },
  )
  if (error) throw new Error(error.message)
}
