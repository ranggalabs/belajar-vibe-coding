import { Elysia } from 'elysia';
import { registerUser, loginUser, getCurrentUser } from '../services/user-service';

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
});
