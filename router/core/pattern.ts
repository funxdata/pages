export type PatternMatch = {
  params: Record<string, string>;
};

/** 路由路径是否包含动态段（:name 或 *） */
export const isDynamicPath = (path: string): boolean =>
  path.split("/").some((part) => part.startsWith(":") || part === "*");

/**
 * 将注册模式与实际 pathname 匹配。
 * - `:name` 匹配单段并写入 params
 * - `*` 匹配剩余所有段，写入 params["*"]
 */
export const matchPattern = (
  pattern: string,
  pathname: string,
): PatternMatch | null => {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const part = patternParts[i];

    if (part === "*") {
      params["*"] = pathParts.slice(i).map(safeDecode).join("/");
      return { params };
    }

    const value = pathParts[i];
    if (value === undefined) return null;

    if (part.startsWith(":")) {
      params[part.slice(1)] = safeDecode(value);
    } else if (part !== value) {
      return null;
    }
  }

  return patternParts.length === pathParts.length ? { params } : null;
};

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
