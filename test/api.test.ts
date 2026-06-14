import { describe, test, expect, beforeEach } from "bun:test";
import { app } from "../src";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";
import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

describe("API Test Scenarios", () => {

  describe("System Routes", () => {
    test("GET / - Harus mengembalikan Hello World", async () => {
      const response = await app.handle(
        new Request("http://localhost/")
      );
      expect(response.status).toBe(200);
      expect(await response.text()).toBe("Hello World! Elysia server is running.");
    });

    test("GET /health - Harus mengembalikan status ok", async () => {
      const response = await app.handle(
        new Request("http://localhost/health")
      );
      expect(response.status).toBe(200);
      const data = await response.json() as { status: string };
      expect(data).toEqual({ status: "ok" });
    });
  });

  describe("Database API Routes", () => {
    
    beforeEach(async () => {
      // Hapus data session dulu baru user karena ada foreign key constraint
      await db.delete(sessions);
      await db.delete(users);
    });

    describe("User Registration (POST /api/users)", () => {
      test("Skenario 1: Sukses registrasi dengan data valid", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "John Doe",
              email: "john@example.com",
              password: "password123",
            }),
          })
        );
        expect(response.status).toBe(200);
        const resBody = await response.json() as { data: string };
        expect(resBody).toEqual({ data: "Ok" });

        // Verifikasi di database
        const dbUsers = await db.select().from(users);
        expect(dbUsers.length).toBe(1);
        expect(dbUsers[0]!.name).toBe("John Doe");
        expect(dbUsers[0]!.email).toBe("john@example.com");
      });

      test("Skenario 2: Gagal registrasi jika email sudah terdaftar", async () => {
        // Setup: Daftarkan satu email terlebih dahulu
        await db.insert(users).values({
          name: "Existing User",
          email: "john@example.com",
          password: bcrypt.hashSync("password123", 10),
        });

        const response = await app.handle(
          new Request("http://localhost/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "John Doe",
              email: "john@example.com",
              password: "password123",
            }),
          })
        );
        expect(response.status).toBe(400);
        const resBody = await response.json() as { error: string };
        expect(resBody.error).toBe("email sudah terdaftar");
      });

      test("Skenario 3: Gagal registrasi jika panjang nama melebihi 255 karakter", async () => {
        const longName = "a".repeat(300);
        const response = await app.handle(
          new Request("http://localhost/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: longName,
              email: "john@example.com",
              password: "password123",
            }),
          })
        );
        expect(response.status).toBe(422);
        expect(await response.text()).toBe("Nama maksimal 255 karakter");
      });

      test("Skenario 4: Gagal registrasi jika format email tidak valid", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "John Doe",
              email: "invalid-email-format",
              password: "password123",
            }),
          })
        );
        expect(response.status).toBe(422);
        expect(await response.text()).toBe("Format email tidak valid");
      });

      test("Skenario 5: Gagal registrasi jika password kurang dari 6 karakter", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "John Doe",
              email: "john@example.com",
              password: "123",
            }),
          })
        );
        expect(response.status).toBe(422);
        expect(await response.text()).toBe("Password minimal 6 karakter");
      });
    });

    describe("User Login (POST /api/users/login)", () => {
      test("Skenario 1: Sukses login dengan kredensial yang valid", async () => {
        // Setup
        await db.insert(users).values({
          name: "John Doe",
          email: "john@example.com",
          password: bcrypt.hashSync("password123", 10),
        });

        const response = await app.handle(
          new Request("http://localhost/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "john@example.com",
              password: "password123",
            }),
          })
        );
        expect(response.status).toBe(200);
        const resBody = await response.json() as { data: string };
        expect(resBody.data).toBeDefined();
        expect(typeof resBody.data).toBe("string");
      });

      test("Skenario 2: Gagal login jika email tidak terdaftar", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "notfound@example.com",
              password: "password123",
            }),
          })
        );
        expect(response.status).toBe(401);
        const resBody = await response.json() as { error: string };
        expect(resBody.error).toBe("email atau password salah");
      });

      test("Skenario 3: Gagal login jika password salah", async () => {
        // Setup
        await db.insert(users).values({
          name: "John Doe",
          email: "john@example.com",
          password: bcrypt.hashSync("password123", 10),
        });

        const response = await app.handle(
          new Request("http://localhost/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "john@example.com",
              password: "wrongpassword",
            }),
          })
        );
        expect(response.status).toBe(401);
        const resBody = await response.json() as { error: string };
        expect(resBody.error).toBe("email atau password salah");
      });
    });

    describe("Get Current User (GET /api/users/current)", () => {
      test("Skenario 1: Sukses mengambil data user aktif dengan token valid", async () => {
        // Setup
        const hashedPassword = bcrypt.hashSync("password123", 10);
        await db.insert(users).values({
          name: "John Doe",
          email: "john@example.com",
          password: hashedPassword,
        });

        const dbUsers = await db.select().from(users).where(eq(users.email, "john@example.com"));
        const userId = dbUsers[0]!.id;

        const token = "valid-session-token-123";
        await db.insert(sessions).values({
          token,
          userId: userId,
          password: hashedPassword,
        });

        const response = await app.handle(
          new Request("http://localhost/api/users/current", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
          })
        );
        expect(response.status).toBe(200);
        const resBody = await response.json() as { data: { name: string; email: string } };
        expect(resBody.data.name).toBe("John Doe");
        expect(resBody.data.email).toBe("john@example.com");
      });

      test("Skenario 2: Gagal mengambil data user jika token tidak disertakan (Unauthorized)", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/users/current", {
            method: "GET",
          })
        );
        expect(response.status).toBe(401);
        const resBody = await response.json() as { error: string };
        expect(resBody.error).toBe("Unauthorized");
      });

      test("Skenario 3: Gagal mengambil data user jika token salah/tidak valid (Unauthorized)", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/users/current", {
            method: "GET",
            headers: { "Authorization": "Bearer invalidtoken" },
          })
        );
        expect(response.status).toBe(401);
        const resBody = await response.json() as { error: string };
        expect(resBody.error).toBe("Unauthorized");
      });
    });

    describe("User Logout (DELETE /api/users/logout)", () => {
      test("Skenario 1: Sukses logout dan menghapus session token aktif", async () => {
        // Setup
        const hashedPassword = bcrypt.hashSync("password123", 10);
        await db.insert(users).values({
          name: "John Doe",
          email: "john@example.com",
          password: hashedPassword,
        });

        const dbUsers = await db.select().from(users).where(eq(users.email, "john@example.com"));
        const userId = dbUsers[0]!.id;

        const token = "valid-session-token-logout";
        await db.insert(sessions).values({
          token,
          userId: userId,
          password: hashedPassword,
        });

        const response = await app.handle(
          new Request("http://localhost/api/users/logout", {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
          })
        );
        expect(response.status).toBe(200);
        const resBody = await response.json() as { data: string };
        expect(resBody.data).toBe("Ok");

        // Verifikasi session dihapus di DB
        const dbSessions = await db.select().from(sessions);
        expect(dbSessions.length).toBe(0);
      });

      test("Skenario 2: Gagal logout jika token tidak valid atau tidak disertakan", async () => {
        const response = await app.handle(
          new Request("http://localhost/api/users/logout", {
            method: "DELETE",
          })
        );
        expect(response.status).toBe(401);
        const resBody = await response.json() as { error: string };
        expect(resBody.error).toBe("Unauthorized");
      });
    });

  });

});
