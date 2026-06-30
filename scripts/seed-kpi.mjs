// Seed KPI Kolegial dari 5 dokumen LHEK 2025. Idempoten: upsert per (judul, tahun),
// item lama dihapus lalu diisi ulang. Jalankan: node scripts/seed-kpi.mjs
import postgres from "postgres"
import { loadEnv, makeSslOpt } from "./_env.mjs"

loadEnv()
const sql = postgres(process.env.DATABASE_URL, { ssl: makeSslOpt(process.env.DATABASE_URL), prepare: false })

// item: [perspektif, indikator, satuan, target, realisasi, polaritas, bobot, skor]
const SETS = [
  {
    judul: "KPI Kolegial PT LPP Agro Nusantara",
    entitas: ["PT LPPAN"],
    items: [
      ["A.1 Finansial", "EBITDA Margin", "%", "8,86", "7,04", "Maximize", 12, 9.53],
      ["A.1 Finansial", "Cash From Operation (CFO)", "Rp Miliar", "3,25", "15,98", "Maximize", 3, 3.30],
      ["A.1 Finansial", "Laporan KAP Tahunan", "Waktu", "31 Maret 2025", "30 Mei 2025", "Minimize", 5, 2.00],
      ["A.2 Operasional", "Pendapatan Usaha", "Rp Miliar", "105,67", "125,98", "Maximize", 8, 8.80],
      ["A.2 Operasional", "Kepuasan Pelanggan", "Skor", "65", "90,97", "Maximize", 6, 6.60],
      ["A.2 Operasional", "Learning Class Delivery", "Kelas", "300", "368", "Maximize", 6, 6.60],
      ["A.3 Sosial", "Penyaluran CSR", "Rp Juta", "120", "128,48", "Maximize", 5, 5.35],
      ["A.3 Sosial", "Pemberdayaan & Edukasi Masyarakat", "Kali", "12", "46", "Maximize", 5, 5.50],
      ["B. Inovasi Model Bisnis", "Pengembangan Revenue Stream Asset Arranger", "Aset terlisting", "100", "109", "Maximize", 6, 6.54],
      ["B. Inovasi Model Bisnis", "Implementasi Eters sebagai Model Bisnis Kerjasama Digital", "%", "100", "100", "Maximize", 6, 6.00],
      ["C. Kepemimpinan Teknologi", "Implementasi Digitalisasi Proses Bisnis Internal LPPAN", "Sistem digital", "2", "4", "Maximize", 6, 6.60],
      ["C. Kepemimpinan Teknologi", "Pengembangan Product Digital Business", "Produk", "4", "5", "Maximize", 6, 6.60],
      ["D. Peningkatan Investasi", "Pengembangan AI Precision Farming", "Produk", "2", "3", "Maximize", 6, 6.60],
      ["D. Peningkatan Investasi", "Optimalisasi Aset", "Aset", "2", "2", "Maximize", 6, 6.00],
      ["E. Pengembangan Talenta", "Rasio Talent Muda", "%", "35", "58", "Maximize", 4, 4.40],
      ["E. Pengembangan Talenta", "Rasio Talent Perempuan", "%", "25", "33", "Maximize", 4, 4.40],
      ["E. Pengembangan Talenta", "Pemenuhan Kompetensi Karyawan melalui Pendidikan", "Orang", "5", "5", "Maximize", 3, 3.00],
      ["E. Pengembangan Talenta", "Pemenuhan Kompetensi Karyawan melalui IDP", "%", "75", "95,57", "Maximize", 3, 3.30],
    ],
  },
  {
    judul: "KPI Kolegial PT Perkebunan Nusantara I",
    entitas: ["PTPN I - Regional 1", "PTPN I - Regional 2", "PTPN I - Regional 3", "PTPN I - Regional 4", "PTPN I - Regional 5", "PTPN I - Regional 7", "PTPN I - Regional 8", "PTPN I - Supporting Co HO"],
    items: [
      ["A.1 Finansial", "EBITDA Margin", "%", "24,72", "29,79", "Maximize", 10, 11.00],
      ["A.1 Finansial", "ROIC >= WACC", "%", "-1,53", "-2,64", "Maximize", 7, 4.06],
      ["A.1 Finansial", "Penyampaian LAI Tahun 2024", "Waktu", "31 Maret 2025", "8 Juni 2025", "Minimize", 6, 0.00],
      ["A.2 Operasional", "Cash Cost Komoditi Karet", "Rp/Kg", "18.900", "21.389,19", "Minimize", 12, 10.60],
      ["A.2 Operasional", "Produktivitas Komoditi Karet", "Ton/Ha", "1,44", "1,21", "Maximize", 12, 10.08],
      ["A.3 Sosial", "Realisasi Program TJSL BUMN", "%", "100", "95,00", "Maximize", 7, 6.65],
      ["B. Inovasi Model Bisnis", "Implementasi Post Merger Integration & Integrated Management System", "%", "100,00", "90,28", "Maximize", 3, 2.71],
      ["B. Inovasi Model Bisnis", "Total Revenue dari Pemasaran Produk", "Rp Miliar", "4.048,40", "3.856,98", "Maximize", 5, 4.76],
      ["B. Inovasi Model Bisnis", "Total Revenue dari Agrowisata", "Rp Miliar", "215,80", "155,73", "Maximize", 4, 2.89],
      ["B. Inovasi Model Bisnis", "Implementasi ESG", "%", "100,00", "100,00", "Maximize", 3, 3.00],
      ["C. Kepemimpinan Teknologi", "Implementasi RSTI 2025 - 2029", "%", "100,00", "100,00", "Maximize", 8, 8.00],
      ["D. Peningkatan Investasi", "Realisasi PMN", "%", "96,60", "81,78", "Maximize", 4, 3.39],
      ["D. Peningkatan Investasi", "Monetisasi, dan/atau Pelepasan Aset Non-Inti", "Rp Miliar", "1.566", "489,39", "Maximize", 7, 2.19],
      ["D. Peningkatan Investasi", "Replanting & Perluasan", "Ha", "3.300,86", "3.700,03", "Maximize", 4, 4.40],
      ["E. Pengembangan Talenta", "Human Capital Transformation", "%", "100,00", "99,94", "Maximize", 8, 8.00],
    ],
  },
  {
    judul: "KPI Kolegial PT Perkebunan Nusantara IV",
    entitas: ["PTPN IV - Palm Co HO", "PTPN IV - Regional 1", "PTPN IV - Regional 2", "PTPN IV - Regional 3", "PTPN IV - Regional 4", "PTPN IV - Regional 5", "PTPN IV - Regional 6", "PTPN IV - Regional 7"],
    items: [
      ["A.1 Finansial", "EBITDA Margin", "%", "21,92", "28,41", "Maximize", 8, 8.80],
      ["A.1 Finansial", "ROIC >= WACC", "%", "3,82", "11,30", "Maximize", 5, 5.50],
      ["A.1 Finansial", "Penyampaian LAI Tahun 2024", "Waktu", "31 Maret 2025", "23 Juli 2025", "Minimize", 5, 0.00],
      ["A.2 Operasional", "Cash Cost Kelapa Sawit", "Rp/Kg", "4.630", "4.663", "Maximize", 10, 9.93],
      ["A.2 Operasional", "Produktivitas CPO", "Ton/Ha", "5.429", "4.791", "Maximize", 10, 8.82],
      ["A.3 Sosial", "Perolehan Bahan Baku P3 Kelapa Sawit", "Ton", "3.191.756", "3.259.110", "Maximize", 8, 8.17],
      ["A.3 Sosial", "Peremajaan Sawit Rakyat Sebagai Komitmen PSN", "Ha", "22.568", "22.996", "Maximize", 8, 8.15],
      ["B. Inovasi Model Bisnis", "Sertifikasi RSPO", "Unit", "217", "191", "Maximize", 4, 3.52],
      ["B. Inovasi Model Bisnis", "Total Revenue dari Pemasaran Produk", "Rp Miliar", "41.404", "45.986", "Maximize", 4, 4.40],
      ["B. Inovasi Model Bisnis", "Pengukuran Nilai Emisi Karbon", "%", "100", "100", "Maximize", 3, 3.00],
      ["B. Inovasi Model Bisnis", "Implementasi Post Merger Integration", "%", "100", "100", "Maximize", 4, 4.00],
      ["C. Kepemimpinan Teknologi", "Implementasi RSTI 2025", "%", "100", "116,69", "Maximize", 8, 8.80],
      ["D. Peningkatan Investasi", "Replanting & Konversi", "Ha", "21.443", "20.691,56", "Maximize", 8, 7.72],
      ["D. Peningkatan Investasi", "Pembangunan Pabrik Pengolahan Inti Sawit", "Waktu", "Triwulan II", "Tidak Terlaksana", "Maximize", 7, 0.00],
      ["E. Pengembangan Talenta", "Human Capital Transformation", "%", "100", "109,80", "Maximize", 8, 8.78],
    ],
  },
  {
    judul: "KPI Kolegial PT Kawasan Industri Nusantara",
    entitas: ["PT KINRA"],
    items: [
      ["A.1 Finansial", "EBITDA Margin", "%", "16,65", "23,35", "Maximize", 12, 13.20],
      ["A.1 Finansial", "Cash From Operation", "Rp Miliar", "72,06", "54,33", "Maximize", 3, 2.26],
      ["A.1 Finansial", "Penyampaian LAI", "Waktu", "31 Maret 2025", "15 Mei 2025", "Minimize", 5, 3.00],
      ["A.2 Operasional", "Total Produksi Air Bersih", "m³", "3.873.925", "3.348.093", "Maximize", 9, 7.78],
      ["A.2 Operasional", "Total Produksi Listrik", "kWh", "128.679.676", "93.736.971", "Maximize", 9, 6.56],
      ["A.2 Operasional", "Pengolahan Limbah Cair", "m³", "1.815.676", "1.087.259", "Maximize", 7, 4.19],
      ["A.3 Sosial", "Pemberitaan Positif oleh Media", "Berita", "26", "99", "Maximize", 5, 5.50],
      ["B. Inovasi Model Bisnis", "Optimalisasi Penggunaan Aset Tetap", "Unit", "80", "44", "Maximize", 4, 2.20],
      ["B. Inovasi Model Bisnis", "Otomasi Perangkat Utilitas", "Unit", "1", "1", "Maximize", 4, 4.00],
      ["B. Inovasi Model Bisnis", "Pelayanan Perizinan RKL-RPL Rinci Kawasan", "Kali", "4", "6", "Maximize", 5, 5.50],
      ["C. Kepemimpinan Teknologi", "Total Interaksi Investor — Cold Calling", "Perusahaan", "30", "59", "Maximize", 4, 4.40],
      ["C. Kepemimpinan Teknologi", "Total Interaksi Investor — Direct Email", "Perusahaan", "50", "90", "Maximize", 3, 3.30],
      ["C. Kepemimpinan Teknologi", "Digitalisasi Promosi — Website", "Visitor", "10.000", "23.000", "Maximize", 4, 4.40],
      ["C. Kepemimpinan Teknologi", "Digitalisasi Promosi — Media Sosial", "Unggahan", "100", "137", "Maximize", 3, 3.30],
      ["D. Peningkatan Investasi", "Luas Lahan yang Tersewakan pada Investor", "Ha", "150", "81,07", "Maximize", 9, 3.78],
      ["D. Peningkatan Investasi", "Kerjasama Optimasi Aset dengan Investor", "Unit", "1", "1", "Maximize", 4, 6.00],
      ["E. Pengembangan Talenta", "Rasio Talent Muda", "%", "10", "19,33", "Maximize", 5, 5.50],
      ["E. Pengembangan Talenta", "Rasio Talent Perempuan", "%", "10", "20,69", "Maximize", 5, 5.50],
    ],
  },
  {
    judul: "KPI Kolegial PT Industri Karet Nusantara",
    entitas: ["PT IKN"],
    items: [
      ["A.1 Finansial", "EBITDA Margin", "%", "18,77", "10,56", "Maximize", 12, 6.75],
      ["A.1 Finansial", "Cash from Operation (CFO)", "Rp Miliar", "7,90", "-2,47", "Maximize", 3, 0.00],
      ["A.1 Finansial", "Penyampaian LAI", "Waktu", "31 Maret 2025", "5 Mei 2025", "Minimize", 5, 3.00],
      ["A.2 Operasional", "Total Produksi Resiprene", "Kg", "400.000", "285.200", "Maximize", 5, 3.56],
      ["A.2 Operasional", "Harga Pokok Produksi Resiprene", "Rp/Kg", "59.815", "57.987", "Minimize", 4, 4.13],
      ["A.2 Operasional", "Total Penjualan Resiprene", "Rp Miliar", "44,39", "34,07", "Maximize", 4, 3.07],
      ["A.2 Operasional", "Total Produksi Rubber Article", "Kg", "25.000", "7.677", "Maximize", 5, 1.54],
      ["A.2 Operasional", "Harga Pokok Produksi Rubber Article", "Rp/Kg", "99.557", "127.873", "Minimize", 4, 3.11],
      ["A.2 Operasional", "Total Penjualan Rubber Article", "Rp Miliar", "5,78", "1,73", "Maximize", 4, 1.20],
      ["A.3 Sosial", "Penyaluran Sumbangan Masyarakat & Lingkungan", "Rp Juta", "40,00", "38,51", "Maximize", 4, 3.85],
      ["B. Inovasi Model Bisnis", "Supplier Produk Lain-lain di lingkungan PTPN Group", "Paket", "6", "6", "Maximize", 5, 5.00],
      ["B. Inovasi Model Bisnis", "Pendirian Toko/Gerai", "Unit", "1", "1", "Maximize", 4, 4.00],
      ["B. Inovasi Model Bisnis", "Pencapaian Penjualan Produk Sepatu Boots", "Pasang", "50.000", "42.506", "Maximize", 5, 4.25],
      ["C. Kepemimpinan Teknologi", "Digitalisasi Proses Produksi", "%", "90", "80", "Maximize", 4, 3.56],
      ["C. Kepemimpinan Teknologi", "Digitalisasi Proses Pencatatan Keuangan & Akuntansi", "%", "90", "90", "Maximize", 4, 4.00],
      ["C. Kepemimpinan Teknologi", "Digitalisasi Proses Pemasaran", "%", "90", "90", "Maximize", 4, 4.00],
      ["D. Peningkatan Investasi", "Pemeliharaan Mesin & Bangunan Pabrik Rubber Article", "Rp Juta", "600", "162", "Minimize", 4, 4.40],
      ["D. Peningkatan Investasi", "Pemeliharaan Mesin & Bangunan Pabrik Resiprene", "Rp Juta", "4.343", "1.545", "Minimize", 8, 8.80],
      ["E. Pengembangan Talenta", "Rasio Talenta Muda & Perempuan", "%", "15,00", "19,67", "Maximize", 6, 6.60],
      ["E. Pengembangan Talenta", "Pelatihan & Pengembangan Karyawan", "%", "100,00", "100,00", "Maximize", 6, 6.60],
    ],
  },
]

const TAHUN = 2025
let totalItems = 0
try {
  for (const s of SETS) {
    const [{ id }] = await sql`
      insert into kpi_kolegial (judul, tahun, entitas)
      values (${s.judul}, ${TAHUN}, ${s.entitas})
      on conflict (judul, tahun) do update set entitas = excluded.entitas, updated_at = now()
      returning id`
    await sql`delete from kpi_item where set_id = ${id}`
    let urut = 0
    for (const [perspektif, indikator, satuan, target, realisasi, polaritas, bobot, skor] of s.items) {
      urut += 1
      await sql`
        insert into kpi_item (set_id, urut, perspektif, indikator, satuan, target, realisasi, polaritas, bobot, skor)
        values (${id}, ${urut}, ${perspektif}, ${indikator}, ${satuan}, ${target}, ${realisasi}, ${polaritas}, ${bobot}, ${skor})`
    }
    const [{ total }] = await sql`select coalesce(sum(skor),0)::numeric(8,2) as total from kpi_item where set_id=${id}`
    totalItems += s.items.length
    console.log(`✓ ${s.judul} — ${s.items.length} item, total skor ${total}`)
  }
  console.log(`Selesai. ${SETS.length} set, ${totalItems} item KPI.`)
} catch (e) {
  console.error("✗ Seed GAGAL:", e.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
