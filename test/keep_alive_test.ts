import { assertEquals } from "@std/assert";
import { PagesRouter } from "../router/core.ts";

type FakeContainer = { innerHTML: string };

function withLocation<T>(
  href: string,
  fn: () => Promise<T>,
): Promise<T> {
  const original = Object.getOwnPropertyDescriptor(globalThis, "location");
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
  return fn().finally(() => {
    if (original) {
      Object.defineProperty(globalThis, "location", original);
    } else {
      delete (globalThis as { location?: unknown }).location;
    }
  });
}

Deno.test("R-04 keep-alive 缓存页面 DOM，返回时不再执行 hook", async () => {
  const container = { innerHTML: "" } as unknown as HTMLElement;
  const router = new PagesRouter({ keepAlive: true, container });

  const pageA = router.on("/a", "A")!;
  let hooksA = 0;
  pageA.hook = () => {
    hooksA++;
    container.innerHTML = "A";
  };

  const pageB = router.on("/b", "B")!;
  pageB.hook = () => {
    container.innerHTML = "B";
  };

  await withLocation("https://example.com/a", async () => {
    await router.loading("/a");
    assertEquals(container.innerHTML, "A");
    assertEquals(hooksA, 1);

    await router.loading("/b");
    assertEquals(container.innerHTML, "B");

    await router.loading("/a");
    assertEquals(container.innerHTML, "A");
    // 命中缓存，不重复执行 hook
    assertEquals(hooksA, 1);
  });
});

Deno.test("R-04 clearKeepAlive 后重新进入会重新执行 hook", async () => {
  const container = { innerHTML: "" } as unknown as HTMLElement;
  const router = new PagesRouter({ keepAlive: true, container });

  const pageA = router.on("/a", "A")!;
  let hooksA = 0;
  pageA.hook = () => {
    hooksA++;
    container.innerHTML = "A";
  };
  router.on("/b", "B")!.hook = () => {
    container.innerHTML = "B";
  };

  await withLocation("https://example.com/a", async () => {
    await router.loading("/a");
    await router.loading("/b");
    router.clearKeepAlive("/a");
    await router.loading("/a");
    assertEquals(hooksA, 2);
  });
});

Deno.test("R-04 未开启 keep-alive 时每次进入都执行 hook", async () => {
  const container = { innerHTML: "" } as unknown as HTMLElement;
  const router = new PagesRouter({ container });

  const pageA = router.on("/a", "A")!;
  let hooksA = 0;
  pageA.hook = () => {
    hooksA++;
    container.innerHTML = "A";
  };
  router.on("/b", "B")!.hook = () => {
    container.innerHTML = "B";
  };

  await withLocation("https://example.com/a", async () => {
    await router.loading("/a");
    await router.loading("/b");
    await router.loading("/a");
    assertEquals(hooksA, 2);
  });
});
