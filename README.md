# Belajar Vibe Coding

Aplikasi backend sederhana untuk registrasi pengguna, otentikasi (login/logout), dan manajemen sesi. Proyek ini dibangun menggunakan **ElysiaJS** sebagai web framework, **Drizzle ORM** untuk berinteraksi dengan database MySQL, dan dijalankan menggunakan **Bun runtime**.

---

## 🛠️ Tech Stack & Library

Proyek ini menggunakan kombinasi teknologi modern untuk kinerja maksimal dan kenyamanan pengembangan berbasis TypeScript:

- **Runtime & Package Manager**: [Bun](https://bun.com) (v1.3.14)
- **Web Framework**: [ElysiaJS](https://elysiajs.com) (v1.4.28)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team) (v0.45.2)
- **Database Driver**: `mysql2` (v3.22.4)
- **Validation**: [TypeBox](https://github.com/sinclairzx81/typebox) (bawaan Elysia)
- **Enkripsi**: `bcrypt` (v6.0.0)
- **Testing**: `bun test` (bawaan Bun)

---

## 📁 Arsitektur Folder & Struktur File

Aplikasi ini mengikuti pola arsitektur berlapis (layered architecture) yang memisahkan antara rute HTTP, logika bisnis, dan akses database. Berikut struktur foldernya:

```text
belajar-vibe-coding/
├── src/
│   ├── db/
│   │   ├── index.ts          # Konfigurasi koneksi MySQL pool dengan Drizzle
│   │   └── schema.ts         # Definisi skema tabel database (Users & Sessions)
│   ├── routes/
│   │   └── user-route.ts     # Rute HTTP (endpoint API) dan validasi input schema
│   ├── services/
│   │   └── user-service.ts   # Logika bisnis (register, login, logout, get profile)
│   └── index.ts              # Entry point aplikasi (Elysia server initialization)
├── test/
│   └── api.test.ts           # Skenario & implementasi unit test (Bun Test)
├── drizzle.config.ts         # Konfigurasi Drizzle-Kit untuk migrasi skema
├── package.json              # File manifest npm dependencies dan scripts
├── tsconfig.json             # Konfigurasi kompiler TypeScript
└── .env                      # Konfigurasi environment variables (Database URL)
```

### Penamaan & Tanggung Jawab Berkas:
- **`*-route.ts`**: Menangani permintaan HTTP masuk, validasi request body menggunakan TypeBox, memanggil service yang sesuai, dan mengembalikan response HTTP.
- **`*-service.ts`**: Berisi logika bisnis inti aplikasi (seperti hashing password, mencocokkan password, query database, manipulasi data).
- **`schema.ts`**: Representasi tabel database relasional dalam bentuk TypeScript code yang digunakan oleh Drizzle ORM.

---

## 🗄️ Skema Database

Berikut skema tabel yang digunakan pada database MySQL:

### 1. Tabel `users`
Tabel ini menyimpan data kredensial dan profil dasar pengguna.
- `id` (`serial`): Primary Key.
- `name` (`varchar(255)`): Nama lengkap pengguna (maksimal 255 karakter).
- `email` (`varchar(255)`): Email unik pengguna (digunakan untuk login).
- `password` (`varchar(255)`): Hash password bcrypt pengguna.
- `created_at` (`timestamp`): Tanggal dan waktu akun dibuat (default: `NOW()`).

### 2. Tabel `sessions`
Tabel ini digunakan untuk otentikasi berbasis token session (Stateful Session).
- `id` (`serial`): Primary Key.
- `token` (`varchar(255)`): Token UUID acak yang dibuat saat login sukses.
- `user_id` (`int`): Foreign Key yang merujuk ke `users.id`.
- `password` (`varchar(255)`): Hash password pengguna (untuk verifikasi keamanan tambahan).
- `created_at` (`timestamp`): Waktu token session dibuat (default: `NOW()`).

---

## 🌐 Daftar Endpoint API

Semua rute API terdaftar di bawah `/api/users` kecuali endpoint sistem bawaan.

### Endpoint Sistem
- **GET `/`**: Mengembalikan status server (`"Hello World! Elysia server is running."`).
- **GET `/health`**: Mengembalikan status kesehatan aplikasi (`{"status": "ok"}`).

### Endpoint Manajemen Pengguna
- **POST `/api/users`** (Register User)
  - Mendaftarkan pengguna baru.
  - **Validasi Input**:
    - `name`: String, maksimal 255 karakter.
    - `email`: String, berformat email valid.
    - `password`: String, minimal 6 karakter.
  - **Response (200 OK)**: `{"data": "Ok"}`

- **POST `/api/users/login`** (Login User)
  - Autentikasi pengguna dan mendapatkan session token.
  - **Response (200 OK)**: `{"data": "<session_token_uuid>"}`

- **GET `/api/users/current`** (Get Current User)
  - Mengambil profil pengguna yang sedang login saat ini.
  - **Header Wajib**: `Authorization: Bearer <session_token_uuid>`
  - **Response (200 OK)**:
    ```json
    {
      "data": {
        "id": 1,
        "name": "Nama User",
        "email": "user@example.com",
        "created_at": "2026-06-14T07:00:00.000Z"
      }
    }
    ```

- **DELETE `/api/users/logout`** (Logout User)
  - Menghapus sesi otentikasi aktif dari database.
  - **Header Wajib**: `Authorization: Bearer <session_token_uuid>`
  - **Response (200 OK)**: `{"data": "Ok"}`

---

## 🚀 Memulai Project (Setup Guide)

### 1. Prasyarat
Pastikan Anda sudah menginstal **Bun** pada komputer Anda. Jika belum, instal menggunakan:
```bash
# Untuk macOS/Linux:
curl -fsSL https://bun.sh/install | bash

# Untuk Windows (PowerShell):
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 2. Instalasi Dependensi
Jalankan perintah berikut di root folder:
```bash
bun install
```

### 3. Konfigurasi Environment (`.env`)
Buat file bernama `.env` di root folder dan konfigurasikan koneksi MySQL Anda:
```env
DATABASE_URL="mysql://username:password@localhost:3306/nama_database"
```

### 4. Setup Database (Migrasi Drizzle)
Dorong skema tabel TypeScript Anda ke database MySQL menggunakan perintah:
```bash
bun run db:push
```

### 5. Jalankan Aplikasi
Jalankan server dalam mode pengembangan (dengan hot-reload otomatis saat file berubah):
```bash
bun run dev
```
Server akan berjalan di `http://localhost:3000`.

---

## 🧪 Cara Menjalankan Pengujian (Testing)

Proyek ini telah dilengkapi dengan skenario unit test menyeluruh menggunakan framework pengujian native Bun Test.

Untuk menjalankan seluruh unit test, jalankan perintah:
```bash
bun test
```

*Catatan: Tes terbagi menjadi dua bagian:*
- **System Routes**: Berjalan secara in-memory dan tidak memerlukan database.
- **Database API Routes**: Memerlukan database lokal yang dikonfigurasi pada `.env` agar menyala, karena test akan melakukan proses insert, query, dan pembersihan tabel secara otomatis pada awal setiap skenario.
