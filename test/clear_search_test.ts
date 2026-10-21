import { assertEquals } from "@std/assert";
import { PagesRouter } from "../router/core.ts";

type HistoryCall = { type: "push" | "replace"; url: string };

async function withBrowserState<T>(
  href: string,
  fn: (calls: HistoryCall[]) => Promise<T>,
): Promise<T> {
  const calls: HistoryCall[] = [];
  const originalLocation = Object.getOwnPropertyDescriptor(
    globalThis,
    "location",
  );
  const originalHistory = Object.getOwnPropertyDescriptor(
    globalThis,
    "history",
  );

  Object.defineProperty(globalThis, "location", {
    value: {
      href,
      origin: new URL(href).origin,
      pathname: new URL(href).pathname,
      search: new URL(href).search,
    },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "history", {
    value: {
      pushState: (_state: unknown, _title: string, url?: string) => {
        calls.push({ type: "push", url: String(url) });
      },
      replaceState: (_state: unknown, _title: string, url?: string) => {
        calls.push({ type: "replace", url: String(url) });
      },
    },
    configurable: true,
    writable: true,
  });

  try {
    return await fn(calls);
  } finally {
    if (originalLocation) {
      Object.defineProperty(globalThis, "location", originalLocation);
    } else {
      delete (globalThis as { location?: unknown }).location;
    }
    if (originalHistory) {
      Object.defineProperty(globalThis, "history", originalHistory);
    } else {
      delete (globalThis as { history?: unknown }).history;
    }
  }
}

Deno.test("R-05 开启 clearSearchOnLeave 时离开页面前清理查询参数", async () => {
  await withBrowserState("https://example.com/a?tab=1", async (calls) => {
    const router = new PagesRouter({ clearSearchOnLeave: true });
    router.on("/a", "A");
    router.on("/b", "B");

    await router.replace("/b");

    assertEquals(calls[0], {
      type: "replace",
      url: "https://example.com/a",
    });
    assertEquals(calls[1], { type: "replace", url: "/b" });
  });
});

Deno.test("R-05 默认不清查询参数", async () => {
  await withBrowserState("https://example.com/a?tab=1", async (calls) => {
    const router = new PagesRouter();
    router.on("/a", "A");
    router.on("/b", "B");

    await router.replace("/b");

    assertEquals(calls, [{ type: "replace", url: "/b" }]);
  });
});

Deno.test("R-05 页面本身没有查询参数时不额外调用 replaceState", async () => {
  await withBrowserState("https://example.com/a", async (calls) => {
    const router = new PagesRouter({ clearSearchOnLeave: true });
    router.on("/a", "A");
    router.on("/b", "B");

    await router.replace("/b");

    assertEquals(calls, [{ type: "replace", url: "/b" }]);
  });
});
