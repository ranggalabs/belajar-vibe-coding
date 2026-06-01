import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

export async function registerUser(data: any) {
  const { name, email, password } = data;

  // 1. Cek email apakah sudah terdaftar
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    throw new Error('email sudah terdaftar');
  }

  // 2. Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // 3. Simpan ke database
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { data: 'Ok' };
}
