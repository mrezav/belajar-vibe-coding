import { Elysia } from "elysia";
import { userRoute } from "./routes/user-route";

const app = new Elysia()
  .get("/", () => ({
    message: "Welcome to Elysia + Bun + Drizzle + MySQL API!",
    status: "online",
  }))
  .use(userRoute)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
