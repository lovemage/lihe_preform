import { getD1Config } from "@/lib/admin/config";

type D1ResultRow = Record<string, unknown>;

type D1Response<T extends D1ResultRow = D1ResultRow> = {
  result: Array<{
    success: boolean;
    results?: T[];
    meta?: Record<string, unknown>;
    error?: string;
  }>;
  success: boolean;
  errors?: Array<{ message?: string }>;
};

type D1Binding = {
  prepare: (sql: string) => {
    bind: (...params: unknown[]) => {
      all: <T extends D1ResultRow = D1ResultRow>() => Promise<{ results?: T[] }>;
    };
  };
};

function hasD1ApiConfig() {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID
    && process.env.CLOUDFLARE_D1_DATABASE_ID
    && process.env.CLOUDFLARE_D1_API_TOKEN,
  );
}

async function executeViaBinding<T extends D1ResultRow>(sql: string, params: unknown[] = []) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = await getCloudflareContext();
  const db = (env as { CONTENT_DB?: D1Binding }).CONTENT_DB;

  if (!db) {
    throw new Error("Missing D1 binding: CONTENT_DB");
  }

  const response = await db.prepare(sql).bind(...params).all<T>();
  return response.results ?? [];
}

async function execute<T extends D1ResultRow>(sql: string, params: unknown[] = []) {
  if (!hasD1ApiConfig()) {
    return executeViaBinding<T>(sql, params);
  }

  const config = getD1Config();
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`D1 query failed with status ${response.status}`);
  }

  const payload = (await response.json()) as D1Response<T>;
  const first = payload.result[0];

  if (!payload.success || !first?.success) {
    const message = first?.error ?? payload.errors?.[0]?.message ?? "Unknown D1 error";
    throw new Error(message);
  }

  return first.results ?? [];
}

export async function d1Query<T extends D1ResultRow>(sql: string, params: unknown[] = []) {
  return execute<T>(sql, params);
}

export async function d1First<T extends D1ResultRow>(sql: string, params: unknown[] = []) {
  const rows = await execute<T>(sql, params);
  return rows[0] ?? null;
}

export async function d1Exec(sql: string, params: unknown[] = []) {
  await execute(sql, params);
}
