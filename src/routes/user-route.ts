import { Elysia, t } from 'elysia';
import { registerUser, loginUser, getCurrentUser, logoutUser } from '../services/user-service';

export const userRoute = new Elysia().post('/api/users', async ({ body, set }) => {
  try {
    const result = await registerUser(body);
    return result;
  } catch (error: any) {
    if (error.message === 'email sudah terdaftar') {
      set.status = 400;
      return { error: error.message };
    }
    
    set.status = 500;
    return { error: 'Internal Server Error' };
  }
}, {
  body: t.Object({
    name: t.String({ maxLength: 255, error: 'Nama maksimal 255 karakter' }),
    email: t.String({ format: 'email', error: 'Format email tidak valid' }),
    password: t.String({ minLength: 6, error: 'Password minimal 6 karakter' })
  }),
  response: {
    200: t.Object({ data: t.String() }),
    400: t.Object({ error: t.String() }),
    500: t.Object({ error: t.String() }),
    422: t.Any()
  },
  detail: {
    tags: ['User Management'],
    summary: 'Registrasi User Baru',
    description: 'Mendaftarkan pengguna baru ke sistem dengan validasi panjang nama, format email, dan password.'
  }
}).post('/api/users/login', async ({ body, set }) => {
  try {
    const result = await loginUser(body);
    return result;
  } catch (error: any) {
    if (error.message === 'email atau password salah') {
      set.status = 401;
      return { error: error.message };
    }
    
    set.status = 500;
    return { error: 'Internal Server Error' };
  }
}, {
  body: t.Object({
    email: t.String({ format: 'email', error: 'Format email tidak valid' }),
    password: t.String({ error: 'Password wajib diisi' })
  }),
  response: {
    200: t.Object({ data: t.String() }),
    401: t.Object({ error: t.String() }),
    500: t.Object({ error: t.String() }),
    422: t.Any()
  },
  detail: {
    tags: ['User Management'],
    summary: 'Login User',
    description: 'Mendapatkan session token otentikasi berdasarkan email & password.'
  }
}).get('/api/users/current', async ({ headers, set }) => {
  const authHeader = headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    set.status = 401;
    return { error: 'Unauthorized' };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const result = await getCurrentUser(token);
    return { data: result };
  } catch (error: any) {
    set.status = 401;
    return { error: 'Unauthorized' };
  }
}, {
  response: {
    200: t.Object({
      data: t.Object({
        id: t.Number(),
        name: t.String(),
        email: t.String(),
        created_at: t.Any()
      })
    }),
    401: t.Object({ error: t.String() })
  },
  detail: {
    tags: ['User Management'],
    summary: 'Ambil Profil User Aktif',
    description: 'Mendapatkan data profil user yang sedang masuk (butuh Bearer Token).',
    security: [{ BearerAuth: [] }]
  }
}).delete('/api/users/logout', async ({ headers, set }) => {
  const authHeader = headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    set.status = 401;
    return { error: 'Unauthorized' };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const result = await logoutUser(token);
    return result;
  } catch (error: any) {
    set.status = 401;
    return { error: 'Unauthorized' };
  }
}, {
  response: {
    200: t.Object({ data: t.String() }),
    401: t.Object({ error: t.String() })
  },
  detail: {
    tags: ['User Management'],
    summary: 'Logout User',
    description: 'Menghapus session token aktif dari server.',
    security: [{ BearerAuth: [] }]
  }
});
