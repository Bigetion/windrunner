import { PERSPECTIVE_MAP, PERSPECTIVE_ORIGIN_MAP } from "../maps/effects.maps.js";
import { resolveThemeValue, resolveArbitraryValue } from "../resolvers.js";

export function buildTransformDeclaration(baseToken, theme) {
  if (baseToken === "transform") {
    return "--tw-translate-x: 0; --tw-translate-y: 0; --tw-rotate: 0; --tw-skew-x: 0; --tw-skew-y: 0; --tw-scale-x: 1; --tw-scale-y: 1; transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));";
  }
  if (baseToken === "transform-none") return "transform: none;";
  if (baseToken === "transform-gpu") {
    return "transform: translate3d(var(--tw-translate-x,0), var(--tw-translate-y,0), 0) rotate(var(--tw-rotate,0)) skewX(var(--tw-skew-x,0)) skewY(var(--tw-skew-y,0)) scaleX(var(--tw-scale-x,1)) scaleY(var(--tw-scale-y,1));";
  }

  const negative = baseToken.startsWith("-");
  const normalized = negative ? baseToken.slice(1) : baseToken;

  // rotate
  if (normalized.startsWith("rotate-")) {
    const key = normalized.slice(7);
    const axisMatch = key.match(/^([xyz])-(.+)$/);
    if (axisMatch) {
      const [, axis, valueKey] = axisMatch;
      let val = resolveThemeValue(theme.rotate || {}, valueKey) || resolveArbitraryValue(valueKey);
      if (val === undefined) return undefined;
      if (negative) val = val.startsWith("-") ? val.slice(1) : `-${val}`;
      return `rotate: ${axis.toUpperCase()}(${val});`;
    }
    let val = resolveThemeValue(theme.rotate || {}, key) || resolveArbitraryValue(key);
    if (val === undefined) return undefined;
    if (negative) val = val.startsWith("-") ? val.slice(1) : `-${val}`;
    return `--tw-rotate: ${val}; transform: rotate(${val});`;
  }

  // scale
  if (normalized.startsWith("scale-")) {
    const key = normalized.slice(6);
    const axisMatch = key.match(/^([xyz])-(.+)$/);
    if (axisMatch) {
      const [, axis, valueKey] = axisMatch;
      let val = resolveThemeValue(theme.scale || {}, valueKey) || resolveArbitraryValue(valueKey);
      if (val === undefined) return undefined;
      if (negative && val !== "0") val = `-${val}`;
      if (axis === "z") return `--tw-scale-z: ${val}; scale: var(--tw-scale-x, 1) var(--tw-scale-y, 1) ${val};`;
      return `--tw-scale-${axis}: ${val}; transform: scale${axis.toUpperCase()}(${val});`;
    }
    let val = resolveThemeValue(theme.scale || {}, key) || resolveArbitraryValue(key);
    if (val === undefined) return undefined;
    if (negative && val !== "0") val = `-${val}`;
    return `--tw-scale-x: ${val}; --tw-scale-y: ${val}; transform: scale(${val});`;
  }

  // translate
  if (normalized.startsWith("translate-")) {
    const key = normalized.slice(10);
    const axisMatch = key.match(/^([xyz])-(.+)$/);
    if (axisMatch) {
      const [, axis, valueKey] = axisMatch;
      const scale = theme.translate || theme.spacing || {};
      let val = resolveThemeValue(scale, valueKey) || resolveArbitraryValue(valueKey);
      if (val === undefined) return undefined;
      if (negative && val !== "0") val = `-${val}`;
      if (axis === "z") return `--tw-translate-z: ${val}; transform: translateZ(${val});`;
      return `--tw-translate-${axis}: ${val}; transform: translate${axis.toUpperCase()}(${val});`;
    }
    const scale = theme.translate || theme.spacing || {};
    let val = resolveThemeValue(scale, key) || resolveArbitraryValue(key);
    if (val === undefined) return undefined;
    if (negative && val !== "0") val = `-${val}`;
    return `--tw-translate-x: ${val}; --tw-translate-y: ${val}; transform: translate(${val}, ${val});`;
  }

  // skew
  if (normalized.startsWith("skew-")) {
    const key = normalized.slice(5);
    const axisMatch = key.match(/^([xy])-(.+)$/);
    if (axisMatch) {
      const [, axis, valueKey] = axisMatch;
      let val = resolveThemeValue(theme.skew || {}, valueKey) || resolveArbitraryValue(valueKey);
      if (val === undefined) return undefined;
      if (negative) val = val.startsWith("-") ? val.slice(1) : `-${val}`;
      return `--tw-skew-${axis}: ${val}; transform: skew${axis.toUpperCase()}(${val});`;
    }
  }

  // transform-origin
  if (normalized.startsWith("origin-")) {
    const val = resolveThemeValue(theme.transformOrigin || {}, normalized.slice(7));
    if (val !== undefined) return `transform-origin: ${val};`;
  }

  // perspective-origin
  if (normalized.startsWith("perspective-origin-")) {
    const key = normalized.slice(19);
    if (PERSPECTIVE_ORIGIN_MAP[key]) return PERSPECTIVE_ORIGIN_MAP[key];
    const arb = resolveArbitraryValue(key);
    if (arb !== undefined) return `perspective-origin: ${arb};`;
  }

  // perspective
  if (normalized.startsWith("perspective-")) {
    const key = normalized.slice(12);
    if (PERSPECTIVE_MAP[key]) return PERSPECTIVE_MAP[key];
    const arb = resolveArbitraryValue(key);
    if (arb !== undefined) return `perspective: ${arb};`;
  }

  return undefined;
}
