import { z } from "zod";

import { defaultContent, type SiteContent } from "../src/content/defaultContent";

export interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
  ADMIN_EMAILS?: string;
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
  ENVIRONMENT?: string;
}

interface AdminSession {
  authenticated: boolean;
  configured: boolean;
  email?: string;
}

interface InquiryRow {
  id: number;
  name: string;
  phone: string;
  pet: string;
  message: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
}

const serviceSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(2).max(120),
  category: z.string().min(2).max(80),
  summary: z.string().min(10).max(500),
  price: z.string().min(2).max(80),
  featured: z.boolean(),
  order: z.number().int().min(0).max(10_000),
});

const contentSchema = z.object({
  settings: z.object({
    clinicName: z.string().min(2).max(80),
    heroEyebrow: z.string().min(2).max(120),
    heroTitle: z.string().min(10).max(120),
    heroText: z.string().min(20).max(500),
    phone: z.string().min(7).max(40),
    phoneHref: z.string().regex(/^\+?\d{10,15}$/),
    address: z.string().min(10).max(200),
    hours: z.string().min(5).max(100),
    bookingNote: z.string().min(5).max(160),
    rating: z.string().min(1).max(10),
  }),
  services: z.array(serviceSchema).min(1).max(100),
  updatedAt: z.string(),
});

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .min(10)
    .max(40)
    .refine((value) => value.replace(/\D/g, "").length >= 10),
  pet: z.string().trim().max(100).default(""),
  message: z.string().trim().max(1_000).default(""),
});

const inquiryStatusSchema = z.object({
  status: z.enum(["new", "contacted", "closed"]),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(200),
});

const adminCookieName = "ushkovet_admin";
const sessionLifetimeSeconds = 8 * 60 * 60;

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function allowedAdminEmails(env: Env): string[] {
  return (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function parseCookies(request: Request): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const separator = part.indexOf("=");
    if (separator <= 0) continue;
    cookies.set(part.slice(0, separator).trim(), part.slice(separator + 1));
  }
  return cookies;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
}

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(signature));
}

async function createSessionToken(email: string, secret: string): Promise<string> {
  const payload = toBase64Url(
    new TextEncoder().encode(
      JSON.stringify({
        email,
        expiresAt: Date.now() + sessionLifetimeSeconds * 1000,
      }),
    ),
  );
  return `${payload}.${await hmac(payload, secret)}`;
}

async function verifySessionToken(
  token: string,
  secret: string,
): Promise<{ email: string } | null> {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || (await hmac(payload, secret)) !== signature) return null;

  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      email?: string;
      expiresAt?: number;
    };
    if (!parsed.email || !parsed.expiresAt || parsed.expiresAt <= Date.now()) return null;
    return { email: parsed.email.toLowerCase() };
  } catch {
    return null;
  }
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, iterationValue, saltValue, expectedValue] = storedHash.split("$");
  const iterations = Number(iterationValue);
  if (
    algorithm !== "pbkdf2_sha256" ||
    !Number.isSafeInteger(iterations) ||
    iterations < 100_000 ||
    !saltValue ||
    !expectedValue
  ) {
    return false;
  }

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: fromBase64Url(saltValue),
      iterations,
    },
    keyMaterial,
    256,
  );

  return toBase64Url(new Uint8Array(derived)) === expectedValue;
}

function sessionCookie(token: string, env: Env, maxAge = sessionLifetimeSeconds): string {
  const secure = env.ENVIRONMENT === "production" ? "; Secure" : "";
  return `${adminCookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

async function adminSession(request: Request, env: Env): Promise<AdminSession> {
  const isDevelopment = env.ENVIRONMENT === "development";
  const allowedEmails = allowedAdminEmails(env);
  const configured =
    isDevelopment ||
    Boolean(allowedEmails.length && env.ADMIN_PASSWORD_HASH && env.SESSION_SECRET);

  const developmentEmail = request.headers.get("x-local-admin-email")?.trim().toLowerCase();
  if (isDevelopment && developmentEmail) {
    return { authenticated: true, configured, email: developmentEmail };
  }

  const token = parseCookies(request).get(adminCookieName);
  const session =
    token && env.SESSION_SECRET
      ? await verifySessionToken(token, env.SESSION_SECRET)
      : null;
  const email =
    session && allowedEmails.includes(session.email) ? session.email : undefined;

  return {
    authenticated: Boolean(email),
    configured,
    ...(email ? { email } : {}),
  };
}

async function ensureDatabase(db: D1Database): Promise<void> {
  await db.batch([
    db.prepare(
      `CREATE TABLE IF NOT EXISTS site_content (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        pet TEXT NOT NULL DEFAULT '',
        message TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL
      )`,
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS inquiries_status_created_idx ON inquiries(status, created_at DESC)",
    ),
  ]);

  await db
    .prepare(
      "INSERT OR IGNORE INTO site_content (id, payload, updated_at) VALUES (1, ?, ?)",
    )
    .bind(JSON.stringify(defaultContent), defaultContent.updatedAt)
    .run();
}

async function getContent(db?: D1Database): Promise<SiteContent> {
  if (!db) return defaultContent;

  try {
    await ensureDatabase(db);
    const row = await db
      .prepare("SELECT payload FROM site_content WHERE id = 1")
      .first<{ payload: string }>();

    return row ? contentSchema.parse(JSON.parse(row.payload)) : defaultContent;
  } catch {
    return defaultContent;
  }
}

function mapInquiry(row: InquiryRow) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    pet: row.pet,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method !== "GET" && !isSameOrigin(request)) {
    return json({ error: "Запрос отклонён" }, { status: 403 });
  }

  if (url.pathname === "/api/content" && request.method === "GET") {
    const content = await getContent(env.DB);
    return json(content, {
      headers: { "cache-control": "public, max-age=60, s-maxage=300" },
    });
  }

  if (url.pathname === "/api/inquiries" && request.method === "POST") {
    if (!env.DB) {
      return json({ error: "Хранилище заявок ещё не подключено" }, { status: 503 });
    }

    const payload = inquirySchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return json({ error: "Проверьте данные формы" }, { status: 400 });
    }

    await ensureDatabase(env.DB);
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO inquiries (name, phone, pet, message, status, created_at)
       VALUES (?, ?, ?, ?, 'new', ?)`,
    )
      .bind(
        payload.data.name,
        payload.data.phone,
        payload.data.pet,
        payload.data.message,
        now,
      )
      .run();

    return json({ ok: true }, { status: 201 });
  }

  if (url.pathname === "/api/admin/session" && request.method === "GET") {
    return json(await adminSession(request, env));
  }

  if (url.pathname === "/api/admin/login" && request.method === "POST") {
    const session = await adminSession(request, env);
    if (!session.configured || !env.ADMIN_PASSWORD_HASH || !env.SESSION_SECRET) {
      return json({ error: "Авторизация администратора не настроена" }, { status: 503 });
    }

    const parsed = loginSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return json({ error: "Проверьте email и пароль" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const isAllowed = allowedAdminEmails(env).includes(email);
    const passwordMatches =
      isAllowed && (await verifyPassword(parsed.data.password, env.ADMIN_PASSWORD_HASH));
    if (!passwordMatches) {
      return json({ error: "Неверный email или пароль" }, { status: 401 });
    }

    const token = await createSessionToken(email, env.SESSION_SECRET);
    return json(
      { authenticated: true, configured: true, email },
      { headers: { "set-cookie": sessionCookie(token, env) } },
    );
  }

  if (url.pathname === "/api/admin/logout" && request.method === "POST") {
    return json({ ok: true }, { headers: { "set-cookie": sessionCookie("", env, 0) } });
  }

  if (url.pathname.startsWith("/api/admin/")) {
    const session = await adminSession(request, env);
    if (!session.configured) {
      return json(
        { error: "Список администраторов не настроен", ...session },
        { status: 503 },
      );
    }
    if (!session.authenticated) {
      return json({ error: "Требуется авторизация", ...session }, { status: 401 });
    }
    if (!env.DB) {
      return json({ error: "База данных не подключена" }, { status: 503 });
    }

    await ensureDatabase(env.DB);

    if (url.pathname === "/api/admin/content" && request.method === "GET") {
      return json(await getContent(env.DB));
    }

    if (url.pathname === "/api/admin/content" && request.method === "PUT") {
      const parsed = contentSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success) {
        return json({ error: "Контент не прошёл проверку" }, { status: 400 });
      }

      const saved: SiteContent = {
        ...parsed.data,
        updatedAt: new Date().toISOString(),
      };

      await env.DB.prepare(
        "UPDATE site_content SET payload = ?, updated_at = ? WHERE id = 1",
      )
        .bind(JSON.stringify(saved), saved.updatedAt)
        .run();

      return json(saved);
    }

    if (url.pathname === "/api/admin/inquiries" && request.method === "GET") {
      const result = await env.DB.prepare(
        `SELECT id, name, phone, pet, message, status, created_at
         FROM inquiries
         ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 ELSE 2 END,
                  created_at DESC
         LIMIT 200`,
      ).all<InquiryRow>();

      return json(result.results.map(mapInquiry));
    }

    const inquiryMatch = url.pathname.match(/^\/api\/admin\/inquiries\/(\d+)$/);
    if (inquiryMatch && request.method === "PATCH") {
      const id = Number(inquiryMatch[1]);
      const parsed = inquiryStatusSchema.safeParse(await request.json().catch(() => null));
      if (!parsed.success || !Number.isSafeInteger(id)) {
        return json({ error: "Некорректный статус заявки" }, { status: 400 });
      }

      await env.DB.prepare("UPDATE inquiries SET status = ? WHERE id = ?")
        .bind(parsed.data.status, id)
        .run();

      const row = await env.DB.prepare(
        "SELECT id, name, phone, pet, message, status, created_at FROM inquiries WHERE id = ?",
      )
        .bind(id)
        .first<InquiryRow>();

      return row
        ? json(mapInquiry(row))
        : json({ error: "Заявка не найдена" }, { status: 404 });
    }
  }

  return json({ error: "Маршрут не найден" }, { status: 404 });
}

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "SAMEORIGIN");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set(
    "content-security-policy",
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-src https://yandex.ru https://yandex.com; font-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function serveSite(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const prerenderedRoutes: Record<string, string> = {
    "/": "/index.html",
    "/services": "/services/index.html",
    "/services/": "/services/index.html",
    "/contacts": "/contacts/index.html",
    "/contacts/": "/contacts/index.html",
    "/admin": "/",
    "/admin/": "/",
  };
  const target = prerenderedRoutes[url.pathname];

  let response = target
    ? await env.ASSETS.fetch(new Request(new URL(target, request.url), request))
    : await env.ASSETS.fetch(request);

  if (response.status === 404 && request.headers.get("accept")?.includes("text/html")) {
    response = await env.ASSETS.fetch(new Request(new URL("/", request.url), request));
  }

  return withSecurityHeaders(response);
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env);
    return serveSite(request, env);
  },
};

export default worker;
