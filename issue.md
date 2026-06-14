# Task: Integrasi Swagger API Documentation di ElysiaJS

## Deskripsi Tugas
Kita ingin menambahkan fitur dokumentasi API interaktif menggunakan **Swagger** di project ini. Tujuannya adalah agar pengembang lain dapat dengan mudah melihat, memahami, dan menguji seluruh endpoint API yang tersedia langsung dari antarmuka web (UI) tanpa perlu menggunakan pihak ketiga seperti Postman.

## Teknologi yang Digunakan
- **ElysiaJS Swagger Plugin**: [@elysiajs/swagger](https://elysiajs.com/plugins/swagger.html)

---

## Langkah-Langkah Implementasi (Instruksi untuk Junior Programmer / AI Model)

Ikuti instruksi langkah demi langkah di bawah ini untuk menambahkan dan mengonfigurasi Swagger:

### Langkah 1: Instalasi Plugin Swagger
Instal plugin resmi `@elysiajs/swagger` menggunakan runtime Bun. Jalankan perintah berikut di terminal Anda:
```bash
bun add @elysiajs/swagger
```

### Langkah 2: Daftarkan Plugin Swagger di Server Utama
Buka berkas `src/index.ts` dan daftarkan plugin Swagger agar dapat diakses oleh server.

Ubah isi `src/index.ts` menjadi seperti berikut:
```typescript
import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger'; // 1. Import plugin swagger
import { userRoute } from './routes/user-route';

const app = new Elysia()
  .use(swagger({                           // 2. Aktifkan plugin swagger dengan konfigurasi metadata
    documentation: {
      info: {
        title: 'Belajar Vibe Coding API Documentation',
        version: '1.0.0',
        description: 'Dokumentasi interaktif untuk aplikasi manajemen user dan session',
      },
      tags: [
        { name: 'System', description: 'Endpoint utilitas sistem' },
        { name: 'User Management', description: 'Endpoint registrasi, login, logout, dan profil user' }
      ]
    }
  }))
  .use(userRoute)
  .get('/', () => 'Hello World! Elysia server is running.', {
    detail: {
      tags: ['System'],
      summary: 'Mengembalikan pesan selamat datang server'
    }
  })
  .get('/health', () => ({ status: 'ok' }), {
    detail: {
      tags: ['System'],
      summary: 'Mengecek kesehatan server'
    }
  })
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
```

### Langkah 3: Tambahkan Metadata API di Rute User
Buka berkas `src/routes/user-route.ts`. Kita perlu menambahkan metadata berupa `detail` di masing-masing endpoint agar terdokumentasi dengan rapi di halaman Swagger.

Tambahkan parameter `detail` pada konfigurasi validator masing-masing endpoint. Berikut contoh penerapannya:

#### 1. Endpoint POST `/api/users` (Register)
```typescript
}, {
  body: t.Object({
    name: t.String({ maxLength: 255, error: 'Nama maksimal 255 karakter' }),
    email: t.String({ format: 'email', error: 'Format email tidak valid' }),
    password: t.String({ minLength: 6, error: 'Password minimal 6 karakter' })
  }),
  detail: {
    tags: ['User Management'],
    summary: 'Registrasi User Baru',
    description: 'Mendaftarkan pengguna baru ke sistem dengan validasi panjang nama, format email, dan password.'
  }
})
```

#### 2. Endpoint POST `/api/users/login` (Login)
```typescript
}, {
  detail: {
    tags: ['User Management'],
    summary: 'Login User',
    description: 'Mendapatkan session token otentikasi berdasarkan email & password.'
  }
})
```

#### 3. Endpoint GET `/api/users/current` (Get Profile)
```typescript
}, {
  detail: {
    tags: ['User Management'],
    summary: 'Ambil Profil User Aktif',
    description: 'Mendapatkan data profil user yang sedang masuk (butuh Bearer Token).'
  }
})
```

#### 4. Endpoint DELETE `/api/users/logout` (Logout)
```typescript
}, {
  detail: {
    tags: ['User Management'],
    summary: 'Logout User',
    description: 'Menghapus session token aktif dari server.'
  }
})
```

---

## Verifikasi Implementasi

1. Jalankan aplikasi menggunakan perintah:
   ```bash
   bun run dev
   ```
2. Buka peramban (browser) dan akses alamat:
   ```text
   http://localhost:3000/swagger
   ```
3. Pastikan halaman antarmuka Swagger UI terbuka dan menampilkan seluruh endpoint (System & User Management) lengkap dengan validasi skemanya.
4. Coba lakukan uji coba pendaftaran user atau login menggunakan tombol **"Try it out"** di Swagger UI untuk memastikan fungsionalitasnya berjalan dengan baik.
