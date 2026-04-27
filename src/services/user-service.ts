import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

/**
 * Mendaftarkan user baru ke dalam sistem.
 *
 * Melakukan validasi keunikan email, melakukan hashing pada password
 * menggunakan bcrypt, menyimpan data user ke database, kemudian
 * mengembalikan data user yang baru dibuat (tanpa field password).
 *
 * @param name - Nama lengkap user
 * @param email - Alamat email user (harus unik)
 * @param password - Password plaintext yang akan di-hash sebelum disimpan
 * @returns Data user yang baru dibuat (id, name, email, createdAt, updatedAt)
 * @throws Error jika email sudah terdaftar di database
 */
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

/**
 * Melakukan autentikasi login user berdasarkan email dan password.
 *
 * Mencari user berdasarkan email, memverifikasi password menggunakan bcrypt,
 * membuat token sesi unik (UUID), menyimpan sesi ke database, dan
 * mengembalikan token tersebut untuk digunakan pada request selanjutnya.
 *
 * @param email - Alamat email user yang ingin login
 * @param password - Password plaintext untuk diverifikasi
 * @returns Token sesi (UUID string) yang valid
 * @throws Error jika email tidak ditemukan atau password tidak cocok
 */
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

/**
 * Mengambil data profil user berdasarkan token sesi yang aktif.
 *
 * Melakukan JOIN antara tabel sessions dan users untuk mendapatkan
 * data user yang terkait dengan token yang diberikan.
 * Digunakan untuk memvalidasi sesi dan mendapatkan identitas user yang sedang login.
 *
 * @param token - Token sesi (UUID) milik user yang sedang login
 * @returns Data profil user (id, name, email, createdAt)
 * @throws Error "unauthorized" jika token tidak ditemukan atau tidak valid
 */
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

/**
 * Melakukan logout user dengan menghapus token sesi dari database.
 *
 * Menghapus record sesi yang cocok dengan token yang diberikan.
 * Setelah logout, token tersebut tidak dapat digunakan kembali
 * untuk mengakses endpoint yang membutuhkan autentikasi.
 *
 * @param token - Token sesi (UUID) yang ingin dihapus/di-invalidate
 * @returns true jika sesi berhasil dihapus
 * @throws Error "unauthorized" jika token tidak ditemukan di database
 */
export const logoutUser = async (token: string) => {
  const result = await db.delete(sessions).where(eq(sessions.token, token));
  
  if (result[0].affectedRows === 0) {
    throw new Error("unauthorized");
  }

  return true;
};
