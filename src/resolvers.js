// ─── Arbitrary value ─────────────────────────────────────────────────────────

export function resolveArbitraryValue(valueKey) {
  if (valueKey.startsWith("[") && valueKey.endsWith("]")) {
    return valueKey.slice(1, -1).replace(/_/g, " ");
  }
  return undefined;
}

// ─── Theme scale lookup ───────────────────────────────────────────────────────

export function resolveThemeValue(scale, valueKey) {
  if (typeof scale !== "object" || scale === null) return undefined;
  if (Object.prototype.hasOwnProperty.call(scale, valueKey)) {
    return scale[valueKey];
  }
  const arbitrary = resolveArbitraryValue(valueKey);
  if (arbitrary !== undefined) return arbitrary;
  return undefined;
}

// ─── Time value (transition-duration / delay) ─────────────────────────────────

export function resolveTimeValue(valueKey) {
  const arbitrary = resolveArbitraryValue(valueKey);
  if (arbitrary !== undefined) return arbitrary;
  if (/^\d+(?:\.\d+)?(?:ms|s)$/.test(valueKey)) return valueKey;
  if (/^\d+(?:\.\d+)?$/.test(valueKey)) return `${valueKey}ms`;
  return undefined;
}

// ─── Color lookup ─────────────────────────────────────────────────────────────

export function resolveColorValue(colors, colorKey) {
  if (!colors || typeof colors !== "object") return undefined;

  const arbitrary = resolveArbitraryValue(colorKey);
  if (arbitrary !== undefined) return arbitrary;

  if (Object.prototype.hasOwnProperty.call(colors, colorKey)) {
    const direct = colors[colorKey];
    if (typeof direct === "string") return direct;
    if (direct && typeof direct === "object" && typeof direct.DEFAULT === "string") {
      return direct.DEFAULT;
    }
  }

  // nested lookup: "blue-500" → colors.blue["500"]
  const segments = colorKey.split("-");
  let current = colors;
  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    if (!current || typeof current !== "object") return undefined;
    if (!Object.prototype.hasOwnProperty.call(current, segment)) return undefined;
    current = current[segment];
  }

  if (typeof current === "string") return current;
  if (current && typeof current === "object" && typeof current.DEFAULT === "string") {
    return current.DEFAULT;
  }
  return undefined;
}

// ─── Color with opacity modifier: "blue-500/50" ───────────────────────────────

export function resolveColorWithOpacity(colors, rawKey) {
  const slashIdx = rawKey.lastIndexOf("/");
  if (slashIdx === -1) return resolveColorValue(colors, rawKey);

  const colorKey = rawKey.slice(0, slashIdx);
  const opacityStr = rawKey.slice(slashIdx + 1);
  const color = resolveColorValue(colors, colorKey);
  if (color === undefined) return undefined;

  // Arbitrary opacity e.g. /[0.35]
  const arbOpacity = resolveArbitraryValue(opacityStr);
  const opacityVal = arbOpacity !== undefined
    ? arbOpacity
    : String(parseFloat(opacityStr) / 100);

  if (!opacityVal || opacityVal === "NaN") return undefined;
  return `color-mix(in oklch, ${color} ${parseFloat(opacityStr)}%, transparent)`;
}

// ─── CSS identifier escaping ──────────────────────────────────────────────────

export function escapeCssIdentifier(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1")
    .replace(/^(\d)/, "\\3$1 ");
}

// ─── !important appender ──────────────────────────────────────────────────────

export function appendImportant(declaration, isImportant) {
  if (!isImportant) return declaration;
  const entries = declaration
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.includes("!important") ? item : `${item} !important`));
  return `${entries.join("; ")};`;
}

// ─── Variant delimiter splitter ───────────────────────────────────────────────
// Splits "md:hover:bg-blue-500" into ["md", "hover", "bg-blue-500"]
// but respects brackets so "bg-[url(a:b)]" stays as one token.

export function splitByVariantDelimiter(token) {
  const parts = [];
  let current = "";
  let bracketDepth = 0;

  for (let i = 0; i < token.length; i += 1) {
    const char = token[i];
    if (char === "[") bracketDepth += 1;
    if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);

    if (char === ":" && bracketDepth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current) parts.push(current);
  return parts;
}
