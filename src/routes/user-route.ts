import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "../services/user-service";

export const userRoute = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body, set }) => {
    try {
      const data = await registerUser(body);
      return {
        message: "User berhasil dibuat",
        data,
      };
    } catch (error: any) {
      set.status = 409; // Conflict
      if (error.message === "Email sudah terdaftar") {
        return {
          message: "User gagal dibuat",
          error: "Email sudah terdaftar",
        };
      }
      set.status = 500;
      return {
        message: "User gagal dibuat",
        error: error.message,
      };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  })
  .post("/login", async ({ body, set }) => {
    try {
      const token = await loginUser(body);
      return {
        data: token,
      };
    } catch (error: any) {
      set.status = error.message === "email atau password salah" ? 401 : 500;
      return {
        error: error.message,
      };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  });
