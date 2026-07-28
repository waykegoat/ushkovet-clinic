import { describe, expect, it } from "vitest";

import { defaultContent } from "@/content/defaultContent";
import worker, { type Env } from "../worker/index";
import { FakeD1 } from "./helpers/fakeD1";

const sessionSecret = "test-session-secret-that-is-long-enough";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function createPasswordHash(password: string): Promise<string> {
  const iterations = 100_000;
  const salt = new TextEncoder().encode("stable-test-salt");
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial,
    256,
  );
  return `pbkdf2_sha256$${iterations}$${toBase64Url(salt)}$${toBase64Url(new Uint8Array(hash))}`;
}

function createAssets(): Fetcher {
  return {
    fetch: () => Promise.resolve(new Response("Not found", { status: 404 })),
    connect: () => {
      throw new Error("Not implemented");
    },
  };
}

function createRoutingAssets(): Fetcher {
  return {
    fetch: (input) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      return Promise.resolve(
        url.pathname === "/"
          ? new Response('<div id="app"></div>', {
              headers: { "content-type": "text/html" },
            })
          : new Response("Not found", { status: 404 }),
      );
    },
    connect: () => {
      throw new Error("Not implemented");
    },
  };
}

describe("site worker", () => {
  it("returns prerender defaults when D1 is not connected", async () => {
    const response = await worker.fetch(new Request("https://ushkovet.ru/api/content"), {
      ASSETS: createAssets(),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      settings: { clinicName: defaultContent.settings.clinicName },
    });
  });

  it("accepts an inquiry and exposes it to an authenticated local admin", async () => {
    const database = new FakeD1();
    const env: Env = {
      ASSETS: createAssets(),
      DB: database.asBinding(),
      ENVIRONMENT: "development",
    };

    const createResponse = await worker.fetch(
      new Request("https://ushkovet.ru/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Анна",
          phone: "+7 900 123-45-67",
          pet: "Кот",
          message: "Нужен осмотр",
        }),
      }),
      env,
    );

    expect(createResponse.status).toBe(201);

    const listResponse = await worker.fetch(
      new Request("https://ushkovet.ru/api/admin/inquiries", {
        headers: { "x-local-admin-email": "local@ushkovet.test" },
      }),
      env,
    );
    const inquiries: Array<{
      name: string;
      status: string;
    }> = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(inquiries).toEqual([expect.objectContaining({ name: "Анна", status: "new" })]);
  });

  it("rejects an unauthenticated admin request", async () => {
    const response = await worker.fetch(
      new Request("https://ushkovet.ru/api/admin/content"),
      {
        ASSETS: createAssets(),
        DB: new FakeD1().asBinding(),
        ADMIN_EMAILS: "owner@example.com",
        ADMIN_PASSWORD_HASH: await createPasswordHash("strong-test-password"),
        SESSION_SECRET: sessionSecret,
      },
    );

    expect(response.status).toBe(401);
  });

  it("creates a protected cookie session after a valid admin login", async () => {
    const password = "strong-test-password";
    const env: Env = {
      ASSETS: createAssets(),
      ADMIN_EMAILS: "owner@example.com",
      ADMIN_PASSWORD_HASH: await createPasswordHash(password),
      SESSION_SECRET: sessionSecret,
      ENVIRONMENT: "production",
    };

    const loginResponse = await worker.fetch(
      new Request("https://ushkovet.ru/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "owner@example.com", password }),
      }),
      env,
    );
    const cookie = loginResponse.headers.get("set-cookie")?.split(";")[0];

    expect(loginResponse.status).toBe(200);
    expect(cookie).toContain("ushkovet_admin=");

    const sessionResponse = await worker.fetch(
      new Request("https://ushkovet.ru/api/admin/session", {
        headers: { cookie: cookie ?? "" },
      }),
      env,
    );

    expect(await sessionResponse.json()).toMatchObject({
      authenticated: true,
      email: "owner@example.com",
    });
  });

  it("serves the SPA shell for the admin route without redirecting", async () => {
    const response = await worker.fetch(
      new Request("https://ushkovet.ru/admin", {
        headers: { accept: "text/html" },
      }),
      { ASSETS: createRoutingAssets() },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(await response.text()).toContain('id="app"');
  });
});
