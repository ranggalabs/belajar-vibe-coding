import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { userRoute } from './routes/user-route';

export const app = new Elysia()
  .use(swagger({
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
