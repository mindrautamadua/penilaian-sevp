-- Skema Penilaian SEVP — Tahun Kinerja 2025 (sumber: "Kertas Kerja" PTPN Group)

-- Kertas kerja: rincian per-penugasan (1 orang bisa punya >1 baris karena rangkap/Plt).
create table if not exists kertas_kerja (
  id          serial primary key,
  no          int,
  entitas     text,
  nama        text not null,
  jabatan     text,
  keterangan  text,
  awal        date,            -- awal menjabat
  akhir       date,            -- akhir menjabat
  hari        int,
  bulan       int,
  skor        numeric(8,4),    -- SKOR SEMENTARA (terbobot periode)
  rangkap     boolean not null default false
);

-- Rekap: skor final 1 orang = 1 skor, dipisah status kepegawaian.
create table if not exists rekap (
  id        serial primary key,
  no        int,
  nama      text not null,
  entitas   text,
  jabatan   text,
  status    text not null check (status in ('PKWT', 'PKWTT')),
  skor      numeric(8,4),      -- null = skor belum tersedia
  bulan     int,
  catatan   text,
  kategori_bod text,           -- override kategori oleh BOD; null = ikuti kategori sistem
  phdp         text,           -- usulan Golongan PhDP 2025
  person_grade text            -- usulan Person Grade 2025
);

-- Akun aplikasi: username + password (di-hash scrypt). Sumber kebenaran login
-- begitu user mengganti password; sebelum itu dipakai akun bawaan di lib/auth.ts.
create table if not exists app_users (
  username      text primary key,
  name          text not null,
  role          text not null default 'admin',
  password_hash text not null,
  updated_at    timestamptz not null default now()
);

-- Dokumen LHEK (Laporan Hasil Evaluasi Kinerja) per entitas. File PDF disimpan
-- di Supabase Storage (bucket 'lhek'); tabel ini menyimpan metadata + path.
-- entitas: daftar kode entitas yang dicakup 1 dokumen (mis. LHEK PTPN I konsolidasi).
create table if not exists lhek_doc (
  id          serial primary key,
  judul       text not null,
  tahun       int not null default 2025,
  entitas     text[] not null default '{}',
  path        text not null,            -- path objek di bucket Storage
  file_name   text not null,
  size_bytes  bigint,
  uploaded_by text,
  uploaded_at timestamptz not null default now()
);

create index if not exists idx_lhek_entitas on lhek_doc using gin (entitas);

-- KPI Kolegial per LHEK (1 set per entitas/dokumen). Nilai diketik/seed dari LHEK
-- agar bisa ditampilkan tanpa membuka PDF.
create table if not exists kpi_kolegial (
  id         serial primary key,
  judul      text not null,
  tahun      int not null default 2025,
  entitas    text[] not null default '{}',
  catatan    text,
  updated_at timestamptz not null default now(),
  unique (judul, tahun)
);
create index if not exists idx_kpi_kolegial_entitas on kpi_kolegial using gin (entitas);

create table if not exists kpi_item (
  id         serial primary key,
  set_id     int not null references kpi_kolegial(id) on delete cascade,
  urut       int not null default 0,
  perspektif text,                 -- mis. "A.1 Finansial", "B. Inovasi Model Bisnis"
  indikator  text not null,
  satuan     text,
  target     text,                 -- text: bisa berupa tanggal/keterangan ("Triwulan II")
  realisasi  text,
  polaritas  text,                 -- Maximize / Minimize
  bobot      numeric(8,2),
  skor       numeric(10,4)          -- presisi penuh agar total cocok skor final
);
create index if not exists idx_kpi_item_set on kpi_item(set_id);

-- Breakdown KPI per individu (sesuai jabatan) — bobot & skor berbeda tiap jabatan.
-- Menjumlah ke skor final orang tsb (mis. SEVP Operation LPP = 104,94).
create table if not exists kpi_pejabat (
  id         serial primary key,
  nama       text not null,
  jabatan    text,
  entitas    text,
  tahun      int not null default 2025,
  urut       int not null default 0,
  perspektif text,
  indikator  text not null,
  satuan     text,
  target     text,
  realisasi  text,
  polaritas  text,
  bobot      numeric(8,2),
  capaian    text,                 -- % capaian realisasi (mis. "79,5%")
  skor       numeric(10,4)         -- presisi penuh agar total cocok dgn skor final
);
create index if not exists idx_kpi_pejabat_nama on kpi_pejabat(nama, tahun);

-- Kategori skor (Istimewa/Sangat Baik/dst) — ambang & warna dapat diatur admin.
create table if not exists skor_kategori (
  id        serial primary key,
  urut      int not null default 0,
  label     text not null,
  batas_min numeric(6,2) not null,   -- skor >= batas_min → kategori ini (dicek dari tertinggi)
  warna     text not null default 'slate'
);

-- Pejabat yang dikecualikan dari penilaian (disembunyikan dari dashboard & kertas kerja).
create table if not exists pejabat_excluded (
  nama   text primary key,
  alasan text,
  oleh   text,
  waktu  timestamptz not null default now()
);

create index if not exists idx_rekap_entitas on rekap(entitas);
create index if not exists idx_rekap_status  on rekap(status);
create index if not exists idx_kk_entitas    on kertas_kerja(entitas);
create index if not exists idx_kk_nama       on kertas_kerja(nama);

-- Riwayat penilaian kinerja tahun-tahun sebelumnya (per pejabat per tahun).
create table if not exists riwayat_penilaian (
  nama       text not null,
  tahun      int  not null,
  nilai      numeric(8,2),
  rating     text,
  golongan   text,
  grade      text,
  perusahaan text,
  jabatan    text,
  entitas    text,
  primary key (nama, tahun)
);
create index if not exists idx_riwayat_nama on riwayat_penilaian(nama);
