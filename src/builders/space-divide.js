import { BORDER_STYLE_MAP } from "../maps/interactivity.maps.js";
import { resolveThemeValue, resolveColorWithOpacity } from "../resolvers.js";

// ─── Child selector marker ────────────────────────────────────────────────────
// Builders that need the > :not(:first-child) selector return a tagged object
// instead of a plain string. The compiler checks for this and applies the scope.

export function childScoped(declaration) {
  return { __childScoped: true, declaration };
}

export function isChildScoped(result) {
  return result !== null && typeof result === "object" && result.__childScoped === true;
}

// ─── space-x-* / space-y-* ───────────────────────────────────────────────────

export function buildSpaceBetweenDeclaration(baseToken, theme) {
  const negative = baseToken.startsWith("-");
  const normalized = negative ? baseToken.slice(1) : baseToken;

  // space-x-reverse / space-y-reverse: apply to parent, no child scoping
  if (normalized === "space-x-reverse") return "--tw-space-x-reverse: 1;";
  if (normalized === "space-y-reverse") return "--tw-space-y-reverse: 1;";

  const matchX = normalized.match(/^space-x-(.+)$/);
  if (matchX) {
    let val = resolveThemeValue(theme.spacing || {}, matchX[1]);
    if (val === undefined) return undefined;
    if (negative && val !== "0") val = `-${val}`;
    return childScoped([
      `--tw-space-x-reverse: 0;`,
      `margin-inline-end: calc(${val} * var(--tw-space-x-reverse));`,
      `margin-inline-start: calc(${val} * calc(1 - var(--tw-space-x-reverse)));`,
    ].join(" "));
  }

  const matchY = normalized.match(/^space-y-(.+)$/);
  if (matchY) {
    let val = resolveThemeValue(theme.spacing || {}, matchY[1]);
    if (val === undefined) return undefined;
    if (negative && val !== "0") val = `-${val}`;
    return childScoped([
      `--tw-space-y-reverse: 0;`,
      `margin-bottom: calc(${val} * var(--tw-space-y-reverse));`,
      `margin-top: calc(${val} * calc(1 - var(--tw-space-y-reverse)));`,
    ].join(" "));
  }

  return undefined;
}

// ─── divide-x-* / divide-y-* / divide-style / divide-color ──────────────────

export function buildDivideDeclaration(baseToken, theme) {
  if (!baseToken.startsWith("divide-")) return undefined;
  const key = baseToken.slice(7);

  // divide-x / divide-x-{n}
  if (key === "x" || key === "x-reverse") {
    if (key === "x-reverse") return "--tw-divide-x-reverse: 1;";
    const val = resolveThemeValue(theme.borderWidth || {}, "DEFAULT") || "1px";
    return childScoped(`--tw-divide-x-reverse: 0; border-inline-end-width: calc(${val} * var(--tw-divide-x-reverse)); border-inline-start-width: calc(${val} * calc(1 - var(--tw-divide-x-reverse)));`);
  }
  const matchX = key.match(/^x-(\d+)$/);
  if (matchX) {
    const val = resolveThemeValue(theme.borderWidth || {}, matchX[1]);
    if (val !== undefined) return childScoped(`--tw-divide-x-reverse: 0; border-inline-end-width: calc(${val} * var(--tw-divide-x-reverse)); border-inline-start-width: calc(${val} * calc(1 - var(--tw-divide-x-reverse)));`);
  }

  // divide-y / divide-y-{n}
  if (key === "y" || key === "y-reverse") {
    if (key === "y-reverse") return "--tw-divide-y-reverse: 1;";
    const val = resolveThemeValue(theme.borderWidth || {}, "DEFAULT") || "1px";
    return childScoped(`--tw-divide-y-reverse: 0; border-bottom-width: calc(${val} * var(--tw-divide-y-reverse)); border-top-width: calc(${val} * calc(1 - var(--tw-divide-y-reverse)));`);
  }
  const matchY = key.match(/^y-(\d+)$/);
  if (matchY) {
    const val = resolveThemeValue(theme.borderWidth || {}, matchY[1]);
    if (val !== undefined) return childScoped(`--tw-divide-y-reverse: 0; border-bottom-width: calc(${val} * var(--tw-divide-y-reverse)); border-top-width: calc(${val} * calc(1 - var(--tw-divide-y-reverse)));`);
  }

  // divide-style — applies to parent (controls style of the border lines)
  if (BORDER_STYLE_MAP[key]) return `border-style: ${BORDER_STYLE_MAP[key].replace("border-style: ", "").replace(";", "")};`;
  if (key === "none")   return "border-style: none;";
  if (key === "solid")  return "border-style: solid;";
  if (key === "dashed") return "border-style: dashed;";
  if (key === "dotted") return "border-style: dotted;";
  if (key === "double") return "border-style: double;";

  // divide-color — applies to children (sets border-color on the child borders)
  const colors = theme.colors || {};
  const color = resolveColorWithOpacity(theme.divideColor || colors, key);
  if (color !== undefined) return childScoped(`border-color: ${color};`);

  // divide-opacity (legacy)
  if (key.startsWith("opacity-")) {
    const val = resolveThemeValue(theme.opacity || {}, key.slice(8));
    if (val !== undefined) return childScoped(`--tw-divide-opacity: ${val};`);
  }

  return undefined;
}
