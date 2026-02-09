/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type D1Database = import("@cloudflare/workers-types").D1Database;

interface Env {
  DB: D1Database;
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
