import { Elysia, t } from "elysia";
import { registerUser, loginUser, getUserByToken, logoutUser } from "../services/user-service";

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
      name: t.String({
        maxLength: 255,
        error: "Nama maksimal 255 karakter"
      }),
      email: t.String({
        format: "email",
        error: "Format email tidak valid"
      }),
      password: t.String({
        minLength: 8,
        error: "Password minimal 8 karakter"
      }),
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
  })
  .group("", (app) => 
    app
      .derive(({ headers, set }) => {
        const auth = headers["authorization"];
        if (!auth || !auth.startsWith("Bearer ")) {
          set.status = 401;
          throw new Error("unauthorized");
        }

        return {
          token: auth.slice(7)
        };
      })
      .get("/current", async ({ token, set }) => {
        try {
          const user = await getUserByToken(token);

          return {
            data: {
              id: user.id,
              name: user.name,
              email: user.email,
              created_at: user.createdAt,
            },
          };
        } catch (error: any) {
          set.status = 401;
          return {
            error: "unauthorized",
          };
        }
      })
      .delete("/logout", async ({ token, set }) => {
        try {
          await logoutUser(token);

          return {
            data: "ok",
          };
        } catch (error: any) {
          set.status = 401;
          return {
            error: "unauthorized",
          };
        }
      })
  );
