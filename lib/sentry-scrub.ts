// A URL or path, followed by its query string.
const URL_WITH_QUERY = /((?:https?:\/\/|\/)[^\s?"'<>]*)\?[^\s"'<>]*/g;

// Fields that hold a query string on its own.
const QUERY_KEYS = new Set(["url.query", "http.query", "query_string"]);

/**
 * Removes query strings from anything about to be sent to Sentry. They carry
 * user input here (text to speak, search terms, voice names), and the SDK's
 * `urlQueryParams: false` doesn't cover every field that records a URL.
 */
export function stripQueryStrings<T>(value: T, seen = new WeakSet()): T {
  if (typeof value === "string") {
    return value.replace(URL_WITH_QUERY, "$1") as T;
  }

  if (typeof value !== "object" || value === null || seen.has(value)) {
    return value;
  }

  // Changed in place, so class instances in SDK payloads keep their type.
  seen.add(value);
  const record = value as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (QUERY_KEYS.has(key)) delete record[key];
    else record[key] = stripQueryStrings(record[key], seen);
  }

  return value;
}
