# Project Setup Plan: Bun, ElysiaJS, Drizzle ORM, MySQL

## Deskripsi Tugas
Tugas ini adalah untuk menginisialisasi proyek backend baru menggunakan Bun. Proyek ini akan menggunakan ElysiaJS sebagai framework web, Drizzle ORM sebagai alat ORM, dan MySQL sebagai database relasionalnya.

## Tujuan Utama
Membuat struktur dasar proyek dan memastikan semua pustaka (dependencies) yang diperlukan terpasang dan terkonfigurasi dengan benar agar siap untuk pengembangan fitur.

## Instruksi Pengerjaan (High Level)

1. **Inisialisasi Proyek Bun:**
   - Mulai proyek baru menggunakan Bun di direktori ini.
   - Pastikan file `package.json` dan `tsconfig.json` terbentuk.

2. **Setup Framework Web (ElysiaJS):**
   - Instal `elysia`.
   - Buat file entry point utama (misal: `src/index.ts`).
   - Buat satu endpoint dasar (misal: `GET /` yang mengembalikan pesan "Hello World" atau status server).

3. **Setup Database (MySQL) & ORM (Drizzle):**
   - Instal `drizzle-orm` serta driver koneksi MySQL untuk Bun (misal: `mysql2`).
   - Instal dependensi development untuk Drizzle (misal: `drizzle-kit`).
   - Buat konfigurasi dasar koneksi database. Gunakan environment variables (`.env`) untuk menyimpan kredensial database (jangan hardcode).
   - Buat konfigurasi `drizzle.config.ts` untuk keperluan migrasi.

4. **Struktur Basis Schema:**
   - Buat folder khusus untuk schema database (misal: `src/db/schema.ts`).
   - Tambahkan contoh satu tabel sederhana (misal: tabel `users`) menggunakan Drizzle MySQL.

5. **Dokumentasi & Skrip Dasar:**
   - Tambahkan skrip di `package.json` untuk menjalankan server di mode development (misal menggunakan `bun run --watch`).
   - Tambahkan skrip untuk melakukan migrasi database menggunakan Drizzle Kit.

## Kriteria Penerimaan (Acceptance Criteria)
- Proyek dapat dijalankan tanpa error.
- Terdapat endpoint yang bisa diakses dan mengembalikan respons HTTP.
- Skrip migrasi Drizzle dapat dijalankan dan membaca koneksi ke MySQL lokal.
- Kredensial database tertulis dalam contoh file `.env.example`.
