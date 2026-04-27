# Belajar Vibe Coding - Backend API

Proyek backend API sederhana yang dibangun menggunakan Bun, ElysiaJS, dan Drizzle ORM. Proyek ini dibuat untuk keperluan belajar pengembangan backend modern dengan performa tinggi dan _type-safety_ yang terjamin (End-to-End Type Safety).

## 🚀 Tech Stack & Libraries

Proyek ini dibangun di atas teknologi modern:

- **Runtime**: [Bun](https://bun.sh/) (v1.x) - Runtime JavaScript yang sangat cepat, sekaligus berfungsi sebagai package manager dan test runner.
- **Framework**: [ElysiaJS](https://elysiajs.com/) - Web framework tercepat untuk Bun dengan dukungan TypeScript penuh.
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - ORM TypeScript yang ringan dan cepat.
- **Database**: MySQL 8.0 (dijalankan via Docker)
- **Library Tambahan**: 
  - `bcrypt` (Untuk melakukan _hashing_ dan verifikasi _password_ user)
  - `mysql2` (Driver MySQL untuk koneksi database)
  - `drizzle-kit` (CLI untuk memanajemen migrasi skema database)
- **Bahasa Pemrograman**: TypeScript

## 🗄️ Skema Database

Aplikasi ini menggunakan database MySQL dan memiliki 2 tabel utama:

1. **`users`** (Tabel untuk menyimpan data pengguna)
   - `id` (int, Primary Key, Auto Increment)
   - `name` (varchar(255), Not Null) - Nama lengkap pengguna
   - `email` (varchar(100), Not Null, Unique) - Alamat email unik untuk login
   - `password` (varchar(255), Not Null) - Password yang sudah di-hash (Bcrypt)
   - `createdAt` (timestamp, Default Now)
   - `updatedAt` (timestamp, On Update Now)

2. **`sessions`** (Tabel untuk manajemen sesi login pengguna)
   - `id` (int, Primary Key, Auto Increment)
   - `token` (varchar(100), Not Null, Unique) - Token unik (UUID) untuk sesi login
   - `userId` (int, Not Null, Foreign Key ke `users.id`) - Relasi ke pengguna terkait
   - `createdAt` (timestamp, Default Now)

## 🌐 API yang Tersedia

Aplikasi ini berjalan secara default di `http://localhost:3000`.

### User Endpoint (`/api/users`)
Semua *request* dan *response* menggunakan format JSON.

| Method | Endpoint | Keterangan | Autentikasi | Body Request |
|--------|----------|------------|-------------|--------------|
| `POST` | `/api/users` | Registrasi user baru | Tidak | `{ "name": "...", "email": "...", "password": "..." }` |
| `POST` | `/api/users/login` | Login user | Tidak | `{ "email": "...", "password": "..." }` |
| `GET`  | `/api/users/current` | Mendapatkan profil user saat ini | Ya (Bearer Token) | - |
| `DELETE`| `/api/users/logout` | Melakukan logout (hapus token) | Ya (Bearer Token) | - |

> **Catatan Autentikasi**: Untuk endpoint yang memerlukan autentikasi (`/current` dan `/logout`), Anda wajib menyertakan token dari hasil login pada Headers HTTP: `Authorization: Bearer <token>`

## 🏗️ Arsitektur, Struktur Folder & Penamaan

Aplikasi ini mengadopsi arsitektur modular (Service-Controller Pattern) dengan pemisahan lapisan logika (*layering*).

### Struktur Folder
```text
belajar-vibe-coding/
├── src/
│   ├── db/            # Berisi konfigurasi Drizzle ORM dan definisi skema database (schema.ts)
│   ├── routes/        # Berisi controller (definisi rute ElysiaJS dan validasi body request)
│   ├── services/      # Berisi _business logic_ dan interaksi/query langsung ke database
│   └── index.ts       # Entry point utama untuk menginisialisasi server ElysiaJS
├── test/              # Berisi seluruh berkas unit testing menggunakan Bun Test
├── docker-compose.yml # Berkas konfigurasi Docker untuk men-deploy MySQL lokal
├── .env.example       # Template environment variables (contoh)
├── package.json       # Informasi dependensi dan skrip proyek
└── tsconfig.json      # Konfigurasi compiler TypeScript
```

### Konvensi Penamaan (Naming Conventions)
- **Nama File**: Menggunakan **kebab-case** (contoh: `user-route.ts`, `user-service.ts`, `schema.ts`).
- **Nama Variabel & Fungsi**: Menggunakan **camelCase** (contoh: `registerUser`, `userRoute`).
- **Nama Tabel Database**: Menggunakan bentuk jamak **snake_case** (contoh: `users`, `sessions`). Kolom database didefinisikan sebagai camelCase di TypeScript tetapi dipetakan (mapped) menjadi snake_case di database SQL (contoh: `createdAt` -> `created_at`).

## 📋 Requirement / Prerequisite

Sebelum menjalankan atau mengembangkan aplikasi, pastikan perangkat Anda telah memenuhi prasyarat berikut:
1. **[Bun](https://bun.sh/)** (Disarankan versi terbaru v1.0+) - Berfungsi sebagai runtime, _package manager_, dan _test runner_.
2. **[Docker](https://www.docker.com/)** dan **Docker Compose** - Diperlukan untuk memutar _container_ database MySQL lokal tanpa perlu meng-install MySQL Server secara manual.

## 🛠️ Cara Menjalankan Aplikasi

Ikuti langkah-langkah di bawah ini untuk mulai menjalankan aplikasi di _local environment_:

1. **Install Dependencies**
   Gunakan Bun untuk mengunduh semua package:
   ```bash
   bun install
   ```

2. **Siapkan Environment Variables**
   Salin file `.env.example` ke file `.env` baru:
   ```bash
   cp .env.example .env
   ```
   *(Secara default, konfigurasi koneksi database di `.env.example` sudah disesuaikan dengan kredensial pada `docker-compose.yml`)*

3. **Jalankan Database MySQL via Docker**
   Jalankan container MySQL di _background_:
   ```bash
   docker-compose up -d
   ```

4. **Sinkronisasi Skema Database (Migrasi)**
   Pastikan skema database terbaru pada kode di-push (diterapkan) ke dalam database MySQL:
   ```bash
   bun run db:generate
   bun run db:push
   ```

5. **Jalankan Server Backend**
   Jalankan mode _development_. Aplikasi akan otomatis *restart* apabila ada perubahan pada kode sumber (_hot-reload/watch_):
   ```bash
   bun run dev
   ```
   Server sekarang dapat diakses pada `http://localhost:3000`.

## 🧪 Cara Melakukan Test Aplikasi

Aplikasi ini menggunakan fitur *testing* bawaan dari Bun (`bun test`). Suite pengujian otomatis mencakup skenario pembuatan akun, pengelolaan database, pengelolaan sesi, autentikasi, serta penanganan *error*.

1. Pastikan container database lokal masih berjalan (`docker-compose up -d`).
2. Eksekusi pengujian dengan perintah:
   ```bash
   bun test
   ```
   *(Test script akan secara otomatis menjalankan semua skenario dan membersihkan data (*cleanup*) pada akhir setiap iterasi)*
