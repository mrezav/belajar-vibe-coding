import { db } from "./src/db";
import { sessions } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function test() {
  try {
    const result = await db.delete(sessions).where(eq(sessions.token, "dummy-token-that-does-not-exist"));
    console.log("Delete result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

test();
