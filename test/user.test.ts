import { describe, test, expect, beforeEach } from "bun:test";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";
import { app } from "../src/index";

// Helper: bersihkan data sebelum setiap test
beforeEach(async () => {
  await db.delete(sessions);
  await db.delete(users);
});

// Helper: register user dan return response
const registerUser = async (body: Record<string, unknown>) => {
  const req = new Request("http://localhost:3000/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return app.handle(req);
};

// Helper: login user dan return response
const loginUser = async (body: Record<string, unknown>) => {
  const req = new Request("http://localhost:3000/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return app.handle(req);
};

// Helper: get current user
const getCurrentUser = async (token?: string) => {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = token;
  }
  const req = new Request("http://localhost:3000/api/users/current", {
    method: "GET",
    headers,
  });
  return app.handle(req);
};

// Helper: logout user
const logoutUser = async (token?: string) => {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = token;
  }
  const req = new Request("http://localhost:3000/api/users/logout", {
    method: "DELETE",
    headers,
  });
  return app.handle(req);
};

// Helper: register + login dan return token
const createAndLoginUser = async () => {
  await registerUser({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });
  const loginRes = await loginUser({
    email: "test@example.com",
    password: "password123",
  });
  const loginJson = await loginRes.json();
  return loginJson.data as string;
};

// ============================================================
// 1. API Register User (POST /api/users/)
// ============================================================
describe("POST /api/users - Register User", () => {
  test("berhasil mendaftar dengan data valid", async () => {
    const res = await registerUser({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toBe("User berhasil dibuat");
    expect(json.data).toBeDefined();
    expect(json.data.email).toBe("john@example.com");
    expect(json.data.name).toBe("John Doe");
    expect(json.data.id).toBeDefined();
  });

  test("gagal jika email format tidak valid", async () => {
    const res = await registerUser({
      name: "John Doe",
      email: "bukan-email",
      password: "password123",
    });

    expect(res.status).not.toBe(200);
  });

  test("gagal jika password kurang dari 8 karakter", async () => {
    const res = await registerUser({
      name: "John Doe",
      email: "john@example.com",
      password: "short",
    });

    expect(res.status).not.toBe(200);
  });

  test("gagal jika nama lebih dari 255 karakter", async () => {
    const res = await registerUser({
      name: "a".repeat(256),
      email: "john@example.com",
      password: "password123",
    });

    expect(res.status).not.toBe(200);
  });

  test("gagal jika email sudah terdaftar (duplikat)", async () => {
    // Register pertama
    await registerUser({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    // Register kedua dengan email sama
    const res = await registerUser({
      name: "Jane Doe",
      email: "john@example.com",
      password: "password456",
    });
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toBe("Email sudah terdaftar");
  });
});

// ============================================================
// 2. API Login User (POST /api/users/login)
// ============================================================
describe("POST /api/users/login - Login User", () => {
  test("berhasil login dengan kredensial yang benar", async () => {
    // Register dulu
    await registerUser({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    const res = await loginUser({
      email: "john@example.com",
      password: "password123",
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(typeof json.data).toBe("string");
  });

  test("gagal login jika email salah", async () => {
    await registerUser({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    const res = await loginUser({
      email: "wrong@example.com",
      password: "password123",
    });
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("email atau password salah");
  });

  test("gagal login jika password salah", async () => {
    await registerUser({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    const res = await loginUser({
      email: "john@example.com",
      password: "wrongpassword",
    });
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("email atau password salah");
  });

  test("gagal login jika body request tidak lengkap", async () => {
    const res = await loginUser({
      email: "john@example.com",
    });

    expect(res.status).not.toBe(200);
  });
});

// ============================================================
// 3. API Get Current User (GET /api/users/current)
// ============================================================
describe("GET /api/users/current - Get Current User", () => {
  test("berhasil mendapatkan data user dengan token valid", async () => {
    const token = await createAndLoginUser();

    const res = await getCurrentUser(`Bearer ${token}`);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(json.data.email).toBe("test@example.com");
    expect(json.data.name).toBe("Test User");
    expect(json.data.id).toBeDefined();
    expect(json.data.created_at).toBeDefined();
  });

  test("gagal jika tanpa header Authorization", async () => {
    const res = await getCurrentUser();

    expect(res.status).toBe(401);
  });

  test("gagal jika format token salah (tanpa Bearer prefix)", async () => {
    const token = await createAndLoginUser();

    const res = await getCurrentUser(token); // tanpa "Bearer "

    expect(res.status).toBe(401);
  });

  test("gagal jika token tidak valid / palsu", async () => {
    const res = await getCurrentUser("Bearer fake-token-12345");
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("unauthorized");
  });
});

// ============================================================
// 4. API Logout User (DELETE /api/users/logout)
// ============================================================
describe("DELETE /api/users/logout - Logout User", () => {
  test("berhasil logout dengan token valid", async () => {
    const token = await createAndLoginUser();

    const res = await logoutUser(`Bearer ${token}`);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBe("ok");

    // Pastikan token sudah tidak bisa digunakan lagi
    const currentRes = await getCurrentUser(`Bearer ${token}`);
    expect(currentRes.status).toBe(401);
  });

  test("gagal logout jika tanpa header Authorization", async () => {
    const res = await logoutUser();

    expect(res.status).toBe(401);
  });

  test("gagal logout jika token tidak valid / palsu", async () => {
    const res = await logoutUser("Bearer fake-token-12345");
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("unauthorized");
  });
});
