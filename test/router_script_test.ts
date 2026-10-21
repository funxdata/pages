import { assertEquals } from "@std/assert";
import { Route } from "../router/core/router_map.ts";

type Listener = () => void;

class FakeScript {
  src = "";
  async = false;
  type = "";
  dataset: Record<string, string> = {};
  onload: Listener | null = null;
  onerror: Listener | null = null;
  isConnected = false;

  remove() {
    this.isConnected = false;
  }
}

/** 最小 DOM 桩：只实现 Route 脚本加载需要的 API */
class FakeDocument {
  scripts: FakeScript[] = [];
  autoLoad: boolean;
  body: { appendChild: (script: FakeScript) => FakeScript };

  constructor(options: { autoLoad?: boolean } = {}) {
    this.autoLoad = options.autoLoad ?? true;
    this.body = {
      appendChild: (script: FakeScript) => {
        script.isConnected = true;
        this.scripts.push(script);
        if (this.autoLoad) {
          setTimeout(() => script.onload?.(), 0);
        }
        return script;
      },
    };
  }

  createElement(tag: string) {
    if (tag !== "script") throw new Error(`unsupported tag: ${tag}`);
    return new FakeScript();
  }
}

function withDocument<T>(
  options: { autoLoad?: boolean },
  fn: (doc: FakeDocument) => Promise<T>,
): Promise<T> {
  const doc = new FakeDocument(options);
  const original = (globalThis as { document?: unknown }).document;
  Object.defineProperty(globalThis, "document", {
    value: doc,
    configurable: true,
    writable: true,
  });
  return fn(doc).finally(() => {
    if (original === undefined) {
      delete (globalThis as { document?: unknown }).document;
    } else {
      Object.defineProperty(globalThis, "document", {
        value: original,
        configurable: true,
        writable: true,
      });
    }
  });
}

Deno.test("R-03 同一路由重复进入只插入一次脚本", async () => {
  await withDocument({}, async (doc) => {
    const route = new Route("/a", { cacheBust: true });
    route.loadjs = "/a.ts";
    let hooks = 0;
    route.hook = () => {
      hooks++;
    };

    await route.do_load();
    assertEquals(doc.scripts.length, 1);
    assertEquals(hooks, 1);

    await route.do_load();
    assertEquals(doc.scripts.length, 1);
    assertEquals(hooks, 2);
  });
});

Deno.test("R-03 并发进入同一路由只加载并执行一次", async () => {
  await withDocument({}, async (doc) => {
    const route = new Route("/a", { cacheBust: true });
    route.loadjs = "/a.ts";
    let hooks = 0;
    route.hook = () => {
      hooks++;
    };

    await Promise.all([route.do_load(), route.do_load()]);
    assertEquals(doc.scripts.length, 1);
    assertEquals(hooks, 1);
  });
});

Deno.test("R-02 离开路由后移除脚本，再次进入重新加载", async () => {
  await withDocument({}, async (doc) => {
    const route = new Route("/a", { cacheBust: true });
    route.loadjs = "/a.ts";
    let hooks = 0;
    route.hook = () => {
      hooks++;
    };

    await route.do_load();
    assertEquals(doc.scripts.length, 1);

    route.do_unload(true);
    assertEquals(doc.scripts[0].isConnected, false);

    await route.do_load();
    assertEquals(doc.scripts.length, 2);
    assertEquals(hooks, 2);
  });
});

Deno.test("R-02 关闭清理时脚本保留且不会重复插入", async () => {
  await withDocument({}, async (doc) => {
    const route = new Route("/a", { cacheBust: true });
    route.loadjs = "/a.ts";
    let hooks = 0;
    route.hook = () => {
      hooks++;
    };

    await route.do_load();
    route.do_unload(false);
    assertEquals(doc.scripts[0].isConnected, true);

    await route.do_load();
    assertEquals(doc.scripts.length, 1);
    assertEquals(hooks, 2);
  });
});

Deno.test("R-02 加载期间切走不会执行迟到的 hook", async () => {
  await withDocument({ autoLoad: false }, async (doc) => {
    const route = new Route("/a", { cacheBust: true, scriptTimeout: 1_000 });
    route.loadjs = "/a.ts";
    let hooks = 0;
    route.hook = () => {
      hooks++;
    };

    const pending = route.do_load();
    const script = doc.scripts[0];

    route.do_unload(true);
    script.onload?.();

    await pending;
    assertEquals(hooks, 0);
  });
});

Deno.test("R-04 do_load_fn 按 already → before → hook → after 顺序执行", async () => {
  await withDocument({}, async () => {
    const route = new Route("/a");
    const order: string[] = [];
    route.already = () => {
      order.push("already");
    };
    route.before = () => {
      order.push("before");
    };
    route.hook = () => {
      order.push("hook");
    };
    route.after = () => {
      order.push("after");
    };

    await route.do_load();
    assertEquals(order, ["already", "before", "hook", "after"]);
  });
});
