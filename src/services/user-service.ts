import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const registerUser = async ({ name, email, password }: any) => {
  // 1. Check if email exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Insert user
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // 4. Get the created user (without password)
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error("Gagal mengambil data user");
  }

  return user;
};

export const loginUser = async ({ email, password }: any) => {
  // 1. Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error("email atau password salah");
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("email atau password salah");
  }

  // 3. Generate token
  const token = crypto.randomUUID();

  // 4. Store session
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
};

export const getUserByToken = async (token: string) => {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (!user) {
    throw new Error("unauthorized");
  }

  return user;
};

export const logoutUser = async (token: string) => {
  const result = await db.delete(sessions).where(eq(sessions.token, token));
  
  if (result.rowsAffected === 0) {
    throw new Error("unauthorized");
  }

  return true;
};
