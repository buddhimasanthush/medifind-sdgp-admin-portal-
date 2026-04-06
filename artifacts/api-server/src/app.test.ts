import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "./app";

async function withServer(
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");

  try {
    const { port } = server.address() as AddressInfo;
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await closeServer(server);
  }
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

const tests: Array<{ name: string; run: () => Promise<void> }> = [
  {
    name: "GET /health returns a healthy response",
    run: async () => {
      await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/health`);
        const body = await response.json();

        assert.equal(response.status, 200);
        assert.equal(body.status, "ok");
        assert.equal(typeof body.timestamp, "string");
      });
    },
  },
  {
    name: "GET /api/healthz still returns the documented health payload",
    run: async () => {
      await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/healthz`);
        const body = await response.json();

        assert.equal(response.status, 200);
        assert.deepEqual(body, { status: "ok" });
      });
    },
  },
  {
    name: "OPTIONS /api/login/request-otp returns CORS headers for the GitHub Pages origin",
    run: async () => {
      await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/login/request-otp`, {
          method: "OPTIONS",
          headers: {
            Origin: "https://buddhimasanthush.github.io",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
          },
        });

        assert.ok(response.status === 204 || response.status === 200);
        assert.equal(
          response.headers.get("access-control-allow-origin"),
          "https://buddhimasanthush.github.io",
        );
        assert.equal(
          response.headers.get("access-control-allow-credentials"),
          "true",
        );
      });
    },
  },
  {
    name: "GET /api/me without cookies returns 401 instead of failing upstream",
    run: async () => {
      await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/me`);
        const body = await response.json();

        assert.equal(response.status, 401);
        assert.equal(body.error, "Not authenticated");
      });
    },
  },
  {
    name: "POST /api/login/request-otp rejects an empty payload before any DB access",
    run: async () => {
      await withServer(async (baseUrl) => {
        const response = await fetch(`${baseUrl}/api/login/request-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "https://buddhimasanthush.github.io",
          },
          body: JSON.stringify({}),
        });
        const body = await response.json();

        assert.equal(response.status, 400);
        assert.equal(body.error, "Email is required");
        assert.equal(
          response.headers.get("access-control-allow-origin"),
          "https://buddhimasanthush.github.io",
        );
      });
    },
  },
];

let failures = 0;

for (const testCase of tests) {
  try {
    await testCase.run();
    console.log(`PASS ${testCase.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${testCase.name}`);
    console.error(error);
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`PASS ${tests.length}/${tests.length} checks passed`);
}
