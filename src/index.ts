import { Elysia } from 'elysia';
import { userRoute } from './routes/user-route';

export const app = new Elysia()
  .use(userRoute)
  .get('/', () => 'Hello World! Elysia server is running.')
  .get('/health', () => ({ status: 'ok' }))
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
